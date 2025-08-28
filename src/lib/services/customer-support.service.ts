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
  limit,
  startAfter
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { auditService } from './audit.service'
import { emailService } from './email.service'

export interface SupportTicket {
  id: string
  ticketNumber: string
  customerId: string
  customerEmail: string
  customerName: string
  subject: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  assignedTo?: string
  tags: string[]
  attachments: TicketAttachment[]
  messages: TicketMessage[]
  resolution?: string
  satisfactionRating?: number
  satisfactionFeedback?: string
  estimatedResolutionTime?: Date
  actualResolutionTime?: Date
  escalationLevel: number
  relatedOrderId?: string
  relatedProductId?: string
  createdAt: Date
  updatedAt: Date
  closedAt?: Date
}

export type TicketCategory = 
  | 'order_issue'
  | 'product_inquiry'
  | 'shipping_problem'
  | 'payment_issue'
  | 'return_refund'
  | 'technical_support'
  | 'account_help'
  | 'complaint'
  | 'suggestion'
  | 'other'

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

export type TicketStatus = 
  | 'open'
  | 'in_progress'
  | 'waiting_customer'
  | 'waiting_internal'
  | 'escalated'
  | 'resolved'
  | 'closed'

export interface TicketMessage {
  id: string
  ticketId: string
  senderId: string
  senderType: 'customer' | 'agent' | 'system'
  senderName: string
  message: string
  attachments: TicketAttachment[]
  isInternal: boolean
  createdAt: Date
}

export interface TicketAttachment {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploadedBy: string
  uploadedAt: Date
}

export interface SupportAgent {
  id: string
  name: string
  email: string
  department: string
  specializations: string[]
  isActive: boolean
  maxConcurrentTickets: number
  currentTicketCount: number
  performanceMetrics: AgentPerformance
  workingHours: WorkingHours
  createdAt: Date
}

export interface AgentPerformance {
  totalTicketsHandled: number
  averageResolutionTime: number // hours
  customerSatisfactionScore: number
  firstResponseTime: number // hours
  escalationRate: number
  reopenRate: number
  lastUpdated: Date
}

export interface WorkingHours {
  timezone: string
  schedule: {
    [key: string]: { start: string; end: string } | null // day of week
  }
}

export interface KnowledgeBaseArticle {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  isPublic: boolean
  viewCount: number
  helpfulVotes: number
  unhelpfulVotes: number
  relatedArticles: string[]
  createdBy: string
  updatedBy: string
  createdAt: Date
  updatedAt: Date
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  order: number
  isActive: boolean
  viewCount: number
  createdAt: Date
  updatedAt: Date
}

export interface SupportMetrics {
  totalTickets: number
  openTickets: number
  resolvedTickets: number
  averageResolutionTime: number
  firstResponseTime: number
  customerSatisfactionScore: number
  ticketsByCategory: { category: string; count: number }[]
  ticketsByPriority: { priority: string; count: number }[]
  agentPerformance: { agentId: string; name: string; metrics: AgentPerformance }[]
}

export class CustomerSupportService {
  private readonly TICKETS_COLLECTION = 'support_tickets'
  private readonly MESSAGES_COLLECTION = 'ticket_messages'
  private readonly AGENTS_COLLECTION = 'support_agents'
  private readonly KB_COLLECTION = 'knowledge_base'
  private readonly FAQ_COLLECTION = 'faqs'

