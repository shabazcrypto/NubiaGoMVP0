import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  addDoc,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { logger } from '@/lib/utils/logger'

export interface CMSContent {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  template: string
  status: 'draft' | 'published' | 'archived' | 'pending_approval'
  contentType: 'page' | 'post' | 'product' | 'custom'
  
  // SEO
  metaTitle?: string
  metaDescription?: string
  keywords?: string[]
  canonicalUrl?: string
  
  // Media
  featuredImage?: string
  gallery?: string[]
  
  // Workflow
  authorId: string
  authorName?: string
  approverId?: string
  approvalStatus: 'pending' | 'approved' | 'rejected'
  approvalNotes?: string
  
  // Versioning
  version: number
  previousVersions?: string[]
  
  // Publishing
  publishedAt?: Date
  expiresAt?: Date
  isScheduled: boolean
  scheduledPublishAt?: Date
  
  // Metadata
  tags: string[]
  categories: string[]
  customFields: Record<string, any>
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

export interface CMSCreateRequest {
  title: string
  slug: string
  content: string
  excerpt?: string
  template: string
  contentType: 'page' | 'post' | 'product' | 'custom'
  metaTitle?: string
  metaDescription?: string
  keywords?: string[]
  featuredImage?: string
  gallery?: string[]
  tags: string[]
  categories: string[]
  customFields?: Record<string, any>
  isScheduled?: boolean
  scheduledPublishAt?: Date
}

export interface CMSUpdateRequest {
  title?: string
  slug?: string
  content?: string
  excerpt?: string
  template?: string
  metaTitle?: string
  metaDescription?: string
  keywords?: string[]
  featuredImage?: string
  gallery?: string[]
  tags?: string[]
  categories?: string[]
  customFields?: Record<string, any>
  isScheduled?: boolean
  scheduledPublishAt?: Date
}

export interface CMSFilters {
  status?: 'draft' | 'published' | 'archived' | 'pending_approval'
  contentType?: 'page' | 'post' | 'product' | 'custom'
  authorId?: string
  approvalStatus?: 'pending' | 'approved' | 'rejected'
  category?: string
  tags?: string[]
  search?: string
  isScheduled?: boolean
  limit?: number
  startAfter?: string
}

export interface CMSTemplate {
  id: string
  name: string
  description: string
  type: 'page' | 'post' | 'product' | 'custom'
  structure: TemplateField[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TemplateField {
  name: string
  type: 'text' | 'textarea' | 'rich-text' | 'image' | 'select' | 'number' | 'date' | 'boolean'
  label: string
  required: boolean
  defaultValue?: any
  validation?: ValidationRule[]
  options?: SelectOption[]
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom'
  value: any
  message: string
}

export interface SelectOption {
  value: string
  label: string
}

export interface CMSMedia {
  id: string
  name: string
  type: 'image' | 'video' | 'document' | 'audio'
  url: string
  thumbnailUrl?: string
  size: number
  mimeType: string
  dimensions?: {
    width: number
    height: number
  }
  duration?: number // for video/audio
  uploadedBy: string
  uploadedAt: Date
  tags: string[]
  altText?: string
  isPublic: boolean
}

export interface MediaFilters {
  type?: 'image' | 'video' | 'document' | 'audio'
  uploadedBy?: string
  tags?: string[]
  search?: string
  limit?: number
  startAfter?: string
}

export interface CMSVersion {
  id: string
  contentId: string
  version: number
  content: CMSContent
  createdBy: string
  createdAt: Date
  changeNotes?: string
}

export class CMSContentService {
  private contentCollection = collection(db, 'cms_content')
  private templatesCollection = collection(db, 'cms_templates')
  private mediaCollection = collection(db, 'cms_media')
  private versionsCollection = collection(db, 'cms_versions')
  private listeners: Map<string, () => void> = new Map()

  // Content CRUD Operations
  async createContent(content: CMSCreateRequest, authorId: string): Promise<CMSContent> {
    try {
      // Validate required fields
      if (!content.title || !content.slug || !content.content || !content.template) {
        throw new Error('Missing required fields: title, slug, content, template')
      }

      // Check if slug already exists
      const existingContent = await this.getContentBySlug(content.slug)
      if (existingContent) {
        throw new Error('Content with this slug already exists')
      }

      const id = `cms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const now = new Date()
      
      const newContent: CMSContent = {
        id,
        ...content,
        status: 'draft',
        approvalStatus: 'pending',
        version: 1,
        authorId,
        createdAt: now,
        updatedAt: now,
        isScheduled: content.isScheduled || false,
        customFields: content.customFields || {}
      }

      await setDoc(doc(this.contentCollection, id), {
        ...newContent,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now)
      })

      logger.info(`✅ CMS content created: ${id}`)
      return newContent
    } catch (error: any) {
      logger.error('❌ Failed to create CMS content:', error)
      throw new Error(`Failed to create CMS content: ${error.message}`)
    }
  }

  async updateContent(id: string, updates: CMSUpdateRequest, userId: string): Promise<CMSContent> {
    try {
      const contentRef = doc(this.contentCollection, id)
      const contentSnap = await getDoc(contentRef)

      if (!contentSnap.exists()) {
        throw new Error('Content not found')
      }

      const currentContent = contentSnap.data() as CMSContent
      
      // Create version before updating
      await this.createVersion(id, currentContent, userId, 'Content updated')

      const now = new Date()
      const updatedContent: Partial<CMSContent> = {
        ...updates,
        version: currentContent.version + 1,
        updatedAt: now,
        // lastModifiedBy: userId // Not in CMSContent type
      }

      await updateDoc(contentRef, {
        ...updatedContent,
        updatedAt: Timestamp.fromDate(now)
      })

      logger.info(`✅ CMS content updated: ${id}`)
      return { ...currentContent, ...updatedContent } as CMSContent
    } catch (error: any) {
      logger.error('❌ Failed to update CMS content:', error)
      throw new Error(`Failed to update CMS content: ${error.message}`)
    }
  }

  async deleteContent(id: string): Promise<void> {
    try {
      await deleteDoc(doc(this.contentCollection, id))
      logger.info(`✅ CMS content deleted: ${id}`)
    } catch (error: any) {
      logger.error('❌ Failed to delete CMS content:', error)
      throw new Error(`Failed to delete CMS content: ${error.message}`)
    }
  }

  async getContent(id: string): Promise<CMSContent | null> {
    try {
      const contentSnap = await getDoc(doc(this.contentCollection, id))
      
      if (!contentSnap.exists()) {
        return null
      }

      const data = contentSnap.data()
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        publishedAt: data.publishedAt?.toDate(),
        expiresAt: data.expiresAt?.toDate(),
        scheduledPublishAt: data.scheduledPublishAt?.toDate()
      } as CMSContent
    } catch (error: any) {
      logger.error('❌ Failed to fetch CMS content:', error)
      throw new Error(`Failed to fetch CMS content: ${error.message}`)
    }
  }

  async getContentBySlug(slug: string): Promise<CMSContent | null> {
    try {
      const q = query(
        this.contentCollection,
        where('slug', '==', slug),
        where('status', '==', 'published'),
        limit(1)
      )
      
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        return null
      }

      const doc = querySnapshot.docs[0]
      const data = doc.data()
      
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        publishedAt: data.publishedAt?.toDate(),
        expiresAt: data.expiresAt?.toDate(),
        scheduledPublishAt: data.scheduledPublishAt?.toDate()
      } as CMSContent
    } catch (error: any) {
      logger.error('❌ Failed to fetch CMS content by slug:', error)
      throw new Error(`Failed to fetch CMS content by slug: ${error.message}`)
    }
  }

  async listContent(filters: CMSFilters = {}): Promise<CMSContent[]> {
    try {
      let q = query(this.contentCollection, orderBy('createdAt', 'desc'))

      // Apply filters
      if (filters.status) {
        q = query(q, where('status', '==', filters.status))
      }
      if (filters.contentType) {
        q = query(q, where('contentType', '==', filters.contentType))
      }
      if (filters.authorId) {
        q = query(q, where('authorId', '==', filters.authorId))
      }
      if (filters.approvalStatus) {
        q = query(q, where('approvalStatus', '==', filters.approvalStatus))
      }
      if (filters.category) {
        q = query(q, where('categories', 'array-contains', filters.category))
      }
      if (filters.isScheduled !== undefined) {
        q = query(q, where('isScheduled', '==', filters.isScheduled))
      }

      if (filters.limit) {
        q = query(q, limit(filters.limit))
      }

      const querySnapshot = await getDocs(q)
      const content: CMSContent[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        content.push({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          publishedAt: data.publishedAt?.toDate(),
          expiresAt: data.expiresAt?.toDate(),
          scheduledPublishAt: data.scheduledPublishAt?.toDate()
        } as CMSContent)
      })

      // Apply search filter if provided
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        return content.filter(item => 
          item.title.toLowerCase().includes(searchTerm) ||
          item.content.toLowerCase().includes(searchTerm) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        )
      }

      return content
    } catch (error: any) {
      logger.error('❌ Failed to fetch CMS content list:', error)
      throw new Error(`Failed to fetch CMS content list: ${error.message}`)
    }
  }

  // Template Management
  async createTemplate(template: Omit<CMSTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<CMSTemplate> {
    try {
      const id = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const now = new Date()
      
      const newTemplate: CMSTemplate = {
        id,
        ...template,
        createdAt: now,
        updatedAt: now
      }

      await setDoc(doc(this.templatesCollection, id), {
        ...newTemplate,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now)
      })

      logger.info(`✅ CMS template created: ${id}`)
      return newTemplate
    } catch (error: any) {
      logger.error('❌ Failed to create CMS template:', error)
      throw new Error(`Failed to create CMS template: ${error.message}`)
    }
  }

  async getTemplates(): Promise<CMSTemplate[]> {
    try {
      const querySnapshot = await getDocs(this.templatesCollection)
      const templates: CMSTemplate[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        templates.push({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as CMSTemplate)
      })

      return templates.filter(t => t.isActive)
    } catch (error: any) {
      logger.error('❌ Failed to fetch CMS templates:', error)
      throw new Error(`Failed to fetch CMS templates: ${error.message}`)
    }
  }

  // Workflow Management
  async submitForApproval(contentId: string): Promise<void> {
    try {
      await updateDoc(doc(db, this.contentCollection, contentId), {
        status: 'pending_approval',
        approvalStatus: 'pending',
        updatedAt: serverTimestamp()
      })
      logger.info(`✅ Content submitted for approval: ${contentId}`)
    } catch (error: any) {
      logger.error('❌ Failed to submit content for approval:', error)
      throw new Error(`Failed to submit content for approval: ${error.message}`)
    }
  }

  async approveContent(contentId: string, approverId: string, notes?: string): Promise<void> {
    try {
      const updates: any = {
        status: 'published',
        approvalStatus: 'approved',
        approverId,
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      if (notes) {
        updates.approvalNotes = notes
      }

      await updateDoc(doc(db, this.contentCollection, contentId), updates)
      logger.info(`✅ Content approved: ${contentId}`)
    } catch (error: any) {
      logger.error('❌ Failed to approve content:', error)
      throw new Error(`Failed to approve content: ${error.message}`)
    }
  }

  async rejectContent(contentId: string, approverId: string, reason: string): Promise<void> {
    try {
      await updateDoc(doc(db, this.contentCollection, contentId), {
        status: 'draft',
        approvalStatus: 'rejected',
        approverId,
        approvalNotes: reason,
        updatedAt: serverTimestamp()
      })
      logger.info(`✅ Content rejected: ${contentId}`)
    } catch (error: any) {
      logger.error('❌ Failed to reject content:', error)
      throw new Error(`Failed to reject content: ${error.message}`)
    }
  }

  // Versioning
  async createVersion(contentId: string, content: CMSContent, createdBy: string, changeNotes?: string): Promise<CMSVersion> {
    try {
      const id = `version_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const now = new Date()
      
      const version: CMSVersion = {
        id,
        contentId,
        version: content.version,
        content,
        createdBy,
        createdAt: now,
        changeNotes
      }

      await setDoc(doc(db, this.versionsCollection, id), {
        ...version,
        createdAt: Timestamp.fromDate(now)
      })

      logger.info(`✅ CMS version created: ${id}`)
      return version
    } catch (error: any) {
      logger.error('❌ Failed to create CMS version:', error)
      throw new Error(`Failed to create CMS version: ${error.message}`)
    }
  }

  async getVersionHistory(contentId: string): Promise<CMSVersion[]> {
    try {
      const q = query(
        this.versionsCollection,
        where('contentId', '==', contentId),
        orderBy('version', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const versions: CMSVersion[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        versions.push({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as CMSVersion)
      })

      return versions
    } catch (error: any) {
      logger.error('❌ Failed to fetch version history:', error)
      throw new Error(`Failed to fetch version history: ${error.message}`)
    }
  }

  async restoreVersion(contentId: string, versionId: string): Promise<void> {
    try {
      const versionSnap = await getDoc(doc(db, this.versionsCollection, versionId))
      
      if (!versionSnap.exists()) {
        throw new Error('Version not found')
      }

      const version = versionSnap.data() as CMSVersion
      const contentRef = doc(db, this.contentCollection, contentId)
      
      // Create new version before restoring
      const currentContentSnap = await getDoc(contentRef)
      if (currentContentSnap.exists()) {
        const currentContent = currentContentSnap.data() as CMSContent
        await this.createVersion(contentId, currentContent, 'system', 'Version restored')
      }

      // Restore the old version
      const restoredContent = {
        ...version.content,
        version: version.content.version + 1,
        updatedAt: serverTimestamp()
      }

      await updateDoc(contentRef, restoredContent)
      logger.info(`✅ Content version restored: ${contentId}`)
    } catch (error: any) {
      logger.error('❌ Failed to restore version:', error)
      throw new Error(`Failed to restore version: ${error.message}`)
    }
  }

  // Real-time listeners
  onContentChange(contentId: string, callback: (content: CMSContent | null) => void): () => void {
    const unsubscribe = onSnapshot(
      doc(db, this.contentCollection, contentId),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data()
          const content: CMSContent = {
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            publishedAt: data.publishedAt?.toDate(),
            expiresAt: data.expiresAt?.toDate(),
            scheduledPublishAt: data.scheduledPublishAt?.toDate()
          } as CMSContent
          callback(content)
        } else {
          callback(null)
        }
      },
      (error) => {
        logger.error('❌ CMS content listener error:', error)
        callback(null)
      }
    )

    this.listeners.set(contentId, unsubscribe)
    return unsubscribe
  }

  onContentListChange(filters: CMSFilters, callback: (content: CMSContent[]) => void): () => void {
    let q = query(this.contentCollection, orderBy('createdAt', 'desc'))

    // Apply filters
    if (filters.status) {
      q = query(q, where('status', '==', filters.status))
    }
    if (filters.contentType) {
      q = query(q, where('contentType', '==', filters.contentType))
    }
    if (filters.approvalStatus) {
      q = query(q, where('approvalStatus', '==', filters.approvalStatus))
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const content: CMSContent[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        content.push({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          publishedAt: data.publishedAt?.toDate(),
          expiresAt: data.expiresAt?.toDate(),
          scheduledPublishAt: data.scheduledPublishAt?.toDate()
        } as CMSContent)
      })

      callback(content)
    }, (error) => {
      logger.error('❌ CMS content list listener error:', error)
      callback([])
    })

    const listenerId = `list_${Date.now()}`
    this.listeners.set(listenerId, unsubscribe)
    return unsubscribe
  }

  // Cleanup listeners
  cleanup(): void {
    this.listeners.forEach(unsubscribe => unsubscribe())
    this.listeners.clear()
  }
}

export const cmsContentService = new CMSContentService()
