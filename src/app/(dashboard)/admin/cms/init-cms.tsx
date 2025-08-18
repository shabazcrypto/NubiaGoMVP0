'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, Database, FileText, Globe } from 'lucide-react'
import { InlineLoading } from '@/components/ui/loading'
import { useCMSContentStore } from '@/store/cms'
import { toast } from '@/components/ui/toast'

interface SampleContent {
  id: string
  title: string
  type: 'post' | 'page'
  status: 'published' | 'draft'
  category: string
}

const sampleContent: SampleContent[] = [
  {
    id: 'blog_1',
    title: 'The Future of E-commerce in Africa',
    type: 'post',
    status: 'published',
    category: 'Industry Insights'
  },
  {
    id: 'blog_2',
    title: 'Building Trust in Online Marketplaces',
    type: 'post',
    status: 'published',
    category: 'Business Strategy'
  },
  {
    id: 'blog_3',
    title: 'Sustainable Business Practices in Africa',
    type: 'post',
    status: 'published',
    category: 'Sustainability'
  },
  {
    id: 'page_1',
    title: 'About NubiaGo',
    type: 'page',
    status: 'published',
    category: 'Company'
  },
  {
    id: 'page_2',
    title: 'Our Mission & Vision',
    type: 'page',
    status: 'published',
    category: 'Company'
  }
]

