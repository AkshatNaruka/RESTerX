"use client"

import Link from "next/link"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Zap, Code, History, Sparkles, Lock, Globe, Terminal, Layers, ArrowRight, Check } from "lucide-react"

export default function LandingPage() {
  // Ensure dark theme is set
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
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              <span className="text-xl font-bold tracking-tight text-white">RESTerX</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">
                Features
              </a>
              <Link href="/docs" className="text-sm text-gray-400 hover:text-white transition-colors">
                Documentation
              </Link>
              <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
                Pricing
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-white hover:bg-white/10">Sign In</Button>
              </Link>
              <Link href="/app">
                <Button className="bg-white text-black hover:bg-gray-200">Launch App</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <Badge variant="outline" className="border-white/20 text-gray-400 text-sm px-4 py-1.5">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            Now available for teams
          </Badge>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-balance leading-[1.1] text-white">
            The complete platform to test APIs.
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto text-balance leading-relaxed">
            Your team's toolkit to stop configuring and start innovating. Build, test, and debug APIs with the most
            powerful developer experience.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/app">
              <Button size="lg" className="bg-white text-black hover:bg-gray-200 text-base px-8 py-6 h-auto">
                Get Started Free
              </Button>
            </Link>
            <Link href="/docs">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 text-base px-8 py-6 h-auto bg-transparent"
              >
                View Documentation
              </Button>
            </Link>
          </div>

          {/* <div className="pt-8 text-sm text-gray-500">
            <kbd className="bg-white/5 border border-white/10 px-2 py-1 rounded text-xs">⌘</kbd>
            <kbd className="bg-white/5 border border-white/10 px-2 py-1 rounded text-xs ml-1">K</kbd>
            <span className="ml-2">to quick start</span>
          </div> */}
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="py-12 px-6 text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2 text-white">10ms</div>
              <div className="text-gray-400 text-sm">average response time</div>
            </div>
            <div className="py-12 px-6 text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2 text-white">99.9%</div>
              <div className="text-gray-400 text-sm">uptime guarantee</div>
            </div>
            <div className="py-12 px-6 text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2 text-white">50+</div>
              <div className="text-gray-400 text-sm">API templates included</div>
            </div>
            <div className="py-12 px-6 text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2 text-white">5</div>
              <div className="text-gray-400 text-sm">languages for code export</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance text-white">Everything you need to ship faster.</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto text-balance">
              Professional API testing tools designed for modern development teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white/5 border-white/10 p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Lightning Fast</h3>
              <p className="text-gray-400 leading-relaxed">
                Send requests in milliseconds with optimized performance and real-time response tracking.
              </p>
            </Card>

            <Card className="bg-white/5 border-white/10 p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-6">
                <Code className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Code Generation</h3>
              <p className="text-gray-400 leading-relaxed">
                Export requests to cURL, JavaScript, Python, Go, and more with one click.
              </p>
            </Card>

            <Card className="bg-white/5 border-white/10 p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6">
                <History className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Request History</h3>
              <p className="text-gray-400 leading-relaxed">
                Never lose a request. Automatic history tracking with search and filtering.
              </p>
            </Card>

            <Card className="bg-white/5 border-white/10 p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-6">
                <Lock className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Authentication</h3>
              <p className="text-gray-400 leading-relaxed">
                Built-in support for Bearer tokens, Basic Auth, and custom headers.
              </p>
            </Card>

            <Card className="bg-white/5 border-white/10 p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">API Templates</h3>
              <p className="text-gray-400 leading-relaxed">
                Pre-configured templates for popular APIs like GitHub, Stripe, and more.
              </p>
            </Card>

            <Card className="bg-white/5 border-white/10 p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center mb-6">
                <Layers className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Collections</h3>
              <p className="text-gray-400 leading-relaxed">
                Organize requests into collections for better project management.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Code Preview Section */}
      <section className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="outline" className="border-cyan-500/20 text-cyan-400 text-sm">
                <Terminal className="w-3 h-3 mr-2" />
                Developer Experience
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-balance text-white">Built for developers who ship.</h2>
              <p className="text-xl text-gray-400 leading-relaxed">
                Keyboard shortcuts, instant code generation, and a clean interface that gets out of your way. Focus on
                building, not configuring.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Keyboard-first navigation with shortcuts</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Real-time response formatting and syntax highlighting</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Environment variables and dynamic request building</span>
                </li>
              </ul>
              <Link href="/app">
                <Button className="bg-white text-black hover:bg-gray-200 gap-2 mt-4">
                  Try it now
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <Card className="bg-white/5 border-white/10 p-6 overflow-hidden">
              <div className="bg-black/50 rounded-lg border border-white/10 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs text-gray-500 ml-2 font-mono">request.json</span>
                </div>
                <pre className="p-4 text-sm font-mono overflow-x-auto">
                  <code className="text-gray-300">
                    {`{
  "method": "POST",
  "url": "https://api.example.com/users",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer {{token}}"
  },
  "body": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}`}
                  </code>
                </pre>
                <div className="px-4 py-3 border-t border-white/10 bg-green-500/10 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-green-400 font-mono">200 OK • 45ms</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24 md:py-32">
        <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-white/10 p-12 md:p-16 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-balance text-white">Ready to ship faster?</h2>
            <p className="text-xl text-gray-400 text-balance">
              Join thousands of developers building better APIs with RESTerX.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/app">
                <Button size="lg" className="bg-white text-black hover:bg-gray-200 text-base px-8 py-6 h-auto">
                  Start Testing APIs
                </Button>
              </Link>
              <Link href="https://github.com/AkshatNaruka/RESTerX" target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 text-base px-8 py-6 h-auto bg-transparent"
                >
                  View on GitHub
                </Button>
              </Link>
            </div>
          </div>
        </Card>
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
              <Link href="https://github.com/AkshatNaruka/RESTerX" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                GitHub
              </Link>
              <Link href="/support" className="hover:text-white transition-colors">
                Support
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
            </div>
            <div className="text-sm text-gray-500">© 2025 RESTerX. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
