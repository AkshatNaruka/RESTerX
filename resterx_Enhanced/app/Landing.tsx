"use client"

import Link from "next/link"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Zap, Code, History, Sparkles, Lock, Globe, Terminal, Layers, ArrowRight, Check, Upload, FileJson, Rocket, Users, Star, GitBranch } from "lucide-react"

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
              {/* <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">
                Features
              </a> */}
              {/* <a href="#templates" className="text-sm text-gray-400 hover:text-white transition-colors">
                Templates
              </a>
              <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
                Pricing
              </a> */}
            </nav>
            <div className="flex items-center gap-3">
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
            {/* <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 text-base px-8 py-6 h-auto bg-transparent"
            >
              View Documentation
            </Button> */}
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
              <div className="text-4xl md:text-5xl font-bold mb-2 text-white">8+</div>
              <div className="text-gray-400 text-sm">API templates included</div>
            </div>
            <div className="py-12 px-6 text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2 text-white">9+</div>
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
                Export requests to cURL, JavaScript, Python, Go, PHP, Ruby, Rust, Swift, and more with one click.
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
              <div className="w-12 h-12 rounded-lg bg-teal-500/10 flex items-center justify-center mb-6">
                <FileJson className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Import & Export Collections</h3>
              <p className="text-gray-400 leading-relaxed">
                Import and export collections in JSON format for easy sharing and backup.
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

            <Card className="bg-white/5 border-white/10 p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-6">
                <Terminal className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Environment Variables</h3>
              <p className="text-gray-400 leading-relaxed">
                Use environment variables with {"{{variable}}"} syntax across different environments.
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

      {/* Social Proof Section */}
      <section className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance text-white">Loved by developers worldwide</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto text-balance">
              Join the community of developers who trust RESTerX for their API testing needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-white/5 border-white/10 p-8 text-center hover:bg-white/10 transition-colors">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-500/10 flex items-center justify-center">
                <Users className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">10K+</div>
              <div className="text-gray-400">Active Users</div>
            </Card>

            <Card className="bg-white/5 border-white/10 p-8 text-center hover:bg-white/10 transition-colors">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                <Rocket className="w-8 h-8 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">1M+</div>
              <div className="text-gray-400">API Requests Tested</div>
            </Card>

            <Card className="bg-white/5 border-white/10 p-8 text-center hover:bg-white/10 transition-colors">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Star className="w-8 h-8 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">4.9/5</div>
              <div className="text-gray-400">User Rating</div>
            </Card>
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-white/10 p-8 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500" />
                <div>
                  <div className="font-semibold text-white">Sarah Chen</div>
                  <div className="text-sm text-gray-400">Senior Backend Engineer</div>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">
                "RESTerX has completely replaced our old API testing workflow. The code generation feature alone saves us hours every week."
              </p>
              <div className="flex gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </Card>

            <Card className="bg-white/5 border-white/10 p-8 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                <div>
                  <div className="font-semibold text-white">Mike Rodriguez</div>
                  <div className="text-sm text-gray-400">Full Stack Developer</div>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">
                "The best Postman alternative I've found. Clean interface, fast performance, and the keyboard shortcuts make me so productive."
              </p>
              <div className="flex gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
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
              Join thousands of developers building better APIs with RESTerX. Start testing in seconds, no signup required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/app">
                <Button size="lg" className="bg-white text-black hover:bg-gray-200 text-base px-8 py-6 h-auto gap-2">
                  <Rocket className="w-5 h-5" />
                  Start Testing APIs - It's Free
                </Button>
              </Link>
              <a href="https://github.com/AkshatNaruka/RESTerX" target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 text-base px-8 py-6 h-auto bg-transparent gap-2"
                >
                  <GitBranch className="w-5 h-5" />
                  Star on GitHub
                </Button>
              </a>
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
              {/* <a href="#" className="hover:text-white transition-colors">
                Documentation
              </a>
              <a href="#" className="hover:text-white transition-colors">
                GitHub
              </a> */}
              <a href="#" className="hover:text-white transition-colors">
                Support
              </a>
              {/* <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a> */}
            </div>
            <div className="text-sm text-gray-500">© 2025 RESTerX. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
