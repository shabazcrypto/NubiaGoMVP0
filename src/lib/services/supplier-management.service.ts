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
  onSnapshot,
  limit
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { auditService } from './audit.service'
import { emailService } from './email.service'

export interface Supplier {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  taxId: string
  businessLicense: string
  status: SupplierStatus
  rating: number
  totalOrders: number
  totalValue: number
  paymentTerms: PaymentTerms
  shippingMethods: string[]
  categories: string[]
  certifications: string[]
  documents: SupplierDocument[]
  performanceMetrics: SupplierPerformance
  contractDetails: ContractDetails
  bankDetails: BankDetails
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type SupplierStatus = 
  | 'pending_approval'
  | 'approved'
  | 'suspended'
  | 'blacklisted'
  | 'under_review'

export interface PaymentTerms {
  method: 'net_30' | 'net_60' | 'net_90' | 'cod' | 'prepaid' | 'custom'
  customDays?: number
  discountTerms?: {
    percentage: number
    days: number
  }
}

export interface SupplierDocument {
  id: string
  type: 'business_license' | 'tax_certificate' | 'insurance' | 'quality_cert' | 'contract' | 'other'
  name: string
  url: string
  expirationDate?: Date
  isVerified: boolean
  uploadedAt: Date
}

export interface SupplierPerformance {
  onTimeDeliveryRate: number
  qualityScore: number
  responseTime: number // hours
  defectRate: number
  returnRate: number
  communicationScore: number
  overallScore: number
  lastUpdated: Date
}

export interface ContractDetails {
  startDate: Date
  endDate: Date
  minimumOrderValue: number
  maximumOrderValue?: number
  exclusivityTerms?: string
  penaltyClauses: string[]
  renewalTerms: string
}

export interface BankDetails {
  bankName: string
  accountNumber: string
  routingNumber: string
  swiftCode?: string
  accountHolderName: string
  isVerified: boolean
}

export interface PurchaseOrder {
  id: string
  supplierId: string
  orderNumber: string
  status: POStatus
  items: PurchaseOrderItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  currency: string
  expectedDeliveryDate: Date
  actualDeliveryDate?: Date
  paymentStatus: PaymentStatus
  paymentDueDate: Date
  notes: string
  createdBy: string
  approvedBy?: string
  createdAt: Date
  updatedAt: Date
}

export type POStatus = 
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'sent'
  | 'acknowledged'
  | 'partially_received'
  | 'completed'
  | 'cancelled'

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'overdue'
  | 'disputed'

export interface PurchaseOrderItem {
  productId: string
  sku: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  receivedQuantity?: number
  qualityStatus?: 'passed' | 'failed' | 'pending'
}

export interface SupplierEvaluation {
  id: string
  supplierId: string
  evaluatorId: string
  period: {
    startDate: Date
    endDate: Date
  }
  criteria: {
    quality: number
    delivery: number
    communication: number
    pricing: number
    service: number
  }
  overallScore: number
  comments: string
  recommendations: string[]
  actionItems: string[]
  nextReviewDate: Date
  createdAt: Date
}

export interface SupplierQuote {
  id: string
  supplierId: string
  rfqId: string
  items: QuoteItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  currency: string
  validUntil: Date
  paymentTerms: PaymentTerms
  deliveryTime: number // days
  notes: string
  status: 'pending' | 'submitted' | 'accepted' | 'rejected' | 'expired'
  submittedAt?: Date
  createdAt: Date
}

export interface QuoteItem {
  productId: string
  sku: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  leadTime: number // days
  minimumOrderQuantity: number
}

export class SupplierManagementService {
  private readonly SUPPLIERS_COLLECTION = 'suppliers'
  private readonly PURCHASE_ORDERS_COLLECTION = 'purchase_orders'
  private readonly EVALUATIONS_COLLECTION = 'supplier_evaluations'
  private readonly QUOTES_COLLECTION = 'supplier_quotes'

