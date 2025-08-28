import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  addDoc,
  writeBatch,
  onSnapshot
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { auditService } from './audit.service'
import { emailService } from './email.service'

export interface InventoryItem {
  id: string
  productId: string
  sku: string
  warehouseId: string
  quantity: number
  reservedQuantity: number
  availableQuantity: number
  reorderPoint: number
  maxStock: number
  unitCost: number
  totalValue: number
  location: string
  batchNumber?: string
  expirationDate?: Date
  lastUpdated: Date
  createdAt: Date
}

export interface InventoryMovement {
  id: string
  productId: string
  warehouseId: string
  type: MovementType
  quantity: number
  previousQuantity: number
  newQuantity: number
  reason: string
  reference?: string
  orderId?: string
  supplierId?: string
  userId: string
  createdAt: Date
}

export type MovementType = 
  | 'stock_in'
  | 'stock_out'
  | 'adjustment'
  | 'transfer'
  | 'return'
  | 'damage'
  | 'expired'
  | 'lost'
  | 'found'

export interface Warehouse {
  id: string
  name: string
  address: string
  managerId: string
  isActive: boolean
  capacity: number
  currentUtilization: number
  createdAt: Date
}

export interface StockAlert {
  id: string
  productId: string
  warehouseId: string
  type: 'low_stock' | 'out_of_stock' | 'overstock' | 'expiring_soon'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  currentQuantity: number
  threshold: number
  isResolved: boolean
  resolvedAt?: Date
  createdAt: Date
}

export interface InventoryForecast {
  productId: string
  warehouseId: string
  forecastPeriod: number // days
  predictedDemand: number
  recommendedOrderQuantity: number
  suggestedReorderDate: Date
  confidence: number
  factors: {
    seasonality: number
    trend: number
    promotions: number
    historicalAverage: number
  }
}

export class InventoryManagementService {
  private readonly INVENTORY_COLLECTION = 'inventory_items'
  private readonly MOVEMENTS_COLLECTION = 'inventory_movements'
  private readonly WAREHOUSES_COLLECTION = 'warehouses'
  private readonly ALERTS_COLLECTION = 'stock_alerts'

  // Add or update inventory
  async updateInventory(
    productId: string,
    warehouseId: string,
    quantity: number,
    type: MovementType,
    reason: string,
    userId: string,
    reference?: string
  ): Promise<InventoryItem> {
    try {
      const batch = writeBatch(db)
      
      // Get current inventory item
      const inventoryRef = doc(db, this.INVENTORY_COLLECTION, `${productId}_${warehouseId}`)
      const inventoryDoc = await getDoc(inventoryRef)
      
      let currentItem: InventoryItem
      let previousQuantity = 0
      
      if (inventoryDoc.exists()) {
        currentItem = inventoryDoc.data() as InventoryItem
        previousQuantity = currentItem.quantity
      } else {
        // Create new inventory item
        currentItem = {
          id: `${productId}_${warehouseId}`,
          productId,
          sku: '', // Would be fetched from product service
          warehouseId,
          quantity: 0,
          reservedQuantity: 0,
          availableQuantity: 0,
          reorderPoint: 10,
          maxStock: 1000,
          unitCost: 0,
          totalValue: 0,
          location: '',
          lastUpdated: new Date(),
          createdAt: new Date()
        }
      }

      // Calculate new quantity based on movement type
      let newQuantity = currentItem.quantity
      switch (type) {
        case 'stock_in':
          newQuantity += quantity
          break
        case 'stock_out':
        case 'damage':
        case 'expired':
        case 'lost':
          newQuantity -= quantity
          break
        case 'adjustment':
          newQuantity = quantity // Direct adjustment
          break
        case 'return':
          newQuantity += quantity
          break
        case 'found':
          newQuantity += quantity
          break
      }

      // Ensure quantity doesn't go negative
      if (newQuantity < 0) {
        throw new Error('Insufficient inventory for this operation')
      }

      // Update inventory item
      const updatedItem: InventoryItem = {
        ...currentItem,
        quantity: newQuantity,
        availableQuantity: newQuantity - currentItem.reservedQuantity,
        totalValue: newQuantity * currentItem.unitCost,
        lastUpdated: new Date()
      }

      batch.set(inventoryRef, updatedItem)

      // Create movement record
      const movementRef = doc(collection(db, this.MOVEMENTS_COLLECTION))
      const movement: Omit<InventoryMovement, 'id'> = {
        productId,
        warehouseId,
        type,
        quantity,
        previousQuantity,
        newQuantity,
        reason,
        reference,
        userId,
        createdAt: new Date()
      }
      batch.set(movementRef, movement)

      // Commit batch
      await batch.commit()

      // Check for stock alerts
      await this.checkStockAlerts(updatedItem)

      // Log inventory update
      await auditService.logSystemEvent(
        'inventory_updated',
        {
          productId,
          warehouseId,
          type,
          quantity,
          previousQuantity,
          newQuantity,
          userId
        },
        true
      )

      return updatedItem
    } catch (error) {
      throw new Error(`Failed to update inventory: ${(error as Error).message}`)
    }
  }

