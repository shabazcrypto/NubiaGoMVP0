import { ArrowLeft, FileText, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-6 text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Terms of Service
            </h1>
            <p className="text-gray-600">
              Last updated: December 15, 2024
            </p>
          </div>
        </div>

        {/* Terms Content */}
        <div className="prose prose-gray max-w-none">
          <div className="space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing and using this marketplace platform, you accept and agree to be bound by the terms and provisions of this agreement. 
                These terms govern your use of our services and constitute a legally binding agreement between you and NubiaGo.
              </p>
              <p className="text-gray-700 leading-relaxed">
                If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Use License</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Permission is granted to temporarily download one copy of the materials (information or software) on our website for personal, 
                non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Under this license, you may not:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>Attempt to reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed">
                The materials on our website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Limitations</h2>
              <p className="text-gray-700 leading-relaxed">
                In no event shall NubiaGo or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website, even if NubiaGo or a NubiaGo authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices regarding the collection and use of your personal information.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. User Accounts</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You agree not to disclose your password to any third party and to take sole responsibility for any activities or actions under your account.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The Service and its original content, features, and functionality are and will remain the exclusive property of NubiaGo and its licensors. The Service is protected by copyright, trademark, and other laws.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You may not use our trademarks, service marks, or trade names without our prior written consent.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will cease immediately.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be interpreted and governed by the laws of Nigeria, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
              </p>
              <p className="text-gray-700 leading-relaxed">
                What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@nubiago.com<br />
                  <strong>Address:</strong> 123 Innovation Drive, Victoria Island, Lagos, Nigeria<br />
                  <strong>Phone:</strong> +234 123 456 7890
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="text-gray-600 hover:text-gray-800 transition-colors text-center"
            >
              Contact Us
            </Link>
            <span className="text-gray-400 hidden sm:inline">•</span>
            <Link 
              href="/privacy" 
              className="text-gray-600 hover:text-gray-800 transition-colors text-center"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-400 hidden sm:inline">•</span>
            <Link 
              href="/help" 
              className="text-gray-600 hover:text-gray-800 transition-colors text-center"
            >
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 
