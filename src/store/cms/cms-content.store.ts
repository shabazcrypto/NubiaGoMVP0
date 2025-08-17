import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { 
  cmsContentService, 
  CMSContent, 
  CMSCreateRequest, 
  CMSUpdateRequest, 
  CMSFilters,
  CMSTemplate,
  CMSMedia,
  CMSVersion
} from '@/lib/services/cms/cms-content.service'

interface CMSContentState {
  // Content State
  content: CMSContent[]
  currentContent: CMSContent | null
  templates: CMSTemplate[]
  media: CMSMedia[]
  selectedMedia: CMSMedia[]
  
  // UI State
  isLoading: boolean
  error: string | null
  filters: CMSFilters
  
  // Workflow State
  pendingApprovals: CMSContent[]
  workflowStatus: 'idle' | 'loading' | 'success' | 'error'
  
  // Pagination
  hasMore: boolean
  lastDoc: string | null
}

interface CMSContentActions {
  // Content Actions
  fetchContent: (filters?: CMSFilters, reset?: boolean) => Promise<void>
  fetchContentById: (id: string) => Promise<void>
  createContent: (content: CMSCreateRequest, authorId: string) => Promise<void>
  updateContent: (id: string, updates: CMSUpdateRequest, userId: string) => Promise<void>
  deleteContent: (id: string) => Promise<void>
  