  // Create support ticket
  async createTicket(ticketData: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>): Promise<SupportTicket> {
    try {
      const ticketNumber = await this.generateTicketNumber()
      
      const ticket: Omit<SupportTicket, 'id'> = {
        ...ticketData,
        ticketNumber,
        messages: [],
        escalationLevel: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const docRef = await addDoc(collection(db, this.TICKETS_COLLECTION), ticket)
      
      const createdTicket = {
        id: docRef.id,
        ...ticket
      }

      // Auto-assign ticket if possible
      await this.autoAssignTicket(docRef.id)

      // Send confirmation email to customer
      await this.sendTicketConfirmation(createdTicket)

      // Log ticket creation
      await auditService.logSystemEvent(
        'support_ticket_created',
        {
          ticketId: docRef.id,
          ticketNumber,
          customerId: ticket.customerId,
          category: ticket.category,
          priority: ticket.priority
        },
        true
      )

      return createdTicket
    } catch (error) {
      throw new Error(`Failed to create support ticket: ${(error as Error).message}`)
    }
  }

  // Update ticket
  async updateTicket(ticketId: string, updates: Partial<SupportTicket>): Promise<SupportTicket> {
    try {
      const ticketRef = doc(db, this.TICKETS_COLLECTION, ticketId)
      const ticketDoc = await getDoc(ticketRef)
      
      if (!ticketDoc.exists()) {
        throw new Error('Ticket not found')
      }

      const updatedData = {
        ...updates,
        updatedAt: new Date()
      }

      if (updates.status === 'resolved' || updates.status === 'closed') {
        updatedData.actualResolutionTime = new Date()
        if (updates.status === 'closed') {
          updatedData.closedAt = new Date()
        }
      }

      await updateDoc(ticketRef, updatedData)

      const updatedTicket = {
        id: ticketId,
        ...ticketDoc.data(),
        ...updatedData
      } as SupportTicket

      // Log ticket update
      await auditService.logSystemEvent(
        'support_ticket_updated',
        {
          ticketId,
          updates: Object.keys(updates),
          newStatus: updates.status,
          assignedTo: updates.assignedTo
        },
        true
      )

      // Send notifications for status changes
      if (updates.status && updates.status !== ticketDoc.data()?.status) {
        await this.sendStatusChangeNotification(updatedTicket)
      }

      return updatedTicket
    } catch (error) {
      throw new Error(`Failed to update ticket: ${(error as Error).message}`)
    }
  }

  // Add message to ticket
  async addTicketMessage(
    ticketId: string,
    senderId: string,
    senderType: 'customer' | 'agent' | 'system',
    senderName: string,
    message: string,
    attachments: TicketAttachment[] = [],
    isInternal: boolean = false
  ): Promise<TicketMessage> {
    try {
      const messageData: Omit<TicketMessage, 'id'> = {
        ticketId,
        senderId,
        senderType,
        senderName,
        message,
        attachments,
        isInternal,
        createdAt: new Date()
      }

      const docRef = await addDoc(collection(db, this.MESSAGES_COLLECTION), messageData)
      
      const createdMessage = {
        id: docRef.id,
        ...messageData
      }

      // Update ticket with new message
      const ticketRef = doc(db, this.TICKETS_COLLECTION, ticketId)
      const ticketDoc = await getDoc(ticketRef)
      
      if (ticketDoc.exists()) {
        const ticket = ticketDoc.data() as SupportTicket
        const updatedMessages = [...ticket.messages, createdMessage]
        
        await updateDoc(ticketRef, {
          messages: updatedMessages,
          updatedAt: new Date(),
          // Update status if customer responds
          status: senderType === 'customer' && ticket.status === 'waiting_customer' 
            ? 'in_progress' 
            : ticket.status
        })

        // Send notification to relevant parties
        if (!isInternal) {
          await this.sendMessageNotification(ticketId, createdMessage)
        }
      }

      // Log message addition
      await auditService.logSystemEvent(
        'ticket_message_added',
        {
          ticketId,
          messageId: docRef.id,
          senderId,
          senderType,
          isInternal
        },
        true
      )

      return createdMessage
    } catch (error) {
      throw new Error(`Failed to add ticket message: ${(error as Error).message}`)
    }
  }

  // Get ticket by ID
  async getTicket(ticketId: string): Promise<SupportTicket | null> {
    try {
      const ticketDoc = await getDoc(doc(db, this.TICKETS_COLLECTION, ticketId))
      
      if (!ticketDoc.exists()) {
        return null
      }

      return {
        id: ticketDoc.id,
        ...ticketDoc.data()
      } as SupportTicket
    } catch (error) {
      throw new Error('Failed to fetch ticket')
    }
  }

  // Get tickets with filters
  async getTickets(filters?: {
    customerId?: string
    assignedTo?: string
    status?: TicketStatus
    category?: TicketCategory
    priority?: TicketPriority
    startDate?: Date
    endDate?: Date
    limit?: number
  }): Promise<SupportTicket[]> {
    try {
      let q = query(
        collection(db, this.TICKETS_COLLECTION),
        orderBy('createdAt', 'desc')
      )

      if (filters?.customerId) {
        q = query(q, where('customerId', '==', filters.customerId))
      }
      
      if (filters?.assignedTo) {
        q = query(q, where('assignedTo', '==', filters.assignedTo))
      }
      
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status))
      }
      
