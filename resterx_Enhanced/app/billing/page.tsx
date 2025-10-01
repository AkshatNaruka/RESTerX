"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowLeft, CreditCard, Download, Check } from "lucide-react"
import { useRouter } from "next/navigation"

export default function BillingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [subscriptionPlan, setSubscriptionPlan] = useState("Free")

  useEffect(() => {
    document.documentElement.classList.add("dark")
    document.documentElement.style.colorScheme = "dark"
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/billing")
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

  const handleUpgrade = (plan: string) => {
    // In production, this would open a payment modal/redirect to Stripe checkout
    alert(`Upgrading to ${plan} plan. Payment integration coming soon!`)
  }

  const invoices = [
    { id: "INV-001", date: "2025-01-15", amount: "$19.00", status: "Paid" },
    { id: "INV-002", date: "2024-12-15", amount: "$19.00", status: "Paid" },
    { id: "INV-003", date: "2024-11-15", amount: "$19.00", status: "Paid" },
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
            <Link href="/dashboard">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Page Title */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">Billing & Subscription</h1>
            <p className="text-gray-400">Manage your subscription and payment methods</p>
          </div>

          {/* Current Plan */}
          <Card className="bg-white/5 border-white/10 p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Current Plan</h2>
                <p className="text-gray-400">You are currently on the {subscriptionPlan} plan</p>
              </div>
              <Badge className="bg-cyan-500 text-white">{subscriptionPlan}</Badge>
            </div>

            {subscriptionPlan === "Free" && (
              <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-white/10 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Upgrade to Pro</h3>
                <p className="text-gray-400 mb-4">
                  Unlock unlimited API requests, team collaboration, and priority support
                </p>
                <div className="space-y-3 mb-6">
                  {[
                    "Unlimited API requests",
                    "Unlimited collections",
                    "Team collaboration (up to 5 members)",
                    "Priority support",
                    "Advanced features",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => handleUpgrade("Pro")}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white"
                  >
                    Upgrade to Pro - $19/month
                  </Button>
                  <Link href="/pricing">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      View All Plans
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">Billing Period</p>
                <p className="text-lg font-semibold text-white">Monthly</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Next Billing Date</p>
                <p className="text-lg font-semibold text-white">
                  {subscriptionPlan === "Free" ? "N/A" : "Feb 15, 2025"}
                </p>
              </div>
            </div>
          </Card>

          {/* Payment Method */}
          <Card className="bg-white/5 border-white/10 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Payment Method</h2>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Add Payment Method
              </Button>
            </div>

            {subscriptionPlan === "Free" ? (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No payment method on file</p>
                <p className="text-sm text-gray-500 mt-2">Upgrade to a paid plan to add a payment method</p>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 rounded-lg border border-white/10">
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">Visa ending in 4242</p>
                  <p className="text-sm text-gray-400">Expires 12/2026</p>
                </div>
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  Update
                </Button>
              </div>
            )}
          </Card>

          {/* Payment Processors */}
          <Card className="bg-white/5 border-white/10 p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Accepted Payment Methods</h2>
            <p className="text-gray-400 mb-6">We support multiple payment processors for your convenience</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["Stripe", "PayPal", "Razorpay", "Credit Card"].map((method) => (
                <div
                  key={method}
                  className="p-4 rounded-lg border border-white/10 text-center hover:bg-white/5 transition-colors"
                >
                  <p className="text-sm text-gray-300">{method}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Billing History */}
          <Card className="bg-white/5 border-white/10 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Billing History</h2>
            {subscriptionPlan === "Free" ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No billing history available</p>
                <p className="text-sm text-gray-500 mt-2">Invoices will appear here after you upgrade</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <div>
                      <p className="text-white font-semibold">{invoice.id}</p>
                      <p className="text-sm text-gray-400">{invoice.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-white font-semibold">{invoice.amount}</p>
                        <Badge className="bg-green-500/20 text-green-400 text-xs">
                          {invoice.status}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