  // Reserve inventory for orders
  async reserveInventory(
    productId: string,
    warehouseId: string,
    quantity: number,
    orderId: string
  ): Promise<boolean> {
    try {
      const inventoryRef = doc(db, this.INVENTORY_COLLECTION, `${productId}_${warehouseId}`)
      const inventoryDoc = await getDoc(inventoryRef)
      
      if (!inventoryDoc.exists()) {
        throw new Error('Inventory item not found')
      }

      const item = inventoryDoc.data() as InventoryItem
      
      // Check if enough available quantity
      if (item.availableQuantity < quantity) {
        return false
      }

      // Update reserved quantity
      await updateDoc(inventoryRef, {
        reservedQuantity: item.reservedQuantity + quantity,
        availableQuantity: item.availableQuantity - quantity,
        lastUpdated: new Date()
      })

      // Log reservation
      await auditService.logSystemEvent(
        'inventory_reserved',
        {
          productId,
          warehouseId,
          quantity,
          orderId,
          newReservedQuantity: item.reservedQuantity + quantity
        },
        true
      )

      return true
    } catch (error) {
      throw new Error(`Failed to reserve inventory: ${(error as Error).message}`)
    }
  }

  // Release reserved inventory
  async releaseReservation(
    productId: string,
    warehouseId: string,
    quantity: number,
    orderId: string
  ): Promise<void> {
    try {
      const inventoryRef = doc(db, this.INVENTORY_COLLECTION, `${productId}_${warehouseId}`)
      const inventoryDoc = await getDoc(inventoryRef)
      
      if (!inventoryDoc.exists()) {
        throw new Error('Inventory item not found')
      }

      const item = inventoryDoc.data() as InventoryItem
      
      // Update reserved quantity
      await updateDoc(inventoryRef, {
        reservedQuantity: Math.max(0, item.reservedQuantity - quantity),
        availableQuantity: item.availableQuantity + quantity,
        lastUpdated: new Date()
      })

      // Log release
      await auditService.logSystemEvent(
        'inventory_reservation_released',
        {
          productId,
          warehouseId,
          quantity,
          orderId,
          newReservedQuantity: Math.max(0, item.reservedQuantity - quantity)
        },
        true
      )
    } catch (error) {
      throw new Error(`Failed to release reservation: ${(error as Error).message}`)
    }
  }

  // Get inventory for product across all warehouses
  async getProductInventory(productId: string): Promise<InventoryItem[]> {
    try {
      const q = query(
        collection(db, this.INVENTORY_COLLECTION),
        where('productId', '==', productId)
      )
      
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InventoryItem[]
    } catch (error) {
      throw new Error('Failed to fetch product inventory')
    }
  }

  // Get warehouse inventory
  async getWarehouseInventory(warehouseId: string): Promise<InventoryItem[]> {
    try {
      const q = query(
        collection(db, this.INVENTORY_COLLECTION),
        where('warehouseId', '==', warehouseId)
      )
      
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InventoryItem[]
    } catch (error) {
      throw new Error('Failed to fetch warehouse inventory')
    }
  }

  // Get low stock items
  async getLowStockItems(warehouseId?: string): Promise<InventoryItem[]> {
    try {
      let q = query(collection(db, this.INVENTORY_COLLECTION))
      
      if (warehouseId) {
        q = query(q, where('warehouseId', '==', warehouseId))
      }
      
      const snapshot = await getDocs(q)
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InventoryItem[]
      
      // Filter items where quantity <= reorderPoint
      return items.filter(item => item.quantity <= item.reorderPoint)
    } catch (error) {
      throw new Error('Failed to fetch low stock items')
    }
  }

  // Transfer inventory between warehouses
  async transferInventory(
    productId: string,
    fromWarehouseId: string,
    toWarehouseId: string,
    quantity: number,
    userId: string,
    reason: string
  ): Promise<void> {
    try {
      // Remove from source warehouse
      await this.updateInventory(
        productId,
        fromWarehouseId,
        quantity,
        'stock_out',
        `Transfer to ${toWarehouseId}: ${reason}`,
        userId,
        `TRANSFER_${Date.now()}`
      )

      // Add to destination warehouse
      await this.updateInventory(
        productId,
        toWarehouseId,
        quantity,
        'stock_in',
        `Transfer from ${fromWarehouseId}: ${reason}`,
        userId,
        `TRANSFER_${Date.now()}`
      )

      // Log transfer
      await auditService.logSystemEvent(
        'inventory_transferred',
        {
          productId,
          fromWarehouseId,
          toWarehouseId,
          quantity,
          userId,
          reason
        },
        true
      )
    } catch (error) {
      throw new Error(`Failed to transfer inventory: ${(error as Error).message}`)
    }
  }

