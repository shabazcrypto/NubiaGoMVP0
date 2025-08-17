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
  Timestamp,
  limit
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { logger } from '@/lib/utils/logger'
import { CMSTemplate, TemplateField } from './cms-content.service'

export class CMSTemplatesService {
  private templatesCollection = collection(db, 'cms_templates')

  // Initialize default templates
  async initializeDefaultTemplates(): Promise<void> {
    try {
      const defaultTemplates = this.getDefaultTemplates()
      
      for (const template of defaultTemplates) {
        const existingTemplate = await this.getTemplateByName(template.name)
        if (!existingTemplate) {
          await this.createTemplate(template)
          logger.info(`✅ Default template created: ${template.name}`)
        }
      }
      
      logger.info('✅ All default templates initialized')
    } catch (error: any) {
      logger.error('❌ Failed to initialize default templates:', error)
      throw new Error(`Failed to initialize default templates: ${error.message}`)
    }
  }

  // Get default templates
  private getDefaultTemplates(): Omit<CMSTemplate, 'id' | 'createdAt' | 'updatedAt'>[] {
    return [
      {
        name: 'Standard Page',
        description: 'A standard page template with title, content, and SEO fields',
        type: 'page',
        isActive: true,
        structure: [
          {
            name: 'title',
            type: 'text',
            label: 'Page Title',
            required: true,
            defaultValue: '',
            validation: [
              { type: 'required', value: true, message: 'Title is required' },
              { type: 'minLength', value: 3, message: 'Title must be at least 3 characters' }
            ]
          },
          {
            name: 'content',
            type: 'rich-text',
            label: 'Page Content',
            required: true,
            defaultValue: '',
            validation: [
              { type: 'required', value: true, message: 'Content is required' }
            ]
          },
          {
            name: 'excerpt',
            type: 'textarea',
            label: 'Page Excerpt',
            required: false,
            defaultValue: '',
            validation: [
              { type: 'maxLength', value: 200, message: 'Excerpt must be less than 200 characters' }
            ]
          },
          {
            name: 'metaTitle',
            type: 'text',
            label: 'Meta Title',
            required: false,
            defaultValue: '',
            validation: [
              { type: 'maxLength', value: 60, message: 'Meta title must be less than 60 characters' }
            ]
          },
          {
            name: 'metaDescription',
            type: 'textarea',
            label: 'Meta Description',
            required: false,
            defaultValue: '',
            validation: [
              { type: 'maxLength', value: 160, message: 'Meta description must be less than 160 characters' }
            ]
          },
          {
            name: 'featuredImage',
            type: 'image',
            label: 'Featured Image',
            required: false,
            defaultValue: ''
          },
          {
            name: 'tags',
            type: 'text',
            label: 'Tags (comma-separated)',
            required: false,
            defaultValue: ''
          }
        ]
      },
      {
        name: 'Blog Post',
        description: 'A blog post template with title, content, author, and publishing options',
        type: 'post',
        isActive: true,
        structure: [
          {
            name: 'title',
            type: 'text',
            label: 'Post Title',
            required: true,
            defaultValue: '',
            validation: [
              { type: 'required', value: true, message: 'Title is required' },
              { type: 'minLength', value: 5, message: 'Title must be at least 5 characters' }
            ]
          },
          {
            name: 'content',
            type: 'rich-text',
            label: 'Post Content',
            required: true,
            defaultValue: '',
            validation: [
              { type: 'required', value: true, message: 'Content is required' }
            ]
          },
          {
            name: 'excerpt',
            type: 'textarea',
            label: 'Post Excerpt',
            required: true,
            defaultValue: '',
            validation: [
              { type: 'required', value: true, message: 'Excerpt is required' },
              { type: 'maxLength', value: 300, message: 'Excerpt must be less than 300 characters' }
            ]
          },
          {
            name: 'featuredImage',
            type: 'image',
            label: 'Featured Image',
            required: true,
            defaultValue: '',
            validation: [
              { type: 'required', value: true, message: 'Featured image is required' }
            ]
          },
          {
            name: 'category',
            type: 'select',
            label: 'Category',
            required: true,
            defaultValue: '',
            options: [
              { value: 'technology', label: 'Technology' },
              { value: 'business', label: 'Business' },
              { value: 'lifestyle', label: 'Lifestyle' },
              { value: 'news', label: 'News' }
            ],
            validation: [
              { type: 'required', value: true, message: 'Category is required' }
            ]
          },
          {
            name: 'tags',
            type: 'text',
            label: 'Tags (comma-separated)',
            required: false,
            defaultValue: ''
          },
          {
            name: 'metaTitle',
            type: 'text',
            label: 'Meta Title',
            required: false,
            defaultValue: '',
            validation: [
              { type: 'maxLength', value: 60, message: 'Meta title must be less than 60 characters' }
            ]
          },
          {
            name: 'metaDescription',
            type: 'textarea',
            label: 'Meta Description',
            required: false,
            defaultValue: '',
            validation: [
              { type: 'maxLength', value: 160, message: 'Meta description must be less than 160 characters' }
            ]
          }
        ]
      },
      {
        name: 'Product Page',
        description: 'A product page template with product details, images, and specifications',
        type: 'product',
        isActive: true,
        structure: [
          {
            name: 'title',
            type: 'text',
            label: 'Product Name',
            required: true,
            defaultValue: '',
            validation: [
              { type: 'required', value: true, message: 'Product name is required' }
            ]
          },
          {
            name: 'description',
            type: 'rich-text',
            label: 'Product Description',
            required: true,
            defaultValue: '',
            validation: [
              { type: 'required', value: true, message: 'Product description is required' }
            ]
          },
          {
            name: 'shortDescription',
            type: 'textarea',
            label: 'Short Description',
            required: true,
            defaultValue: '',
            validation: [
              { type: 'required', value: true, message: 'Short description is required' },
              { type: 'maxLength', value: 200, message: 'Short description must be less than 200 characters' }
            ]
          },
          {
            name: 'price',
            type: 'number',
            label: 'Price',
            required: true,
            defaultValue: 0,
            validation: [
              { type: 'required', value: true, message: 'Price is required' },
              { type: 'minLength', value: 0, message: 'Price must be greater than or equal to 0' }
            ]
          },
          {
            name: 'images',
            type: 'image',
            label: 'Product Images',
            required: true,
            defaultValue: '',
            validation: [
              { type: 'required', value: true, message: 'At least one product image is required' }
            ]
          },
          {
            name: 'category',
            type: 'select',
            label: 'Product Category',
            required: true,
            defaultValue: '',
            options: [
              { value: 'electronics', label: 'Electronics' },
              { value: 'clothing', label: 'Clothing' },
              { value: 'home', label: 'Home & Garden' },
              { value: 'sports', label: 'Sports & Outdoors' },
              { value: 'books', label: 'Books & Media' }
            ],
            validation: [
              { type: 'required', value: true, message: 'Product category is required' }
            ]
          },
          {
            name: 'specifications',
            type: 'textarea',
            label: 'Product Specifications',
            required: false,
            defaultValue: ''
          },
          {
            name: 'metaTitle',
            type: 'text',
            label: 'Meta Title',
            required: false,
            defaultValue: '',
            validation: [
              { type: 'maxLength', value: 60, message: 'Meta title must be less than 60 characters' }
            ]
          },
          {
            name: 'metaDescription',
            type: 'textarea',
            label: 'Meta Description',
            required: false,
            defaultValue: '',
            validation: [
              { type: 'maxLength', value: 160, message: 'Meta description must be less than 160 characters' }
            ]
          }
        ]
      },
      {
        name: 'Landing Page',
        description: 'A landing page template with hero section, features, and call-to-action',
        type: 'page',
        isActive: true,
        structure: [
          {
            name: 'heroTitle',
            type: 'text',
            label: 'Hero Title',
            required: true,
            defaultValue: '',
            validation: [
              { type: 'required', value: true, message: 'Hero title is required' }
            ]
          },
          {
            name: 'heroSubtitle',
            type: 'textarea',
            label: 'Hero Subtitle',
            required: false,
            defaultValue: '',
            validation: [
              { type: 'maxLength', value: 200, message: 'Hero subtitle must be less than 200 characters' }
            ]
          },
          {
            name: 'heroImage',
            type: 'image',
            label: 'Hero Image',
            required: true,
            defaultValue: '',
            validation: [
              { type: 'required', value: true, message: 'Hero image is required' }
            ]
          },
          {
            name: 'ctaText',
            type: 'text',
            label: 'Call-to-Action Text',
            required: true,
            defaultValue: 'Get Started',
            validation: [
              { type: 'required', value: true, message: 'CTA text is required' }
            ]
          },
          {
            name: 'ctaLink',
            type: 'text',
            label: 'Call-to-Action Link',
            required: true,
            defaultValue: '/contact',
            validation: [
              { type: 'required', value: true, message: 'CTA link is required' }
            ]
          },
          {
            name: 'features',
            type: 'rich-text',
            label: 'Features Section',
            required: false,
            defaultValue: ''
          },
          {
            name: 'testimonials',
            type: 'rich-text',
            label: 'Testimonials Section',
            required: false,
            defaultValue: ''
          },
          {
            name: 'metaTitle',
            type: 'text',
            label: 'Meta Title',
            required: false,
            defaultValue: '',
            validation: [
              { type: 'maxLength', value: 60, message: 'Meta title must be less than 60 characters' }
            ]
          },
          {
            name: 'metaDescription',
            type: 'textarea',
            label: 'Meta Description',
            required: false,
            defaultValue: '',
            validation: [
              { type: 'maxLength', value: 160, message: 'Meta description must be less than 160 characters' }
            ]
          }
        ]
      }
    ]
  }

