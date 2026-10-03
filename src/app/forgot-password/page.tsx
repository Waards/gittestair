'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Mail, Lock, Home, AlertCircle, ShieldCheck, KeyRound, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import {
  getSecurityQuestionForEmail,
  verifySecurityAnswer,
  resetPasswordWithSecurityAnswer
} from '@/app/actions/admin'

type Step = 'email' | 'answer' | 'reset' | 'done'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [securityQuestion, setSecurityQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await getSecurityQuestionForEmail(email)
      if (result.error) throw new Error(result.error)

      setSecurityQuestion((result as any).question || '')
      setStep('answer')
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to verify email'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await verifySecurityAnswer(email, answer)
      if (result.error) throw new Error(result.error)

      setStep('reset')
    } catch (err: any) {
      const errorMessage = err.message || 'Verification failed'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      toast.error('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await resetPasswordWithSecurityAnswer(email, answer, newPassword)
      if (result.error) throw new Error(result.error)

      toast.success('Password reset successfully')
      setStep('done')
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to reset password'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isMounted) {
    return null
  }

  const stepTitle =
    step === 'email' ? 'Reset Password'
      : step === 'answer' ? 'Security Question'
        : step === 'reset' ? 'Set New Password'
          : 'Password Reset'

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
            {step === 'answer' ? <ShieldCheck className="h-5 w-5" /> : step === 'reset' ? <KeyRound className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
            <CardTitle className="text-lg font-semibold">{stepTitle}</CardTitle>
          </div>
          {step === 'answer' && (
            <CardDescription>Answer your security question to continue</CardDescription>
          )}
          {step === 'reset' && (
            <CardDescription>Choose a new password for your account</CardDescription>
          )}
        </CardHeader>

        {step !== 'done' ? (
          step === 'email' ? (
            <form onSubmit={handleEmailSubmit}>
              <CardContent className="space-y-6 pt-6">
                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p className="font-medium">{error}</p>
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
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Button className="w-full bg-[#005596] hover:bg-[#00447a] text-white py-6 text-base font-semibold" type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Continue
                  </Button>

                  <Button variant="outline" className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 py-6" asChild>
                    <Link href="/login">
                      Back to Login
                    </Link>
                  </Button>
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
          ) : step === 'answer' ? (
            <form onSubmit={handleAnswerSubmit}>
              <CardContent className="space-y-6 pt-6">
                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p className="font-medium">{error}</p>
                  </div>
                )}
                <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
                  <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Security Question</p>
                  <p className="text-sm font-semibold text-[#1E293B]">{securityQuestion}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="answer" className="text-sm font-medium text-slate-700">Your Answer</Label>
                  <Input
                    id="answer"
                    type="text"
                    placeholder="Enter your answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="space-y-4">
                  <Button className="w-full bg-[#005596] hover:bg-[#00447a] text-white py-6 text-base font-semibold" type="submit" disabled={isLoading || !answer}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify Answer
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 py-6"
                    type="button"
                    onClick={() => {
                      setStep('email')
                      setAnswer('')
                      setError(null)
                    }}
                  >
                    Back
                  </Button>
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
          ) : (
            <form onSubmit={handleResetSubmit}>
              <CardContent className="space-y-6 pt-6">
                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p className="font-medium">{error}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium text-slate-700">New Password</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Confirm New Password</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Button className="w-full bg-[#005596] hover:bg-[#00447a] text-white py-6 text-base font-semibold" type="submit" disabled={isLoading || !newPassword || !confirmPassword}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Reset Password
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 py-6"
                    type="button"
                    onClick={() => {
                      setStep('answer')
                      setNewPassword('')
                      setConfirmPassword('')
                      setError(null)
                    }}
                  >
                    Back
                  </Button>
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
          )
        ) : (
          <CardContent className="space-y-6 pt-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="text-sm font-medium text-[#1E293B]">Your password has been reset successfully.</p>
              <p className="text-xs text-slate-500">You can now log in with your new password.</p>
            </div>
            <Button className="w-full bg-[#005596] hover:bg-[#00447a] text-white py-6" asChild>
              <Link href="/login">Return to Login</Link>
            </Button>
            <div className="w-full border-t border-slate-100" />
            <Button variant="outline" className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 py-6" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