  // Create or update supplier
  async createSupplier(supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
    try {
      const supplier: Omit<Supplier, 'id'> = {
        ...supplierData,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const docRef = await addDoc(collection(db, this.SUPPLIERS_COLLECTION), supplier)
      
      const createdSupplier = {
        id: docRef.id,
        ...supplier
      }

      // Log supplier creation
      await auditService.logSystemEvent(
        'supplier_created',
        {
          supplierId: docRef.id,
          companyName: supplier.companyName,
          status: supplier.status
        },
        true
      )

      // Send welcome email if approved
      if (supplier.status === 'approved') {
        await this.sendSupplierWelcomeEmail(createdSupplier)
      }

      return createdSupplier
    } catch (error) {
      throw new Error(`Failed to create supplier: ${(error as Error).message}`)
    }
  }

  // Update supplier
  async updateSupplier(supplierId: string, updates: Partial<Supplier>): Promise<Supplier> {
    try {
      const supplierRef = doc(db, this.SUPPLIERS_COLLECTION, supplierId)
      const supplierDoc = await getDoc(supplierRef)
      
      if (!supplierDoc.exists()) {
        throw new Error('Supplier not found')
      }

      const updatedData = {
        ...updates,
        updatedAt: new Date()
      }

      await updateDoc(supplierRef, updatedData)

      const updatedSupplier = {
        id: supplierId,
        ...supplierDoc.data(),
        ...updatedData
      } as Supplier

      // Log supplier update
      await auditService.logSystemEvent(
        'supplier_updated',
        {
          supplierId,
          updates: Object.keys(updates),
          newStatus: updates.status
        },
        true
      )

      // Send status change notification
      if (updates.status && updates.status !== supplierDoc.data()?.status) {
        await this.sendStatusChangeNotification(updatedSupplier, updates.status)
      }

      return updatedSupplier
    } catch (error) {
      throw new Error(`Failed to update supplier: ${(error as Error).message}`)
    }
  }

  // Get supplier by ID
  async getSupplier(supplierId: string): Promise<Supplier | null> {
    try {
      const supplierDoc = await getDoc(doc(db, this.SUPPLIERS_COLLECTION, supplierId))
      
      if (!supplierDoc.exists()) {
        return null
      }

      return {
        id: supplierDoc.id,
        ...supplierDoc.data()
      } as Supplier
    } catch (error) {
      throw new Error('Failed to fetch supplier')
    }
  }

  // Get suppliers with filters
  async getSuppliers(filters?: {
    status?: SupplierStatus
    category?: string
    rating?: number
    isActive?: boolean
  }): Promise<Supplier[]> {
    try {
      let q = query(collection(db, this.SUPPLIERS_COLLECTION))

      if (filters?.status) {
        q = query(q, where('status', '==', filters.status))
      }
      
      if (filters?.category) {
        q = query(q, where('categories', 'array-contains', filters.category))
      }
      
      if (filters?.rating) {
        q = query(q, where('rating', '>=', filters.rating))
      }
      
      if (filters?.isActive !== undefined) {
        q = query(q, where('isActive', '==', filters.isActive))
      }

      q = query(q, orderBy('companyName'))

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Supplier[]
    } catch (error) {
      throw new Error('Failed to fetch suppliers')
    }
  }

  // Approve supplier
  async approveSupplier(supplierId: string, approverId: string): Promise<void> {
    try {
      await this.updateSupplier(supplierId, {
        status: 'approved',
        isActive: true
      })

      // Log approval
      await auditService.logSystemEvent(
        'supplier_approved',
        {
          supplierId,
          approverId
        },
        true
      )
    } catch (error) {
      throw new Error(`Failed to approve supplier: ${(error as Error).message}`)
    }
  }

  // Suspend supplier
  async suspendSupplier(supplierId: string, reason: string, suspendedBy: string): Promise<void> {
    try {
      await this.updateSupplier(supplierId, {
        status: 'suspended',
        isActive: false
      })

      // Log suspension
      await auditService.logSystemEvent(
        'supplier_suspended',
        {
          supplierId,
          reason,
          suspendedBy
        },
        true
      )

      // Notify supplier
      const supplier = await this.getSupplier(supplierId)
      if (supplier) {
        await emailService.sendSupplierSuspensionNotice(supplier, reason)
      }
    } catch (error) {
      throw new Error(`Failed to suspend supplier: ${(error as Error).message}`)
    }
  }

  // Create purchase order
  async createPurchaseOrder(orderData: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<PurchaseOrder> {
    try {
      const order: Omit<PurchaseOrder, 'id'> = {
        ...orderData,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const docRef = await addDoc(collection(db, this.PURCHASE_ORDERS_COLLECTION), order)
      
      const createdOrder = {
        id: docRef.id,
        ...order
      }

      // Log PO creation
      await auditService.logSystemEvent(
        'purchase_order_created',
        {
          poId: docRef.id,
          supplierId: order.supplierId,
          total: order.total,
          createdBy: order.createdBy
        },
        true
      )

      return createdOrder
    } catch (error) {
      throw new Error(`Failed to create purchase order: ${(error as Error).message}`)
    }
  }

  // Update purchase order status
  async updatePurchaseOrderStatus(
    poId: string,
    status: POStatus,
    updatedBy: string,
    notes?: string
  ): Promise<void> {
    try {
      const updates: Partial<PurchaseOrder> = {
        status,
        updatedAt: new Date()
      }

      if (notes) {
        updates.notes = notes
      }

      if (status === 'completed') {
        updates.actualDeliveryDate = new Date()
      }

      await updateDoc(doc(db, this.PURCHASE_ORDERS_COLLECTION, poId), updates)

      // Log status update
      await auditService.logSystemEvent(
        'purchase_order_status_updated',
        {
          poId,
          newStatus: status,
          updatedBy,
          notes
        },
        true
      )

      // Update supplier performance metrics
      if (status === 'completed') {
        await this.updateSupplierPerformance(poId)
      }
    } catch (error) {
      throw new Error(`Failed to update purchase order status: ${(error as Error).message}`)
    }
  }

  // Get purchase orders
  async getPurchaseOrders(filters?: {
    supplierId?: string
    status?: POStatus
    startDate?: Date
    endDate?: Date
  }): Promise<PurchaseOrder[]> {
    try {
      let q = query(
        collection(db, this.PURCHASE_ORDERS_COLLECTION),
        orderBy('createdAt', 'desc')
      )

      if (filters?.supplierId) {
        q = query(q, where('supplierId', '==', filters.supplierId))
      }
      
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status))
      }
      
      if (filters?.startDate) {
        q = query(q, where('createdAt', '>=', filters.startDate))
      }
      
      if (filters?.endDate) {
        q = query(q, where('createdAt', '<=', filters.endDate))
      }

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PurchaseOrder[]
    } catch (error) {
      throw new Error('Failed to fetch purchase orders')
    }
  }