  // Create a new template
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

      await setDoc(doc(db, this.templatesCollection, id), {
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

  // Get template by ID
  async getTemplate(id: string): Promise<CMSTemplate | null> {
    try {
      const templateSnap = await getDoc(doc(db, this.templatesCollection, id))
      
      if (!templateSnap.exists()) {
        return null
      }

      const data = templateSnap.data()
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as CMSTemplate
    } catch (error: any) {
      logger.error('❌ Failed to fetch CMS template:', error)
      throw new Error(`Failed to fetch CMS template: ${error.message}`)
    }
  }

  // Get template by name
  async getTemplateByName(name: string): Promise<CMSTemplate | null> {
    try {
      const q = query(
        this.templatesCollection,
        where('name', '==', name),
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
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as CMSTemplate
    } catch (error: any) {
      logger.error('❌ Failed to fetch CMS template by name:', error)
      throw new Error(`Failed to fetch CMS template by name: ${error.message}`)
    }
  }

  // Get all templates
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

      return templates.sort((a, b) => a.name.localeCompare(b.name))
    } catch (error: any) {
      logger.error('❌ Failed to fetch CMS templates:', error)
      throw new Error(`Failed to fetch CMS templates: ${error.message}`)
    }
  }

  // Get active templates by type
  async getActiveTemplatesByType(type: string): Promise<CMSTemplate[]> {
    try {
      const q = query(
        this.templatesCollection,
        where('type', '==', type),
        where('isActive', '==', true),
        orderBy('name')
      )
      
      const querySnapshot = await getDocs(q)
      const templates: CMSTemplate[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        templates.push({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as CMSTemplate)
      })

      return templates
    } catch (error: any) {
      logger.error('❌ Failed to fetch active templates by type:', error)
      throw new Error(`Failed to fetch active templates by type: ${error.message}`)
    }
  }

  // Update template
  async updateTemplate(id: string, updates: Partial<CMSTemplate>): Promise<CMSTemplate> {
    try {
      const templateRef = doc(db, this.templatesCollection, id)
      const templateSnap = await getDoc(templateRef)

      if (!templateSnap.exists()) {
        throw new Error('Template not found')
      }

      const now = new Date()
      const updatedTemplate = {
        ...updates,
        updatedAt: now
      }

      await updateDoc(templateRef, {
        ...updatedTemplate,
        updatedAt: Timestamp.fromDate(now)
      })

      logger.info(`✅ CMS template updated: ${id}`)
      return { ...templateSnap.data(), ...updatedTemplate } as CMSTemplate
    } catch (error: any) {
      logger.error('❌ Failed to update CMS template:', error)
      throw new Error(`Failed to update CMS template: ${error.message}`)
    }
  }

  // Delete template
  async deleteTemplate(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.templatesCollection, id))
      logger.info(`✅ CMS template deleted: ${id}`)
    } catch (error: any) {
      logger.error('❌ Failed to delete CMS template:', error)
      throw new Error(`Failed to delete CMS template: ${error.message}`)
    }
  }

  // Toggle template active status
  async toggleTemplateStatus(id: string): Promise<void> {
    try {
      const template = await this.getTemplate(id)
      if (!template) {
        throw new Error('Template not found')
      }

      await this.updateTemplate(id, { isActive: !template.isActive })
      logger.info(`✅ CMS template status toggled: ${id}`)
    } catch (error: any) {
      logger.error('❌ Failed to toggle template status:', error)
      throw new Error(`Failed to toggle template status: ${error.message}`)
    }
  }
}

export const cmsTemplatesService = new CMSTemplatesService()
