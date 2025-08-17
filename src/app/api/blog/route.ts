import { NextRequest, NextResponse } from 'next/server'
import { cmsContentService } from '@/lib/services/cms/cms-content.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const featured = searchParams.get('featured') === 'true'

    // Build filters for blog posts
    const filters: any = {
      contentType: 'post',
      status: 'published',
      limit: limit + 1 // Get one extra to check if there are more
    }

    if (category && category !== 'all') {
      filters.category = category
    }

    if (tag) {
      filters.tags = [tag]
    }

    if (search) {
      filters.search = search
    }

    // Get blog posts from CMS
    const posts = await cmsContentService.listContent(filters)
    
    // Check if there are more posts
    const hasMore = posts.length > limit
    const postsToReturn = hasMore ? posts.slice(0, limit) : posts

    // Transform CMS content to blog post format
    const blogPosts = postsToReturn.map(post => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt || post.content.substring(0, 200) + '...',
      author: post.authorName || 'Unknown',
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
      image: post.featuredImage || '/api/placeholder/400/300',
      featured: post.tags?.includes('featured') || false,
      views: Math.floor(Math.random() * 5000) + 100, // Placeholder for now
      rating: (Math.random() * 1 + 4).toFixed(1), // Placeholder for now
      slug: post.slug,
      tags: post.tags || [],
      categories: post.categories || [],
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      keywords: post.keywords || []
    }))

    // Sort by featured first, then by date
    const sortedPosts = blogPosts.sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

    return NextResponse.json({
      success: true,
      data: {
        posts: sortedPosts,
        pagination: {
          currentPage: page,
          hasMore,
          totalPosts: posts.length
        }
      }
    })

  } catch (error: any) {
    console.error('Failed to fetch blog posts:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch blog posts',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // This endpoint could be used for creating blog posts via API
    // For now, we'll return an error as posts should be created via the CMS admin
    return NextResponse.json(
      { 
        success: false, 
        error: 'Blog posts should be created via the CMS admin interface' 
      },
      { status: 405 }
    )

  } catch (error: any) {
    console.error('Failed to create blog post:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create blog post',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
