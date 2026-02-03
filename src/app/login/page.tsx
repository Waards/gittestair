'use client'

import { useState, useEffect, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/app/actions/user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Mail, Lock, Eye, EyeOff, Home, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signIn, null)
  const [isMounted, setIsMounted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    }
  }, [state])

  if (!isMounted) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-[#005596] text-3xl font-bold text-white shadow-lg">
          A
        </div>
        <h1 className="text-3xl font-bold text-[#1E293B]">Login</h1>
        <p className="mt-1 text-sm text-[#64748B]">Access the Online Login System</p>
      </div>

      <Card className="w-full max-w-md border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-[#005596]">
            <Lock className="h-5 w-5" />
            <CardTitle className="text-lg font-semibold">Sign In</CardTitle>
          </div>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-6 pt-6">
            {state?.error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p className="font-medium">{state.error}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" title="password label" className="text-sm font-medium text-slate-700">Password</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  className="px-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button className="w-full bg-[#005596] hover:bg-[#00447a] text-white py-6 text-base font-semibold" type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>

            <div className="text-center">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-[#005596] hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-0">
            <div className="w-full border-t border-slate-100" />
            <Button variant="outline" className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 py-6" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
