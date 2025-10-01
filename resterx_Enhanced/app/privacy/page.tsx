"use client"

import Link from "next/link"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, ArrowLeft, Shield } from "lucide-react"

export default function PrivacyPage() {
  useEffect(() => {
    document.documentElement.classList.add("dark")
    document.documentElement.style.colorScheme = "dark"
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50 bg-black/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              <span className="text-xl font-bold tracking-tight text-white">RESTerX</span>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 rounded-lg bg-cyan-500/10 flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-400">
            Last updated: January 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 pb-24">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="bg-white/5 border-white/10 p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
            <p className="text-gray-400 leading-relaxed">
              At RESTerX, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our API testing platform. Please read this privacy policy carefully.
            </p>
          </Card>

          <Card className="bg-white/5 border-white/10 p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Information We Collect</h2>
            <div className="space-y-4 text-gray-400">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Personal Information</h3>
                <p className="leading-relaxed">
                  We may collect personal information that you voluntarily provide to us when you register on the platform, such as your name, email address, and username.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Usage Data</h3>
                <p className="leading-relaxed">
                  We automatically collect certain information when you visit, use, or navigate the platform. This information may include your IP address, browser type, operating system, access times, and the pages you have viewed.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">API Request Data</h3>
                <p className="leading-relaxed">
                  To provide our service, we temporarily store API request and response data. This data is encrypted and only accessible to you. We do not share this data with third parties.
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-white/5 border-white/10 p-8">
            <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
            <div className="space-y-3 text-gray-400">
              <p className="leading-relaxed">We use the information we collect or receive to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide, operate, and maintain our platform</li>
                <li>Improve, personalize, and expand our platform</li>
                <li>Understand and analyze how you use our platform</li>
                <li>Develop new products, services, features, and functionality</li>
                <li>Communicate with you for customer service and support</li>
                <li>Send you updates and marketing communications (with your consent)</li>
                <li>Prevent fraud and enhance security</li>
              </ul>
            </div>
          </Card>

          <Card className="bg-white/5 border-white/10 p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Data Security</h2>
            <p className="text-gray-400 leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information. However, please note that no method of transmission over the Internet or electronic storage is 100% secure. We use industry-standard encryption (AES-256) for data at rest and TLS 1.3 for data in transit.
            </p>
          </Card>

          <Card className="bg-white/5 border-white/10 p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Data Retention</h2>
            <p className="text-gray-400 leading-relaxed">
              We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy. API request history is retained according to your subscription plan (7 days for Free, unlimited for Pro and Enterprise).
            </p>
          </Card>

          <Card className="bg-white/5 border-white/10 p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Third-Party Services</h2>
            <div className="space-y-3 text-gray-400">
              <p className="leading-relaxed">We use the following third-party services:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">Google OAuth:</strong> For authentication (optional)</li>
                <li><strong className="text-white">Payment Processors:</strong> Stripe, PayPal, and Razorpay for payment processing</li>
                <li><strong className="text-white">Analytics:</strong> To understand usage patterns and improve our service</li>
              </ul>
              <p className="leading-relaxed mt-4">
                These third parties have their own privacy policies. We encourage you to review them.
              </p>
            </div>
          </Card>

          <Card className="bg-white/5 border-white/10 p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Your Rights</h2>
            <div className="space-y-3 text-gray-400">
              <p className="leading-relaxed">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your personal information</li>
                <li>Object to our processing of your personal information</li>
                <li>Request data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p className="leading-relaxed mt-4">
                To exercise these rights, please contact us at privacy@resterx.com
              </p>
            </div>
          </Card>

          <Card className="bg-white/5 border-white/10 p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Cookies</h2>
            <p className="text-gray-400 leading-relaxed">
              We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </Card>

          <Card className="bg-white/5 border-white/10 p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Children's Privacy</h2>
            <p className="text-gray-400 leading-relaxed">
              Our platform is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.
            </p>
          </Card>

          <Card className="bg-white/5 border-white/10 p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Changes to This Privacy Policy</h2>
            <p className="text-gray-400 leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </Card>

          <Card className="bg-white/5 border-white/10 p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="space-y-2 text-gray-400">
              <p>Email: <a href="mailto:privacy@resterx.com" className="text-cyan-400 hover:underline">privacy@resterx.com</a></p>
              <p>Support: <Link href="/support" className="text-cyan-400 hover:underline">Contact Support</Link></p>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span className="font-bold text-white">RESTerX</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-400">
              <Link href="/docs" className="hover:text-white transition-colors">
                Documentation
              </Link>
              <Link href="/support" className="hover:text-white transition-colors">
                Support
              </Link>
              <Link href="/pricing" className="hover:text-white transition-colors">
                Pricing
              </Link>
            </div>
            <div className="text-sm text-gray-500">© 2025 RESTerX. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
