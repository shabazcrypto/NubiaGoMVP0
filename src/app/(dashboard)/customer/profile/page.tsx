'use client';

import React, { useState } from 'react'
import { ArrowLeft, Camera, Save, User, Mail, Phone, MapPin } from 'lucide-react'
import { ImageUpload } from '@/components/ui/image-upload'
import { ImageMetadata } from '@/lib/image-utils'

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  address: string
  avatar: string
  bio: string
}

export default function CustomerProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    id: 'user-123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, New York, NY 10001',
    avatar: 'https://firebasestorage.googleapis.com/v0/b/nubiago-a000f.firebasestorage.app/o/avatars%2Favatar-user-2.jpg?alt=media&token=25c37b6f-5150-4fce-90b3-54fd01731a8b',
    bio: 'Passionate shopper and fashion enthusiast. Love discovering new trends and quality products.'
  })

  // Mock user ID for demo
  const userId = 'user-123'

  // Handle avatar upload completion
  const handleAvatarUploadComplete = (metadata: ImageMetadata | ImageMetadata[]) => {
    if (Array.isArray(metadata)) {
      // Multiple images uploaded - take the first one
      setProfile(prev => ({
        ...prev,
        avatar: metadata[0].urls.original
      }))
    } else {
      // Single image uploaded
      setProfile(prev => ({
        ...prev,
        avatar: metadata.urls.original
      }))
    }
  }

  // Handle avatar upload error
  const handleAvatarUploadError = (error: string) => {
    console.error('Avatar upload failed:', error)
    // You can add toast notification here
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Profile updated:', profile)
    // Add your form submission logic here
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-2 text-gray-600">
              <ArrowLeft className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="space-y-8">
            {/* Avatar Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Picture</h3>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Update Profile Picture</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Upload a new profile picture. We recommend using a square image for best results.
                  </p>
                  <ImageUpload
                    category="avatars"
                    userId={userId}
                    multiple={false}
                    generateThumbnails={true}
                    onUploadComplete={handleAvatarUploadComplete}
                    onUploadError={handleAvatarUploadError}
                    className="max-w-xs"
                  />
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={profile.address}
                      onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter your address"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">About Me</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Tell us a bit about yourself..."
                />
              </div>
            </div>

            {/* Preferences Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Receive updates about orders and promotions</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">SMS Notifications</h4>
                    <p className="text-sm text-gray-500">Receive order updates via text message</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Marketing Communications</h4>
                    <p className="text-sm text-gray-500">Receive promotional emails and offers</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t">
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 
