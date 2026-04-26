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
  getUserMaintenanceWithItems,
  rescheduleService,
  getUserClientUnits,
  getUserUnitServiceHistory,
  sendMessageToAdmin
} from '@/app/actions/user'
import { getAvailableTimeSlots } from '@/app/actions/admin'
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
  Settings,
  Calendar,
  Edit3,
  Wind,
  ChevronRight,
  Package,
  Mail
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
import { NotificationToggle } from '@/components/notification-toggle'

const allTimeSlots = [
  '08:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '01:00 PM - 03:00 PM',
  '03:00 PM - 05:00 PM',
  '05:00 PM - 07:00 PM',
  '07:00 PM - 08:00 PM',
]

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
  const [airconBrandOther, setAirconBrandOther] = useState<string>('')
  const [airconType, setAirconType] = useState<string>('')
  const [, setTick] = useState<number>(0)
  const [view, setView] = useState<'dashboard' | 'settings' | 'machines' | 'notifications'>('dashboard')
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [availableSlots, setAvailableSlots] = useState<string[]>(allTimeSlots)
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [clientUnits, setClientUnits] = useState<any[]>([])
  const [selectedUnit, setSelectedUnit] = useState<any>(null)
  const [unitHistory, setUnitHistory] = useState<any[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [selectedUnits, setSelectedUnits] = useState<string[]>([])
  const [showUnitSelector, setShowUnitSelector] = useState(false)
  const [requestDate, setRequestDate] = useState('')
  const [requestTime, setRequestTime] = useState('')
  const [messageSubject, setMessageSubject] = useState('')
  const [messageContent, setMessageContent] = useState('')
  const [isSendingMessage, setIsSendingMessage] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => setTick(t => t + 1), 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (view === 'machines') {
      getUserClientUnits().then(units => setClientUnits(units || []))
    }
  }, [view])

  useEffect(() => {
    if (isRequestDialogOpen && clientUnits.length === 0) {
      getUserClientUnits().then(units => setClientUnits(units || []))
    }
  }, [isRequestDialogOpen])

  const handleViewUnitHistory = async (unit: any) => {
    setSelectedUnit(unit)
    setIsLoadingHistory(true)
    const history = await getUserUnitServiceHistory(unit.id)
    setUnitHistory(history || [])
    setIsLoadingHistory(false)
  }

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
      setActivities(activityData || [])
      setMaintenanceData(maintenanceItems || [])
      setNotifications(notifData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsFetching(false)
    }
  }

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'Pending': 'bg-yellow-500',
      'Scheduled': 'bg-blue-500',
      'In Progress': 'bg-orange-500',
      'Completed': 'bg-green-500',
      'Success': 'bg-green-600',
      'Delayed': 'bg-red-400',
      'Failed': 'bg-red-600',
      'Issue': 'bg-purple-500',
      'Cancelled': 'bg-gray-500',
    }
    return statusColors[status] || 'bg-gray-400'
  }

  const getStatusType = (status: string): 'pending' | 'in_progress' | 'completed' | 'default' | 'error' => {
    const statusTypes: Record<string, 'pending' | 'in_progress' | 'completed' | 'default' | 'error'> = {
      'Completed': 'completed',
      'Success': 'completed',
      'In Progress': 'in_progress',
      'Scheduled': 'in_progress',
      'Delayed': 'pending',
      'Issue': 'pending',
      'Failed': 'error',
      'Pending': 'pending',
    }
    return statusTypes[status] || 'default'
  }

  const getStatusProgress = (item: any) => {
    if (item.progress !== undefined) return item.progress
    const statusProgress: Record<string, number> = {
      'Pending': 0,
      'Scheduled': 20,
      'In Progress': 50,
      'Delayed': 30,
      'Completed': 100,
      'Success': 100,
      'Failed': 100,
      'Issue': 40,
    }
    return statusProgress[item.status] || 0
  }

  const handleServiceRequest = async () => {
    if (!serviceType) {
      toast.error('Please select a service type')
      return
    }
    if (!profile?.full_name || !profile?.email) {
      toast.error('Please complete your profile first')
      return
    }
    if (!requestDate || !requestTime) {
      toast.error('Please select a preferred date and time')
      return
    }

    const servicesWithMultipleUnits = ['Maintenance']
    if (servicesWithMultipleUnits.includes(serviceType) && selectedUnits.length === 0) {
      toast.error('Please select at least one unit')
      return
    }

    setIsLoading(true)
    const formData = new FormData()
    formData.append('fullName', profile.full_name)
    formData.append('phone', profile.phone || '')
    formData.append('email', profile.email)
    formData.append('address', profile.address || '')
    formData.append('serviceType', serviceType)
    formData.append('date', requestDate)
    formData.append('time', requestTime)
    if (selectedUnits.length > 0) {
      formData.append('selectedUnits', JSON.stringify(selectedUnits))
    }
    if (serviceType === 'Installation') {
      formData.append('airconBrand', airconBrand === 'Other' ? airconBrandOther : airconBrand)
      formData.append('airconType', airconType)
    }

    const notesInput = document.getElementById('requestNotes') as HTMLTextAreaElement
    if (notesInput) formData.append('notes', notesInput.value)
    
    const result = await requestService(formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Service request submitted successfully!')
      setIsRequestDialogOpen(false)
      setServiceType('')
      setAirconBrand('')
      setAirconType('')
      setSelectedUnits([])
      setRequestDate('')
      setRequestTime('')
      setAvailableSlots(allTimeSlots)
      fetchData()
    }
    setIsLoading(false)
  }

  const canReschedule = (item: any) => {
    if (!item.date || !item.time) return false
    const timePart = item.time.split(' - ')[0]
    const dateTime = new Date(`${item.date}T${timePart}`)
    const threeHoursBefore = new Date(dateTime.getTime() - (3 * 60 * 60 * 1000))
    return new Date() < threeHoursBefore
  }

  const handleRescheduleClick = (item: any) => {
    setSelectedItem(item)
    setRescheduleDate(item.date || '')
    setRescheduleTime('')
    getAvailableTimeSlots(item.date).then(slots => setAvailableSlots(slots))
    setShowRescheduleDialog(true)
  }

  const handleRescheduleDateChange = (date: string) => {
    setRescheduleDate(date)
    setRescheduleTime('')
    getAvailableTimeSlots(date).then(slots => setAvailableSlots(slots))
  }

  const handleRescheduleSubmit = async () => {
    if (!selectedItem || !rescheduleDate || !rescheduleTime) {
      toast.error('Please select date and time')
      return
    }

    setIsRescheduling(true)
    const result = await rescheduleService(selectedItem.id, rescheduleDate, rescheduleTime, selectedItem.service_type || selectedItem.title)
    
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Service rescheduled successfully')
      setShowRescheduleDialog(false)
      fetchData()
    }
    setIsRescheduling(false)
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
      <ClientSidebar 
        view={view}
        onViewChange={setView}
        onRequestService={() => setIsRequestDialogOpen(true)}
        onNotifications={() => setShowNotifications(true)}
        onSignOut={handleLogout}
        unreadNotifications={notifications.filter(n => !n.is_read).length}
      />

      <main className="flex-1 overflow-y-auto">
        {view === 'dashboard' && (
          <div className="container mx-auto py-8 px-4 md:px-8 max-w-7xl space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#1E293B]">Client Dashboard</h1>
                <p className="text-slate-500 mt-1">Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}!</p>
              </div>
              <Button 
                onClick={() => setIsRequestDialogOpen(true)}
                className="bg-[#0062a3] hover:bg-[#0062a3]/90 text-white"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Request a Service
              </Button>
            </div>

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

            <div className="bg-white p-6 rounded-xl border border-slate-100">
              <h2 className="font-bold text-[#1E293B] mb-4">Your Recent Services</h2>
              {activities.length === 0 && maintenanceData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <Activity className="h-8 w-8 text-slate-300" />
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
                      {canReschedule(activity) && (
                        <div className="mt-4 pt-4 border-t border-slate-50 flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleRescheduleClick(activity)}
                            className="text-[#005596] border-[#005596]"
                          >
                            <Edit3 className="h-3 w-3 mr-2" />
                            Reschedule
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}

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
                      {maint.notes && (
                        <div className="mt-4 pt-4 border-t border-slate-50">
                          <p className="text-[13px] text-slate-600 font-medium bg-slate-50 p-3 rounded-lg border-l-[3px] border-[#005596]">
                            <span className="font-bold text-[10px] uppercase tracking-widest text-[#005596] block mb-1 opacity-80">Reference Notes:</span>
                            {maint.notes}
                          </p>
                        </div>
                      )}
                      {canReschedule(maint) && (
                        <div className="mt-4 pt-4 border-t border-slate-50 flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleRescheduleClick(maint)}
                            className="text-[#005596] border-[#005596]"
                          >
                            <Edit3 className="h-3 w-3 mr-2" />
                            Reschedule
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'machines' && (
          <div className="container mx-auto py-8 px-4 md:px-8 max-w-7xl space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#005596] rounded-xl shadow-lg shadow-[#005596]/20">
                <Wind className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-[#1E293B]">My Machine List</h1>
            </div>

            {clientUnits.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <Wind className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No registered air conditioning units found</p>
                <p className="text-sm text-gray-400 mt-2">Your registered units will appear here after installation</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clientUnits.map((unit) => (
                  <Card key={unit.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                          <Wind className="h-8 w-8 text-[#005596]" />
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewUnitHistory(unit)}
                        >
                          <History className="h-4 w-4 mr-2" />
                          History
                        </Button>
                      </div>
                      <h3 className="font-bold text-lg text-[#1E293B] mb-3">{unit.unit_name}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Brand:</span>
                          <span className="font-medium">{unit.brand || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Type:</span>
                          <span className="font-medium">{unit.unit_type || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Horsepower:</span>
                          <span className="font-medium">{unit.horsepower ? `${unit.horsepower} HP` : 'N/A'}</span>
                        </div>
                        {unit.indoor_serial && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Indoor S/N:</span>
                            <span className="font-medium text-xs">{unit.indoor_serial}</span>
                          </div>
                        )}
                        {unit.outdoor_serial && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Outdoor S/N:</span>
                            <span className="font-medium text-xs">{unit.outdoor_serial}</span>
                          </div>
                        )}
                        {unit.installation_date && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Installed:</span>
                            <span className="font-medium text-xs">{unit.installation_date}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Full Name</Label>
                    <Input defaultValue={profile?.full_name || ''} disabled className="bg-slate-50" />
                    <p className="text-xs text-slate-400">Contact support to change your name</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Email Address</Label>
                    <Input defaultValue={profile?.email || ''} disabled className="bg-slate-50" />
                    <p className="text-xs text-slate-400">Email cannot be changed</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</Label>
                    <Input 
                      id="settingsPhone"
                      placeholder="Enter phone number (e.g., 09123456789)"
                      defaultValue={profile?.phone || ''}
                      className="max-w-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Client Type</Label>
                    <Input 
                      defaultValue={profile?.client_type || 'Residential'} 
                      disabled 
                      className="bg-slate-50 max-w-md" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Address</Label>
                  <Input 
                    id="settingsAddress"
                    placeholder="Enter your address"
                    defaultValue={profile?.address || ''}
                    className="max-w-md"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    className="bg-[#005596] hover:bg-[#00447a]"
                    onClick={async () => {
                      const phoneInput = document.getElementById('settingsPhone') as HTMLInputElement
                      const addressInput = document.getElementById('settingsAddress') as HTMLInputElement
                      const formData = new FormData()
                      formData.append('fullName', profile?.full_name || '')
                      formData.append('phone', phoneInput?.value || '')
                      formData.append('address', addressInput?.value || '')
                      const result = await updateProfile(formData)
                      if (result.error) {
                        toast.error(result.error)
                      } else {
                        toast.success('Profile updated successfully')
                        fetchData()
                      }
                    }}
                  >
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Current Password</Label>
                    <Input 
                      id="currentPassword"
                      type="password"
                      placeholder="Enter current password"
                      className="max-w-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">New Password</Label>
                    <Input 
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      className="max-w-md"
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-2">
                  <Button 
                    variant="outline"
                    onClick={async () => {
                      const currentPassword = (document.getElementById('currentPassword') as HTMLInputElement)?.value
                      const newPassword = (document.getElementById('newPassword') as HTMLInputElement)?.value
                      if (!currentPassword || !newPassword) {
                        toast.error('Please enter both current and new password')
                        return
                      }
                      if (newPassword.length < 6) {
                        toast.error('Password must be at least 6 characters')
                        return
                      }
                      const supabase = createClient()
                      const { error } = await supabase.auth.updateUser({ password: newPassword })
                      if (error) {
                        toast.error(error.message)
                      } else {
                        toast.success('Password changed successfully')
                        ;(document.getElementById('currentPassword') as HTMLInputElement).value = ''
                        ;(document.getElementById('newPassword') as HTMLInputElement).value = ''
                      }
                    }}
                  >
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            <NotificationToggle userId={profile?.id} />

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Admin
                </CardTitle>
                <CardDescription>Send a message to the admin team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    placeholder="Enter subject"
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    placeholder="Enter your message"
                    className="min-h-[100px]"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                  />
                </div>
                <Button
                  onClick={async () => {
                    if (!messageSubject.trim() || !messageContent.trim()) {
                      toast.error('Please fill in both subject and message')
                      return
                    }
                    setIsSendingMessage(true)
                    const result = await sendMessageToAdmin(messageSubject, messageContent)
                    setIsSendingMessage(false)
                    if (result.error) {
                      toast.error(result.error)
                    } else {
                      toast.success('Message sent to admin!')
                      setMessageSubject('')
                      setMessageContent('')
                    }
                  }}
                  disabled={isSendingMessage}
                  className="bg-[#0062a3] hover:bg-[#0062a3]/90"
                >
                  {isSendingMessage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Send Message'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Request Service Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={(open) => {
        setIsRequestDialogOpen(open)
        if (!open) {
          setServiceType('')
          setAirconBrand('')
          setAirconType('')
          setSelectedUnits([])
          setRequestDate('')
          setRequestTime('')
          setAvailableSlots(allTimeSlots)
        }
      }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Service</DialogTitle>
            <DialogDescription>Fill in the details for your service request</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Service Type *</Label>
              <Select value={serviceType} onValueChange={(val) => { setServiceType(val); setSelectedUnits([]) }}>
                <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Installation">Installation</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Repair">Repair</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {serviceType === 'Installation' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Aircon Brand *</Label>
                    <Select value={airconBrand} onValueChange={(v) => {
                      setAirconBrand(v)
                      if (v === 'Other') setAirconBrandOther('')
                    }}>
                      <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                      <SelectContent>
                        {['Aux', 'Midea', 'LG', 'Samsung', 'Daikin', 'Carrier', 'Panasonic', 'Hitachi', 'Sharp', 'Kelvinator', 'Other'].map(b => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {airconBrand === 'Other' && (
                      <Input 
                        placeholder="Enter brand name"
                        value={airconBrandOther}
                        onChange={(e) => setAirconBrandOther(e.target.value)}
                        className="mt-2"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Aircon Type *</Label>
                    <Select value={airconType} onValueChange={setAirconType}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Window">Window</SelectItem>
                        <SelectItem value="Split">Split</SelectItem>
                        <SelectItem value="Inverter">Inverter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {['Maintenance', 'Repair'].includes(serviceType) && clientUnits.length > 0 && (
              <div className="space-y-2">
                <Label>Select Unit *</Label>
                {clientUnits.length === 0 ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                    No registered units found. Please register units first.
                  </div>
                ) : (
                  <Select 
                    value={selectedUnits[0] || ''} 
                    onValueChange={(val) => setSelectedUnits([val])}
                  >
                    <SelectTrigger><SelectValue placeholder="Select your unit" /></SelectTrigger>
                    <SelectContent>
                      {clientUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.unit_name} - {unit.brand} {unit.unit_type} ({unit.horsepower}HP)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {['Maintenance', 'Repair'].includes(serviceType) && clientUnits.length === 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                No registered units found. Please contact support or register units first.
              </div>
            )}

            {serviceType === 'Repair' && (
              <div className="space-y-2">
                <Label>Describe the Issue *</Label>
                <Textarea
                  placeholder="Describe the issue with your aircon (e.g., not cooling, making noise, leaking water)"
                  className="min-h-[80px]"
                  required
                />
                <p className="text-xs text-slate-500">For issues with your registered aircon unit only</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preferred Date *</Label>
                <Input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={requestDate}
                  onChange={(e) => {
                    setRequestDate(e.target.value)
                    setRequestTime('')
                    if (e.target.value) {
                      getAvailableTimeSlots(e.target.value).then(slots => setAvailableSlots(slots))
                    } else {
                      setAvailableSlots(allTimeSlots)
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Preferred Time *</Label>
                {availableSlots.length === 0 ? (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                    No slots for this date
                  </div>
                ) : (
                  <Select value={requestTime} onValueChange={setRequestTime}>
                    <SelectTrigger><SelectValue placeholder="Select time slot" /></SelectTrigger>
                    <SelectContent>
                      {availableSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea
                id="requestNotes"
                placeholder="Any other details or special instructions..."
                className="min-h-[80px]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>Cancel</Button>
            <Button className="bg-[#005596]" onClick={handleServiceRequest} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No notifications</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`p-4 rounded-xl border ${n.is_read ? 'bg-white border-slate-100 opacity-70' : 'bg-[#005596]/5 border-[#005596]/20'}`}>
                  <h4 className={`font-bold text-sm ${n.is_read ? 'text-slate-700' : 'text-[#005596]'}`}>{n.title}</h4>
                  <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                  <p className="text-[10px] text-slate-400 mt-2">
                    {new Date(n.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#005596]" />
              Reschedule Service
            </DialogTitle>
            <DialogDescription>
              Select a new date and time for your {selectedItem?.service_type || selectedItem?.title} service.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">
                <span className="font-medium">Current Schedule:</span> {selectedItem?.date} at {selectedItem?.time}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rescheduleDate">New Date</Label>
              <Input
                id="rescheduleDate"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={rescheduleDate}
                onChange={(e) => handleRescheduleDateChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rescheduleTime">New Time</Label>
              {availableSlots.length === 0 ? (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                  No available time slots for this date.
                </div>
              ) : (
                <Select value={rescheduleTime} onValueChange={setRescheduleTime}>
                  <SelectTrigger><SelectValue placeholder="Select time slot" /></SelectTrigger>
                  <SelectContent>
                    {availableSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Rescheduling is only allowed up to 3 hours before the original scheduled time.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowRescheduleDialog(false)}>Cancel</Button>
            <Button 
              className="bg-[#005596]" 
              onClick={handleRescheduleSubmit}
              disabled={!rescheduleDate || !rescheduleTime || isRescheduling}
            >
              {isRescheduling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Reschedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unit Service History Dialog */}
      <Dialog open={!!selectedUnit} onOpenChange={(open) => !open && setSelectedUnit(null)}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wind className="h-5 w-5 text-[#005596]" />
              Service History
            </DialogTitle>
            <DialogDescription>
              {selectedUnit?.unit_name} - {selectedUnit?.brand} {selectedUnit?.unit_type} {selectedUnit?.horsepower}HP
            </DialogDescription>
          </DialogHeader>
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#005596]" />
            </div>
          ) : unitHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <History className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p>No service history found for this unit</p>
            </div>
          ) : (
            <div className="space-y-3">
              {unitHistory.map((item, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.type === 'Repair' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {item.type || 'Service'}
                      </span>
                      <span className="font-medium text-sm">{item.title || 'Service'}</span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  {item.notes && (
                    <p className="text-xs text-slate-600 mt-2">{item.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}