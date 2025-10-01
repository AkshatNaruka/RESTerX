"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, User, CreditCard, Settings, LogOut, BarChart3, Zap, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [subscriptionPlan, setSubscriptionPlan] = useState("Free")

  useEffect(() => {
    document.documentElement.classList.add("dark")
    document.documentElement.style.colorScheme = "dark"
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/dashboard")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const stats = [
    { label: "API Requests", value: "245", icon: BarChart3, color: "text-cyan-400" },
    { label: "Collections", value: "12", icon: Zap, color: "text-purple-400" },
    { label: "Days Active", value: "30", icon: Calendar, color: "text-green-400" },
  ]

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
            <div className="flex items-center gap-3">
              <Link href="/app">
                <Button variant="ghost">API Playground</Button>
              </Link>
              <Button variant="ghost" onClick={() => signOut()}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">
              Welcome back, {session.user?.name || session.user?.email}
            </h1>
            <p className="text-gray-400">Manage your account and subscription</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <Card key={stat.label} className="bg-white/5 border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </Card>
            ))}
          </div>

          {/* Subscription Card */}
          <Card className="bg-white/5 border-white/10 p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Subscription</h2>
                <p className="text-gray-400">Manage your subscription plan</p>
              </div>
              <Badge className="bg-cyan-500 text-white">{subscriptionPlan}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">Current Plan</p>
                <p className="text-lg font-semibold text-white">{subscriptionPlan}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">API Requests</p>
                <p className="text-lg font-semibold text-white">
                  {subscriptionPlan === "Free" ? "100/day" : "Unlimited"}
                </p>
              </div>
            </div>

            {subscriptionPlan === "Free" && (
              <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-2">Upgrade to Pro</h3>
                <p className="text-gray-400 mb-4">
                  Get unlimited API requests, team collaboration, and priority support
                </p>
                <div className="flex items-center gap-3">
                  <Link href="/pricing">
                    <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
                      View Plans
                    </Button>
                  </Link>
                  <span className="text-sm text-gray-400">Starting at $19/month</span>
                </div>
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/5 border-white/10 p-6 hover:bg-white/10 transition-colors cursor-pointer">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Profile Settings</h3>
                <p className="text-sm text-gray-400">Update your personal information</p>
              </div>
            </Card>

            <Link href="/billing">
              <Card className="bg-white/5 border-white/10 p-6 hover:bg-white/10 transition-colors cursor-pointer h-full">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Billing</h3>
                  <p className="text-sm text-gray-400">Manage payment methods and invoices</p>
                </div>
              </Card>
            </Link>

            <Card className="bg-white/5 border-white/10 p-6 hover:bg-white/10 transition-colors cursor-pointer">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Preferences</h3>
                <p className="text-sm text-gray-400">Customize your experience</p>
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="bg-white/5 border-white/10 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {[
                { action: "API Request", endpoint: "GET /api/users", time: "2 minutes ago" },
                { action: "Collection Created", endpoint: "GitHub API", time: "1 hour ago" },
                { action: "API Request", endpoint: "POST /api/posts", time: "3 hours ago" },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                >
                  <div>
                    <p className="text-white font-semibold">{activity.action}</p>
                    <p className="text-sm text-gray-400">{activity.endpoint}</p>
                  </div>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 mt-12">
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
