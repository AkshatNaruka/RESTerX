"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Sparkles, ArrowLeft, Mail, MessageSquare, Book, Users } from "lucide-react"

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  useEffect(() => {
    document.documentElement.classList.add("dark")
    document.documentElement.style.colorScheme = "dark"
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    alert("Thank you for contacting us! We'll get back to you soon.")
    setFormData({ name: "", email: "", subject: "", message: "" })
  }

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
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white">
            How can we help?
          </h1>
          <p className="text-xl text-gray-400">
            Get in touch with our support team or explore our resources
          </p>
        </div>
      </section>

      {/* Support Options */}
      <section className="container mx-auto px-4 pb-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/5 border-white/10 p-6 hover:bg-white/10 transition-colors">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Book className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Documentation</h3>
              <p className="text-sm text-gray-400">
                Find answers in our comprehensive documentation
              </p>
              <Link href="/docs">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Browse Docs
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="bg-white/5 border-white/10 p-6 hover:bg-white/10 transition-colors">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Community</h3>
              <p className="text-sm text-gray-400">
                Join our community forum for discussions
              </p>
              <a href="https://github.com/AkshatNaruka/RESTerX/discussions" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Join Community
                </Button>
              </a>
            </div>
          </Card>

          <Card className="bg-white/5 border-white/10 p-6 hover:bg-white/10 transition-colors">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">GitHub Issues</h3>
              <p className="text-sm text-gray-400">
                Report bugs or request features
              </p>
              <a href="https://github.com/AkshatNaruka/RESTerX/issues" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Open Issue
                </Button>
              </a>
            </div>
          </Card>
        </div>
      </section>

      {/* Contact Form */}
      <section className="container mx-auto px-4 pb-24">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/5 border-white/10 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Contact Support</h2>
                <p className="text-sm text-gray-400">We'll get back to you within 24 hours</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@example.com"
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-white">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="How can we help?"
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-white">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us more about your inquiry..."
                  rows={6}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>

              <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">
                Send Message
              </Button>
            </form>
          </Card>

          {/* Additional Info */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-gray-400 text-sm">
              For urgent issues, please contact us directly at{" "}
              <a href="mailto:support@resterx.com" className="text-cyan-400 hover:underline">
                support@resterx.com
              </a>
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
              <div>
                <div className="text-white font-semibold mb-1">Response Time</div>
                <div>&lt; 24 hours</div>
              </div>
              <div>
                <div className="text-white font-semibold mb-1">Availability</div>
                <div>24/7</div>
              </div>
              <div>
                <div className="text-white font-semibold mb-1">Support</div>
                <div>Email & Chat</div>
              </div>
            </div>
          </div>
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
