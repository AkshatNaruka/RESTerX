"use client"

import Link from "next/link"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowLeft, Check, Zap, Users, Building2 } from "lucide-react"

export default function PricingPage() {
  useEffect(() => {
    document.documentElement.classList.add("dark")
    document.documentElement.style.colorScheme = "dark"
  }, [])

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for individuals and hobby projects",
      icon: Sparkles,
      iconColor: "text-gray-400",
      iconBg: "bg-gray-500/10",
      features: [
        "100 API requests per day",
        "3 collections",
        "Request history (7 days)",
        "Basic authentication",
        "Code generation (5 languages)",
        "Community support",
      ],
      cta: "Get Started",
      ctaLink: "/app",
      popular: false,
    },
    {
      name: "Pro",
      price: "$19",
      period: "per month",
      description: "For professional developers and small teams",
      icon: Zap,
      iconColor: "text-cyan-400",
      iconBg: "bg-cyan-500/10",
      features: [
        "Unlimited API requests",
        "Unlimited collections",
        "Request history (unlimited)",
        "Advanced authentication",
        "Code generation (all languages)",
        "Environment variables",
        "Team collaboration (up to 5 members)",
        "Priority support",
        "API monitoring",
        "Custom templates",
      ],
      cta: "Start Free Trial",
      ctaLink: "/app",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For large teams and organizations",
      icon: Building2,
      iconColor: "text-purple-400",
      iconBg: "bg-purple-500/10",
      features: [
        "Everything in Pro",
        "Unlimited team members",
        "SSO & SAML authentication",
        "Advanced security features",
        "Custom integrations",
        "Dedicated account manager",
        "24/7 premium support",
        "SLA guarantee",
        "On-premise deployment option",
        "Custom contract terms",
      ],
      cta: "Contact Sales",
      ctaLink: "/support",
      popular: false,
    },
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
          <Badge variant="outline" className="border-white/20 text-gray-400 text-sm px-4 py-1.5">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            14-day free trial on all plans
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-400">
            Choose the perfect plan for your API testing needs. No hidden fees.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative bg-white/5 border-white/10 p-8 hover:bg-white/10 transition-all ${
                plan.popular ? "ring-2 ring-cyan-500/50 scale-105" : ""
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-white">
                  Most Popular
                </Badge>
              )}
              
              <div className="space-y-6">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-lg ${plan.iconBg} flex items-center justify-center`}>
                  <plan.icon className={`w-6 h-6 ${plan.iconColor}`} />
                </div>

                {/* Plan Name */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-400">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">/ {plan.period}</span>
                </div>

                {/* CTA Button */}
                <Link href={plan.ctaLink} className="block">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>

                {/* Features */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-24">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <Card className="bg-white/5 border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Can I change plans later?
              </h3>
              <p className="text-gray-400">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges.
              </p>
            </Card>

            <Card className="bg-white/5 border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-400">
                We accept all major credit cards, PayPal, and Razorpay. Enterprise customers can also pay via bank transfer.
              </p>
            </Card>

            <Card className="bg-white/5 border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-400">
                Yes! All paid plans come with a 14-day free trial. No credit card required to start.
              </p>
            </Card>

            <Card className="bg-white/5 border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                What happens after my trial ends?
              </h3>
              <p className="text-gray-400">
                You can continue using the free plan or upgrade to a paid plan. Your data is never deleted.
              </p>
            </Card>

            <Card className="bg-white/5 border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Do you offer discounts for students or non-profits?
              </h3>
              <p className="text-gray-400">
                Yes! We offer special pricing for educational institutions and non-profit organizations. Contact us for details.
              </p>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-24">
          <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-white/10 p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Still have questions?
            </h2>
            <p className="text-gray-400 mb-6">
              Our team is here to help you find the perfect plan for your needs.
            </p>
            <Link href="/support">
              <Button size="lg" className="bg-white text-black hover:bg-gray-200">
                Contact Support
              </Button>
            </Link>
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