  // Create supplier evaluation
  async createSupplierEvaluation(
    evaluationData: Omit<SupplierEvaluation, 'id' | 'createdAt'>
  ): Promise<SupplierEvaluation> {
    try {
      const evaluation: Omit<SupplierEvaluation, 'id'> = {
        ...evaluationData,
        createdAt: new Date()
      }

      const docRef = await addDoc(collection(db, this.EVALUATIONS_COLLECTION), evaluation)
      
      const createdEvaluation = {
        id: docRef.id,
        ...evaluation
      }

      // Update supplier rating
      await this.updateSupplierRating(evaluation.supplierId, evaluation.overallScore)

      // Log evaluation
      await auditService.logSystemEvent(
        'supplier_evaluation_created',
        {
          evaluationId: docRef.id,
          supplierId: evaluation.supplierId,
          overallScore: evaluation.overallScore,
          evaluatorId: evaluation.evaluatorId
        },
        true
      )

      return createdEvaluation
    } catch (error) {
      throw new Error(`Failed to create supplier evaluation: ${(error as Error).message}`)
    }
  }

  // Get supplier evaluations
  async getSupplierEvaluations(supplierId: string): Promise<SupplierEvaluation[]> {
    try {
      const q = query(
        collection(db, this.EVALUATIONS_COLLECTION),
        where('supplierId', '==', supplierId),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SupplierEvaluation[]
    } catch (error) {
      throw new Error('Failed to fetch supplier evaluations')
    }
  }

  // Create supplier quote
  async createSupplierQuote(
    quoteData: Omit<SupplierQuote, 'id' | 'createdAt'>
  ): Promise<SupplierQuote> {
    try {
      const quote: Omit<SupplierQuote, 'id'> = {
        ...quoteData,
        createdAt: new Date()
      }

      const docRef = await addDoc(collection(db, this.QUOTES_COLLECTION), quote)
      
      const createdQuote = {
        id: docRef.id,
        ...quote
      }

      // Log quote creation
      await auditService.logSystemEvent(
        'supplier_quote_created',
        {
          quoteId: docRef.id,
          supplierId: quote.supplierId,
          rfqId: quote.rfqId,
          total: quote.total
        },
        true
      )

      return createdQuote
    } catch (error) {
      throw new Error(`Failed to create supplier quote: ${(error as Error).message}`)
    }
  }

  // Get supplier quotes
  async getSupplierQuotes(filters?: {
    supplierId?: string
    rfqId?: string
    status?: string
  }): Promise<SupplierQuote[]> {
    try {
      let q = query(
        collection(db, this.QUOTES_COLLECTION),
        orderBy('createdAt', 'desc')
      )

      if (filters?.supplierId) {
        q = query(q, where('supplierId', '==', filters.supplierId))
      }
      
      if (filters?.rfqId) {
        q = query(q, where('rfqId', '==', filters.rfqId))
      }
      
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status))
      }

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SupplierQuote[]
    } catch (error) {
      throw new Error('Failed to fetch supplier quotes')
    }
  }

  // Get supplier analytics
  async getSupplierAnalytics(supplierId?: string): Promise<{
    totalSuppliers: number
    activeSuppliers: number
    averageRating: number
    totalPurchaseValue: number
    onTimeDeliveryRate: number
    topPerformingSuppliers: { id: string; name: string; rating: number }[]
    categoryDistribution: { category: string; count: number }[]
  }> {
    try {
      let suppliersQuery = query(collection(db, this.SUPPLIERS_COLLECTION))
      if (supplierId) {
        suppliersQuery = query(suppliersQuery, where('id', '==', supplierId))
      }

      const suppliersSnapshot = await getDocs(suppliersQuery)
      const suppliers = suppliersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Supplier[]

      const totalSuppliers = suppliers.length
      const activeSuppliers = suppliers.filter(s => s.isActive).length
      const averageRating = suppliers.reduce((sum, s) => sum + s.rating, 0) / totalSuppliers
      const totalPurchaseValue = suppliers.reduce((sum, s) => sum + s.totalValue, 0)
      
      const onTimeDeliveryRate = suppliers.reduce((sum, s) => 
        sum + s.performanceMetrics.onTimeDeliveryRate, 0
      ) / totalSuppliers

      const topPerformingSuppliers = suppliers
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 10)
        .map(s => ({
          id: s.id,
          name: s.companyName,
          rating: s.rating
        }))

      // Category distribution
      const categoryCount: Record<string, number> = {}
      suppliers.forEach(supplier => {
        supplier.categories.forEach(category => {
          categoryCount[category] = (categoryCount[category] || 0) + 1
        })
      })

      const categoryDistribution = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)

      return {
        totalSuppliers,
        activeSuppliers,
        averageRating,
        totalPurchaseValue,
        onTimeDeliveryRate,
        topPerformingSuppliers,
        categoryDistribution
      }
    } catch (error) {
      throw new Error('Failed to get supplier analytics')
    }
  }

  // Private helper methods
  private async updateSupplierPerformance(poId: string): Promise<void> {
    try {
      const poDoc = await getDoc(doc(db, this.PURCHASE_ORDERS_COLLECTION, poId))
      if (!poDoc.exists()) return

      const po = poDoc.data() as PurchaseOrder
      const supplier = await this.getSupplier(po.supplierId)
      if (!supplier) return

      // Calculate on-time delivery
      const isOnTime = po.actualDeliveryDate && po.actualDeliveryDate <= po.expectedDeliveryDate
      
      // Update performance metrics (simplified calculation)
      const currentMetrics = supplier.performanceMetrics
      const totalOrders = supplier.totalOrders + 1
      
      const newOnTimeRate = (
        (currentMetrics.onTimeDeliveryRate * supplier.totalOrders) + (isOnTime ? 1 : 0)
      ) / totalOrders

      await this.updateSupplier(po.supplierId, {
        totalOrders: totalOrders,
        totalValue: supplier.totalValue + po.total,
        performanceMetrics: {
          ...currentMetrics,
          onTimeDeliveryRate: newOnTimeRate,
          lastUpdated: new Date()
        }
      })
    } catch (error) {
      // Log error but don't throw
      await auditService.logSystemEvent(
        'supplier_performance_update_failed',
        {
          poId,
          error: (error as Error).message
        },
        false
      )
    }
  }

  private async updateSupplierRating(supplierId: string, newScore: number): Promise<void> {
    try {
      const evaluations = await this.getSupplierEvaluations(supplierId)
      const totalScore = evaluations.reduce((sum, eval) => sum + eval.overallScore, 0)
      const averageRating = totalScore / evaluations.length

      await this.updateSupplier(supplierId, {
        rating: averageRating
      })
    } catch (error) {
      // Log error but don't throw
      await auditService.logSystemEvent(
        'supplier_rating_update_failed',
        {
          supplierId,
          error: (error as Error).message
        },
        false
      )
    }
  }

  private async sendSupplierWelcomeEmail(supplier: Supplier): Promise<void> {
    try {
      await emailService.sendSupplierWelcome(supplier)
    } catch (error) {
      // Log error but don't throw
      await auditService.logSystemEvent(
        'supplier_welcome_email_failed',
        {
          supplierId: supplier.id,
          error: (error as Error).message
        },
        false
      )
    }
  }

  private async sendStatusChangeNotification(supplier: Supplier, newStatus: SupplierStatus): Promise<void> {
    try {
      await emailService.sendSupplierStatusChange(supplier, newStatus)
    } catch (error) {
      // Log error but don't throw
      await auditService.logSystemEvent(
        'supplier_status_notification_failed',
        {
          supplierId: supplier.id,
          newStatus,
          error: (error as Error).message
        },
        false
      )
    }
  }

  // Real-time supplier monitoring
  onSupplierChange(supplierId: string, callback: (supplier: Supplier | null) => void): () => void {
    return onSnapshot(
      doc(db, this.SUPPLIERS_COLLECTION, supplierId),
      (doc) => {
        if (doc.exists()) {
          callback({ id: doc.id, ...doc.data() } as Supplier)
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

export const supplierManagementService = new SupplierManagementService()