      if (filters?.category) {
        q = query(q, where('category', '==', filters.category))
      }
      
      if (filters?.priority) {
        q = query(q, where('priority', '==', filters.priority))
      }
      
      if (filters?.startDate) {
        q = query(q, where('createdAt', '>=', filters.startDate))
      }
      
      if (filters?.endDate) {
        q = query(q, where('createdAt', '<=', filters.endDate))
      }

      if (filters?.limit) {
        q = query(q, limit(filters.limit))
      }

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SupportTicket[]
    } catch (error) {
      throw new Error('Failed to fetch tickets')
    }
  }

  // Assign ticket to agent
  async assignTicket(ticketId: string, agentId: string, assignedBy: string): Promise<void> {
    try {
      // Check agent availability
      const agent = await this.getAgent(agentId)
      if (!agent || !agent.isActive) {
        throw new Error('Agent not available')
      }

      if (agent.currentTicketCount >= agent.maxConcurrentTickets) {
        throw new Error('Agent has reached maximum concurrent tickets')
      }

      // Update ticket
      await this.updateTicket(ticketId, {
        assignedTo: agentId,
        status: 'in_progress'
      })

      // Update agent ticket count
      await this.updateAgent(agentId, {
        currentTicketCount: agent.currentTicketCount + 1
      })

      // Log assignment
      await auditService.logSystemEvent(
        'ticket_assigned',
        {
          ticketId,
          agentId,
          assignedBy
        },
        true
      )
    } catch (error) {
      throw new Error(`Failed to assign ticket: ${(error as Error).message}`)
    }
  }

  // Escalate ticket
  async escalateTicket(ticketId: string, reason: string, escalatedBy: string): Promise<void> {
    try {
      const ticket = await this.getTicket(ticketId)
      if (!ticket) {
        throw new Error('Ticket not found')
      }

      await this.updateTicket(ticketId, {
        status: 'escalated',
        escalationLevel: ticket.escalationLevel + 1,
        priority: ticket.priority === 'urgent' ? 'urgent' : 
                 ticket.priority === 'high' ? 'urgent' : 'high'
      })

      // Add escalation message
      await this.addTicketMessage(
        ticketId,
        escalatedBy,
        'system',
        'System',
        `Ticket escalated to level ${ticket.escalationLevel + 1}. Reason: ${reason}`,
        [],
        true
      )

      // Log escalation
      await auditService.logSystemEvent(
        'ticket_escalated',
        {
          ticketId,
          escalationLevel: ticket.escalationLevel + 1,
          reason,
          escalatedBy
        },
        true
      )

      // Notify management
      await this.notifyEscalation(ticket, reason)
    } catch (error) {
      throw new Error(`Failed to escalate ticket: ${(error as Error).message}`)
    }
  }

  // Create support agent
  async createAgent(agentData: Omit<SupportAgent, 'id' | 'createdAt'>): Promise<SupportAgent> {
    try {
      const agent: Omit<SupportAgent, 'id'> = {
        ...agentData,
        createdAt: new Date()
      }

      const docRef = await addDoc(collection(db, this.AGENTS_COLLECTION), agent)
      
      const createdAgent = {
        id: docRef.id,
        ...agent
      }

      // Log agent creation
      await auditService.logSystemEvent(
        'support_agent_created',
        {
          agentId: docRef.id,
          name: agent.name,
          department: agent.department
        },
        true
      )

      return createdAgent
    } catch (error) {
      throw new Error(`Failed to create support agent: ${(error as Error).message}`)
    }
  }

  // Update agent
  async updateAgent(agentId: string, updates: Partial<SupportAgent>): Promise<SupportAgent> {
    try {
      const agentRef = doc(db, this.AGENTS_COLLECTION, agentId)
      const agentDoc = await getDoc(agentRef)
      
      if (!agentDoc.exists()) {
        throw new Error('Agent not found')
      }

      await updateDoc(agentRef, updates)

      const updatedAgent = {
        id: agentId,
        ...agentDoc.data(),
        ...updates
      } as SupportAgent

      return updatedAgent
    } catch (error) {
      throw new Error(`Failed to update agent: ${(error as Error).message}`)
    }
  }

  // Get agent by ID
  async getAgent(agentId: string): Promise<SupportAgent | null> {
    try {
      const agentDoc = await getDoc(doc(db, this.AGENTS_COLLECTION, agentId))
      
      if (!agentDoc.exists()) {
        return null
      }

      return {
        id: agentDoc.id,
        ...agentDoc.data()
      } as SupportAgent
    } catch (error) {
      throw new Error('Failed to fetch agent')
    }
  }

  // Get available agents for assignment
  async getAvailableAgents(category?: TicketCategory): Promise<SupportAgent[]> {
    try {
      let q = query(
        collection(db, this.AGENTS_COLLECTION),
        where('isActive', '==', true)
      )

      const snapshot = await getDocs(q)
      let agents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SupportAgent[]

      // Filter by specialization if category provided
      if (category) {
        agents = agents.filter(agent => 
          agent.specializations.includes(category) || 
          agent.specializations.includes('general')
        )
      }

      // Filter by availability
      agents = agents.filter(agent => 
        agent.currentTicketCount < agent.maxConcurrentTickets
      )

      // Sort by current workload
      agents.sort((a, b) => a.currentTicketCount - b.currentTicketCount)

      return agents
    } catch (error) {
      throw new Error('Failed to fetch available agents')
    }
  }

  // Create knowledge base article
  async createKBArticle(articleData: Omit<KnowledgeBaseArticle, 'id' | 'createdAt' | 'updatedAt'>): Promise<KnowledgeBaseArticle> {
    try {
      const article: Omit<KnowledgeBaseArticle, 'id'> = {
        ...articleData,
        viewCount: 0,
        helpfulVotes: 0,
        unhelpfulVotes: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const docRef = await addDoc(collection(db, this.KB_COLLECTION), article)
      
      return {
        id: docRef.id,
        ...article
      }
    } catch (error) {
      throw new Error(`Failed to create knowledge base article: ${(error as Error).message}`)
    }
  }

  // Search knowledge base
  async searchKnowledgeBase(query: string, category?: string): Promise<KnowledgeBaseArticle[]> {
    try {
      let q = query(
        collection(db, this.KB_COLLECTION),
        where('isPublic', '==', true)
      )

      if (category) {
        q = query(q, where('category', '==', category))
      }

      const snapshot = await getDocs(q)
      let articles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as KnowledgeBaseArticle[]

      // Simple text search (can be enhanced with full-text search)
      const searchTerms = query.toLowerCase().split(' ')
      articles = articles.filter(article => {
        const content = `${article.title} ${article.content}`.toLowerCase()
        return searchTerms.some(term => content.includes(term))
      })

      // Sort by relevance (simplified)
      articles.sort((a, b) => b.viewCount - a.viewCount)

      return articles
    } catch (error) {
      throw new Error('Failed to search knowledge base')
    }
  }

  // Get support metrics
  async getSupportMetrics(startDate?: Date, endDate?: Date): Promise<SupportMetrics> {
    try {
      let ticketsQuery = query(collection(db, this.TICKETS_COLLECTION))
      
      if (startDate) {
        ticketsQuery = query(ticketsQuery, where('createdAt', '>=', startDate))
      }
      
      if (endDate) {
        ticketsQuery = query(ticketsQuery, where('createdAt', '<=', endDate))
      }

      const ticketsSnapshot = await getDocs(ticketsQuery)
      const tickets = ticketsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SupportTicket[]

      const totalTickets = tickets.length
      const openTickets = tickets.filter(t => ['open', 'in_progress', 'waiting_customer', 'waiting_internal', 'escalated'].includes(t.status)).length
      const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length

      // Calculate average resolution time
      const resolvedWithTime = tickets.filter(t => t.actualResolutionTime && t.createdAt)
      const avgResolutionTime = resolvedWithTime.length > 0 
        ? resolvedWithTime.reduce((sum, t) => {
            const resolutionTime = (t.actualResolutionTime!.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60)
            return sum + resolutionTime
          }, 0) / resolvedWithTime.length
        : 0

      // Calculate first response time (simplified)
      const firstResponseTime = 2.5 // hours - would calculate from actual message data

      // Calculate customer satisfaction
      const ratedTickets = tickets.filter(t => t.satisfactionRating)
      const customerSatisfactionScore = ratedTickets.length > 0
        ? ratedTickets.reduce((sum, t) => sum + t.satisfactionRating!, 0) / ratedTickets.length
        : 0

      // Tickets by category
      const categoryCount: Record<string, number> = {}
      tickets.forEach(ticket => {
        categoryCount[ticket.category] = (categoryCount[ticket.category] || 0) + 1
      })
      const ticketsByCategory = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))

      // Tickets by priority
      const priorityCount: Record<string, number> = {}
      tickets.forEach(ticket => {
        priorityCount[ticket.priority] = (priorityCount[ticket.priority] || 0) + 1
      })
      const ticketsByPriority = Object.entries(priorityCount)
        .map(([priority, count]) => ({ priority, count }))

      // Agent performance (simplified)
      const agentsSnapshot = await getDocs(collection(db, this.AGENTS_COLLECTION))
      const agentPerformance = agentsSnapshot.docs.map(doc => {
        const agent = doc.data() as SupportAgent
        return {
          agentId: doc.id,
          name: agent.name,
          metrics: agent.performanceMetrics
        }
      })

      return {
        totalTickets,
        openTickets,
        resolvedTickets,
        averageResolutionTime: avgResolutionTime,
        firstResponseTime,
        customerSatisfactionScore,
        ticketsByCategory,
        ticketsByPriority,
        agentPerformance
      }
    } catch (error) {
      throw new Error('Failed to get support metrics')
    }
  }

  // Private helper methods
  private async generateTicketNumber(): Promise<string> {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `TKT-${timestamp}-${random}`
  }

  private async autoAssignTicket(ticketId: string): Promise<void> {
    try {
      const ticket = await this.getTicket(ticketId)
      if (!ticket) return

      const availableAgents = await this.getAvailableAgents(ticket.category)
      
      if (availableAgents.length > 0) {
        // Assign to agent with lowest current workload
        const selectedAgent = availableAgents[0]
        await this.assignTicket(ticketId, selectedAgent.id, 'system')
      }
    } catch (error) {
      // Log error but don't throw
      await auditService.logSystemEvent(
        'auto_assignment_failed',
        {
          ticketId,
          error: (error as Error).message
        },
        false
      )
    }
  }

  private async sendTicketConfirmation(ticket: SupportTicket): Promise<void> {
    try {
      await emailService.sendTicketConfirmation(ticket)
    } catch (error) {
      // Log error but don't throw
      await auditService.logSystemEvent(
        'ticket_confirmation_email_failed',
        {
          ticketId: ticket.id,
          error: (error as Error).message
        },
        false
      )
    }
  }

  private async sendStatusChangeNotification(ticket: SupportTicket): Promise<void> {
    try {
      await emailService.sendTicketStatusUpdate(ticket)
    } catch (error) {
      // Log error but don't throw
      await auditService.logSystemEvent(
        'status_change_notification_failed',
        {
          ticketId: ticket.id,
          error: (error as Error).message
        },
        false
      )
    }
  }

  private async sendMessageNotification(ticketId: string, message: TicketMessage): Promise<void> {
    try {
      await emailService.sendTicketMessageNotification(ticketId, message)
    } catch (error) {
      // Log error but don't throw
      await auditService.logSystemEvent(
        'message_notification_failed',
        {
          ticketId,
          messageId: message.id,
          error: (error as Error).message
        },
        false
      )
    }
  }

  private async notifyEscalation(ticket: SupportTicket, reason: string): Promise<void> {
    try {
      await emailService.sendEscalationNotification(ticket, reason)
    } catch (error) {
      // Log error but don't throw
      await auditService.logSystemEvent(
        'escalation_notification_failed',
        {
          ticketId: ticket.id,
          error: (error as Error).message
        },
        false
      )
    }
  }

  // Real-time ticket monitoring
  onTicketChange(ticketId: string, callback: (ticket: SupportTicket | null) => void): () => void {
    return onSnapshot(
      doc(db, this.TICKETS_COLLECTION, ticketId),
      (doc) => {
        if (doc.exists()) {
          callback({ id: doc.id, ...doc.data() } as SupportTicket)
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

export const customerSupportService = new CustomerSupportService()
