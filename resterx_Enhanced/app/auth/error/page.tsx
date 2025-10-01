"use client"

import Link from "next/link"
import { useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, AlertCircle } from "lucide-react"
import { useSearchParams } from "next/navigation"

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams?.get("error")

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration."
      case "AccessDenied":
        return "Access denied. You do not have permission to sign in."
      case "Verification":
        return "The verification token has expired or has already been used."
      default:
        return "An error occurred during authentication. Please try again."
    }
  }

  return (
    <Card className="bg-white/5 border-white/10 p-8">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-white">Authentication Error</h1>
        
        <p className="text-gray-400">
          {getErrorMessage(error)}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
          <Link href="/auth/signin" className="flex-1">
            <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">
              Try Again
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
              Go Home
            </Button>
          </Link>
        </div>

        <Link href="/support" className="text-sm text-gray-400 hover:text-white pt-4">
          Contact Support
        </Link>
      </div>
    </Card>
  )
}

export default function AuthErrorPage() {
  useEffect(() => {
    document.documentElement.classList.add("dark")
    document.documentElement.style.colorScheme = "dark"
  }, [])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-cyan-400" />
            <span className="text-2xl font-bold tracking-tight text-white">RESTerX</span>
          </Link>
        </div>

        <Suspense fallback={
          <Card className="bg-white/5 border-white/10 p-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-400">Loading...</div>
            </div>
          </Card>
        }>
          <ErrorContent />
        </Suspense>
      </div>
    </div>
  )
}