  // Template Actions
  fetchTemplates: () => Promise<void>
  createTemplate: (template: Omit<CMSTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  
  // Media Actions
  fetchMedia: (filters?: any) => Promise<void>
  selectMedia: (media: CMSMedia) => void
  deselectMedia: (mediaId: string) => void
  clearSelectedMedia: () => void
  
  // Workflow Actions
  submitForApproval: (contentId: string) => Promise<void>
  approveContent: (contentId: string, approverId: string, notes?: string) => Promise<void>
  rejectContent: (contentId: string, approverId: string, reason: string) => Promise<void>
  
  // Version Actions
  fetchVersionHistory: (contentId: string) => Promise<CMSVersion[]>
  restoreVersion: (contentId: string, versionId: string) => Promise<void>
  
  // Utility Actions
  setCurrentContent: (content: CMSContent | null) => void
  setFilters: (filters: CMSFilters) => void
  clearError: () => void
  reset: () => void
}

interface CMSContentStore extends CMSContentState, CMSContentActions {}

const initialState: CMSContentState = {
  content: [],
  currentContent: null,
  templates: [],
  media: [],
  selectedMedia: [],
  isLoading: false,
  error: null,
  filters: {},
  pendingApprovals: [],
  workflowStatus: 'idle',
  hasMore: true,
  lastDoc: null
}

export const useCMSContentStore = create<CMSContentStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Content Actions
        fetchContent: async (filters = {}, reset = false) => {
          try {
            set({ isLoading: true, error: null })
            
            const currentFilters = reset ? filters : { ...get().filters, ...filters }
            const content = await cmsContentService.listContent(currentFilters)
            
            set(state => ({
              content: reset ? content : [...state.content, ...content],
              filters: currentFilters,
              isLoading: false,
              hasMore: content.length > 0
            }))
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to fetch content',
              isLoading: false 
            })
          }
        },

        fetchContentById: async (id: string) => {
          try {
            set({ isLoading: true, error: null })
            const content = await cmsContentService.getContent(id)
            set({ currentContent: content, isLoading: false })
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to fetch content',
              isLoading: false 
            })
          }
        },

        createContent: async (content: CMSCreateRequest, authorId: string) => {
          try {
            set({ isLoading: true, error: null })
            const newContent = await cmsContentService.createContent(content, authorId)
            
            set(state => ({
              content: [newContent, ...state.content],
              currentContent: newContent,
              isLoading: false
            }))
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to create content',
              isLoading: false 
            })
            throw error
          }
        },

        updateContent: async (id: string, updates: CMSUpdateRequest, userId: string) => {
          try {
            set({ isLoading: true, error: null })
            const updatedContent = await cmsContentService.updateContent(id, updates, userId)
            
            set(state => ({
              content: state.content.map(item => 
                item.id === id ? updatedContent : item
              ),
              currentContent: state.currentContent?.id === id ? updatedContent : state.currentContent,
              isLoading: false
            }))
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to update content',
              isLoading: false 
            })
            throw error
          }
        },

        deleteContent: async (id: string) => {
          try {
            set({ isLoading: true, error: null })
            await cmsContentService.deleteContent(id)
            
            set(state => ({
              content: state.content.filter(item => item.id !== id),
              currentContent: state.currentContent?.id === id ? null : state.currentContent,
              isLoading: false
            }))
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to delete content',
              isLoading: false 
            })
            throw error
          }
        },

        // Template Actions
        fetchTemplates: async () => {
          try {
            const templates = await cmsContentService.getTemplates()
            set({ templates })
          } catch (error: any) {
            set({ error: error.message || 'Failed to fetch templates' })
            throw error
          }
        },

        createTemplate: async (template: Omit<CMSTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
          try {
            const newTemplate = await cmsContentService.createTemplate(template)
            set(state => ({
              templates: [...state.templates, newTemplate]
            }))
          } catch (error: any) {
            set({ error: error.message || 'Failed to create template' })
            throw error
          }
        },

        // Media Actions
        fetchMedia: async (filters = {}) => {
          try {
            // This would integrate with a media service
            // For now, we'll use a placeholder
            set({ media: [] })
          } catch (error: any) {
            set({ error: error.message || 'Failed to fetch media' })
          }
        },

        selectMedia: (media: CMSMedia) => {
          set(state => ({
            selectedMedia: [...state.selectedMedia, media]
          }))
        },

        deselectMedia: (mediaId: string) => {
          set(state => ({
            selectedMedia: state.selectedMedia.filter(item => item.id !== mediaId)
          }))
        },

        clearSelectedMedia: () => {
          set({ selectedMedia: [] })
        },

        // Workflow Actions
        submitForApproval: async (contentId: string) => {
          try {
            set({ workflowStatus: 'loading' })
            await cmsContentService.submitForApproval(contentId)
            
            // Update local state
            set(state => ({
              content: state.content.map(item => 
                item.id === contentId 
                  ? { ...item, status: 'pending_approval', approvalStatus: 'pending' }
                  : item
              ),
              currentContent: state.currentContent?.id === contentId 
                ? { ...state.currentContent, status: 'pending_approval', approvalStatus: 'pending' }
                : state.currentContent,
              workflowStatus: 'success'
            }))
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to submit for approval',
              workflowStatus: 'error'
            })
            throw error
          }
        },

        approveContent: async (contentId: string, approverId: string, notes?: string) => {
          try {
            set({ workflowStatus: 'loading' })
            await cmsContentService.approveContent(contentId, approverId, notes)
            
            // Update local state
            set(state => ({
              content: state.content.map(item => 
                item.id === contentId 
                  ? { ...item, status: 'published', approvalStatus: 'approved' }
                  : item
              ),
              currentContent: state.currentContent?.id === contentId 
                ? { ...state.currentContent, status: 'published', approvalStatus: 'approved' }
                : state.currentContent,
              workflowStatus: 'success'
            }))
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to approve content',
              workflowStatus: 'error'
            })
            throw error
          }
        },

        rejectContent: async (contentId: string, approverId: string, reason: string) => {
          try {
            set({ workflowStatus: 'loading' })
            await cmsContentService.rejectContent(contentId, approverId, reason)
            
            // Update local state
            set(state => ({
              content: state.content.map(item => 
                item.id === contentId 
                  ? { ...item, status: 'draft', approvalStatus: 'rejected' }
                  : item
              ),
              currentContent: state.currentContent?.id === contentId 
                ? { ...state.currentContent, status: 'draft', approvalStatus: 'rejected' }
                : state.currentContent,
              workflowStatus: 'success'
            }))
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to reject content',
              workflowStatus: 'error'
            })
            throw error
          }
        },

        // Version Actions
        fetchVersionHistory: async (contentId: string) => {
          try {
            return await cmsContentService.getVersionHistory(contentId)
          } catch (error: any) {
            set({ error: error.message || 'Failed to fetch version history' })
            throw error
          }
        },

        restoreVersion: async (contentId: string, versionId: string) => {
          try {
            await cmsContentService.restoreVersion(contentId, versionId)
            // Refresh the current content
            const { fetchContentById } = get()
            await fetchContentById(contentId)
          } catch (error: any) {
            set({ error: error.message || 'Failed to restore version' })
            throw error
          }
        },

        // Utility Actions
        setCurrentContent: (content: CMSContent | null) => {
          set({ currentContent: content })
        },

        setFilters: (filters: CMSFilters) => {
          set({ filters })
        },

        clearError: () => {
          set({ error: null })
        },

        reset: () => {
          set(initialState)
        }
      }),
      {
        name: 'cms-content-store',
        partialize: (state) => ({
          filters: state.filters,
          selectedMedia: state.selectedMedia
        })
      }
    ),
    {
      name: 'cms-content-store'
    }
  )
)