  // Check and create stock alerts
  private async checkStockAlerts(item: InventoryItem): Promise<void> {
    try {
      const alerts: Omit<StockAlert, 'id'>[] = []

      // Low stock alert
      if (item.quantity <= item.reorderPoint && item.quantity > 0) {
        alerts.push({
          productId: item.productId,
          warehouseId: item.warehouseId,
          type: 'low_stock',
          severity: 'medium',
          message: `Stock level is below reorder point (${item.reorderPoint})`,
          currentQuantity: item.quantity,
          threshold: item.reorderPoint,
          isResolved: false,
          createdAt: new Date()
        })
      }

      // Out of stock alert
      if (item.quantity === 0) {
        alerts.push({
          productId: item.productId,
          warehouseId: item.warehouseId,
          type: 'out_of_stock',
          severity: 'high',
          message: 'Product is out of stock',
          currentQuantity: item.quantity,
          threshold: 0,
          isResolved: false,
          createdAt: new Date()
        })
      }

      // Overstock alert
      if (item.quantity > item.maxStock) {
        alerts.push({
          productId: item.productId,
          warehouseId: item.warehouseId,
          type: 'overstock',
          severity: 'low',
          message: `Stock level exceeds maximum (${item.maxStock})`,
          currentQuantity: item.quantity,
          threshold: item.maxStock,
          isResolved: false,
          createdAt: new Date()
        })
      }

      // Expiration alert (if expiration date exists)
      if (item.expirationDate) {
        const daysUntilExpiration = Math.ceil(
          (item.expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
        
        if (daysUntilExpiration <= 30 && daysUntilExpiration > 0) {
          alerts.push({
            productId: item.productId,
            warehouseId: item.warehouseId,
            type: 'expiring_soon',
            severity: daysUntilExpiration <= 7 ? 'high' : 'medium',
            message: `Product expires in ${daysUntilExpiration} days`,
            currentQuantity: item.quantity,
            threshold: 30,
            isResolved: false,
            createdAt: new Date()
          })
        }
      }

      // Create alerts
      for (const alert of alerts) {
        await addDoc(collection(db, this.ALERTS_COLLECTION), alert)
        
        // Send notification for high severity alerts
        if (alert.severity === 'high') {
          await this.notifyStockAlert(alert)
        }
      }
    } catch (error) {
      // Log error but don't throw
      await auditService.logSystemEvent(
        'stock_alert_check_failed',
        {
          productId: item.productId,
          warehouseId: item.warehouseId,
          error: (error as Error).message
        },
        false
      )
    }
  }

  // Get stock alerts
  async getStockAlerts(warehouseId?: string, isResolved?: boolean): Promise<StockAlert[]> {
    try {
      let q = query(
        collection(db, this.ALERTS_COLLECTION),
        orderBy('createdAt', 'desc')
      )

      if (warehouseId) {
        q = query(q, where('warehouseId', '==', warehouseId))
      }
      
      if (isResolved !== undefined) {
        q = query(q, where('isResolved', '==', isResolved))
      }

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StockAlert[]
    } catch (error) {
      throw new Error('Failed to fetch stock alerts')
    }
  }

  // Resolve stock alert
  async resolveStockAlert(alertId: string): Promise<void> {
    try {
      await updateDoc(doc(db, this.ALERTS_COLLECTION, alertId), {
        isResolved: true,
        resolvedAt: new Date()
      })
    } catch (error) {
      throw new Error('Failed to resolve stock alert')
    }
  }

  // Get inventory movements
  async getInventoryMovements(
    productId?: string,
    warehouseId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<InventoryMovement[]> {
    try {
      let q = query(
        collection(db, this.MOVEMENTS_COLLECTION),
        orderBy('createdAt', 'desc')
      )

      if (productId) {
        q = query(q, where('productId', '==', productId))
      }
      
      if (warehouseId) {
        q = query(q, where('warehouseId', '==', warehouseId))
      }

      if (startDate) {
        q = query(q, where('createdAt', '>=', startDate))
      }
      
      if (endDate) {
        q = query(q, where('createdAt', '<=', endDate))
      }

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InventoryMovement[]
    } catch (error) {
      throw new Error('Failed to fetch inventory movements')
    }
  }

  // Generate inventory forecast
  async generateInventoryForecast(
    productId: string,
    warehouseId: string,
    forecastDays: number = 30
  ): Promise<InventoryForecast> {
    try {
      // Get historical movements for analysis
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const movements = await this.getInventoryMovements(productId, warehouseId, thirtyDaysAgo)
      
      // Calculate historical demand (stock_out movements)
      const demandMovements = movements.filter(m => m.type === 'stock_out')
      const totalDemand = demandMovements.reduce((sum, m) => sum + m.quantity, 0)
      const avgDailyDemand = totalDemand / 30
      
      // Simple forecast calculation (can be enhanced with ML)
      const predictedDemand = avgDailyDemand * forecastDays
      const safetyStock = avgDailyDemand * 7 // 7 days safety stock
      const recommendedOrderQuantity = predictedDemand + safetyStock
      
      // Get current inventory
      const currentInventory = await getDoc(
        doc(db, this.INVENTORY_COLLECTION, `${productId}_${warehouseId}`)
      )
      
      let suggestedReorderDate = new Date()
      if (currentInventory.exists()) {
        const item = currentInventory.data() as InventoryItem
        const daysUntilReorder = Math.max(0, (item.quantity - item.reorderPoint) / avgDailyDemand)
        suggestedReorderDate = new Date(Date.now() + daysUntilReorder * 24 * 60 * 60 * 1000)
      }

      return {
        productId,
        warehouseId,
        forecastPeriod: forecastDays,
        predictedDemand,
        recommendedOrderQuantity,
        suggestedReorderDate,
        confidence: 0.75, // Simple confidence score
        factors: {
          seasonality: 1.0,
          trend: 1.0,
          promotions: 1.0,
          historicalAverage: avgDailyDemand
        }
      }
    } catch (error) {
      throw new Error(`Failed to generate inventory forecast: ${(error as Error).message}`)
    }
  }

  // Get inventory analytics
  async getInventoryAnalytics(warehouseId?: string): Promise<{
    totalValue: number
    totalItems: number
    lowStockCount: number
    outOfStockCount: number
    overstockCount: number
    turnoverRate: number
    topMovingProducts: { productId: string; quantity: number }[]
  }> {
    try {
      let inventoryQuery = query(collection(db, this.INVENTORY_COLLECTION))
      if (warehouseId) {
        inventoryQuery = query(inventoryQuery, where('warehouseId', '==', warehouseId))
      }

      const inventorySnapshot = await getDocs(inventoryQuery)
      const items = inventorySnapshot.docs.map(doc => doc.data()) as InventoryItem[]

      const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0)
      const totalItems = items.length
      const lowStockCount = items.filter(item => item.quantity <= item.reorderPoint).length
      const outOfStockCount = items.filter(item => item.quantity === 0).length
      const overstockCount = items.filter(item => item.quantity > item.maxStock).length

      // Calculate turnover rate (simplified)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const movements = await this.getInventoryMovements(undefined, warehouseId, thirtyDaysAgo)
      const outMovements = movements.filter(m => m.type === 'stock_out')
      const totalOut = outMovements.reduce((sum, m) => sum + m.quantity, 0)
      const avgInventory = items.reduce((sum, item) => sum + item.quantity, 0) / items.length
      const turnoverRate = avgInventory > 0 ? totalOut / avgInventory : 0

      // Top moving products
      const productMovements = outMovements.reduce((acc, m) => {
        acc[m.productId] = (acc[m.productId] || 0) + m.quantity
        return acc
      }, {} as Record<string, number>)

      const topMovingProducts = Object.entries(productMovements)
        .map(([productId, quantity]) => ({ productId, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10)

      return {
        totalValue,
        totalItems,
        lowStockCount,
        outOfStockCount,
        overstockCount,
        turnoverRate,
        topMovingProducts
      }
    } catch (error) {
      throw new Error('Failed to get inventory analytics')
    }
  }

  // Private helper methods
  private async notifyStockAlert(alert: Omit<StockAlert, 'id'>): Promise<void> {
    try {
      // Send email notification to warehouse manager
      await emailService.sendStockAlert(alert)
      
      // Log notification
      await auditService.logSystemEvent(
        'stock_alert_notification_sent',
        {
          productId: alert.productId,
          warehouseId: alert.warehouseId,
          type: alert.type,
          severity: alert.severity
        },
        true
      )
    } catch (error) {
      // Log error but don't throw
      await auditService.logSystemEvent(
        'stock_alert_notification_failed',
        {
          productId: alert.productId,
          warehouseId: alert.warehouseId,
          error: (error as Error).message
        },
        false
      )
    }
  }

  // Real-time inventory monitoring
  onInventoryChange(
    productId: string,
    warehouseId: string,
    callback: (item: InventoryItem | null) => void
  ): () => void {
    const itemId = `${productId}_${warehouseId}`
    return onSnapshot(
      doc(db, this.INVENTORY_COLLECTION, itemId),
      (doc) => {
        if (doc.exists()) {
          callback({ id: doc.id, ...doc.data() } as InventoryItem)
        } else {
          callback(null)
        }
      },
      (error) => {
        callback(null)
      }
    )
  }
}

export const inventoryManagementService = new InventoryManagementService()
