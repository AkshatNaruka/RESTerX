"use client"

import { signIn } from "next-auth/react"
import Link from "next/link"
import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, Mail, Lock, Chrome } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        router.push(searchParams?.get("callbackUrl") || "/app")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: searchParams?.get("callbackUrl") || "/app" })
  }

  return (
    <Card className="bg-white/5 border-white/10 p-8">
      {/* Google Sign In */}
      <Button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full bg-white text-black hover:bg-gray-200 mb-6"
        disabled={isLoading}
      >
        <Chrome className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-black text-gray-400">Or continue with</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Demo Credentials Info */}
      <div className="mb-4 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm">
        <div className="font-semibold mb-1">Demo Credentials:</div>
        <div>Email: demo@resterx.com</div>
        <div>Password: demo123</div>
      </div>

      {/* Sign In Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 pl-10"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 pl-10"
              disabled={isLoading}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-400">Don't have an account? </span>
        <Link href="/auth/signup" className="text-cyan-400 hover:underline">
          Sign up
        </Link>
      </div>

      <div className="mt-4 text-center">
        <Link href="/" className="text-sm text-gray-400 hover:text-white">
          Back to home
        </Link>
      </div>
    </Card>
  )
}

export default function SignInPage() {
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
          <p className="text-gray-400">Sign in to your account</p>
        </div>

        <Suspense fallback={
          <Card className="bg-white/5 border-white/10 p-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-400">Loading...</div>
            </div>
          </Card>
        }>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  )
}
