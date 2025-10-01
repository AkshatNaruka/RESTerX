"use client"

import Link from "next/link"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, ArrowLeft, Book, Code, Zap, Terminal, FileCode, Rocket } from "lucide-react"

export default function DocumentationPage() {
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
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white">
            Documentation
          </h1>
          <p className="text-xl text-gray-400">
            Everything you need to know to get started with RESTerX
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 pb-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Getting Started */}
          <Card className="bg-white/5 border-white/10 p-8 hover:bg-white/10 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                <Rocket className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold text-white">Getting Started</h3>
                <p className="text-gray-400">
                  Learn the basics of RESTerX and make your first API request in minutes.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="text-sm">
                    <span className="text-cyan-400">1.</span> Navigate to the app
                  </div>
                  <div className="text-sm">
                    <span className="text-cyan-400">2.</span> Enter your API endpoint
                  </div>
                  <div className="text-sm">
                    <span className="text-cyan-400">3.</span> Configure headers and body
                  </div>
                  <div className="text-sm">
                    <span className="text-cyan-400">4.</span> Send request and view response
                  </div>
                </div>
                <Link href="/app">
                  <Button className="mt-4 bg-cyan-500 hover:bg-cyan-600">
                    Launch App
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* API Methods */}
          <Card className="bg-white/5 border-white/10 p-8 hover:bg-white/10 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Terminal className="w-6 h-6 text-purple-400" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold text-white">HTTP Methods</h3>
                <p className="text-gray-400">
                  RESTerX supports all standard HTTP methods for comprehensive API testing.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono bg-green-500/20 text-green-400 px-2 py-1 rounded">GET</span>
                    <span className="text-sm text-gray-400">Retrieve data</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono bg-blue-500/20 text-blue-400 px-2 py-1 rounded">POST</span>
                    <span className="text-sm text-gray-400">Create resources</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">PUT</span>
                    <span className="text-sm text-gray-400">Update resources</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono bg-red-500/20 text-red-400 px-2 py-1 rounded">DELETE</span>
                    <span className="text-sm text-gray-400">Remove resources</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Authentication */}
          <Card className="bg-white/5 border-white/10 p-8 hover:bg-white/10 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-green-400" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold text-white">Authentication</h3>
                <p className="text-gray-400">
                  Add authentication headers to secure your API requests.
                </p>
                <div className="bg-black/50 rounded-lg p-3 mt-3">
                  <code className="text-sm text-green-400 font-mono">
                    Authorization: Bearer &lt;token&gt;
                  </code>
                </div>
                <div className="text-sm text-gray-400 pt-2">
                  Supports Bearer tokens, Basic Auth, API keys, and custom headers.
                </div>
              </div>
            </div>
          </Card>

          {/* Code Generation */}
          <Card className="bg-white/5 border-white/10 p-8 hover:bg-white/10 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                <Code className="w-6 h-6 text-orange-400" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold text-white">Code Generation</h3>
                <p className="text-gray-400">
                  Export your requests to multiple programming languages.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="text-sm">✓ cURL commands</div>
                  <div className="text-sm">✓ JavaScript (Fetch/Axios)</div>
                  <div className="text-sm">✓ Python (Requests)</div>
                  <div className="text-sm">✓ Node.js</div>
                  <div className="text-sm">✓ Go</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Collections */}
          <Card className="bg-white/5 border-white/10 p-8 hover:bg-white/10 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                <Book className="w-6 h-6 text-pink-400" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold text-white">Collections</h3>
                <p className="text-gray-400">
                  Organize your API requests into collections for better management.
                </p>
                <div className="text-sm text-gray-400 pt-2">
                  Create, edit, and share collections with your team. Keep your API testing organized and efficient.
                </div>
              </div>
            </div>
          </Card>

          {/* Templates */}
          <Card className="bg-white/5 border-white/10 p-8 hover:bg-white/10 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <FileCode className="w-6 h-6 text-blue-400" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold text-white">API Templates</h3>
                <p className="text-gray-400">
                  Pre-configured templates for popular APIs to get you started quickly.
                </p>
                <div className="text-sm text-gray-400 pt-2">
                  Includes templates for GitHub, Stripe, Twitter, and many more popular APIs.
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Start Code Example */}
        <div className="max-w-6xl mx-auto mt-12">
          <Card className="bg-white/5 border-white/10 p-8">
            <h3 className="text-2xl font-semibold text-white mb-4">Quick Example</h3>
            <div className="bg-black/50 rounded-lg border border-white/10 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-gray-500 ml-2 font-mono">example-request.sh</span>
              </div>
              <pre className="p-4 text-sm font-mono overflow-x-auto">
                <code className="text-gray-300">
{`# Example API request using cURL
curl -X POST https://api.example.com/users \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'`}
                </code>
              </pre>
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
