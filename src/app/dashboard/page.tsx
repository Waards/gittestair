'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getProfile, changePassword } from '@/app/actions/user'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, LogOut, ShieldCheck, User } from 'lucide-react'

export default function ClientDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const data = await getProfile()
      if (!data) {
        router.push('/login')
        return
      }
      setProfile(data)
    } catch (error) {
      toast.error('Failed to fetch profile')
    } finally {
      setIsFetching(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await changePassword(formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Password changed successfully')
      ;(e.target as HTMLFormElement).reset()
    }
    setIsLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (isFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Account</h1>
        <Button variant="outline" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your personal details and account role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label className="text-muted-foreground">Full Name</Label>
              <p className="text-lg font-medium">{profile?.full_name}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Email Address</Label>
              <p className="text-lg font-medium">{profile?.email}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Account Role</Label>
              <div className="flex items-center gap-2">
                <span className="capitalize px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                  {profile?.role}
                </span>
                {profile?.role === 'admin' && (
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-xs" 
                    onClick={() => router.push('/admin')}
                  >
                    Go to Admin Dashboard
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleChangePassword}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" name="newPassword" type="password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" required />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
