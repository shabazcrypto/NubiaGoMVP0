'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Calendar, 
  User, 
  Clock, 
  ArrowLeft, 
  Tag, 
  Share2, 
  BookOpen, 
  Star,
  Eye,
  Heart,
  MessageCircle,
  Loader2
} from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string
  author: string
  authorId: string
  date: string
  readTime: string
  category: string
  categories: string[]
  image: string
  gallery: string[]
  featured: boolean
  views: string
  rating: string
  slug: string
  tags: string[]
  metaTitle: string
  metaDescription: string
  keywords: string[]
  template: string
  version: number
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])

  const slug = params.slug as string

  useEffect(() => {
    if (slug) {
      fetchBlogPost(slug)
    }
  }, [slug])

  const fetchBlogPost = async (postSlug: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/blog/${postSlug}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Blog post not found')
        }
        throw new Error('Failed to fetch blog post')
      }

      const data = await response.json()
      
      if (data.success) {
        setPost(data.data)
        // Fetch related posts
        fetchRelatedPosts(data.data.categories, data.data.id)
      } else {
        throw new Error(data.error || 'Failed to fetch blog post')
      }
    } catch (error: any) {
      console.error('Error fetching blog post:', error)
      setError(error.message || 'Failed to fetch blog post')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRelatedPosts = async (categories: string[], currentPostId: string) => {
    try {
      if (!categories || categories.length === 0) return

      const category = categories[0]
      const response = await fetch(`/api/blog?category=${category}&limit=4`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Filter out current post and limit to 3 related posts
          const filtered = data.data.posts
            .filter((p: BlogPost) => p.id !== currentPostId)
            .slice(0, 3)
          setRelatedPosts(filtered)
        }
      }
    } catch (error) {
      console.error('Error fetching related posts:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading blog post...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button 
              onClick={() => fetchBlogPost(slug)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
            <Link
              href="/blog"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Post not found</h1>
          <p className="text-gray-600 mb-4">The blog post you're looking for doesn't exist.</p>
          <Link
            href="/blog"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/blog"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Category and Meta */}
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
              {post.category}
            </span>
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {post.readTime}
            </span>
            <span className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {post.views} views
            </span>
            <span className="flex items-center text-yellow-500">
              <Star className="h-4 w-4 fill-current mr-1" />
              {post.rating}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Author and Date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                {post.author}
              </span>
              <span className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                {post.date}
              </span>
            </div>

            {/* Share Button */}
            <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {post.image && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-xl"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="prose prose-lg max-w-none">
            {/* Convert content to HTML if it's markdown, otherwise display as plain text */}
            <div 
              className="text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: post.content.replace(/\n/g, '<br />') 
              }}
            />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {post.categories && post.categories.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {post.categories.map((category) => (
                  <Link
                    key={category}
                    href={`/blog?category=${category}`}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full hover:bg-blue-200 transition-colors"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Related Posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <article key={relatedPost.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <img
                    src={relatedPost.image}
                    alt={relatedPost.title}
                    className="w-full h-48 object-cover"
                  />
                  
                  <div className="p-6">
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                        {relatedPost.category}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {relatedPost.readTime}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {relatedPost.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {relatedPost.author}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {relatedPost.date}
                      </span>
                    </div>
                    
                    <Link
                      href={`/blog/${relatedPost.slug}`}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                    >
                      Read More
                      <BookOpen className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Back to Blog */}
      <div className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to All Posts
          </Link>
        </div>
      </div>
    </div>
  )
}
