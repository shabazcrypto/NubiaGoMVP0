'use client'

import Link from 'next/link'
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

export function Footer() {
  return (
    <footer className="bg-[#0b1220] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Link clusters */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h5 className="text-white font-semibold text-sm tracking-wide mb-3">Quick Links</h5>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-gray-400 hover:text-white">Home</Link></li>
              <li><Link href="/products" className="text-gray-400 hover:text-white">Products</Link></li>
              <li><Link href="/categories" className="text-gray-400 hover:text-white">Categories</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
              <li><Link href="/become-supplier" className="text-gray-400 hover:text-white">Become a Seller</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-semibold text-sm tracking-wide mb-3">Support</h5>
            <ul className="space-y-2 text-sm">
              <li><Link href="/help" className="text-gray-400 hover:text-white">Help Center</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-white">FAQ</Link></li>
              <li><Link href="/shipping" className="text-gray-400 hover:text-white">Shipping</Link></li>
              <li><Link href="/returns" className="text-gray-400 hover:text-white">Returns</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-semibold text-sm tracking-wide mb-3">Legal</h5>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="text-gray-400 hover:text-white">Cookie Policy</Link></li>
              <li><Link href="/gdpr" className="text-gray-400 hover:text-white">GDPR</Link></li>
              <li><Link href="/press" className="text-gray-400 hover:text-white">Press</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-semibold text-sm tracking-wide mb-3">Contact</h5>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-3 text-gray-400">
                <Phone className="h-4 w-4" />
                <span>+234 123 456 7890</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Mail className="h-4 w-4" />
                <span>support@nubiago.com</span>
              </li>
              <li className="flex items-start space-x-3 text-gray-400">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>123 Business Avenue<br />Lagos, Nigeria</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6">
          <div className="flex flex-col md:flex-row items-center md:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Logo variant="icon-only" size="sm" />
              <span className="text-sm text-gray-400">© {new Date().getFullYear()} NubiaGo. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="https://facebook.com" target="_blank" aria-label="Facebook" className="text-gray-400 hover:text-white transition-colors"><Facebook className="h-5 w-5" /></Link>
              <Link href="https://instagram.com" target="_blank" aria-label="Instagram" className="text-gray-400 hover:text-white transition-colors"><Instagram className="h-5 w-5" /></Link>
              <Link href="https://twitter.com" target="_blank" aria-label="Twitter" className="text-gray-400 hover:text-white transition-colors"><Twitter className="h-5 w-5" /></Link>
              <Link href="https://linkedin.com" target="_blank" aria-label="LinkedIn" className="text-gray-400 hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