export default function InitCMS() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [initializedItems, setInitializedItems] = useState<string[]>([])
  const [errors, setErrors] = useState<string[]>([])
  
  const { createContent, templates } = useCMSContentStore()

  const handleInitializeCMS = async () => {
    setIsInitializing(true)
    setInitializedItems([])
    setErrors([])

    try {
      // Check if we have templates
      if (!templates || templates.length === 0) {
        toast('No CMS templates found. Please create templates first.', 'error')
        return
      }

             // Get default templates
       const postTemplate = templates.find(t => t.name === 'Blog Post' && t.type === 'post')
       const pageTemplate = templates.find(t => t.name === 'Page' && t.type === 'page')

      if (!postTemplate || !pageTemplate) {
        toast('Required templates not found. Please create Blog Post and Page templates first.', 'error')
        return
      }

      // Initialize sample blog posts
      const blogPosts = [
        {
          title: 'The Future of E-commerce in Africa',
          slug: 'future-ecommerce-africa',
          content: `Africa is experiencing a digital revolution that's transforming how people shop, sell, and do business. With mobile penetration reaching unprecedented levels and internet connectivity improving across the continent, e-commerce is poised for explosive growth.

The key drivers of this transformation include:

1. **Mobile-First Approach**: With over 80% of internet access coming from mobile devices, African e-commerce platforms must prioritize mobile experiences.

2. **Digital Payments**: Mobile money solutions like M-Pesa, Airtel Money, and others are making online transactions accessible to millions who don't have traditional bank accounts.

3. **Local Content**: African consumers want to see products and content that reflect their local culture, languages, and preferences.

4. **Trust Building**: Building trust through secure payment systems, reliable delivery, and excellent customer service is crucial for success.

At NubiaGo, we're committed to being at the forefront of this transformation, providing a platform that connects African businesses with customers worldwide while maintaining the highest standards of quality and service.`,
          excerpt: 'How digital transformation is reshaping retail across the continent and what it means for businesses and consumers.',
          template: postTemplate.name,
          status: 'published',
          contentType: 'post',
          metaTitle: 'The Future of E-commerce in Africa - NubiaGo Blog',
          metaDescription: 'Discover how digital transformation is reshaping retail across Africa and what it means for businesses and consumers.',
          keywords: ['e-commerce', 'Africa', 'digital transformation', 'retail', 'technology'],
          featuredImage: '/api/placeholder/800/400',
          tags: ['featured', 'e-commerce', 'Africa', 'technology'],
          categories: ['Industry Insights'],
          authorName: 'Sarah Johnson'
        },
        {
          title: 'Building Trust in Online Marketplaces',
          slug: 'building-trust-marketplaces',
          content: `Trust is the foundation of any successful e-commerce platform. In Africa, where many consumers are still new to online shopping, building and maintaining trust is even more critical.

Here are the key strategies we use at NubiaGo to build trust:

**Verification Systems**
- Supplier verification and background checks
- Product quality assurance
- Secure payment processing
- Transparent pricing and fees

**Customer Protection**
- Money-back guarantees
- Secure payment gateways
- Dispute resolution systems
- Clear return and refund policies

**Transparency**
- Real-time order tracking
- Clear communication channels
- Honest product descriptions
- Authentic customer reviews

Building trust takes time and consistent effort, but it's the key to long-term success in e-commerce.`,
          excerpt: 'Essential strategies for building and maintaining trust in online marketplaces, especially in emerging markets.',
          template: postTemplate.name,
          status: 'published',
          contentType: 'post',
          metaTitle: 'Building Trust in Online Marketplaces - NubiaGo Blog',
          metaDescription: 'Learn essential strategies for building and maintaining trust in online marketplaces, especially in emerging markets.',
          keywords: ['trust', 'marketplace', 'e-commerce', 'customer protection', 'verification'],
          featuredImage: '/api/placeholder/800/400',
          tags: ['trust', 'marketplace', 'e-commerce', 'strategy'],
          categories: ['Business Strategy'],
          authorName: 'Michael Chen'
        },
        {
          title: 'Sustainable Business Practices in Africa',
          slug: 'sustainable-business-africa',
          content: `Sustainability is not just a trend—it's a necessity for businesses operating in Africa. As the continent faces unique environmental and social challenges, businesses must adapt their practices to ensure long-term success.

**Environmental Sustainability**
- Reducing carbon footprints through efficient logistics
- Supporting renewable energy initiatives
- Implementing waste reduction programs
- Promoting eco-friendly packaging

**Social Responsibility**
- Supporting local communities
- Fair labor practices
- Ethical sourcing of materials
- Investing in education and skills development

**Economic Sustainability**
- Building resilient supply chains
- Supporting local suppliers and artisans
- Creating long-term partnerships
- Investing in local infrastructure

At NubiaGo, we believe that sustainable business practices are not just good for the planet—they're good for business and essential for Africa's future.`,
          excerpt: 'How businesses in Africa can implement sustainable practices that benefit the environment, society, and their bottom line.',
          template: postTemplate.name,
          status: 'published',
          contentType: 'post',
          metaTitle: 'Sustainable Business Practices in Africa - NubiaGo Blog',
          metaDescription: 'Discover how businesses in Africa can implement sustainable practices that benefit the environment, society, and their bottom line.',
          keywords: ['sustainability', 'Africa', 'business practices', 'environmental responsibility', 'social responsibility'],
          featuredImage: '/api/placeholder/800/400',
          tags: ['sustainability', 'Africa', 'business', 'environment'],
          categories: ['Sustainability'],
          authorName: 'Aisha Mbeki'
        }
      ]

      // Initialize sample pages
      const pages = [
        {
          title: 'About NubiaGo',
          slug: 'about',
          content: `NubiaGo is Africa's premier e-commerce platform, connecting businesses and consumers across the continent and beyond. Founded with a vision to transform how Africa trades, we're building the digital infrastructure that will power the continent's economic future.

**Our Story**
Founded in 2023, NubiaGo emerged from a simple observation: Africa's e-commerce potential was being held back by fragmented platforms and limited access to global markets. We set out to change this by creating a unified platform that serves both local businesses and international customers.

**Our Mission**
To democratize e-commerce in Africa by providing accessible, secure, and efficient trading platforms that empower businesses of all sizes to reach global markets.

**Our Vision**
To become the leading e-commerce ecosystem in Africa, driving economic growth and digital transformation across the continent.

**Why NubiaGo?**
- **Local Expertise**: Deep understanding of African markets and consumer behavior
- **Global Reach**: Access to international markets and suppliers
- **Secure Platform**: Enterprise-grade security and payment processing
- **Local Support**: Dedicated support teams in major African cities
- **Innovation**: Cutting-edge technology tailored for African business needs`,
          excerpt: 'Learn about NubiaGo, Africa\'s premier e-commerce platform connecting businesses and consumers across the continent.',
          template: pageTemplate.name,
          status: 'published',
          contentType: 'page',
          metaTitle: 'About NubiaGo - Africa\'s Premier E-commerce Platform',
          metaDescription: 'Learn about NubiaGo, Africa\'s premier e-commerce platform connecting businesses and consumers across the continent.',
          keywords: ['NubiaGo', 'Africa', 'e-commerce', 'marketplace', 'about'],
          featuredImage: '/api/placeholder/800/400',
          tags: ['about', 'company'],
          categories: ['Company'],
          authorName: 'NubiaGo Team'
        },
        {
          title: 'Our Mission & Vision',
          slug: 'mission-vision',
          content: `At NubiaGo, we're driven by a clear mission and an ambitious vision for Africa's digital future.

**Our Mission**
To democratize e-commerce in Africa by providing accessible, secure, and efficient trading platforms that empower businesses of all sizes to reach global markets.

We believe that every African business, from small artisans to large corporations, deserves access to the tools and markets they need to succeed in the digital economy.

**Our Vision**
To become the leading e-commerce ecosystem in Africa, driving economic growth and digital transformation across the continent.

We envision a future where:
- African businesses can easily reach customers worldwide
- Consumers have access to quality products from around the globe
- Digital payments and logistics are seamless and reliable
- Innovation drives economic growth across the continent

**Our Values**
- **Innovation**: We constantly push the boundaries of what's possible in e-commerce
- **Integrity**: We operate with transparency and honesty in all our dealings
- **Inclusivity**: We serve businesses and customers of all sizes and backgrounds
- **Impact**: We measure success by the positive change we create in African economies
- **Excellence**: We strive for the highest quality in everything we do

**Our Commitment**
We're committed to building not just a platform, but an ecosystem that supports Africa's economic development and digital transformation.`,
          excerpt: 'Discover NubiaGo\'s mission to democratize e-commerce in Africa and our vision for the continent\'s digital future.',
          template: pageTemplate.name,
          status: 'published',
          contentType: 'page',
          metaTitle: 'Our Mission & Vision - NubiaGo',
          metaDescription: 'Discover NubiaGo\'s mission to democratize e-commerce in Africa and our vision for the continent\'s digital future.',
          keywords: ['mission', 'vision', 'NubiaGo', 'Africa', 'e-commerce', 'digital transformation'],
          featuredImage: '/api/placeholder/800/400',
          tags: ['mission', 'vision', 'company'],
          categories: ['Company'],
          authorName: 'NubiaGo Team'
        }
      ]

      // Create blog posts
      for (const post of blogPosts) {
        try {
          await createContent({ ...post, contentType: 'post' as const }, 'post')
          setInitializedItems(prev => [...prev, `Blog Post: ${post.title}`])
          toast.success(`Created blog post: ${post.title}`)
        } catch (error: any) {
          const errorMsg = `Failed to create blog post "${post.title}": ${error.message}`
          setErrors(prev => [...prev, errorMsg])
          toast(errorMsg, 'error')
        }
      }

      // Create pages
      for (const page of pages) {
        try {
          await createContent({ ...page, contentType: 'page' as const }, 'page')
          setInitializedItems(prev => [...prev, `Page: ${page.title}`])
          toast.success(`Created page: ${page.title}`)
        } catch (error: any) {
          const errorMsg = `Failed to create page "${page.title}": ${error.message}`
          setErrors(prev => [...prev, errorMsg])
          toast(errorMsg, 'error')
        }
      }

      toast.success('CMS initialization completed!')
    } catch (error: any) {
      toast(`Initialization failed: ${error.message}`, 'error')
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            CMS Initialization
          </CardTitle>
          <CardDescription>
            Initialize your CMS with sample content including blog posts and pages. This will create the foundation for your content management system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Sample Content</h3>
              <p className="text-sm text-gray-600">Ready to create {sampleContent.length} items</p>
            </div>
            <Button 
              onClick={handleInitializeCMS} 
              disabled={isInitializing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isInitializing ? (
                <InlineLoading size="sm" text="Initializing..." />
              ) : (
                'Initialize CMS'
              )}
            </Button>
          </div>

          {/* Sample Content Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sampleContent.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                {item.type === 'post' ? (
                  <FileText className="h-5 w-5 text-blue-600" />
                ) : (
                  <Globe className="h-5 w-5 text-green-600" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {item.type}
                    </Badge>
                    <Badge variant={item.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                      {item.status}
                    </Badge>
                    <span className="text-xs text-gray-500">{item.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Results */}
          {initializedItems.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-green-700 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Successfully Created ({initializedItems.length})
              </h4>
              <div className="space-y-2">
                {initializedItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    {item}
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
