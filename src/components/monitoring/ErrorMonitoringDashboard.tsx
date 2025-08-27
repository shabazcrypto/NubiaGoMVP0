'use client'

import React, { useState, useEffect } from 'react'
import { 
  AlertTriangle, 
  Activity, 
  Clock, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Filter,
  Search,
  RefreshCw,
  Download,
  Eye,
  EyeOff
} from 'lucide-react'

interface ErrorStats {
  total: number
  critical: number
  warnings: number
  info: number
  today: number
  thisWeek: number
  thisMonth: number
}

interface ErrorLog {
  id: string
  timestamp: string
  level: 'error' | 'warn' | 'info' | 'debug'
  category: string
  message: string
  userId?: string
  url?: string
  userAgent?: string
}

export default function ErrorMonitoringDashboard() {
  const [stats, setStats] = useState<ErrorStats>({
    total: 0,
    critical: 0,
    warnings: 0,
    info: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0
  })
  
  const [recentErrors, setRecentErrors] = useState<ErrorLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    level: 'all',
    category: 'all',
    search: ''
  })
  const [showDetails, setShowDetails] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    loadErrorData()
    
    if (autoRefresh) {
      const interval = setInterval(loadErrorData, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const loadErrorData = async () => {
    try {
      setLoading(true)
      
      // In a real implementation, this would fetch from your error logging service
      // For now, we'll simulate the data
      const mockStats: ErrorStats = {
        total: 1247,
        critical: 23,
        warnings: 156,
        info: 1068,
        today: 12,
        thisWeek: 89,
        thisMonth: 234
      }
      
      const mockErrors: ErrorLog[] = [
        {
          id: 'err_1',
          timestamp: new Date().toISOString(),
          level: 'error',
          category: 'api',
          message: 'Failed to fetch user data',
          userId: 'user_123',
          url: '/api/users/123',
          userAgent: 'Mozilla/5.0...'
        },
        {
          id: 'err_2',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          level: 'warn',
          category: 'ui',
          message: 'Component failed to render',
          url: '/products',
          userAgent: 'Mozilla/5.0...'
        }
      ]
      
      setStats(mockStats)
      setRecentErrors(mockErrors)
    } catch (error) {
      console.error('Failed to load error data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredErrors = recentErrors.filter(error => {
    if (filter.level !== 'all' && error.level !== filter.level) return false
    if (filter.category !== 'all' && error.category !== filter.category) return false
    if (filter.search && !error.message.toLowerCase().includes(filter.search.toLowerCase())) return false
    return true
  })

  const exportErrorLogs = () => {
    const csv = [
      'ID,Timestamp,Level,Category,Message,User ID,URL',
      ...filteredErrors.map(error => 
        `${error.id},${error.timestamp},${error.level},${error.category},"${error.message}",${error.userId || ''},${error.url || ''}`
      )
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `error-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50'
      case 'warn': return 'text-yellow-600 bg-yellow-50'
      case 'info': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertTriangle className="w-4 h-4" />
      case 'warn': return <AlertTriangle className="w-4 h-4" />
      case 'info': return <Activity className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Error Monitoring Dashboard</h1>
            <p className="text-gray-600">Real-time error tracking and monitoring</p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={loadErrorData}
              disabled={loading}
              className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={exportErrorLogs}
              className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center px-3 py-2 rounded-lg ${
                autoRefresh 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              {autoRefresh ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
              Auto Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Critical Errors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.critical}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">-12% from yesterday</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Warnings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.warnings}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-red-600">+5% from yesterday</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Clock className="w-4 h-4 text-gray-400 mr-1" />
              <span className="text-gray-600">Last 24 hours</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Activity className="w-4 h-4 text-gray-400 mr-1" />
              <span className="text-gray-600">All time</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Level:</label>
              <select
                value={filter.level}
                onChange={(e) => setFilter({ ...filter, level: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Levels</option>
                <option value="error">Error</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Category:</label>
              <select
                value={filter.category}
                onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Categories</option>
                <option value="api">API</option>
                <option value="ui">UI</option>
                <option value="auth">Authentication</option>
                <option value="payment">Payment</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search errors..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Error List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Errors</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredErrors.map((error) => (
              <div key={error.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(error.level)}`}>
                        {getLevelIcon(error.level)}
                        <span className="ml-1 capitalize">{error.level}</span>
                      </span>
                      <span className="text-sm text-gray-500">{error.category}</span>
                      <span className="text-sm text-gray-400">
                        {new Date(error.timestamp).toLocaleString()}
                      </span>
                    </div>
                    
                    <p className="text-gray-900 font-medium mb-2">{error.message}</p>
                    
                    {showDetails && (
                      <div className="mt-3 space-y-2 text-sm text-gray-600">
                        {error.userId && (
                          <p><strong>User ID:</strong> {error.userId}</p>
                        )}
                        {error.url && (
                          <p><strong>URL:</strong> {error.url}</p>
                        )}
                        {error.userAgent && (
                          <p><strong>User Agent:</strong> {error.userAgent}</p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {filteredErrors.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No errors found matching your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
