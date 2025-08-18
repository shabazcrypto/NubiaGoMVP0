import { NextRequest, NextResponse } from 'next/server'
import { cmsContentService } from '@/lib/services/cms/cms-content.service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Blog post slug is required' },
        { status: 400 }
      )
    }

    // Get blog post by slug from CMS
    const post = await cmsContentService.getContentBySlug(slug)

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      )
    }

    // Check if post is published
    if (post.status !== 'published') {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      )
    }

    // Transform CMS content to blog post format
    const blogPost = {
      id: post.id,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || post.content.substring(0, 200) + '...',
      author: post.authorName || 'Unknown',
      authorId: post.authorId,
      date: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : new Date(post.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      readTime: Math.ceil(post.content.split(' ').length / 200) + ' min read',
      category: post.categories?.[0] || 'Uncategorized',
      categories: post.categories || [],
      image: post.featuredImage || '/api/placeholder/800/400',
      gallery: post.gallery || [],
      featured: post.tags?.includes('featured') || false,
      views: Math.floor(Math.random() * 5000) + 100, // Placeholder for now
      rating: (Math.random() * 1 + 4).toFixed(1), // Placeholder for now
      slug: post.slug,
      tags: post.tags || [],
      metaTitle: post.metaTitle || post.title,
      metaDescription: post.metaDescription || post.excerpt || post.content.substring(0, 160),
      keywords: post.keywords || [],
      template: post.template,
      version: post.version,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      publishedAt: post.publishedAt
    }

    return NextResponse.json({
      success: true,
      data: blogPost
    })

  } catch (error: any) {
    console.error('Failed to fetch blog post:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch blog post',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    const body = await request.json()
    
    // This endpoint could be used for updating blog posts via API
    // For now, we'll return an error as posts should be updated via the CMS admin
    return NextResponse.json(
      { 
        success: false, 
        error: 'Blog posts should be updated via the CMS admin interface' 
      },
      { status: 405 }
    )

  } catch (error: any) {
    console.error('Failed to update blog post:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update blog post',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    
    // This endpoint could be used for deleting blog posts via API
    // For now, we'll return an error as posts should be deleted via the CMS admin
    return NextResponse.json(
      { 
        success: false, 
        error: 'Blog posts should be deleted via the CMS admin interface' 
      },
      { status: 405 }
    )

  } catch (error: any) {
    console.error('Failed to delete blog post:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete blog post',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
