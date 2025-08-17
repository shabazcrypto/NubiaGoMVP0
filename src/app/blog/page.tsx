'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, User, Clock, ArrowRight, Tag, Search, BookOpen, TrendingUp, Star, Loader2 } from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  author: string
  date: string
  readTime: string
  category: string
  image: string
  featured: boolean
  views: string
  rating: string
  slug: string
  tags: string[]
  categories: string[]
}

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All Posts')
  const [searchQuery, setSearchQuery] = useState('')
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const categories = [
    'All Posts',
    'Industry Insights',
    'Business Strategy',
    'Technology',
    'Community',
    'Sustainability',
    'Success Stories'
  ]

  // Fetch blog posts from CMS
  const fetchBlogPosts = async (page: number = 1, reset: boolean = false) => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      })

      if (selectedCategory !== 'All Posts') {
        params.append('category', selectedCategory)
      }

      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/blog?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts')
      }

      const data = await response.json()
      
      if (data.success) {
        if (reset) {
          setBlogPosts(data.data.posts)
        } else {
          setBlogPosts(prev => [...prev, ...data.data.posts])
        }
        setHasMore(data.data.pagination.hasMore)
        setCurrentPage(page)
      } else {
        throw new Error(data.error || 'Failed to fetch blog posts')
      }
    } catch (error: any) {
      console.error('Error fetching blog posts:', error)
      setError(error.message || 'Failed to fetch blog posts')
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchBlogPosts(1, true)
  }, [selectedCategory, searchQuery])

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
    setHasMore(true)
  }

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1)
    setHasMore(true)
    fetchBlogPosts(1, true)
  }

  // Load more posts
  const loadMorePosts = () => {
    if (!isLoading && hasMore) {
      fetchBlogPosts(currentPage + 1, false)
    }
  }

  // Filter posts based on current state
  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'All Posts' || post.category === selectedCategory
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const featuredPost = filteredPosts.find(post => post.featured) || filteredPosts[0]
  const regularPosts = filteredPosts.filter(post => !post.featured)

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => fetchBlogPosts(1, true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              NubiaGo Blog
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Insights, stories, and updates from Africa's premier e-commerce platform
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-4 py-3 text-gray-900 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto space-x-1 py-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading && blogPosts.length === 0 ? (
          <div className="text-center py-20">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading blog posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600">
              {searchQuery 
                ? `No posts found matching "${searchQuery}"`
                : `No posts found in "${selectedCategory}" category`
              }
            </p>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && (
              <div className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                  <Star className="h-6 w-6 text-yellow-500 mr-2" />
                  Featured Post
                </h2>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-1/2">
                      <img
                        src={featuredPost.image}
                        alt={featuredPost.title}
                        className="w-full h-64 md:h-full object-cover"
                      />
                    </div>
                    <div className="md:w-1/2 p-8">
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                          {featuredPost.category}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {featuredPost.readTime}
                        </span>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        {featuredPost.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-6 line-clamp-3">
                        {featuredPost.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {featuredPost.author}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {featuredPost.date}
                          </span>
                        </div>
                        
                        <Link
                          href={`/blog/${featuredPost.slug}`}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Read More
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Regular Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post) => (
                <article key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  
                  <div className="p-6">
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                        {post.category}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {post.readTime}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {post.author}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {post.date}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="flex items-center text-yellow-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="ml-1 text-sm text-gray-600">{post.rating}</span>
                        </span>
                        <span className="text-sm text-gray-500">
                          {post.views} views
                        </span>
                      </div>
                      
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                      >
                        Read More
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMorePosts}
                  disabled={isLoading}
                  className="px-8 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                      Loading...
                    </>
                  ) : (
                    'Load More Posts'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 
