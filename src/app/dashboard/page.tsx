'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  getProfile, 
  changePassword, 
  getDashboardStats, 
  requestService, 
  getUserActivity,
  getUserNotifications,
  markUserNotificationAsRead
} from '@/app/actions/user'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { 
  Loader2, 
  LogOut, 
  User, 
  Bell, 
  Settings, 
  Wrench, 
  Activity, 
  Clock, 
  CheckCircle2,
  ShieldCheck,
  X,
  History,
  TrendingUp
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { validatePHPhone, PHONE_VALIDATION_ERROR } from "@/lib/utils"

export default function ClientDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeServices: 0,
    completedServices: 0
  })
  const [activities, setActivities] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [serviceType, setServiceType] = useState<string>('')
  const [airconBrand, setAirconBrand] = useState<string>('')
  const [airconType, setAirconType] = useState<string>('')

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [profileData, statsData, activityData, notifData] = await Promise.all([
        getProfile(),
        getDashboardStats(),
        getUserActivity(),
        getUserNotifications()
      ])

      if (!profileData) {
        router.push('/login')
        return
      }
      setProfile(profileData)
      setStats(statsData)
      setActivities(activityData)
      setNotifications(notifData)
    } catch (error) {
      toast.error('Failed to fetch dashboard data')
    } finally {
      setIsFetching(false)
    }
  }

  const getStatusProgress = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 20
      case 'scheduled': return 40
      case 'in_progress': return 70
      case 'completed':
      case 'finished': return 100
      case 'rejected':
      case 'cancelled': return 0
      default: return 10
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-amber-500'
      case 'scheduled': return 'bg-blue-500'
      case 'in_progress': return 'bg-purple-500'
      case 'completed':
      case 'finished': return 'bg-emerald-500'
      case 'rejected':
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-slate-500'
    }
  }

  const today = new Date().toISOString().split('T')[0]

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await changePassword(formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Password changed successfully')
      setIsPasswordDialogOpen(false)
    }
    setIsLoading(false)
  }

  const handleRequestService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.append('serviceType', serviceType)
    const phone = formData.get('phone') as string

    if (!validatePHPhone(phone)) {
      toast.error(PHONE_VALIDATION_ERROR)
      return
    }

    // Append unit info to notes if provided
    if (airconBrand || airconType) {
      const unitInfo = [
        airconBrand ? `Brand: ${airconBrand}` : null,
        airconType ? `Type: ${airconType}` : null,
      ].filter(Boolean).join(' | ')
      const existingNotes = formData.get('notes') as string
      formData.set('notes', unitInfo + (existingNotes ? `\n${existingNotes}` : ''))
    }

    setIsLoading(true)
    const result = await requestService(formData)

    if (result?.error) {
      toast.error(result.error)
    } else if (result?.success) {
      toast.success('Service request submitted successfully!')
      setIsRequestDialogOpen(false)
      setServiceType('')
      setAirconBrand('')
      setAirconType('')
      fetchData()
    } else {
      toast.success('Service request submitted successfully!')
      setIsRequestDialogOpen(false)
      setServiceType('')
      setAirconBrand('')
      setAirconType('')
      fetchData()
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
    <>
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="container mx-auto py-8 px-4 space-y-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#005596] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">Client Dashboard</h1>
                <p className="text-[#64748B]">Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 border-slate-200"
                  onClick={() => setShowNotifications(true)}
                >
                  <Bell className="h-4 w-4" />
                  Notifications
                  {notifications.filter(n => !n.is_read).length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                      {notifications.filter(n => !n.is_read).length}
                    </span>
                  )}
                </Button>
              </div>

              <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 border-slate-200">
                    <Wrench className="h-4 w-4" />
                    Services
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request a Service</DialogTitle>
                    <DialogDescription>
                      Fill out the form below to request an aircon service.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleRequestService} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="serviceType">Service Type *</Label>
                      <Select value={serviceType} onValueChange={(v) => {
                        setServiceType(v)
                        setAirconBrand('')
                        setAirconType('')
                      }} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Installation">Installation</SelectItem>
                          <SelectItem value="Repair">Repair</SelectItem>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                          <SelectItem value="Cleaning">Cleaning</SelectItem>
                          <SelectItem value="Inspection">Inspection</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Unit Info — shown once a service type is selected */}
                    {serviceType && (
                      <div className="grid grid-cols-2 gap-3 p-3 border border-[#005596]/20 rounded-lg bg-blue-50/30">
                        <div className="col-span-2">
                          <p className="text-xs font-semibold text-[#005596] uppercase tracking-wide mb-2">
                            Unit Information <span className="text-slate-400 font-normal normal-case">(if applicable)</span>
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Aircon Brand</Label>
                          <Select value={airconBrand} onValueChange={setAirconBrand}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select brand" />
                            </SelectTrigger>
                            <SelectContent>
                              {['Aux', 'Midea', 'LG', 'Samsung', 'Daikin', 'Carrier'].map(b => (
                                <SelectItem key={b} value={b}>{b}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Aircon Type</Label>
                          <Select value={airconType} onValueChange={setAirconType}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Window">Window</SelectItem>
                              <SelectItem value="Split">Split</SelectItem>
                              <SelectItem value="Inverter">Inverter</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input id="phone" name="phone" type="tel" placeholder="09XXXXXXXXX" maxLength={11 as any} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" name="address" placeholder="Your address" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Preferred Date *</Label>
                        <Input id="date" name="date" type="date" min={today} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Preferred Time *</Label>
                        <Input id="time" name="time" type="time" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea id="notes" name="notes" placeholder="Describe your issue or requirements..." />
                    </div>
                    <Button type="submit" className="w-full bg-[#005596] hover:bg-[#00447a]" disabled={isLoading || !serviceType}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Submit Request
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 border-slate-200">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Account Settings</DialogTitle>
                    <DialogDescription>
                      Update your security preferences here.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleChangePassword} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" name="newPassword" type="password" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" name="confirmPassword" type="password" required />
                    </div>
                    <Button type="submit" className="w-full bg-[#005596] hover:bg-[#00447a]" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Update Password
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-slate-200">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          {/* Profile Information Card */}
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4 py-4">
              <div className="p-2 bg-[#005596]/10 rounded-lg">
                <User className="h-5 w-5 text-[#005596]" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-[#1E293B]">Your Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Name</Label>
                  <p className="text-base font-semibold text-[#1E293B]">{profile?.full_name}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Email</Label>
                  <p className="text-base font-semibold text-[#1E293B]">{profile?.email}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Client Type</Label>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold text-[#1E293B]">{profile?.client_type || 'Residential'}</p>
                    {profile?.client_type === 'Corporate' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 uppercase">Premium</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">Standard</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[#64748B]">Your Activity</p>
                    <p className="text-4xl font-bold text-[#1E293B]">{stats.totalBookings}</p>
                    <p className="text-xs text-[#64748B]">Total bookings & services</p>
                  </div>
                  <div className="p-3 bg-[#005596]/10 text-[#005596] rounded-full group-hover:scale-110 transition-transform">
                    <Activity className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[#64748B]">Active Services</p>
                    <p className="text-4xl font-bold text-[#1E293B]">{stats.activeServices}</p>
                    <p className="text-xs text-[#64748B]">Ongoing & scheduled</p>
                  </div>
                  <div className="p-3 bg-amber-50 text-amber-500 rounded-full group-hover:scale-110 transition-transform">
                    <Clock className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[#64748B]">Completed Services</p>
                    <p className="text-4xl font-bold text-[#1E293B]">{stats.completedServices}</p>
                    <p className="text-xs text-[#64748B]">Finished services</p>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-500 rounded-full group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Section */}
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-[#005596]" />
                <CardTitle className="text-lg font-semibold text-[#1E293B]">Recent Activity</CardTitle>
              </div>
              {activities.length > 0 && (
                <span className="text-xs font-medium text-[#64748B] bg-slate-100 px-2 py-1 rounded-full">
                  {activities.length} total requests
                </span>
              )}
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <div className="p-4 bg-slate-50 rounded-full">
                    <TrendingUp className="h-8 w-8 text-slate-300" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[#1E293B] font-medium">No activity yet</p>
                    <p className="text-[#64748B] text-sm max-w-[250px]">
                      Your service requests and their progress will appear here.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsRequestDialogOpen(true)}>
                    Make your first request
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {activities.map((activity) => (
                    <div key={activity.id} className="space-y-3 p-4 rounded-xl border border-slate-100 bg-white hover:border-[#005596]/20 hover:shadow-sm transition-all">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#1E293B]">{activity.service_type}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase text-white ${getStatusColor(activity.status)}`}>
                              {activity.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#64748B] flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Requested for {activity.date} at {activity.time}
                          </p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <span className="text-xs font-semibold text-[#1E293B]">{getStatusProgress(activity.status)}% Complete</span>
                          <div className="w-32 md:w-48">
                            <Progress value={getStatusProgress(activity.status)} className="h-1.5" />
                          </div>
                        </div>
                      </div>
                      {activity.notes && (
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border-l-2 border-[#005596]">
                          <span className="font-semibold text-xs uppercase text-[#64748B] block mb-1">Notes:</span>
                          {activity.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Welcome Card */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#1E293B]">Welcome to Your Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 leading-relaxed">
                This is your client dashboard. Here you can view your bookings, service history, and account information.
              </p>
              <p className="text-[#64748B] text-sm">
                Your data will appear here once you have bookings or completed services.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Notifications Dialog */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-hidden flex flex-col p-0 text-[#1E293B]">
          <DialogHeader className="p-6 pb-2">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 font-bold text-xl">
                <Bell className="h-5 w-5 text-[#005596]" />
                Notifications
              </DialogTitle>
              {notifications.some(n => !n.is_read) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-[#005596] hover:text-[#00447a] p-0 h-auto font-medium"
                  onClick={async () => {
                    for (const n of notifications.filter(notif => !notif.is_read)) {
                      await markUserNotificationAsRead(n.id)
                    }
                    fetchData()
                  }}
                >
                  Mark all as read
                </Button>
              )}
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${n.is_read ? 'bg-white border-slate-100' : 'bg-blue-50/50 border-blue-100'}`}
                  onClick={async () => {
                    if (!n.is_read) {
                      await markUserNotificationAsRead(n.id)
                      fetchData()
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-bold text-sm ${n.is_read ? 'text-slate-700' : 'text-[#005596]'}`}>{n.title}</h4>
                    {!n.is_read && <div className="h-2 w-2 bg-[#005596] rounded-full mt-1" />}
                  </div>
                  <p className="text-xs text-slate-600 mb-2 leading-relaxed">{n.message}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      {new Date(n.created_at).toLocaleDateString()} at {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {n.type === 'reminder' && (
                      <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-1.5 py-0.5 rounded">Reminder</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t bg-slate-50">
            <Button variant="outline" className="w-full border-slate-200" onClick={() => setShowNotifications(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
