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
  markUserNotificationAsRead,
  updateProfile,
  getUserMaintenanceWithItems
} from '@/app/actions/user'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { 
  Loader2, 
  User, 
  Bell, 
  Activity, 
  Clock, 
  CheckCircle2,
  History,
  TrendingUp,
  ShieldCheck,
  Phone,
  MapPin,
  Settings
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { calculateDynamicProgress } from "@/lib/progress"
import { ClientSidebar } from '@/components/client-sidebar'

export default function ClientDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeServices: 0,
    completedServices: 0
  })
  const [activities, setActivities] = useState<any[]>([])
  const [maintenanceData, setMaintenanceData] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [serviceType, setServiceType] = useState<string>('')
  const [airconBrand, setAirconBrand] = useState<string>('')
  const [airconType, setAirconType] = useState<string>('')
  const [, setTick] = useState<number>(0)
  const [view, setView] = useState<'dashboard' | 'settings'>('dashboard')

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => setTick(t => t + 1), 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [profileData, statsData, activityData, notifData, maintenanceItems] = await Promise.all([
        getProfile(),
        getDashboardStats(),
        getUserActivity(),
        getUserNotifications(),
        getUserMaintenanceWithItems()
      ])

      if (!profileData) {
        router.push('/login')
        return
      }
      setProfile(profileData)
      setStats(statsData)
      setActivities(activityData)
      setNotifications(notifData)
      setMaintenanceData(maintenanceItems || [])
    } catch (error) {
      toast.error('Failed to fetch dashboard data')
    } finally {
      setIsFetching(false)
    }
  }

  const getStatusProgress = (activity: any) => {
    return Math.round(calculateDynamicProgress(activity))
  }

  const getStatusType = (status: string): 'pending' | 'in_progress' | 'completed' | 'default' => {
    const s = status?.toLowerCase()
    if (s === 'completed' || s === 'finished') return 'completed'
    if (s === 'in_progress' || s === 'in progress') return 'in_progress'
    if (s === 'pending' || s === 'scheduled') return 'pending'
    return 'default'
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
      ;(e.target as HTMLFormElement).reset()
    }
    setIsLoading(false)
  }

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const result = await updateProfile(formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Profile updated successfully!')
      fetchData()
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
      toast.success('Service request submitted!')
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
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="h-8 w-8 animate-spin text-[#005596]" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      
      {/* Sidebar Navigation */}
      <ClientSidebar 
        view={view}
        onViewChange={setView}
        onRequestService={() => setIsRequestDialogOpen(true)}
        onNotifications={() => setShowNotifications(true)}
        onSignOut={handleLogout}
        unreadNotifications={notifications.filter(n => !n.is_read).length}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        
        {view === 'dashboard' && (
          <div className="container mx-auto py-8 px-4 md:px-8 max-w-7xl space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#1E293B]">Client Dashboard</h1>
                <p className="text-slate-500 mt-1">Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}!</p>
              </div>
            </div>

            {/* Profile Information Card */}
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center gap-4 py-5 border-b border-slate-50">
                <div className="p-2.5 bg-[#005596]/10 rounded-xl">
                  <User className="h-6 w-6 text-[#005596]" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-[#1E293B]">Your Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Name</Label>
                    <p className="text-[15px] font-semibold text-[#1E293B]">{profile?.full_name}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Email</Label>
                    <p className="text-[15px] font-semibold text-[#1E293B]">{profile?.email}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Client Type</Label>
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-semibold text-[#1E293B]">{profile?.client_type || 'Residential'}</p>
                      {profile?.client_type === 'Corporate' ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-700 uppercase tracking-wide">Premium</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-[#005596] uppercase tracking-wide">Standard</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-[#64748B]">Your Activity</p>
                      <p className="text-4xl font-extrabold text-[#1E293B]">{stats.totalBookings}</p>
                      <p className="text-xs text-[#64748B] font-medium">Total bookings & services</p>
                    </div>
                    <div className="p-3 bg-[#005596]/10 text-[#005596] rounded-xl group-hover:scale-110 transition-transform">
                      <Activity className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-[#64748B]">Active Services</p>
                      <p className="text-4xl font-extrabold text-[#1E293B]">{stats.activeServices}</p>
                      <p className="text-xs text-[#64748B] font-medium">Ongoing & scheduled</p>
                    </div>
                    <div className="p-3 bg-amber-50 text-amber-500 rounded-xl group-hover:scale-110 transition-transform">
                      <Clock className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-[#64748B]">Completed Services</p>
                      <p className="text-4xl font-extrabold text-[#1E293B]">{stats.completedServices}</p>
                      <p className="text-xs text-[#64748B] font-medium">Finished operations</p>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Section */}
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <History className="h-5 w-5 text-slate-600" />
                  </div>
                  <CardTitle className="text-xl font-bold text-[#1E293B]">Recent Activity</CardTitle>
                </div>
                {(activities.length > 0 || maintenanceData.length > 0) && (
                  <span className="text-xs font-bold text-[#64748B] bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
                    {activities.length + maintenanceData.length} entries
                  </span>
                )}
              </CardHeader>
              <CardContent className="pt-6">
                {activities.length === 0 && maintenanceData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                    <div className="p-5 bg-slate-50 rounded-full border border-dashed border-slate-200">
                      <TrendingUp className="h-10 w-10 text-slate-300" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[#1E293B] font-bold text-lg">No activity yet</p>
                      <p className="text-slate-500 text-sm max-w-xs mx-auto">
                        Your service requests, repair histories, and progress tracking will be organized here.
                      </p>
                    </div>
                    <Button className="bg-[#005596] hover:bg-[#00447a] mt-4 shadow-sm" onClick={() => setIsRequestDialogOpen(true)}>
                      Make your first request
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Regular Activities */}
                    {activities.map((activity) => (
                      <div key={activity.id} className="p-5 rounded-xl border border-slate-100 bg-white hover:border-[#005596]/20 hover:shadow-md transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-3">
                              <span className="font-extrabold text-[15px] text-[#1E293B] tracking-tight">{activity.service_type}</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase text-white tracking-wider ${getStatusColor(activity.status)}`}>
                                {activity.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              Requested on {activity.date} at {activity.time}
                            </p>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1.5 min-w-[200px]">
                            <span className="text-xs font-bold text-[#1E293B] bg-slate-100 px-2 py-0.5 rounded">{getStatusProgress(activity)}% Complete</span>
                            <div className="w-full">
                              <Progress value={getStatusProgress(activity)} status={getStatusType(activity.status)} className="h-2 rounded-full" />
                            </div>
                          </div>
                        </div>
                        {activity.notes && (
                          <div className="mt-4 pt-4 border-t border-slate-50">
                            <p className="text-[13px] text-slate-600 font-medium bg-slate-50 p-3 rounded-lg border-l-[3px] border-[#005596]">
                              <span className="font-bold text-[10px] uppercase tracking-widest text-[#005596] block mb-1 opacity-80">Reference Notes:</span>
                              {activity.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Maintenance with Multi-Unit Items */}
                    {maintenanceData.map((maint) => (
                      <div key={maint.id} className="p-5 rounded-xl border border-slate-100 bg-white hover:border-[#005596]/20 hover:shadow-md transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-3">
                              <span className="font-extrabold text-[15px] text-[#1E293B] tracking-tight">{maint.title}</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase text-white tracking-wider ${getStatusColor(maint.status)}`}>
                                {maint.status}
                              </span>
                              {maint.is_multi_unit && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200">
                                  Multi-Unit
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              Scheduled on {maint.date} at {maint.time}
                            </p>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1.5 min-w-[200px]">
                            <span className="text-xs font-bold text-[#1E293B] bg-slate-100 px-2 py-0.5 rounded">{maint.progress || 0}% Complete</span>
                            <div className="w-full">
                              <Progress value={maint.progress || 0} status={getStatusType(maint.status)} className="h-2 rounded-full" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Multi-Unit Items Display */}
                        {maint.items && maint.items.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-50">
                            <p className="text-[10px] font-bold text-[#005596] uppercase tracking-widest mb-3">Unit Services</p>
                            <div className="space-y-2">
                              {maint.items.map((item: any) => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                  <div>
                                    <p className="font-medium text-sm">{item.client_units?.unit_name || `Unit ${item.unit_id}`}</p>
                                    <p className="text-xs text-slate-500">{item.client_units?.brand} {item.client_units?.unit_type} - {item.client_units?.horsepower}HP</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase text-white ${getStatusColor(item.status)}`}>
                                      {item.status}
                                    </span>
                                    <span className="text-xs text-slate-500">{item.service_type}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {maint.notes && (
                          <div className="mt-4 pt-4 border-t border-slate-50">
                            <p className="text-[13px] text-slate-600 font-medium bg-slate-50 p-3 rounded-lg border-l-[3px] border-[#005596]">
                              <span className="font-bold text-[10px] uppercase tracking-widest text-[#005596] block mb-1 opacity-80">Reference Notes:</span>
                              {maint.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {view === 'settings' && (
          <div className="container mx-auto py-8 px-4 md:px-8 max-w-4xl space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#005596] rounded-xl shadow-lg shadow-[#005596]/20">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-[#1E293B]">Account Settings</h1>
            </div>

            <div className="grid gap-8">
              {/* Profile Settings */}
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5">
                  <CardTitle className="flex items-center gap-2 text-lg text-[#1E293B]">
                    <User className="h-5 w-5 text-[#005596]" /> Profile Information
                  </CardTitle>
                  <CardDescription>
                    Update your contact details and home address.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleUpdateProfile} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-slate-700 font-medium">Full Name</Label>
                        <Input id="fullName" name="fullName" defaultValue={profile?.full_name} required className="bg-white" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-slate-700 font-medium">Phone Number</Label>
                        <Input id="phone" name="phone" type="tel" defaultValue={profile?.phone} placeholder="09XXXXXXXXX" maxLength={11 as any} required className="bg-white" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-slate-700 font-medium">Default Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input id="address" name="address" defaultValue={profile?.address} placeholder="123 Block, City, Province" className="bg-white pl-9" />
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button type="submit" disabled={isLoading} className="bg-[#005596] hover:bg-[#00447a] text-white px-6">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Information
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card className="border-none shadow-sm overflow-hidden border-rose-100">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5">
                  <CardTitle className="flex items-center gap-2 text-lg text-[#1E293B]">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" /> Password & Security
                  </CardTitle>
                  <CardDescription>
                    Maintain account access and update your private password.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-slate-700 font-medium">New Password</Label>
                      <Input id="newPassword" name="newPassword" type="password" required className="bg-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">Confirm New Password</Label>
                      <Input id="confirmPassword" name="confirmPassword" type="password" required className="bg-white" />
                    </div>
                    <div className="pt-2">
                      <Button type="submit" variant="default" disabled={isLoading} className="bg-slate-800 hover:bg-slate-900 border-none">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Password
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

      </main>

      {/* Global Modals */}

      {/* Request Service Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#005596]">Request a Service</DialogTitle>
            <DialogDescription>
              Fill out the form below to remotely queue an aircon service operation.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRequestService} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="serviceType">Service Type *</Label>
              <Select value={serviceType} onValueChange={(v: string) => {
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

            {serviceType && (
              <div className="grid grid-cols-2 gap-3 p-4 border border-[#005596]/10 rounded-xl bg-blue-50/20">
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-[#005596] uppercase tracking-widest mb-1.5 opacity-80">
                    Unit Information (Optional)
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Brand</Label>
                  <Select value={airconBrand} onValueChange={(v: string) => setAirconBrand(v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Brand" /></SelectTrigger>
                    <SelectContent>
                      {['Aux', 'Midea', 'LG', 'Samsung', 'Daikin', 'Carrier'].map(b => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Type</Label>
                  <Select value={airconType} onValueChange={(v: string) => setAirconType(v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
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
              <Input id="phone" name="phone" type="tel" defaultValue={profile?.phone} placeholder="09XXXXXXXXX" maxLength={11 as any} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input id="address" name="address" defaultValue={profile?.address} placeholder="Your current address" required/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input id="date" name="date" type="date" min={today} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input id="time" name="time" type="time" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Diagnostics / Notes</Label>
              <Textarea id="notes" name="notes" placeholder="Describe your issue or requirements..." className="resize-none" />
            </div>
            <div className="pt-2">
              <Button type="submit" className="w-full bg-[#005596] hover:bg-[#00447a] h-11 text-md font-bold" disabled={isLoading || !serviceType}>
                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Submit Request
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 font-bold text-xl text-[#1E293B]">
                <Bell className="h-5 w-5 text-[#005596]" />
                Recent Alerts
              </DialogTitle>
              {notifications.some(n => !n.is_read) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-[11px] font-bold uppercase tracking-wider text-[#005596] hover:bg-[#005596]/10 h-8"
                  onClick={async () => {
                    for (const n of notifications.filter(notif => !notif.is_read)) {
                      await markUserNotificationAsRead(n.id)
                    }
                    fetchData()
                  }}
                >
                  Mark all read
                </Button>
              )}
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC]">
            {notifications.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <div className="p-4 bg-white rounded-full inline-block shadow-sm mb-3">
                  <Bell className="h-6 w-6 opacity-40 text-[#005596]" />
                </div>
                <p className="font-medium text-[#1E293B]">All caught up!</p>
                <p className="text-xs">No pending notifications.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-4 rounded-xl border shadow-sm transition-all cursor-pointer ${n.is_read ? 'bg-white border-slate-100 opacity-70 hover:opacity-100' : 'bg-[#005596]/5 border-[#005596]/20 ring-1 ring-[#005596]/10'}`}
                  onClick={async () => {
                    if (!n.is_read) {
                      await markUserNotificationAsRead(n.id)
                      fetchData()
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <h4 className={`font-bold text-sm leading-tight pr-4 ${n.is_read ? 'text-slate-700' : 'text-[#005596]'}`}>{n.title}</h4>
                    {!n.is_read && <div className="h-2 w-2 bg-[#005596] rounded-full mt-1 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">{n.message}</p>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                    <span className="text-[10px] font-medium text-slate-400">
                      {new Date(n.created_at).toLocaleDateString()} at {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {n.type === 'reminder' && (
                      <span className="text-[9px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Reminder</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
