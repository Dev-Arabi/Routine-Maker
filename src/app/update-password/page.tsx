"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff } from "lucide-react"

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // Listen for auth state changes to handle password recovery
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        // This event indicates the user arrived via a password recovery link
        setMessage("Please set your new password.")
      }
      // Removed the SIGNED_IN redirect here to ensure the user stays on this page
      // until they explicitly update their password.
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase.auth])

  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long.")
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setMessage(`Error updating password: ${error.message}`)
    } else {
      setMessage("Your password has been updated successfully! Redirecting to dashboard...")
      setTimeout(() => {
        router.push("/") // Redirect to dashboard after successful update
      }, 2000)
    }
    setLoading(false)
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
        <svg className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="pattern-circles"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
              patternContentUnits="userSpaceOnUse"
            >
              <circle id="pattern-circle" cx="1" cy="1" r="1" fill="#e0e7ff"></circle>
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)"></rect>
        </svg>
      </div>

      <Card className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md border border-indigo-200 shadow-2xl transition-all duration-500 ease-out hover:shadow-3xl hover:scale-[1.01]">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 -m-6 mb-6 p-6 rounded-t-lg border-b border-indigo-200">
          <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-800">
            Reset Password
          </CardTitle>
          <CardDescription className="text-indigo-600 font-medium">Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="space-y-2 relative">
              <Label htmlFor="new-password" className="text-indigo-700 font-medium">
                New Password
              </Label>
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 pt-6 text-indigo-600 hover:text-indigo-800 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="confirm-password" className="text-indigo-700 font-medium">
                Confirm New Password
              </Label>
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 pt-6 text-indigo-600 hover:text-indigo-800 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]"
              disabled={loading}
            >
              {loading ? "Updating..." : "Set New Password"}
            </Button>
          </form>
          {message && (
            <Alert className="mt-4 border-indigo-300 bg-indigo-50 text-indigo-700">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
