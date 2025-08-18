'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, FileText, Plus } from 'lucide-react'
import { InlineLoading } from '@/components/ui/loading'
import { useCMSContentStore } from '@/store/cms'
import { toast } from 'sonner'

const defaultTemplates = [
  {
    name: 'Blog Post',
    type: 'post',
    description: 'Standard blog post template with title, content, excerpt, and metadata',
    structure: [
      { name: 'title', type: 'text', label: 'Title', required: true },
      { name: 'content', type: 'rich-text', label: 'Content', required: true },
      { name: 'excerpt', type: 'textarea', label: 'Excerpt', required: false },
      { name: 'tags', type: 'text', label: 'Tags', required: false },
      { name: 'categories', type: 'text', label: 'Categories', required: false },
      { name: 'metaTitle', type: 'text', label: 'Meta Title', required: false },
      { name: 'metaDescription', type: 'textarea', label: 'Meta Description', required: false },
      { name: 'keywords', type: 'text', label: 'Keywords', required: false }
    ]
  },
  {
    name: 'Page',
    type: 'page',
    description: 'Standard page template for static content',
    structure: [
      { name: 'title', type: 'text', label: 'Title', required: true },
      { name: 'content', type: 'rich-text', label: 'Content', required: true },
      { name: 'excerpt', type: 'textarea', label: 'Excerpt', required: false },
      { name: 'metaTitle', type: 'text', label: 'Meta Title', required: false },
      { name: 'metaDescription', type: 'textarea', label: 'Meta Description', required: false },
      { name: 'keywords', type: 'text', label: 'Keywords', required: false }
    ]
  },
  {
    name: 'Product',
    type: 'product',
    description: 'Product template with specifications and details',
    structure: [
      { name: 'title', type: 'text', label: 'Title', required: true },
      { name: 'content', type: 'rich-text', label: 'Content', required: true },
      { name: 'excerpt', type: 'textarea', label: 'Excerpt', required: false },
      { name: 'price', type: 'number', label: 'Price', required: false },
      { name: 'specifications', type: 'textarea', label: 'Specifications', required: false },
      { name: 'metaTitle', type: 'text', label: 'Meta Title', required: false },
      { name: 'metaDescription', type: 'textarea', label: 'Meta Description', required: false },
      { name: 'keywords', type: 'text', label: 'Keywords', required: false }
    ]
  }
]

export default function CreateTemplates() {
  const [isCreating, setIsCreating] = useState(false)
  const [createdTemplates, setCreatedTemplates] = useState<string[]>([])
  const [errors, setErrors] = useState<string[]>([])
  
  const { templates, createTemplate } = useCMSContentStore()

  const handleCreateTemplates = async () => {
    setIsCreating(true)
    setCreatedTemplates([])
    setErrors([])

    try {
      for (const templateData of defaultTemplates) {
        try {
          // Check if template already exists
          const existingTemplate = templates.find(t => t.name === templateData.name && t.type === templateData.type)
          
          if (existingTemplate) {
            setCreatedTemplates(prev => [...prev, `Template: ${templateData.name} (already exists)`])
            continue
          }

          // Create template
          await createTemplate({
            name: templateData.name,
            type: templateData.type as "custom" | "page" | "post" | "product",
            description: templateData.description,
            structure: templateData.structure as any,
            isActive: true
          })
          
          setCreatedTemplates(prev => [...prev, `Template: ${templateData.name}`])
          toast.success(`Created template: ${templateData.name}`)
        } catch (error: any) {
          const errorMsg = `Failed to create template "${templateData.name}": ${error.message}`
          setErrors(prev => [...prev, errorMsg])
          toast(errorMsg, 'error')
        }
      }

      toast.success('Template creation completed!')
    } catch (error: any) {
      toast(`Template creation failed: ${error.message}`, 'error')
    } finally {
      setIsCreating(false)
    }
  }

  const existingTemplateCount = templates.filter(t => 
    defaultTemplates.some(dt => dt.name === t.name && dt.type === t.type)
  ).length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create Default Templates
          </CardTitle>
          <CardDescription>
            Create the default templates needed for your CMS. These templates define the structure for different content types.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Default Templates</h3>
              <p className="text-sm text-gray-600">
                {existingTemplateCount} of {defaultTemplates.length} templates exist
              </p>
            </div>
            <Button 
              onClick={handleCreateTemplates} 
              disabled={isCreating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isCreating ? (
                <InlineLoading size="sm" text="Creating..." />
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Templates
                </>
              )}
            </Button>
          </div>

          {/* Template Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {defaultTemplates.map((template) => {
              const exists = templates.some(t => t.name === template.name && t.type === template.type)
              return (
                <div key={template.name} className={`p-4 border rounded-lg ${exists ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{template.name}</h4>
                    {exists && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </div>
                  <p className="text-xs text-gray-600 mb-3">{template.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {template.type}
                    </Badge>
                                         <span className="text-xs text-gray-500">
                       {template.structure.length} fields
                     </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Results */}
          {createdTemplates.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-green-700 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Templates Status ({createdTemplates.length})
              </h4>
              <div className="space-y-2">
                {createdTemplates.map((template, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    {template}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Errors ({errors.length})
              </h4>
              <div className="space-y-2">
                {errors.map((error, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
