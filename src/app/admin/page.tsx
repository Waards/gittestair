'use client'

import { useState, useEffect } from 'react'
import {
  createClientUser,
  getClients,
  getInstallations,
  getRepairs,
  getAppointments,
  getSettings,
  updateSettings,
  createAppointment,
  createInstallation,
  createRepair,
  createMaintenance,
  getMaintenance,
  getDashboardMaintenance,
  markMaintenanceComplete,
  markInstallationComplete,
  markRepairComplete,
  getClientRequests,
  getNotifications,
  markNotificationAsRead,
  updateRequestStatus,
  archiveClient,
  unarchiveClient,
  updateNotificationSettings,
  updateReminderSettings,
  updateSecuritySettings,
  changeAdminPassword,
  sendClientReminder,
  getTechnicians,
  createTechnician,
  updateTechnician,
  updateTechnicianStatus,
  deleteTechnician,
  getDashboardInstallations,
  getDashboardRepairs,
  getDashboardStats,
  updateAppointmentStatus,
  rescheduleAppointment,
  registerUnit,
  getClientUnits,
  deleteClientUnit,
  logRepairJob,
  getRepairJobs,
  updateRepairJobStatus,
  createMaintenanceWithUnits,
  getMaintenanceWithItems,
  updateMaintenanceItemStatus,
  deleteMaintenanceItem,
  updateInstallationProgress,
  updateRepairProgress,
  updateMaintenanceProgress,
  getAllPendingRequests,
  acceptRequestAsInstallation,
  acceptRequestAsRepair,
  acceptRequestAsMaintenance,
  rejectRequest
} from '@/app/actions/admin'
import { getLeads, updateLeadStatus, convertLeadToClient, deleteLead, acceptLead, acceptLeadAsRepair, acceptLeadAsMaintenance, rejectLead } from '@/app/actions/leads'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO
} from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { toast } from 'sonner'
import {
  Loader2,
  Copy,
  CheckCircle2,
  Users,
  Calendar,
  Wrench,
  PenTool,
  Clock,
  CheckCircle,
  TrendingUp,
  Bell,
  Settings as SettingsIcon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  BarChart3,
  BellRing,
  UserCheck,
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  MapPin,
  FileText,
  Download,
  Building2,
  BellDot,
  Cpu,
  ShieldCheck,
  X,
  Archive,
  ArchiveRestore,
  Eye,
  EyeOff,
  Home,
  Edit2,
  Trash2,
  HardHat,
  Thermometer,
  Zap,
  AlertTriangle,
  Package,
  Camera,
  ClipboardList
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Progress } from '@/components/ui/progress'
import { validatePHPhone, PHONE_VALIDATION_ERROR, cn } from '@/lib/utils'
import { calculateDynamicProgress } from '@/lib/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { AdminSidebar } from '@/components/admin-sidebar'

type View = 'dashboard' | 'clients' | 'installations' | 'repairs' | 'maintenance' | 'schedule' | 'reports' | 'settings' | 'requests' | 'leads' | 'technicians'

export default function AdminDashboard() {
  const [view, setView] = useState<View>('dashboard')
  const [clients, setClients] = useState<any[]>([])
  const [clientsTotal, setClientsTotal] = useState(0)
  const [clientsPage, setClientsPage] = useState(1)
  const [installations, setInstallations] = useState<any[]>([])
  const [installationsTotal, setInstallationsTotal] = useState(0)
  const [installationsPage, setInstallationsPage] = useState(1)
  const [repairs, setRepairs] = useState<any[]>([])
  const [repairsTotal, setRepairsTotal] = useState(0)
  const [repairsPage, setRepairsPage] = useState(1)
  const [maintenance, setMaintenance] = useState<any[]>([])
  const [maintenanceTotal, setMaintenanceTotal] = useState(0)
  const [maintenancePage, setMaintenancePage] = useState(1)
  const [appointments, setAppointments] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [technicians, setTechnicians] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)
  const [clientUnits, setClientUnits] = useState<any[]>([])
  const [repairJobs, setRepairJobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)
  const [showReminders, setShowReminders] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showReminderForm, setShowReminderForm] = useState(false)
  const [selectedClientForReminder, setSelectedClientForReminder] = useState<any>(null)
  const [reminderTitle, setReminderTitle] = useState('Aircon Cleaning Reminder')
  const [reminderMessage, setReminderMessage] = useState('')
  const [isSendingReminder, setIsSendingReminder] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [showBookingDetails, setShowBookingDetails] = useState(false)
  const [selectedInstallation, setSelectedInstallation] = useState<any>(null)
  const [showInstallationDetails, setShowInstallationDetails] = useState(false)
  const [selectedRepair, setSelectedRepair] = useState<any>(null)
  const [showRepairDetails, setShowRepairDetails] = useState(false)
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null)
  const [showMaintenanceDetails, setShowMaintenanceDetails] = useState(false)
  const [, setTick] = useState<number>(0)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(() => setTick(t => t + 1), 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    setIsFetching(true)
    try {
      console.log('Fetching dashboard data...')
      
      // Only fetch essential dashboard data initially (very fast)
      // Priority: fast dashboard data (stats, settings, notifications)
      const priorityResults = await Promise.allSettled([
        getDashboardInstallations(),
        getDashboardRepairs(),
        getDashboardMaintenance(),
        getSettings(),
        getNotifications()
      ])

      if (priorityResults[0].status === 'fulfilled') setInstallations(priorityResults[0].value || [])
      if (priorityResults[1].status === 'fulfilled') setRepairs(priorityResults[1].value || [])
      if (priorityResults[2].status === 'fulfilled') setMaintenance(priorityResults[2].value || [])
      if (priorityResults[3].status === 'fulfilled') setSettings(priorityResults[3].value)
      if (priorityResults[4].status === 'fulfilled') setNotifications(priorityResults[4].value || [])

      // Load secondary data in background (clients, appointments, leads)
      const [clientsResult, appointmentsResult, leadsResult] = await Promise.all([
        getClients(1, 20),
        getAppointments(),
        getLeads()
      ])
      
      setClients(clientsResult.data || [])
      setClientsTotal(clientsResult.total || 0)
      setAppointments(appointmentsResult || [])
      setLeads(leadsResult || [])
    } catch (error) {
      console.error('fetchDashboardData error:', error)
      toast.error('Failed to load dashboard')
    } finally {
      setIsFetching(false)
    }
  }

  // Lazy load data when view changes
  useEffect(() => {
    if (view === 'clients' && clients.length === 0) {
      const result = getClients(1, 20)
      result.then((r: any) => {
        setClients(r.data || [])
        setClientsTotal(r.total || 0)
      })
    } else if (view === 'installations') {
      getInstallations(1, 20).then((r: any) => {
        setInstallations(r.data || [])
        setInstallationsTotal(r.total || 0)
      })
      getClientUnits().then(setClientUnits)
      if (clients.length === 0) getClients(1, 20).then((r: any) => { setClients(r.data || []); setClientsTotal(r.total || 0) })
    } else if (view === 'repairs') {
      getRepairs(1, 20).then((r: any) => {
        setRepairs(r.data || [])
        setRepairsTotal(r.total || 0)
      })
      getRepairJobs().then(setRepairJobs)
      getClientUnits().then(setClientUnits)
      if (clients.length === 0) getClients(1, 20).then((r: any) => { setClients(r.data || []); setClientsTotal(r.total || 0) })
    } else if (view === 'maintenance' && maintenance.length === 0) {
      getMaintenanceWithItems(1, 20).then((result: any) => {
        setMaintenance(result.data || [])
        setMaintenanceTotal(result.total || 0)
      })
      getClientUnits().then(setClientUnits)
      if (clients.length === 0) getClients(1, 20).then((r: any) => { setClients(r.data || []); setClientsTotal(r.total || 0) })
    } else if (view === 'requests' && requests.length === 0) {
      getClientRequests().then(setRequests)
      getAllPendingRequests().then(setRequests)
    } else if (view === 'leads' && leads.length === 0) {
      getLeads().then(setLeads)
    } else if (view === 'technicians' && technicians.length === 0) {
      getTechnicians().then(setTechnicians)
    }
  }, [view])

  // Generic refresh function for components that need to refetch data
  const refreshData = async () => {
    switch (view) {
      case 'clients':
        getClients(clientsPage, 20).then((r: any) => {
          setClients(r.data || [])
          setClientsTotal(r.total || 0)
        })
        break
      case 'installations':
        getInstallations(installationsPage, 20).then((r: any) => {
          setInstallations(r.data || [])
          setInstallationsTotal(r.total || 0)
        })
        getClientUnits().then(setClientUnits)
        break
      case 'repairs':
        getRepairs(repairsPage, 20).then((r: any) => {
          setRepairs(r.data || [])
          setRepairsTotal(r.total || 0)
        })
        getRepairJobs().then(setRepairJobs)
        getClientUnits().then(setClientUnits)
        break
      case 'maintenance':
        getMaintenanceWithItems(maintenancePage, 20).then((result: any) => {
          setMaintenance(result.data || [])
          setMaintenanceTotal(result.total || 0)
        })
        break
      case 'requests':
        getClientRequests().then(setRequests)
        break
      case 'leads':
        getLeads().then(setLeads)
        break
      case 'technicians':
        getTechnicians().then(setTechnicians)
        break
      default:
        fetchDashboardData()
    }
  }

  const handleViewBookingDetails = (booking: any) => {
    setSelectedBooking(booking)
    setShowBookingDetails(true)
  }

  const [installationProgressStatus, setInstallationProgressStatus] = useState('Scheduled')
  const [installationProgress, setInstallationProgress] = useState(0)
  const [installationProgressNotes, setInstallationProgressNotes] = useState('')
  const [repairProgressStatus, setRepairProgressStatus] = useState('Scheduled')
  const [repairProgress, setRepairProgress] = useState(0)
  const [repairProgressNotes, setRepairProgressNotes] = useState('')
  const [maintenanceProgressStatus, setMaintenanceProgressStatus] = useState('Scheduled')
  const [maintenanceProgress, setMaintenanceProgress] = useState(0)
  const [maintenanceProgressNotes, setMaintenanceProgressNotes] = useState('')

  // Auto-update progress when status changes
  useEffect(() => {
    const statusProgressMap: Record<string, number> = {
      'Scheduled': 0,
      'In Progress': 50,
      'Delayed': 25,
      'Issue': 50,
      'Success': 100,
      'Completed': 100,
      'Failed': 0
    }
    if (maintenanceProgressStatus) {
      setMaintenanceProgress(statusProgressMap[maintenanceProgressStatus] ?? maintenanceProgress)
    }
  }, [maintenanceProgressStatus])

  // Auto-update installation progress when status changes
  useEffect(() => {
    const statusProgressMap: Record<string, number> = {
      'Scheduled': 0,
      'In Progress': 50,
      'Delayed': 25,
      'Issue': 50,
      'Success': 100,
      'Completed': 100,
      'Failed': 0
    }
    if (installationProgressStatus) {
      setInstallationProgress(statusProgressMap[installationProgressStatus] ?? installationProgress)
    }
  }, [installationProgressStatus])

  // Auto-update repair progress when status changes
  useEffect(() => {
    const statusProgressMap: Record<string, number> = {
      'Scheduled': 0,
      'In Progress': 50,
      'Delayed': 25,
      'Issue': 50,
      'Success': 100,
      'Completed': 100,
      'Failed': 0
    }
    if (repairProgressStatus) {
      setRepairProgress(statusProgressMap[repairProgressStatus] ?? repairProgress)
    }
  }, [repairProgressStatus])

  const handleViewInstallationDetails = (installation: any) => {
    setSelectedInstallation(installation)
    setInstallationProgressStatus(installation.status || 'Scheduled')
    setInstallationProgress(installation.progress || 0)
    setInstallationProgressNotes(installation.notes || '')
    setShowInstallationDetails(true)
  }

  const handleViewRepairDetails = (repair: any) => {
    setSelectedRepair(repair)
    setRepairProgressStatus(repair.status || 'Scheduled')
    setRepairProgress(repair.progress || 0)
    setRepairProgressNotes(repair.notes || '')
    setShowRepairDetails(true)
  }

  const handleViewMaintenanceDetails = (maintenance: any) => {
    setSelectedMaintenance(maintenance)
    setMaintenanceProgressStatus(maintenance.status || 'Scheduled')
    // Auto-set progress based on status
    const statusProgressMap: Record<string, number> = {
      'Scheduled': 0,
      'In Progress': 50,
      'Delayed': 25,
      'Issue': 50,
      'Success': 100,
      'Completed': 100,
      'Failed': 100
    }
    setMaintenanceProgress(statusProgressMap[maintenance.status] || maintenance.progress || 0)
    setMaintenanceProgressNotes(maintenance.notes || '')
    setShowMaintenanceDetails(true)
  }

  const handleUpdateInstallationProgress = async () => {
    if (!selectedInstallation) return
    setIsLoading(true)
    const result = await updateInstallationProgress(selectedInstallation.id, installationProgressStatus, installationProgress, installationProgressNotes)
    if (result.error) toast.error(result.error)
    else {
      toast.success('Installation progress updated')
      refreshData()
      setShowInstallationDetails(false)
    }
    setIsLoading(false)
  }

  const handleUpdateRepairProgress = async () => {
    if (!selectedRepair) return
    setIsLoading(true)
    const result = await updateRepairProgress(selectedRepair.id, repairProgressStatus, repairProgress, repairProgressNotes)
    if (result.error) toast.error(result.error)
    else {
      toast.success('Repair progress updated')
      refreshData()
      setShowRepairDetails(false)
    }
    setIsLoading(false)
  }

  const handleUpdateMaintenanceProgress = async () => {
    if (!selectedMaintenance) return
    setIsLoading(true)
    try {
      const result = await updateMaintenanceProgress(selectedMaintenance.id, maintenanceProgressStatus, maintenanceProgress, maintenanceProgressNotes)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Maintenance progress updated')
        refreshData()
        setShowMaintenanceDetails(false)
      }
    } catch (error: any) {
      console.error('Update maintenance progress error:', error)
      toast.error(error.message || 'Failed to update progress')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Sidebar Navigation */}
      <AdminSidebar
        view={view}
        onViewChange={setView}
        onSettings={() => setView('settings')}
        onReminders={() => setShowReminders(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content */}
      <div className="flex-1 transition-all duration-300 overflow-auto h-screen">
        {view === 'dashboard' && (
          <div className="flex flex-col w-full h-full">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-20 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-[#005596]">Dashboard</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">Welcome back, Administrator</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNotifications(true)}
                    className="hidden sm:flex items-center gap-2 border-gray-200"
                  >
                    <Bell className="h-4 w-4" />
                    Notification
                    {notifications.filter(n => !n.is_read).length > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 hover:bg-red-600">
                        {notifications.filter(n => !n.is_read).length}
                      </Badge>
                    )}
                  </Button>
                </div>
              </div>
            </header>

            <main className="flex-1 w-full py-6 sm:py-8 px-4 sm:px-6 space-y-6 sm:space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Clients" value={clients.length.toString()} icon={<Users className="text-blue-600" />} />
                <StatCard title="Total Bookings" value={(installations.length + repairs.length + maintenance.length).toString()} icon={<Calendar className="text-blue-600" />} />
                <StatCard title="Total Leads" value={leads.length.toString()} icon={<TrendingUp className="text-purple-600" />} />
                <StatCard title="Pending Requests" value={requests.filter((r: any) => r.status === 'Pending').length.toString()} icon={<Clock className="text-yellow-600" />} />
                <StatCard title="Installations" value={installations.length.toString()} icon={<Wrench className="text-green-600" />} />
                <StatCard
                  title="Pending Installations"
                  value={installations.filter(i => i.status !== 'Completed').length.toString()}
                  icon={<Clock className="text-yellow-600" />}
                />
                <StatCard
                  title="Completed Installations"
                  value={installations.filter(i => i.status === 'Completed').length.toString()}
                  icon={<CheckCircle className="text-green-600" />}
                />
                <StatCard title="Repairs" value={repairs.length.toString()} icon={<PenTool className="text-orange-600" />} />
                <StatCard
                  title="Pending Repairs"
                  value={repairs.filter(r => r.status !== 'Completed').length.toString()}
                  icon={<Clock className="text-yellow-600" />}
                />
                <StatCard
                  title="Completed Repairs"
                  value={repairs.filter(r => r.status === 'Completed').length.toString()}
                  icon={<CheckCircle className="text-green-600" />}
                />
                <StatCard title="Maintenance" value={maintenance.length.toString()} icon={<Wrench className="text-blue-600" />} />
                <StatCard
                  title="Pending Maintenance"
                  value={maintenance.filter(m => m.status !== 'Completed').length.toString()}
                  icon={<Clock className="text-yellow-600" />}
                />
                <StatCard
                  title="Completed Maintenance"
                  value={maintenance.filter(m => m.status === 'Completed').length.toString()}
                  icon={<CheckCircle className="text-green-600" />}
                />
              </div>


              {/* Recent Activity */}
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {installations.length === 0 && repairs.length === 0 && maintenance.length === 0 && appointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-gray-400">No activity found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {[...installations, ...repairs, ...maintenance, ...appointments.map(apt => ({
                        ...apt,
                        title: apt.service_type
                      }))]
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .slice(0, 5)
                        .map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200">
                                {item.title.toLowerCase().includes('repair') ? <PenTool className="h-5 w-5" /> : <Wrench className="h-5 w-5" />}
                              </div>
                              <div>
                                <p className="font-bold text-[#005596]">{item.title}</p>
                                <p className="text-xs text-gray-500">{item.client_name} • {item.date}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={item.status === 'Completed' ? 'default' : 'secondary'} className={item.status === 'Completed' ? 'bg-green-100 text-green-700 border-green-200' : ''}>
                                {item.status}
                              </Badge>
                              <Button variant="ghost" size="sm" onClick={() => handleViewBookingDetails(item)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>


            </main>
          </div>
        )}

        {view === 'clients' && (
          <ClientsView
            clients={clients}
            total={clientsTotal}
            page={clientsPage}
            setPage={setClientsPage}
            isFetching={isFetching}
            onBack={() => setView('dashboard')}
            fetchClients={refreshData}
          />
        )}

        {view === 'installations' && (
          <InstallationsView
            installations={installations}
            total={installationsTotal}
            page={installationsPage}
            setPage={setInstallationsPage}
            clients={clients}
            clientUnits={clientUnits}
            onBack={() => setView('dashboard')}
            fetchInstallations={refreshData}
            onViewDetails={handleViewInstallationDetails}
          />
        )}

        {view === 'repairs' && (
          <RepairsView
            repairs={repairs}
            total={repairsTotal}
            page={repairsPage}
            setPage={setRepairsPage}
            clients={clients}
            clientUnits={clientUnits}
            repairJobs={repairJobs}
            onBack={() => setView('dashboard')}
            fetchRepairs={refreshData}
            onViewDetails={handleViewRepairDetails}
          />
        )}

        {view === 'maintenance' && (
          <MaintenanceView
            maintenance={maintenance}
            total={maintenanceTotal}
            page={maintenancePage}
            setPage={setMaintenancePage}
            clients={clients}
            clientUnits={clientUnits}
            onBack={() => setView('dashboard')}
            fetchMaintenance={refreshData}
            onViewDetails={handleViewMaintenanceDetails}
          />
        )}

        {view === 'schedule' && (
          <ScheduleView
            appointments={appointments}
            onBack={() => setView('dashboard')}
            fetchAppointments={refreshData}
          />
        )}

        {view === 'reports' && (
          <ReportsView
            installations={installations}
            repairs={repairs}
            maintenance={maintenance}
            clients={clients}
            onBack={() => setView('dashboard')}
          />
        )}

        {view === 'settings' && (
          <SettingsView
            settings={settings}
            onBack={() => setView('dashboard')}
            fetchSettings={refreshData}
          />
        )}

        {view === 'requests' && (
          <RequestsView
            requests={requests}
            technicians={technicians}
            onBack={() => setView('dashboard')}
            fetchRequests={refreshData}
            router={router}
            setView={setView}
            setInstallations={setInstallations}
            setRepairs={setRepairs}
            setMaintenance={setMaintenance}
          />
        )}

        {view === 'leads' && (
          <LeadsView
            leads={leads}
            onBack={() => setView('dashboard')}
            fetchLeads={refreshData}
            onGoToClients={() => setView('clients')}
          />
        )}

        {view === 'technicians' && (
          <TechniciansView
            technicians={technicians}
            onBack={() => setView('dashboard')}
            fetchTechnicians={refreshData}
          />
        )}

      </div>


      {/* Modals */}
      <Dialog open={showReminders} onOpenChange={setShowReminders}>
        <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <BellRing className="h-5 w-5 text-[#005596]" />
              Send Client Reminders
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-10"
                placeholder="Search clients to remind..."
                onChange={(e) => {
                  const query = e.target.value.toLowerCase()
                  // Simple local search for the reminders list
                  const items = document.querySelectorAll('.client-reminder-item')
                  items.forEach((item: any) => {
                    const name = item.getAttribute('data-name')?.toLowerCase() || ''
                    if (name.includes(query)) item.classList.remove('hidden')
                    else item.classList.add('hidden')
                  })
                }}
              />
            </div>
            <div className="space-y-2">
              {clients.filter(c => !c.is_archived).length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p>No active clients found</p>
                </div>
              ) : (
                clients.filter(c => !c.is_archived).map((client) => (
                  <div
                    key={client.id}
                    data-name={client.full_name}
                    className="client-reminder-item flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border text-[#005596] font-bold">
                        {client.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#1E293B]">{client.full_name}</p>
                        <p className="text-xs text-gray-500">{client.email}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      onClick={() => {
                        setSelectedClientForReminder(client)
                        setReminderMessage(`Hi ${client.full_name.split(' ')[0]}, your aircon cleaning service is due. Please contact us to schedule an appointment.`)
                        setShowReminderForm(true)
                      }}
                    >
                      Remind
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="p-4 border-t bg-gray-50">
            <Button variant="outline" className="w-full" onClick={() => setShowReminders(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showReminderForm} onOpenChange={setShowReminderForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Reminder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Client</Label>
              <Input value={selectedClientForReminder?.full_name} disabled className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>Reminder Title</Label>
              <Input
                value={reminderTitle}
                onChange={(e) => setReminderTitle(e.target.value)}
                placeholder="e.g. Aircon Cleaning Reminder"
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                placeholder="Enter your reminder message here..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowReminderForm(false)}>Cancel</Button>
              <Button
                className="bg-[#005596]"
                disabled={isSendingReminder || !reminderMessage}
                onClick={async () => {
                  setIsSendingReminder(true)
                  const result = await sendClientReminder(
                    selectedClientForReminder.id,
                    reminderTitle,
                    reminderMessage
                  )
                  if (result.error) toast.error(result.error)
                  else {
                    toast.success('Reminder sent successfully')
                    setShowReminderForm(false)
                  }
                  setIsSendingReminder(false)
                }}
              >
                {isSendingReminder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reminder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center justify-between">
              Notifications
              {notifications.some(n => !n.is_read) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-blue-600 hover:text-blue-700"
                  onClick={async () => {
                    for (const n of notifications.filter(notif => !notif.is_read)) {
                      await markNotificationAsRead(n.id)
                    }
                    // Update local state instead of refetching all data
                    setNotifications(notifications.map(notif => ({ ...notif, is_read: true })))
                  }}
                >
                  Mark all as read
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border transition-colors ${n.is_read ? 'bg-white border-gray-100' : 'bg-blue-50/50 border-blue-100'}`}
                  onClick={async () => {
                    if (!n.is_read) {
                      await markNotificationAsRead(n.id)
                      // Update local state instead of refetching all data
                      setNotifications(notifications.map(notif => notif.id === n.id ? { ...notif, is_read: true } : notif))
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-bold text-sm ${n.is_read ? 'text-gray-700' : 'text-[#005596]'}`}>{n.title}</h4>
                    {!n.is_read && <div className="h-2 w-2 bg-blue-600 rounded-full" />}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{n.message}</p>
                  <span className="text-[10px] text-gray-400">{format(parseISO(n.created_at), 'MMM d, h:mm a')}</span>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t bg-gray-50">
            <Button variant="outline" className="w-full" onClick={() => setShowNotifications(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBookingDetails} onOpenChange={setShowBookingDetails}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#005596]">{selectedBooking.title}</h3>
                  <Badge className={selectedBooking.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                    {selectedBooking.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600">{selectedBooking.cost || 'N/A'}</p>
                  <p className="text-xs text-gray-500">Service Fee</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Client Name</p>
                  <p className="text-sm font-bold">{selectedBooking.client_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Technician</p>
                  <p className="text-sm font-bold">{selectedBooking.technician}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Scheduled Date</p>
                  <p className="text-sm">{selectedBooking.date}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Time</p>
                  <p className="text-sm">{selectedBooking.time || 'N/A'}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-gray-500 font-medium">Location</p>
                  <p className="text-sm">{selectedBooking.location || selectedBooking.address}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-gray-500 font-medium">Progress</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>{Math.round(calculateDynamicProgress(selectedBooking))}% Completed</span>
                    </div>
                    <Progress value={Math.round(calculateDynamicProgress(selectedBooking))} status={selectedBooking?.status?.toLowerCase()?.replace(' ', '_') as any} className="h-2" />
                  </div>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-gray-500 font-medium">Notes</p>
                  <div className="bg-gray-50 p-3 rounded border text-sm italic">
                    {selectedBooking.notes || 'No notes provided'}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowBookingDetails(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Installation Details Dialog */}
      <Dialog open={showInstallationDetails} onOpenChange={setShowInstallationDetails}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Installation Details</DialogTitle>
          </DialogHeader>
          {selectedInstallation && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#005596]">{selectedInstallation.title}</h3>
                  <Badge className={selectedInstallation.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                    {selectedInstallation.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600">{selectedInstallation.cost || 'N/A'}</p>
                  <p className="text-xs text-gray-500">Service Fee</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Client Name</p>
                  <p className="text-sm font-bold">{selectedInstallation.client_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Technician</p>
                  <p className="text-sm font-bold">{selectedInstallation.technician || 'Not assigned'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Scheduled Date</p>
                  <p className="text-sm">{selectedInstallation.date}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Time</p>
                  <p className="text-sm">{selectedInstallation.time || 'N/A'}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-gray-500 font-medium">Location</p>
                  <p className="text-sm">{selectedInstallation.location}</p>
                </div>
              </div>

              {/* Progress Update Section */}
              {selectedInstallation.status !== 'Completed' && (
              <div className="border-t pt-4 space-y-4">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Update In Progress</p>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={installationProgressStatus} onValueChange={setInstallationProgressStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Success">Success</SelectItem>
                      <SelectItem value="Delayed">Delayed</SelectItem>
                      <SelectItem value="Failed">Failed</SelectItem>
                      <SelectItem value="Issue">Has Issue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Progress</Label>
                  <div className="flex items-center gap-3">
                    <Progress 
                      value={installationProgress} 
                      status={installationProgressStatus === 'Failed' ? 'error' : installationProgressStatus === 'Completed' ? 'completed' : installationProgressStatus === 'In Progress' ? 'in_progress' : 'pending'}
                      className="flex-1 h-2" 
                    />
                    <span className={`text-sm font-medium w-12 ${installationProgressStatus === 'Failed' ? 'text-red-500' : 'text-gray-700'}`}>{installationProgress}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea 
                    value={installationProgressNotes} 
                    onChange={(e) => setInstallationProgressNotes(e.target.value)}
                    placeholder="Add notes about the installation progress..."
                  />
                </div>
              </div>
              )}

              {selectedInstallation.status !== 'Completed' && (
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowInstallationDetails(false)}>Close</Button>
                <Button className="bg-[#005596]" onClick={handleUpdateInstallationProgress} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update In Progress
                </Button>
              </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Repair Details Dialog */}
      <Dialog open={showRepairDetails} onOpenChange={setShowRepairDetails}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Repair Details</DialogTitle>
          </DialogHeader>
          {selectedRepair && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#005596]">{selectedRepair.title}</h3>
                  <Badge className={selectedRepair.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                    {selectedRepair.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600">{selectedRepair.cost || 'N/A'}</p>
                  <p className="text-xs text-gray-500">Service Fee</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Client Name</p>
                  <p className="text-sm font-bold">{selectedRepair.client_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Technician</p>
                  <p className="text-sm font-bold">{selectedRepair.technician || 'Not assigned'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Scheduled Date</p>
                  <p className="text-sm">{selectedRepair.date}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Time</p>
                  <p className="text-sm">{selectedRepair.time || 'N/A'}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-gray-500 font-medium">Location</p>
                  <p className="text-sm">{selectedRepair.location}</p>
                </div>
              </div>

              {/* Progress Update Section */}
              {selectedRepair.status !== 'Completed' && (
              <div className="border-t pt-4 space-y-4">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Update In Progress</p>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={repairProgressStatus} onValueChange={setRepairProgressStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Success">Success</SelectItem>
                      <SelectItem value="Delayed">Delayed</SelectItem>
                      <SelectItem value="Failed">Failed</SelectItem>
                      <SelectItem value="Issue">Has Issue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Progress</Label>
                  <div className="flex items-center gap-3">
                    <Progress 
                      value={repairProgress} 
                      status={repairProgressStatus === 'Failed' ? 'error' : repairProgressStatus === 'Completed' ? 'completed' : repairProgressStatus === 'In Progress' ? 'in_progress' : 'pending'}
                      className="flex-1 h-2" 
                    />
                    <span className={`text-sm font-medium w-12 ${repairProgressStatus === 'Failed' ? 'text-red-500' : 'text-gray-700'}`}>{repairProgress}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea 
                    value={repairProgressNotes} 
                    onChange={(e) => setRepairProgressNotes(e.target.value)}
                    placeholder="Add notes about the repair progress..."
                  />
                </div>
              </div>
              )}

              {selectedRepair.status !== 'Completed' && (
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowRepairDetails(false)}>Close</Button>
                <Button className="bg-[#005596]" onClick={handleUpdateRepairProgress} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update In Progress
                </Button>
              </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Maintenance Details Dialog */}
      <Dialog open={showMaintenanceDetails} onOpenChange={setShowMaintenanceDetails}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Maintenance Details</DialogTitle>
          </DialogHeader>
          {selectedMaintenance && (
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#005596]">{selectedMaintenance.title}</h3>
                    <Badge className={selectedMaintenance.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                      {selectedMaintenance.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600">{selectedMaintenance.cost || 'N/A'}</p>
                    <p className="text-xs text-gray-500">Service Fee</p>
                  </div>
                </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Client Name</p>
                  <p className="text-sm font-bold">{selectedMaintenance.client_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Technician</p>
                  <p className="text-sm font-bold">{selectedMaintenance.technician || 'Not assigned'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Scheduled Date</p>
                  <p className="text-sm">{selectedMaintenance.date}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Time</p>
                  <p className="text-sm">{selectedMaintenance.time || 'N/A'}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-gray-500 font-medium">Location</p>
                  <p className="text-sm">{selectedMaintenance.location}</p>
                </div>
              </div>

              {/* Progress Update Section */}
              {selectedMaintenance.status !== 'Completed' && (
              <div className="border-t pt-4 space-y-4">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Update In Progress</p>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={maintenanceProgressStatus} onValueChange={setMaintenanceProgressStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Success">Success</SelectItem>
                      <SelectItem value="Delayed">Delayed</SelectItem>
                      <SelectItem value="Failed">Failed</SelectItem>
                      <SelectItem value="Issue">Has Issue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Progress</Label>
                  <div className="flex items-center gap-3">
                    <Progress 
                      value={maintenanceProgress} 
                      status={maintenanceProgressStatus === 'Failed' ? 'error' : maintenanceProgressStatus === 'Completed' ? 'completed' : maintenanceProgressStatus === 'In Progress' ? 'in_progress' : 'pending'}
                      className="flex-1 h-2" 
                    />
                    <span className={`text-sm font-medium w-12 ${maintenanceProgressStatus === 'Failed' ? 'text-red-500' : 'text-gray-700'}`}>{maintenanceProgress}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea 
                    value={maintenanceProgressNotes} 
                    onChange={(e) => setMaintenanceProgressNotes(e.target.value)}
                    placeholder="Add notes about the maintenance progress..."
                  />
                </div>
              </div>
              )}

              {selectedMaintenance.status !== 'Completed' && (
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowMaintenanceDetails(false)}>Close</Button>
                <Button 
                  type="button"
                  className="bg-[#005596]" 
                  onClick={() => handleUpdateMaintenanceProgress()} 
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update In Progress
                </Button>
              </div>
              )}
            </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}

function LeadsView({ leads, onBack, fetchLeads, onGoToClients }: any) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [clientTypeFilter, setClientTypeFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Filter leads
  const filteredLeads = leads.filter((lead: any) => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = !searchQuery ||
      lead.full_name?.toLowerCase().includes(searchLower) ||
      lead.phone_number?.toLowerCase().includes(searchLower) ||
      lead.email?.toLowerCase().includes(searchLower) ||
      lead.service_address?.toLowerCase().includes(searchLower)
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    const matchesClientType = clientTypeFilter === 'all' || lead.client_type === clientTypeFilter
    
    const leadDate = lead.created_at ? lead.created_at.split('T')[0] : ''
    const matchesDateFrom = !dateFrom || leadDate >= dateFrom
    const matchesDateTo = !dateTo || leadDate <= dateTo
    
    return matchesSearch && matchesStatus && matchesClientType && matchesDateFrom && matchesDateTo
  })

  const pendingLeads = leads.filter((l: any) => l.status === 'Pending').length
  const contactedLeads = leads.filter((l: any) => l.status === 'Contacted').length
  const convertedLeads = leads.filter((l: any) => l.status === 'Converted' || l.status === 'Accepted').length

  const handleStatusUpdate = async (id: string, status: string) => {
    setIsLoading(true)
    const result = await updateLeadStatus(id, status)
    if (result.error) toast.error(result.error)
    else {
      toast.success(`Lead marked as ${status.toLowerCase()}`)
      fetchLeads()
    }
    setIsLoading(false)
  }

  const handleAddClient = async (id: string) => {
    setIsLoading(true)
    const result = await convertLeadToClient(id)
    if (result.error) toast.error(result.error)
    else {
      toast.success('Lead converted to client successfully')
      setGeneratedPassword(result.password || null)
      setShowPasswordDialog(true)
      fetchLeads()
    }
    setIsLoading(false)
  }

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return
    setIsLoading(true)
    const result = await deleteLead(id)
    if (result.error) toast.error(result.error)
    else {
      toast.success('Lead deleted successfully')
      fetchLeads()
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}><ChevronLeft className="h-4 w-4 mr-2" />Back to Dashboard</Button>
          <div>
            <h1 className="text-xl font-bold text-[#005596]">Generated Leads</h1>
            <p className="text-sm text-gray-500">Manage leads generated from the landing page booking form</p>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-8 px-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <MiniStatCard title="Total Leads" value={filteredLeads.length.toString()} icon={<TrendingUp className="text-blue-600" />} />
          <MiniStatCard title="Pending" value={filteredLeads.filter((l: any) => l.status === 'Pending').length.toString()} icon={<Clock className="text-yellow-600" />} />
          <MiniStatCard title="Contacted" value={filteredLeads.filter((l: any) => l.status === 'Contacted').length.toString()} icon={<Phone className="text-blue-600" />} />
          <MiniStatCard title="Converted" value={filteredLeads.filter((l: any) => l.status === 'Converted' || l.status === 'Accepted').length.toString()} icon={<CheckCircle className="text-green-600" />} />
        </div>

        {/* Filters */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder="Search by name, phone, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  className="w-[140px]"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="From"
                />
                <span className="text-gray-400">-</span>
                <Input
                  type="date"
                  className="w-[140px]"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="To"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Converted">Converted</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={clientTypeFilter} onValueChange={setClientTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Residential">Residential</SelectItem>
                  <SelectItem value="Corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500"
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('all')
                  setClientTypeFilter('all')
                  setDateFrom('')
                  setDateTo('')
                }}
              >
                Clear
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Showing <span className="font-bold text-[#005596]">{filteredLeads.length}</span> of <span className="font-bold">{leads.length}</span> leads
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No leads found</p>
            </div>
          ) : (
            filteredLeads.map((lead: any) => (
              <Card key={lead.id} className="border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <Badge className={
                          lead.status === 'Contacted' ? 'bg-blue-100 text-blue-700' :
                            lead.status === 'Converted' ? 'bg-green-100 text-green-700' :
                              'bg-yellow-100 text-yellow-700'
                        }>
                          {lead.status}
                        </Badge>
                        <h3 className="font-bold text-lg text-[#005596]">{lead.full_name}</h3>
                        <span className="text-sm text-gray-400">• {format(parseISO(lead.created_at), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="space-y-1">
                          <p className="text-gray-500 font-medium">Service Requested</p>
                          <p className="text-[#005596] flex items-center gap-2"><Wrench className="h-4 w-4" /> {lead.service_type}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 font-medium">Contact Info</p>
                          <p className="text-[#005596] flex items-center gap-2"><Phone className="h-4 w-4" /> {lead.phone_number}</p>
                          <p className="text-[#005596] flex items-center gap-2"><Mail className="h-4 w-4" /> {lead.email}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 font-medium">Type</p>
                          <p className="text-[#005596] flex items-center gap-2"><Home className="h-4 w-4" /> {lead.client_type}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-6">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedLead(lead)
                          setShowDetails(true)
                        }}
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleDeleteLead(lead.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {lead.status === 'Pending' && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleStatusUpdate(lead.id, 'Contacted')}
                          disabled={isLoading}
                        >
                          Mark Contacted
                        </Button>
                      )}
                      {lead.status === 'Contacted' && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleAddClient(lead.id)}
                          disabled={isLoading}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Add Client
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-6 py-4">

              {/* Lead Profile */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Lead Profile</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Potential Client Name</p>
                    <p className="text-sm font-bold">{selectedLead.full_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Lead Category</p>
                    <Badge variant="outline" className={selectedLead.client_type === 'Corporate' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}>
                      {selectedLead.client_type || 'Residential'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Email</p>
                    <p className="text-sm flex items-center gap-1"><Mail className="h-3 w-3 text-gray-400" /> {selectedLead.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Contact Number</p>
                    <p className="text-sm flex items-center gap-1"><Phone className="h-3 w-3 text-gray-400" /> {selectedLead.phone_number}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Lead Source</p>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      {selectedLead.lead_source || 'Website'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Date Submitted</p>
                    <p className="text-sm">{format(parseISO(selectedLead.created_at), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              </div>

              {/* Requirement Details */}
              <div className="space-y-3 pt-3 border-t">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Requirement Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Service Requested</p>
                    <p className="text-sm font-bold text-blue-600 flex items-center gap-1"><Wrench className="h-3 w-3" /> {selectedLead.service_type}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Unit Brand / Type</p>
                    <p className="text-sm">
                      {selectedLead.unit_brand_type ||
                        selectedLead.additional_info?.match(/Brand: ([^|]+)/)?.[1] ||
                        selectedLead.additional_info?.match(/Type: ([^|]+)/)?.[1] ||
                        'Not specified'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Preferred Schedule</p>
                    <p className="text-sm">{selectedLead.preferred_date} at {selectedLead.preferred_time}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Service Address</p>
                    <p className="text-sm flex items-start gap-1"><MapPin className="h-3 w-3 mt-0.5 text-gray-400" /> {selectedLead.service_address}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-xs text-gray-500 font-medium">Initial Notes / Inquiry</p>
                    <div className="bg-gray-50 p-3 rounded border text-sm italic">
                      {selectedLead.additional_info || 'No additional information provided'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sales Intelligence */}
              <div className="space-y-3 pt-3 border-t">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sales Intelligence</p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Lead Temperature</p>
                    <Badge className={
                      selectedLead.lead_temperature === 'Hot' ? 'bg-red-100 text-red-700' :
                        selectedLead.lead_temperature === 'Warm' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                    }>
                      {selectedLead.lead_temperature || 'Cold'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Potential Deal Value</p>
                    <p className="text-sm font-bold text-green-700">
                      {selectedLead.potential_deal_value ? `₱${Number(selectedLead.potential_deal_value).toLocaleString()}` : 'TBD'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Follow-up Status</p>
                    <Badge className={
                      selectedLead.status === 'Converted' ? 'bg-green-100 text-green-700' :
                        selectedLead.status === 'Contacted' ? 'bg-blue-100 text-blue-700' :
                          selectedLead.status === 'Lost' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                    }>
                      {selectedLead.status === 'Pending' ? 'Inquiry' : selectedLead.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowDetails(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Client Added Successfully
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-gray-600">
              The lead has been converted to a client. Please share the generated password with the client so they can access their dashboard.
            </p>
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg space-y-2">
              <span className="text-sm font-medium text-blue-700">Generated Password (select and copy)</span>
              <Input
                readOnly
                value={generatedPassword || ''}
                className="text-lg font-mono font-bold text-blue-900 bg-white border-blue-200 select-all"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Close</Button>
            <Button className="bg-[#005596]" onClick={() => {
              setShowPasswordDialog(false)
              onGoToClients()
            }}>
              Go to Manage Clients
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-3xl font-bold text-[#005596]">{value}</p>
          </div>
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ActionCard({ title, description, icon, onClick }: { title: string, description: string, icon: React.ReactNode, onClick?: () => void }) {
  return (
    <Card
      className={`border-none shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col items-center justify-center p-8 text-center space-y-4`}
      onClick={onClick}
    >
      <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="font-bold text-[#005596]">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </Card>
  )
}

// VIEW COMPONENTS

function ClientsView({ clients, total, page, setPage, isFetching, onBack, fetchClients }: any) {
  const [isLoading, setIsLoading] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const itemsPerPage = 20

  const totalPages = Math.ceil(total / itemsPerPage)

  const handleCreateClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const phone = formData.get('phone') as string

    if (phone && !validatePHPhone(phone)) {
      toast.error(PHONE_VALIDATION_ERROR)
      return
    }

    setIsLoading(true)
    setGeneratedPassword(null)
    const result = await createClientUser(formData)

    if (result.error) toast.error(result.error)
    else if (result.success && result.password) {
      toast.success('Client created successfully')
      setGeneratedPassword(result.password)
      fetchClients()
        ; (e.target as HTMLFormElement).reset()
    }
    setIsLoading(false)
  }

  const handleArchive = async (id: string) => {
    setIsLoading(true)
    const result = await archiveClient(id)
    if (result.error) toast.error(result.error)
    else {
      toast.success('Client archived successfully')
      fetchClients()
    }
    setIsLoading(false)
  }

  const handleUnarchive = async (id: string) => {
    setIsLoading(true)
    const result = await unarchiveClient(id)
    if (result.error) toast.error(result.error)
    else {
      toast.success('Client restored successfully')
      fetchClients()
    }
    setIsLoading(false)
  }

  const handleExportCSV = () => {
    const filteredData = filteredClients
    const headers = ['Name', 'Email', 'Type', 'Phone', 'Address', 'Created At']
    const csvContent = [
      headers.join(','),
      ...filteredData.map((c: any) => [
        `"${c.full_name || ''}"`,
        `"${c.email || ''}"`,
        `"${c.client_type || 'Residential'}"`,
        `"${c.phone || ''}"`,
        `"${c.address || ''}"`,
        `"${c.created_at || ''}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `clients_${showArchived ? 'archived_' : ''}${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    toast.success('CSV exported successfully')
  }

  const filteredClients = clients.filter((client: any) => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = !searchQuery || 
      client.full_name?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.phone?.toLowerCase().includes(searchLower) ||
      client.address?.toLowerCase().includes(searchLower)
    
    const clientType = (client.client_type || 'Residential').toLowerCase()
    const matchesType = typeFilter === 'all' || clientType === typeFilter.toLowerCase()
    
    const clientDate = client.created_at ? client.created_at.split('T')[0] : ''
    const matchesDateFrom = !dateFrom || clientDate >= dateFrom
    const matchesDateTo = !dateTo || clientDate <= dateTo
    
    const matchesArchived = showArchived ? client.is_archived === true : client.is_archived !== true

    return matchesSearch && matchesType && matchesDateFrom && matchesDateTo && matchesArchived
  })

  const clientTotalPages = Math.ceil(total / itemsPerPage)

  const residentialCount = clients.filter((c: any) => (c.client_type || 'Residential') === 'Residential' && !c.is_archived).length
  const corporateCount = clients.filter((c: any) => c.client_type === 'Corporate' && !c.is_archived).length
  const activeClientsCount = clients.filter((c: any) => !c.is_archived).length

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-xl font-bold text-[#005596]">Client Management</h1>
            <p className="text-sm text-gray-500">Manage your client database</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button className="bg-[#00529B]" size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>
      </header>

      <main className="container mx-auto py-8 px-6 space-y-6">
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowArchived(!showArchived)
              setPage(1)
            }}
          >
            {showArchived ? <ArchiveRestore className="h-4 w-4 mr-2" /> : <Archive className="h-4 w-4 mr-2" />}
            {showArchived ? 'Show Active Clients' : 'Show Archived Clients'}
          </Button>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Search by name, email, phone, or address..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              className="w-[140px]"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
              placeholder="From"
            />
            <span className="text-gray-400">-</span>
            <Input
              type="date"
              className="w-[140px]"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
              placeholder="To"
            />
          </div>
          <Select value={typeFilter} onValueChange={(val) => { setTypeFilter(val); setPage(1) }}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="corporate">Corporate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing <span className="font-bold text-[#005596]">{filteredClients.length}</span> of <span className="font-bold">{total}</span> clients
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500"
            onClick={() => {
              setSearchQuery('')
              setTypeFilter('all')
              setDateFrom('')
              setDateTo('')
              setPage(1)
            }}
          >
            Clear Filters
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Clients</p>
                <p className="text-3xl font-bold text-[#005596]">{filteredClients.length}</p>
              </div>
              <Users className="h-8 w-8 text-gray-300" />
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Residential</p>
                <p className="text-3xl font-bold text-[#005596]">{filteredClients.filter((c: any) => (c.client_type || 'Residential') === 'Residential').length}</p>
              </div>
              <Home className="h-8 w-8 text-gray-300" />
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Corporate</p>
                <p className="text-3xl font-bold text-[#005596]">{filteredClients.filter((c: any) => c.client_type === 'Corporate').length}</p>
              </div>
              <Building2 className="h-8 w-8 text-gray-300" />
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {showArchived ? 'Archived Clients' : 'Clients'} ({filteredClients.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isFetching ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>{showArchived ? 'No archived clients found' : 'No clients found'}</p>
              </div>
            ) : (
              filteredClients.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((client: any) => (
                <div key={client.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#005596]">{client.full_name}</span>
                        <Badge
                          variant="outline"
                          className={
                            (client.client_type || 'Residential') === 'Corporate'
                              ? 'bg-purple-50 text-purple-700 border-purple-200 text-[10px]'
                              : 'bg-blue-50 text-blue-700 border-blue-200 text-[10px]'
                          }
                        >
                          {client.client_type || 'residential'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {client.email}
                        </span>
                        {client.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {client.phone}
                          </span>
                        )}
                        {client.address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {client.address?.substring(0, 40)}{client.address?.length > 40 ? '...' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedClient(client)
                        setShowDetails(true)
                      }}
                    >
                      View Details
                    </Button>
                    {showArchived ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => handleUnarchive(client.id)}
                        disabled={isLoading}
                      >
                        Restore
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleArchive(client.id)}
                        disabled={isLoading}
                      >
                        Archive Client
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-gray-500">
                  Showing {((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, total)} of {total} clients
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: clientTotalPages }, (_, i) => i + 1).map(p => (
                    <Button
                      key={p}
                      variant={page === p ? 'default' : 'outline'}
                      size="sm"
                      className={page === p ? 'bg-[#005596]' : ''}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p: number) => Math.min(clientTotalPages, p + 1))}
                    disabled={page === clientTotalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={showDetails} onOpenChange={(open) => {
        setShowDetails(open)
        if (!open) setShowPassword(false)
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#005596]">{selectedClient.full_name}</h3>
                  <Badge
                    variant="outline"
                    className={
                      (selectedClient.client_type || 'Residential') === 'Corporate'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }
                  >
                    {selectedClient.client_type || 'Residential'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Email</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {selectedClient.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Phone</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {selectedClient.phone || 'Not provided'}
                  </p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-gray-500 font-medium">Address</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {selectedClient.address || 'Not provided'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Created At</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {selectedClient.created_at ? format(parseISO(selectedClient.created_at), 'MMM d, yyyy') : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Generated Password</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono bg-gray-50 px-2 py-1 rounded flex-1">
                      {showPassword ? (selectedClient.password || 'N/A') : (selectedClient.password ? '••••••••' : 'N/A')}
                    </p>
                    {selectedClient.password && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowDetails(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateClient} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input name="fullName" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input name="email" type="email" placeholder="john@example.com" required />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input name="phone" placeholder="09XXXXXXXXX" maxLength={11} required />
            </div>

            <div className="space-y-2">
              <Label>Client Type</Label>
              <Select name="clientType" defaultValue="Residential">
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Residential">Residential</SelectItem>
                  <SelectItem value="Corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#00529B]" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Client
              </Button>
            </div>
          </form>
          {generatedPassword && (
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg space-y-2">
              <span className="text-sm font-medium text-blue-700">Generated Password (select and copy)</span>
              <Input
                readOnly
                value={generatedPassword}
                className="text-lg font-mono font-bold text-blue-900 bg-white border-blue-200 select-all"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InstallationsView({ installations, total, page, setPage, clients, clientUnits, onBack, fetchInstallations, onViewDetails, onUpdateProgress }: any) {
  const [showAdd, setShowAdd] = useState(false)
  const [showRegisterUnit, setShowRegisterUnit] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [type, setType] = useState('Real-Time')
  const [technology, setTechnology] = useState('Inverter')
  const [selectedUnit, setSelectedUnit] = useState<any>(null)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [technicianFilter, setTechnicianFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  
  // Unit filters
  const [unitSearchQuery, setUnitSearchQuery] = useState('')
  const [unitBrandFilter, setUnitBrandFilter] = useState('all')
  
  const today = new Date().toISOString().split('T')[0]
  const itemsPerPage = 20
  const totalPages = Math.ceil(total / itemsPerPage)

  const BRANDS = ['LG', 'Samsung', 'Carrier', 'Daikin', 'Midea', 'Aux', 'Panasonic', 'Kolin', 'Sharp', 'Fujidenzo', 'Generic']
  const HP_OPTIONS = ['0.5', '1.0', '1.5', '2.0', '2.5', '3.0']

  const techSet = new Set<string>()
  installations.forEach((i: any) => { if (i.technician) techSet.add(i.technician) })
  const uniqueTechnicians = Array.from(techSet)

  const brandSet = new Set<string>()
  clientUnits.forEach((u: any) => { if (u.brand) brandSet.add(u.brand as string) })
  const uniqueBrands = Array.from(brandSet)

  // Filter installations
  const filteredInstallations = installations.filter((item: any) => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = !searchQuery || 
      item.title?.toLowerCase().includes(searchLower) ||
      item.client_name?.toLowerCase().includes(searchLower) ||
      item.location?.toLowerCase().includes(searchLower) ||
      item.technician?.toLowerCase().includes(searchLower)
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    const matchesTech = technicianFilter === 'all' || item.technician === technicianFilter
    
    const itemDate = item.date || ''
    const matchesDateFrom = !dateFrom || itemDate >= dateFrom
    const matchesDateTo = !dateTo || itemDate <= dateTo
    
    return matchesSearch && matchesStatus && matchesTech && matchesDateFrom && matchesDateTo
  })

  // Filter client units
  const filteredUnits = clientUnits.filter((unit: any) => {
    const searchLower = unitSearchQuery.toLowerCase()
    const matchesSearch = !unitSearchQuery ||
      unit.unit_name?.toLowerCase().includes(searchLower) ||
      unit.brand?.toLowerCase().includes(searchLower) ||
      unit.profiles?.full_name?.toLowerCase().includes(searchLower)
    
    const matchesBrand = unitBrandFilter === 'all' || unit.brand === unitBrandFilter
    
    return matchesSearch && matchesBrand
  })

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.append('type', type)
    const result = await createInstallation(formData)
    if (result.error) toast.error(result.error)
    else {
      toast.success('Installation added')
      fetchInstallations()
      setShowAdd(false)
    }
    setIsLoading(false)
  }

  const handleComplete = async (id: string) => {
    const result = await markInstallationComplete(id)
    if (result.error) toast.error(result.error)
    else {
      toast.success('Installation marked as completed')
      fetchInstallations()
    }
  }

  const handleRegisterUnit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.set('technology', technology)
    const result = await registerUnit(formData)
    if (result.error) toast.error(result.error)
    else {
      toast.success('Unit registered successfully!')
      fetchInstallations()
      setShowRegisterUnit(false)
      setTechnology('Inverter')
    }
    setIsLoading(false)
  }

  const handleDeleteUnit = async (unitId: string) => {
    if (!confirm('Delete this registered unit? This cannot be undone.')) return
    const result = await deleteClientUnit(unitId)
    if (result.error) toast.error(result.error)
    else {
      toast.success('Unit removed from registry')
      fetchInstallations()
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}><ChevronLeft className="h-4 w-4 mr-2" />Back</Button>
          <div>
            <h1 className="text-xl font-bold text-[#005596]">Installations & Asset Registry</h1>
            <p className="text-sm text-gray-500">Manage service jobs and registered aircon units</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-[#005596] text-[#005596] hover:bg-blue-50" onClick={() => setShowRegisterUnit(true)}>
            <Plus className="h-4 w-4 mr-2" />Register New Unit
          </Button>
          <Button className="bg-[#005596]" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4 mr-2" />Add Installation Job
          </Button>
        </div>
      </header>

      <main className="container mx-auto py-8 px-6 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-6">
          <MiniStatCard title="Total Jobs" value={filteredInstallations.length.toString()} icon={<Wrench className="text-blue-600" />} />
          <MiniStatCard title="Scheduled" value={filteredInstallations.filter((i: any) => i.status === 'Scheduled').length.toString()} icon={<Calendar className="text-yellow-600" />} />
          <MiniStatCard title="In Progress" value={filteredInstallations.filter((i: any) => i.status === 'In Progress').length.toString()} icon={<Clock className="text-blue-600" />} />
          <MiniStatCard title="Registered Units" value={filteredUnits.length.toString()} icon={<ClipboardList className="text-emerald-600" />} />
        </div>

        {/* Installation Jobs Filters */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter Installation Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  className="w-[140px]"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="From"
                />
                <span className="text-gray-400">-</span>
                <Input
                  type="date"
                  className="w-[140px]"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="To"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Technicians" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Technicians</SelectItem>
                  {uniqueTechnicians.map((t: string) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500"
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('all')
                  setTechnicianFilter('all')
                  setDateFrom('')
                  setDateTo('')
                }}
              >
                Clear
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Showing <span className="font-bold text-[#005596]">{filteredInstallations.length}</span> of <span className="font-bold">{installations.length}</span> jobs
            </p>
          </CardContent>
        </Card>

        {/* Installation Jobs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[#005596] text-lg flex items-center gap-2"><Wrench className="h-5 w-5" /> Installation Jobs ({filteredInstallations.length})</h2>
          </div>
          {filteredInstallations.map((item: any) => (
            <Card key={item.id} className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                      {item.status === 'Completed' ? <CheckCircle className="text-green-500" /> : <Clock className="text-blue-500" />}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-[#005596]">{item.title}</h3>
                        <Badge className={item.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>{item.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {item.client_name}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.location}</span>
                        <span className="flex items-center gap-1"><Wrench className="h-3 w-3" /> {item.technician}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {item.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {item.status !== 'Completed' && <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleComplete(item.id)}>Mark Complete</Button>}
                    <Button variant="outline" size="sm" onClick={() => onViewDetails(item)}>View Details</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>{item.status === 'Completed' ? 'Completed' : 'Installation Progress'}</span>
                    <span>{Math.round(calculateDynamicProgress(item))}%</span>
                  </div>
                  <Progress value={Math.round(calculateDynamicProgress(item))} status={item.status === 'Completed' ? 'completed' : item.status === 'In Progress' ? 'in_progress' : 'pending'} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredInstallations.length === 0 && <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">No installation jobs found</div>}
        </div>

        {/* Asset Registry Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[#005596] text-lg flex items-center gap-2"><ClipboardList className="h-5 w-5" /> Asset Registry ({filteredUnits.length})</h2>
          </div>

          {/* Unit Filters */}
          <Card className="border-none shadow-sm">
            <CardContent className="py-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-10"
                    placeholder="Search units..."
                    value={unitSearchQuery}
                    onChange={(e) => setUnitSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={unitBrandFilter} onValueChange={setUnitBrandFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {uniqueBrands.map((b: string) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500"
                  onClick={() => {
                    setUnitSearchQuery('')
                    setUnitBrandFilter('all')
                  }}
                >
                  Clear
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Showing <span className="font-bold text-[#005596]">{filteredUnits.length}</span> of <span className="font-bold">{clientUnits.length}</span> units
              </p>
            </CardContent>
          </Card>

          {filteredUnits.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-[#005596]/20">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-200" />
              <p className="font-semibold text-gray-500">No units found</p>
              <p className="text-sm text-gray-400 mb-4">Click "Register New Unit" to give an aircon its Digital Identity</p>
              <Button className="bg-[#005596]" onClick={() => setShowRegisterUnit(true)}><Plus className="h-4 w-4 mr-2" />Register First Unit</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredUnits.map((unit: any) => (
                <Card key={unit.id} className="border border-[#005596]/10 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#005596]/10 rounded-xl">
                          <Thermometer className="h-5 w-5 text-[#005596]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-[#1E293B] text-sm">{unit.unit_name}</h3>
                          <p className="text-xs text-gray-500">{unit.profiles?.full_name || 'Unknown Client'}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteUnit(unit.id)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                      <div className="bg-slate-50 rounded-lg p-2">
                        <p className="text-gray-400 font-medium uppercase tracking-wide text-[9px] mb-0.5">Brand</p>
                        <p className="font-bold text-[#1E293B]">{unit.brand}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2">
                        <p className="text-gray-400 font-medium uppercase tracking-wide text-[9px] mb-0.5">Type</p>
                        <p className="font-bold text-[#1E293B]">{unit.unit_type}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2">
                        <p className="text-gray-400 font-medium uppercase tracking-wide text-[9px] mb-0.5">HP</p>
                        <p className="font-bold text-[#1E293B]">{unit.horsepower} HP</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2">
                        <p className="text-gray-400 font-medium uppercase tracking-wide text-[9px] mb-0.5">Technology</p>
                        <p className="font-bold text-[#1E293B] flex items-center gap-1">
                          <Zap className="h-3 w-3 text-amber-500" />{unit.technology}
                        </p>
                      </div>
                    </div>

                    {(unit.indoor_serial || unit.outdoor_serial) && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                        {unit.indoor_serial && <p className="text-[10px] text-gray-500"><span className="font-semibold">Indoor S/N:</span> {unit.indoor_serial}</p>}
                        {unit.outdoor_serial && <p className="text-[10px] text-gray-500"><span className="font-semibold">Outdoor S/N:</span> {unit.outdoor_serial}</p>}
                      </div>
                    )}

                    {unit.installation_date && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-400">
                        <Calendar className="h-3 w-3" /> Installed: {unit.installation_date}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Installation Job Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Installation Job</DialogTitle></DialogHeader>
          <div className="py-4 space-y-6">
            <div className="space-y-2">
              <Label>Installation Type *</Label>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setType('Real-Time')} className={`p-6 border rounded-xl text-center space-y-2 transition-all ${type === 'Real-Time' ? 'border-[#005596] bg-blue-50 ring-2 ring-[#005596]/10' : 'border-gray-200 hover:border-gray-300'}`}>
                  <Clock className="mx-auto h-8 w-8 text-[#005596]" />
                  <div className="font-bold">Real-Time</div>
                  <div className="text-xs text-gray-500">Start immediately</div>
                </button>
                <button onClick={() => setType('Schedule')} className={`p-6 border rounded-xl text-center space-y-2 transition-all ${type === 'Schedule' ? 'border-[#005596] bg-blue-50 ring-2 ring-[#005596]/10' : 'border-gray-200 hover:border-gray-300'}`}>
                  <Calendar className="mx-auto h-8 w-8 text-[#005596]" />
                  <div className="font-bold">Schedule</div>
                  <div className="text-xs text-gray-500">Pick date & time</div>
                </button>
              </div>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Client *</Label>
                  <Select name="clientName" required>
                    <SelectTrigger><SelectValue placeholder="Select client..." /></SelectTrigger>
                    <SelectContent>{clients.map((c: any) => <SelectItem key={c.id} value={c.full_name}>{c.full_name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Service Type *</Label>
                  <Select name="serviceType" required>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Air Conditioning Installation">AC Installation</SelectItem>
                      <SelectItem value="Split Type Installation">Split Type</SelectItem>
                      <SelectItem value="Window Type Installation">Window Type</SelectItem>
                      <SelectItem value="Inverter Installation">Inverter</SelectItem>
                      <SelectItem value="Central AC Installation">Central AC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <Label>Technician *</Label>
                <Select name="technician" required>
                  <SelectTrigger><SelectValue placeholder="Select technician" /></SelectTrigger>
                  <SelectContent>
                    {clients.map ? null : null}
                    <SelectItem value="Chris">Chris</SelectItem>
                    <SelectItem value="Emman">Emman</SelectItem>
                    <SelectItem value="Carlos">Carlos</SelectItem>
                    <SelectItem value="Arnold">Arnold</SelectItem>
                    <SelectItem value="Bobby">Bobby</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1"><Label>Cost *</Label>
                  <Select name="cost" required><SelectTrigger><SelectValue placeholder="Select cost" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="₱1,500">₱1,500</SelectItem><SelectItem value="₱2,500">₱2,500</SelectItem>
                      <SelectItem value="₱3,500">₱3,500</SelectItem><SelectItem value="₱5,000">₱5,000</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Date *</Label><Input name="date" type="date" min={today} required /></div>
                <div className="space-y-1"><Label>Time *</Label><Input name="time" type="time" required /></div>
              </div>
              <div className="space-y-1"><Label>Address *</Label><Input name="address" placeholder="Installation address" required /></div>
              <div className="space-y-1"><Label>Notes</Label><Textarea name="notes" placeholder="Additional notes" /></div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#005596]" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add Job</Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Register New Unit Dialog */}
      <Dialog open={showRegisterUnit} onOpenChange={setShowRegisterUnit}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#005596]">
              <ClipboardList className="h-5 w-5" /> Register Aircon Unit
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRegisterUnit} className="space-y-5 py-2">
            {/* Client */}
            <div className="space-y-1">
              <Label>Client *</Label>
              <Select name="clientId" required>
                <SelectTrigger><SelectValue placeholder="Select client..." /></SelectTrigger>
                <SelectContent>
                  {clients.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.full_name} — {c.email}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Unit Details */}
            <div className="border rounded-xl p-4 space-y-4 bg-slate-50/50">
              <p className="text-xs font-bold text-[#005596] uppercase tracking-widest">Unit Details</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Unit Name / Label *</Label>
                  <Input name="unitName" placeholder="e.g. Master's BR, Living Room" required />
                </div>
                <div className="space-y-1">
                  <Label>Brand *</Label>
                  <Select name="brand" required>
                    <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                    <SelectContent>{BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Unit Type *</Label>
                  <Select name="unitType" required>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Split Type">Split Type</SelectItem>
                      <SelectItem value="Window">Window</SelectItem>
                      <SelectItem value="Cassette">Cassette</SelectItem>
                      <SelectItem value="Floor Mounted">Floor Mounted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Horsepower (HP) *</Label>
                  <Select name="horsepower" required>
                    <SelectTrigger><SelectValue placeholder="Select HP" /></SelectTrigger>
                    <SelectContent>{HP_OPTIONS.map(hp => <SelectItem key={hp} value={hp}>{hp} HP</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              {/* Technology Toggle */}
              <div className="space-y-2">
                <Label>Technology *</Label>
                <div className="flex gap-3">
                  {['Inverter', 'Non-Inverter'].map(t => (
                    <button key={t} type="button" onClick={() => setTechnology(t)}
                      className={`flex-1 py-3 border rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${technology === t ? 'bg-[#005596] text-white border-[#005596]' : 'border-gray-200 text-gray-600 hover:border-[#005596]'}`}>
                      <Zap className="h-4 w-4" />{t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Serial Numbers */}
            <div className="border rounded-xl p-4 space-y-4 bg-slate-50/50">
              <p className="text-xs font-bold text-[#005596] uppercase tracking-widest">Serial Numbers</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Indoor Unit Serial</Label><Input name="indoorSerial" placeholder="e.g. LG-IND-2024-001" /></div>
                <div className="space-y-1"><Label>Outdoor Unit Serial</Label><Input name="outdoorSerial" placeholder="e.g. LG-OUT-2024-001" /></div>
              </div>
            </div>

            {/* Installation Date */}
            <div className="space-y-1">
              <Label>Installation Date</Label>
              <Input name="installationDate" type="date" />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setShowRegisterUnit(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#005596] px-8" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Register Unit
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function RepairsView({ repairs, total, page, setPage, clients, clientUnits, repairJobs, onBack, fetchRepairs, onViewDetails, onUpdateProgress }: any) {
  const [showAdd, setShowAdd] = useState(false)
  const [showLogRepair, setShowLogRepair] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [type, setType] = useState('Real-Time')
  const [selectedClientId, setSelectedClientId] = useState('')
  const [parts, setParts] = useState<{ name: string, qty: number, price: number }[]>([])
  const [newPartName, setNewPartName] = useState('')
  const [newPartQty, setNewPartQty] = useState(1)
  const [newPartPrice, setNewPartPrice] = useState(0)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [technicianFilter, setTechnicianFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  
  // Repair jobs filters
  const [jobSearchQuery, setJobSearchQuery] = useState('')
  const [jobStatusFilter, setJobStatusFilter] = useState('all')
  
  const today = new Date().toISOString().split('T')[0]
  const itemsPerPage = 20
  const totalPages = Math.ceil(total / itemsPerPage)

  // Get unique technicians
  const techSet = new Set<string>()
  repairs.forEach((r: any) => { if (r.technician) techSet.add(r.technician as string) })
  const uniqueTechnicians = Array.from(techSet)

  // Filter repairs
  const filteredRepairs = repairs.filter((item: any) => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = !searchQuery || 
      item.title?.toLowerCase().includes(searchLower) ||
      item.client_name?.toLowerCase().includes(searchLower) ||
      item.location?.toLowerCase().includes(searchLower) ||
      item.technician?.toLowerCase().includes(searchLower)
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    const matchesTech = technicianFilter === 'all' || item.technician === technicianFilter
    
    const itemDate = item.date || ''
    const matchesDateFrom = !dateFrom || itemDate >= dateFrom
    const matchesDateTo = !dateTo || itemDate <= dateTo
    
    return matchesSearch && matchesStatus && matchesTech && matchesDateFrom && matchesDateTo
  })

  // Filter repair jobs
  const filteredJobs = repairJobs.filter((job: any) => {
    const searchLower = jobSearchQuery.toLowerCase()
    const matchesSearch = !jobSearchQuery ||
      job.symptom?.toLowerCase().includes(searchLower) ||
      job.error_code?.toLowerCase().includes(searchLower)
    
    const matchesStatus = jobStatusFilter === 'all' || job.status === jobStatusFilter
    
    return matchesSearch && matchesStatus
  })

  // Units for the currently selected client
  const filteredUnits = clientUnits.filter((u: any) => u.client_id === selectedClientId)

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.append('type', type)
    const result = await createRepair(formData)
    if (result.error) toast.error(result.error)
    else { toast.success('Repair added'); fetchRepairs(); setShowAdd(false) }
    setIsLoading(false)
  }

  const handleComplete = async (id: string) => {
    const result = await markRepairComplete(id)
    if (result.error) toast.error(result.error)
    else { toast.success('Repair marked as completed'); fetchRepairs() }
  }

  const addPart = () => {
    if (!newPartName.trim()) return
    setParts(prev => [...prev, { name: newPartName.trim(), qty: newPartQty, price: newPartPrice }])
    setNewPartName(''); setNewPartQty(1); setNewPartPrice(0)
  }

  const removePart = (i: number) => setParts(prev => prev.filter((_, idx) => idx !== i))

  const totalPartsValue = parts.reduce((sum, p) => sum + (p.qty * p.price), 0)

  const handleLogRepair = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.set('clientId', selectedClientId)
    formData.set('partsReplaced', JSON.stringify(parts))
    const result = await logRepairJob(formData)
    if (result.error) toast.error(result.error)
    else {
      toast.success('Repair diagnosis logged!')
      fetchRepairs()
      setShowLogRepair(false)
      setParts([])
      setSelectedClientId('')
    }
    setIsLoading(false)
  }

  const handleUpdateJobStatus = async (jobId: string, status: string) => {
    const result = await updateRepairJobStatus(jobId, status)
    if (result.error) toast.error(result.error)
    else { toast.success(`Job marked as ${status}`); fetchRepairs() }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}><ChevronLeft className="h-4 w-4 mr-2" />Back</Button>
          <div>
            <h1 className="text-xl font-bold text-[#005596]">Repairs & Diagnosis</h1>
            <p className="text-sm text-gray-500">Track service jobs and unit-specific repair logs</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-rose-400 text-rose-600 hover:bg-rose-50" onClick={() => setShowLogRepair(true)}>
            <AlertTriangle className="h-4 w-4 mr-2" />Log Repair Diagnosis
          </Button>
          <Button className="bg-[#005596]" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4 mr-2" />Add Repair Job
          </Button>
        </div>
      </header>

      <main className="container mx-auto py-8 px-6 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-6">
          <MiniStatCard title="Total Jobs" value={filteredRepairs.length.toString()} icon={<PenTool className="text-blue-600" />} />
          <MiniStatCard title="In Progress" value={filteredRepairs.filter((r: any) => r.status === 'In Progress').length.toString()} icon={<Clock className="text-blue-600" />} />
          <MiniStatCard title="Scheduled" value={filteredRepairs.filter((r: any) => r.status === 'Scheduled').length.toString()} icon={<Calendar className="text-yellow-600" />} />
          <MiniStatCard title="Diagnosis Logs" value={filteredJobs.length.toString()} icon={<ClipboardList className="text-rose-600" />} />
        </div>

        {/* Repair Service Jobs Filters */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter Repair Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder="Search repairs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  className="w-[140px]"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="From"
                />
                <span className="text-gray-400">-</span>
                <Input
                  type="date"
                  className="w-[140px]"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="To"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Technicians" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Technicians</SelectItem>
                  {uniqueTechnicians.map((t: string) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500"
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('all')
                  setTechnicianFilter('all')
                  setDateFrom('')
                  setDateTo('')
                }}
              >
                Clear
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Showing <span className="font-bold text-[#005596]">{filteredRepairs.length}</span> of <span className="font-bold">{repairs.length}</span> jobs
            </p>
          </CardContent>
        </Card>

        {/* Repair Service Jobs */}
        <div className="space-y-4">
          <h2 className="font-bold text-[#005596] text-lg flex items-center gap-2"><PenTool className="h-5 w-5" /> Repair Jobs ({filteredRepairs.length})</h2>
          {filteredRepairs.map((item: any) => (
            <Card key={item.id} className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#005596]">{item.title}</h3>
                      <Badge className={item.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>{item.status}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {item.client_name}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.location}</span>
                      <span className="flex items-center gap-1"><PenTool className="h-3 w-3" /> {item.technician}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {item.date}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {item.status !== 'Completed' && <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleComplete(item.id)}>Mark Complete</Button>}
                    <Button variant="outline" size="sm" onClick={() => onViewDetails(item)}>View Details</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium"><span>{item.status === 'Completed' ? 'Completed' : 'Progress'}</span><span>{Math.round(calculateDynamicProgress(item))}%</span></div>
                  <Progress value={Math.round(calculateDynamicProgress(item))} status={item.status === 'Completed' ? 'completed' : item.status === 'In Progress' ? 'in_progress' : 'pending'} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredRepairs.length === 0 && <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">No repair jobs found</div>}
        </div>

        {/* Repair Diagnosis Logs */}
        <div className="space-y-4">
          <h2 className="font-bold text-[#005596] text-lg flex items-center gap-2"><ClipboardList className="h-5 w-5" /> Repair Diagnosis Logs ({filteredJobs.length})</h2>

          {/* Job Filters */}
          <Card className="border-none shadow-sm">
            <CardContent className="py-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-10"
                    placeholder="Search by error code or symptom..."
                    value={jobSearchQuery}
                    onChange={(e) => setJobSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={jobStatusFilter} onValueChange={setJobStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500"
                  onClick={() => {
                    setJobSearchQuery('')
                    setJobStatusFilter('all')
                  }}
                >
                  Clear
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Showing <span className="font-bold text-[#005596]">{filteredJobs.length}</span> of <span className="font-bold">{repairJobs.length}</span> logs
              </p>
            </CardContent>
          </Card>

          {filteredJobs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-rose-200">
              <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-rose-200" />
              <p className="font-semibold text-gray-500">No diagnosis logs found</p>
              <p className="text-sm text-gray-400 mb-4">Log unit-specific fault information with error codes and parts replaced</p>
              <Button variant="outline" className="border-rose-400 text-rose-600" onClick={() => setShowLogRepair(true)}><Plus className="h-4 w-4 mr-2" />Log First Diagnosis</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job: any) => {
                const totalCost = (job.parts_replaced || []).reduce((sum: number, p: any) => sum + ((p.qty || 1) * (p.price || 0)), 0)
                return (
                  <Card key={job.id} className="border border-rose-100 shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-rose-50 rounded-xl"><AlertTriangle className="h-5 w-5 text-rose-500" /></div>
                          <div>
                            <h3 className="font-bold text-[#1E293B] text-sm">{job.profiles?.full_name || 'Unknown Client'}</h3>
                            {job.client_units && <p className="text-xs text-[#005596] font-semibold">{job.client_units.brand} {job.client_units.unit_name} ({job.client_units.unit_type})</p>}
                            {!job.client_units && <p className="text-xs text-gray-400 italic">No specific unit linked</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={job.status === 'Resolved' ? 'bg-green-100 text-green-700' : job.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}>{job.status}</Badge>
                          {job.status === 'Open' && <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 text-xs h-7" onClick={() => handleUpdateJobStatus(job.id, 'In Progress')}>Start</Button>}
                          {job.status === 'In Progress' && <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs h-7" onClick={() => handleUpdateJobStatus(job.id, 'Resolved')}>Resolve</Button>}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-3">
                        {job.error_code && (
                          <div className="bg-red-50 border border-red-100 rounded-lg p-2.5">
                            <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest mb-0.5">Error Code</p>
                            <p className="font-bold text-red-700 text-sm font-mono">{job.error_code}</p>
                          </div>
                        )}
                        {job.symptom && (
                          <div className="bg-slate-50 rounded-lg p-2.5 col-span-1">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Symptom</p>
                            <p className="text-sm text-gray-700">{job.symptom}</p>
                          </div>
                        )}
                      </div>

                      {(job.parts_replaced || []).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Parts Replaced ({job.parts_replaced.length})</p>
                          <div className="space-y-1">
                            {job.parts_replaced.map((p: any, i: number) => (
                              <div key={i} className="flex justify-between text-xs text-gray-700 bg-slate-50 px-3 py-1.5 rounded">
                                <span className="font-medium">{p.name}</span>
                                <span className="text-gray-500">x{p.qty || 1} — <span className="font-bold text-[#005596]">₱{((p.qty || 1) * (p.price || 0)).toLocaleString()}</span></span>
                              </div>
                            ))}
                            <div className="flex justify-between text-xs font-bold px-3 py-1 border-t border-slate-200 mt-1">
                              <span>Total Parts Cost</span><span className="text-[#005596]">₱{totalCost.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {(job.before_photo_url || job.after_photo_url) && (
                        <div className="mt-3 pt-3 border-t border-slate-100 flex gap-3">
                          {job.before_photo_url && <a href={job.before_photo_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline"><Camera className="h-3 w-3" /> Before Photo</a>}
                          {job.after_photo_url && <a href={job.after_photo_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-green-600 hover:underline"><Camera className="h-3 w-3" /> After Photo</a>}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Add Repair Job Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Repair Job</DialogTitle></DialogHeader>
          <div className="py-4 space-y-6">
            <div className="space-y-2">
              <Label>Repair Type *</Label>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setType('Real-Time')} className={`p-6 border rounded-xl text-center space-y-2 transition-all ${type === 'Real-Time' ? 'border-[#005596] bg-blue-50 ring-2 ring-[#005596]/10' : 'border-gray-200 hover:border-gray-300'}`}>
                  <Clock className="mx-auto h-8 w-8 text-[#005596]" />
                  <div className="font-bold">Real-Time</div>
                  <div className="text-xs text-gray-500">Start immediately</div>
                </button>
                <button onClick={() => setType('Schedule')} className={`p-6 border rounded-xl text-center space-y-2 transition-all ${type === 'Schedule' ? 'border-[#005596] bg-blue-50 ring-2 ring-[#005596]/10' : 'border-gray-200 hover:border-gray-300'}`}>
                  <Calendar className="mx-auto h-8 w-8 text-[#005596]" />
                  <div className="font-bold">Schedule</div>
                  <div className="text-xs text-gray-500">Pick date & time</div>
                </button>
              </div>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Client *</Label>
                  <Select name="clientName" required><SelectTrigger><SelectValue placeholder="Select client..." /></SelectTrigger>
                    <SelectContent>{clients.map((c: any) => <SelectItem key={c.id} value={c.full_name}>{c.full_name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Service Type *</Label>
                  <Select name="serviceType" required><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Air Conditioning Repair">AC Repair</SelectItem>
                      <SelectItem value="Compressor Repair">Compressor Repair</SelectItem>
                      <SelectItem value="Refrigerant Leak Repair">Refrigerant Leak</SelectItem>
                      <SelectItem value="Electrical Issue Repair">Electrical Issue</SelectItem>
                      <SelectItem value="Thermostat Repair">Thermostat Repair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1"><Label>Technician *</Label>
                <Select name="technician" required><SelectTrigger><SelectValue placeholder="Select technician" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chris">Chris</SelectItem><SelectItem value="Emman">Emman</SelectItem>
                    <SelectItem value="Carlos">Carlos</SelectItem><SelectItem value="Arnold">Arnold</SelectItem>
                    <SelectItem value="Bobby">Bobby</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1"><Label>Cost *</Label>
                  <Select name="cost" required><SelectTrigger><SelectValue placeholder="Cost" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="₱500">₱500</SelectItem><SelectItem value="₱1,000">₱1,000</SelectItem>
                      <SelectItem value="₱1,500">₱1,500</SelectItem><SelectItem value="₱2,500">₱2,500</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Date *</Label><Input name="date" type="date" min={today} required /></div>
                <div className="space-y-1"><Label>Time *</Label><Input name="time" type="time" required /></div>
              </div>
              <div className="space-y-1"><Label>Address *</Label><Input name="address" placeholder="Repair address" required /></div>
              <div className="space-y-1"><Label>Notes</Label><Textarea name="notes" placeholder="Additional notes" /></div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#005596]" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add Job</Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Log Repair Diagnosis Dialog */}
      <Dialog open={showLogRepair} onOpenChange={setShowLogRepair}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600"><AlertTriangle className="h-5 w-5" /> Log Repair Diagnosis</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLogRepair} className="space-y-5 py-2">

            {/* Client + Unit Picker */}
            <div className="border rounded-xl p-4 space-y-4 bg-slate-50/50">
              <p className="text-xs font-bold text-[#005596] uppercase tracking-widest">Unit Affected</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Client *</Label>
                  <Select value={selectedClientId} onValueChange={setSelectedClientId} required>
                    <SelectTrigger><SelectValue placeholder="Select client..." /></SelectTrigger>
                    <SelectContent>{clients.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Unit (from Asset Registry)</Label>
                  <Select name="unitId" disabled={!selectedClientId || filteredUnits.length === 0}>
                    <SelectTrigger><SelectValue placeholder={!selectedClientId ? 'Select client first' : filteredUnits.length === 0 ? 'No units registered' : 'Select unit...'} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No specific unit</SelectItem>
                      {filteredUnits.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.unit_name} — {u.brand} {u.unit_type}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Error & Symptom */}
            <div className="border rounded-xl p-4 space-y-4 bg-slate-50/50">
              <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">Diagnostics</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Error Code</Label>
                  <Input name="errorCode" placeholder="e.g. E1, F3, P4" className="font-mono" />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Symptom / Issue Description</Label>
                <Textarea name="symptom" placeholder="Describe what the client reported and what you observed..." className="min-h-[80px]" />
              </div>
            </div>

            {/* Parts & Inventory */}
            <div className="border rounded-xl p-4 space-y-4 bg-slate-50/50">
              <p className="text-xs font-bold text-[#005596] uppercase tracking-widest flex items-center gap-2"><Package className="h-4 w-4" /> Parts Replaced</p>
              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1"><Label className="text-xs">Part Name</Label><Input value={newPartName} onChange={e => setNewPartName(e.target.value)} placeholder="e.g. Capacitor, Fan Motor" /></div>
                <div className="w-20 space-y-1"><Label className="text-xs">Qty</Label><Input type="number" min={1} value={newPartQty} onChange={e => setNewPartQty(parseInt(e.target.value) || 1)} /></div>
                <div className="w-28 space-y-1"><Label className="text-xs">Unit Price (₱)</Label><Input type="number" min={0} value={newPartPrice} onChange={e => setNewPartPrice(parseFloat(e.target.value) || 0)} /></div>
                <Button type="button" onClick={addPart} size="sm" className="bg-[#005596] h-10 px-3"><Plus className="h-4 w-4" /></Button>
              </div>
              {parts.length > 0 && (
                <div className="space-y-1 mt-2">
                  {parts.map((p, i) => (
                    <div key={i} className="flex items-center justify-between bg-white border border-slate-100 rounded-lg px-3 py-2 text-sm">
                      <span className="font-medium">{p.name}</span>
                      <div className="flex items-center gap-3 text-gray-500">
                        <span>x{p.qty}</span>
                        <span className="font-bold text-[#005596]">₱{(p.qty * p.price).toLocaleString()}</span>
                        <button type="button" onClick={() => removePart(i)} className="text-red-400 hover:text-red-600"><X className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-sm px-3 py-2 bg-[#005596]/5 rounded-lg border border-[#005596]/10">
                    <span>Total Parts Cost</span><span className="text-[#005596]">₱{totalPartsValue.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Photo Evidence */}
            <div className="border rounded-xl p-4 space-y-4 bg-slate-50/50">
              <p className="text-xs font-bold text-[#005596] uppercase tracking-widest flex items-center gap-2"><Camera className="h-4 w-4" /> Photo Evidence</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Before Photo URL</Label><Input name="beforePhotoUrl" type="url" placeholder="https://..." /></div>
                <div className="space-y-1"><Label>After Photo URL</Label><Input name="afterPhotoUrl" type="url" placeholder="https://..." /></div>
              </div>
              <p className="text-[10px] text-gray-400">Upload your photos to any hosting service (e.g. Imgur, Google Drive) and paste the link here.</p>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setShowLogRepair(false)}>Cancel</Button>
              <Button type="submit" className="bg-rose-600 hover:bg-rose-700 px-8" disabled={isLoading || !selectedClientId}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Diagnosis
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ScheduleView({ appointments, onBack, fetchAppointments }: any) {

  const [showAdd, setShowAdd] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [showDayDetails, setShowDayDetails] = useState(false)

  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false)
  const [workOrderModalOpen, setWorkOrderModalOpen] = useState(false)
  const [selectedApt, setSelectedApt] = useState<any>(null)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [serviceFilter, setServiceFilter] = useState('all')

  const today = new Date().toISOString().split('T')[0]

  // Filter appointments
  const filteredAppointments = appointments.filter((apt: any) => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = !searchQuery ||
      apt.client_name?.toLowerCase().includes(searchLower) ||
      apt.service_type?.toLowerCase().includes(searchLower) ||
      apt.phone?.toLowerCase().includes(searchLower) ||
      apt.address?.toLowerCase().includes(searchLower)
    
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter
    const matchesService = serviceFilter === 'all' || apt.service_type === serviceFilter
    
    return matchesSearch && matchesStatus && matchesService
  })

  // Get unique service types
  const serviceTypesSet = new Set<string>()
  appointments.forEach((a: any) => { if (a.service_type) serviceTypesSet.add(a.service_type as string) })
  const serviceTypes = Array.from(serviceTypesSet)

  const handleUpdateStatus = async () => {
    if (!selectedApt) return
    setIsLoading(true)
    const res = await updateAppointmentStatus(selectedApt.id, selectedStatus)
    if (res.error) toast.error(res.error)
    else {
      toast.success('Status updated')
      setStatusModalOpen(false)
      fetchAppointments()
    }
    setIsLoading(false)
  }

  const handleReschedule = async () => {
    if (!selectedApt || !rescheduleDate || !rescheduleTime) return
    setIsLoading(true)
    const res = await rescheduleAppointment(selectedApt.id, rescheduleDate, rescheduleTime)
    if (res.error) toast.error(res.error)
    else {
      toast.success('Appointment rescheduled')
      setRescheduleModalOpen(false)
      fetchAppointments()
    }
    setIsLoading(false)
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  })

  const getDayAppointments = (day: Date) => {
    return filteredAppointments.filter((apt: any) => isSameDay(parseISO(apt.date), day))
  }

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const phone = formData.get('phone') as string

    if (!validatePHPhone(phone)) {
      toast.error(PHONE_VALIDATION_ERROR)
      return
    }

    setIsLoading(true)
    const result = await createAppointment(formData)
    if (result.error) toast.error(result.error)
    else {
      toast.success('Appointment created')
      fetchAppointments()
      setShowAdd(false)
    }
    setIsLoading(false)
  }

  const todayAppointments = filteredAppointments.filter((apt: any) =>
    isSameDay(parseISO(apt.date), new Date())
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}><ChevronLeft className="h-4 w-4 mr-2" />Back to Dashboard</Button>
          <div>
            <h1 className="text-xl font-bold text-[#005596]">Calendar & Schedule</h1>
            <p className="text-sm text-gray-500">Manage appointments and bookings</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-[#005596] h-9" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-2" />Add Appointment</Button>
        </div>
      </header>
      <main className="container mx-auto py-8 px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <Card className="border-none shadow-sm">
            <CardContent className="py-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-10"
                    placeholder="Search appointments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={serviceFilter} onValueChange={setServiceFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Services" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {serviceTypes.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500"
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                    setServiceFilter('all')
                  }}
                >
                  Clear
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Showing <span className="font-bold text-[#005596]">{filteredAppointments.length}</span> of <span className="font-bold">{appointments.length}</span> appointments
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-8" onClick={() => setCurrentMonth(new Date())}>Today</Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronLeft className="h-4 w-4 rotate-180" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="bg-gray-50 p-2 text-center text-xs font-bold text-gray-500">{day}</div>
              ))}
              {calendarDays.map((day, i) => {
                const dayAppointments = getDayAppointments(day)
                const isToday = isSameDay(day, new Date())
                const isCurrentMonth = isSameMonth(day, monthStart)

                return (
                  <div
                    key={i}
                    className={`bg-white min-h-[100px] p-2 text-xs font-medium transition-colors hover:bg-gray-50 cursor-pointer ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-900'} ${isToday ? 'bg-blue-50/50' : ''}`}
                    onClick={() => {
                      setSelectedDay(day)
                      setShowDayDetails(true)
                    }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={isToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}>
                        {format(day, 'd')}
                      </span>
                      {dayAppointments.length > 0 && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full" />
                      )}
                    </div>
                    <div className="space-y-1 overflow-y-auto max-h-[70px]">
                      {dayAppointments.slice(0, 2).map((apt: any) => (
                        <div key={apt.id} className="p-1 bg-blue-100 text-blue-700 rounded text-[10px] truncate" title={apt.client_name}>
                          {apt.time} {apt.client_name}
                        </div>
                      ))}
                      {dayAppointments.length > 2 && (
                        <div className="text-[10px] text-gray-400 pl-1">+{dayAppointments.length - 2} more</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle className="text-base">Today's Appointments</CardTitle></CardHeader>
            <CardContent>
              {todayAppointments.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No appointments today</p>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.map((apt: any) => (
                    <div key={apt.id} className="p-3 border rounded-lg bg-gray-50 space-y-1">
                      <div className="flex justify-between">
                        <span className="font-bold text-[#005596]">{apt.time}</span>
                        <Badge variant="outline" className="text-[10px]">{apt.service_type}</Badge>
                      </div>
                      <p className="text-sm font-medium">{apt.client_name}</p>
                      <p className="text-xs text-gray-500 truncate">{apt.address}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle className="text-base">This Month ({format(currentMonth, 'MMMM')})</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Total Bookings</span>
                <span className="font-bold">{appointments.filter((apt: any) => isSameMonth(parseISO(apt.date), currentMonth)).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Completed</span>
                <span className="font-bold">0</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Appointment</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 py-4">
            <div className="space-y-1"><Label>Client Name</Label><Input name="clientName" placeholder="Client Name" required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Email</Label><Input name="email" type="email" placeholder="client@example.com" /></div>
              <div className="space-y-1"><Label>Phone Number</Label><Input name="phone" placeholder="09XXXXXXXXX" maxLength={11} required /></div>

            </div>
            <div className="space-y-1"><Label>Address</Label><Textarea name="address" placeholder="Full address" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Date</Label><Input name="date" type="date" min={today} required /></div>
              <div className="space-y-1"><Label>Time</Label><Input name="time" type="time" required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Service Type</Label>
                <Select name="serviceType" defaultValue="Installation">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Installation">Installation</SelectItem>
                    <SelectItem value="Repair">Repair</SelectItem>
                    <SelectItem value="Cleaning">Cleaning</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Cost</Label>
                <Input name="cost" placeholder="₱1,500" />
              </div>
            </div>
            <div className="space-y-1"><Label>Notes</Label><Textarea name="notes" placeholder="Any special instructions..." /></div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#005596]" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showDayDetails} onOpenChange={setShowDayDetails}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDay && format(selectedDay, 'MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {selectedDay && getDayAppointments(selectedDay).length === 0 ? (
              <p className="text-center text-gray-500 py-8">No appointments for this day</p>
            ) : (
              selectedDay && getDayAppointments(selectedDay).map((apt: any) => (
                <div key={apt.id} className="border rounded-xl overflow-hidden">
                  {/* Job Header */}
                  <div className={`px-4 py-2 flex items-center justify-between ${apt.status === 'Completed' ? 'bg-green-600' : 'bg-blue-600'} text-white`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wide">
                        {apt.status === 'Completed' ? 'Completed' : 'Scheduled'}
                      </span>
                      {apt.id && (
                        <span className="text-xs opacity-75">
                          #{apt.id.toString().slice(-6).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-sm">{apt.time}</span>
                  </div>

                  <div className="p-4 bg-gray-50/50 space-y-4">
                    {/* Service Type */}
                    <div className="flex items-center gap-2">
                      <Badge className="bg-white text-gray-700 border border-gray-200">
                        {apt.service_type}
                      </Badge>
                    </div>

                    {/* Who & Where */}
                    <div className="space-y-2 text-sm">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Who & Where</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-gray-700">
                          <UserCheck className="h-4 w-4 text-gray-400 shrink-0" />
                          <span className="font-medium">{apt.client_name}</span>
                        </div>
                        {apt.technician && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <HardHat className="h-4 w-4 text-gray-400 shrink-0" />
                            <span>{apt.technician}</span>
                          </div>
                        )}
                        <div className="flex items-start gap-2 text-gray-600">
                          <MapPin className="h-4 w-4 mt-0.5 text-gray-400 shrink-0" />
                          <span>{apt.address}</span>
                        </div>
                        {apt.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                            <span>{apt.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* What & When */}
                    <div className="space-y-2 text-sm">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">What & When</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white rounded-lg border border-gray-100 p-2">
                          <p className="text-[10px] text-gray-400 font-medium">Date & Time</p>
                          <p className="font-semibold text-[#005596]">{format(parseISO(apt.date), 'MMM d')} at {apt.time}</p>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-100 p-2">
                          <p className="text-[10px] text-gray-400 font-medium">Est. Completion</p>
                          <p className="font-semibold text-gray-700">{apt.estimated_completion || '2 Hours'}</p>
                        </div>
                        {apt.cost && (
                          <div className="bg-white rounded-lg border border-gray-100 p-2">
                            <p className="text-[10px] text-gray-400 font-medium">Service Fee</p>
                            <p className="font-semibold text-green-700">{apt.cost}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {apt.notes && (
                      <div className="p-3 bg-white rounded-lg border border-gray-100 text-sm italic text-gray-500">
                        "{apt.notes}"
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="pt-2 border-t flex gap-2 flex-wrap">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest w-full">Quick Actions</p>
                      <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 h-8 text-xs" onClick={() => { setSelectedApt(apt); setSelectedStatus(apt.status || 'Scheduled'); setStatusModalOpen(true) }}>
                        Update Status
                      </Button>
                      <Button size="sm" variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50 h-8 text-xs" onClick={() => { setSelectedApt(apt); setRescheduleDate(apt.date || ''); setRescheduleTime(apt.time || ''); setRescheduleModalOpen(true) }}>
                        Reschedule
                      </Button>
                      <Button size="sm" className="bg-[#005596] hover:bg-[#00447a] text-white h-8 text-xs" onClick={() => { setSelectedApt(apt); setWorkOrderModalOpen(true) }}>
                        View Full Work Order
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setShowDayDetails(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
        <DialogContent className="sm:max-w-xs z-[100]">
          <DialogHeader><DialogTitle>Update Status</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent className="z-[105]">
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full bg-[#005596] text-white" onClick={handleUpdateStatus} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Status
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={rescheduleModalOpen} onOpenChange={setRescheduleModalOpen}>
        <DialogContent className="sm:max-w-xs z-[100]">
          <DialogHeader><DialogTitle>Reschedule Appointment</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Date</Label>
              <Input type="date" min={today} value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>New Time</Label>
              <Input type="time" value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} />
            </div>
            <Button className="w-full bg-[#005596] text-white" onClick={handleReschedule} disabled={isLoading || !rescheduleDate || !rescheduleTime}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={workOrderModalOpen} onOpenChange={setWorkOrderModalOpen}>
        <DialogContent className="sm:max-w-lg z-[100]">
          <DialogHeader><DialogTitle>Full Work Order</DialogTitle></DialogHeader>
          {selectedApt && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500 block">Client</span><span className="font-bold">{selectedApt.client_name}</span></div>
                <div><span className="text-gray-500 block">Phone</span><span className="font-bold">{selectedApt.phone || 'N/A'}</span></div>
                <div className="col-span-2"><span className="text-gray-500 block">Address</span><span className="font-bold">{selectedApt.address}</span></div>
                <div><span className="text-gray-500 block">Date</span><span className="font-bold">{selectedApt.date}</span></div>
                <div><span className="text-gray-500 block">Time</span><span className="font-bold">{selectedApt.time}</span></div>
                <div><span className="text-gray-500 block">Service</span><span className="font-bold">{selectedApt.service_type}</span></div>
                <div><span className="text-gray-500 block">Cost</span><span className="font-bold">{selectedApt.cost || 'TBD'}</span></div>
                <div><span className="text-gray-500 block">Status</span><Badge>{selectedApt.status}</Badge></div>
                <div><span className="text-gray-500 block">Technician</span><span className="font-bold">{selectedApt.technician || 'Unassigned'}</span></div>
                <div className="col-span-2"><span className="text-gray-500 block">Notes</span><div className="bg-gray-50 p-2 rounded border italic mt-1">{selectedApt.notes || 'None'}</div></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ReportsView({ installations, repairs, maintenance, clients, onBack }: any) {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [datePreset, setDatePreset] = useState('all')
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all')
  const [technicianFilter, setTechnicianFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('')
  const [showReceiptDialog, setShowReceiptDialog] = useState(false)
  const [selectedReceiptItem, setSelectedReceiptItem] = useState<any>(null)
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false)

  // Additional filters
  const [showInstallation, setShowInstallation] = useState(true)
  const [showRepair, setShowRepair] = useState(true)
  const [showMaintenance, setShowMaintenance] = useState(true)

  useEffect(() => {
    const today = new Date()
    switch (datePreset) {
      case 'today':
        setDateFrom(today.toISOString().split('T')[0])
        setDateTo(today.toISOString().split('T')[0])
        break
      case 'yesterday': {
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        setDateFrom(yesterday.toISOString().split('T')[0])
        setDateTo(yesterday.toISOString().split('T')[0])
        break
      }
      case 'last7':
        const last7 = new Date(today)
        last7.setDate(last7.getDate() - 7)
        setDateFrom(last7.toISOString().split('T')[0])
        setDateTo(today.toISOString().split('T')[0])
        break
      case 'last30':
        const last30 = new Date(today)
        last30.setDate(last30.getDate() - 30)
        setDateFrom(last30.toISOString().split('T')[0])
        setDateTo(today.toISOString().split('T')[0])
        break
      case 'thisMonth': {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
        setDateFrom(firstDay.toISOString().split('T')[0])
        setDateTo(today.toISOString().split('T')[0])
        break
      }
      case 'lastMonth': {
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
        setDateFrom(firstDayLastMonth.toISOString().split('T')[0])
        setDateTo(lastDayLastMonth.toISOString().split('T')[0])
        break
      }
      case 'all':
        setDateFrom('')
        setDateTo('')
        break
    }
  }, [datePreset])

  const allItems = [
    ...installations.map((i: any) => ({ ...i, serviceType: 'Installation' })),
    ...repairs.map((r: any) => ({ ...r, serviceType: 'Repair' })),
    ...maintenance.map((m: any) => ({ ...m, serviceType: m.title || 'Maintenance' }))
  ]

  const filteredItems = allItems.filter((item: any) => {
    // Filter by service category toggle
    if (item.serviceType === 'Installation' && !showInstallation) return false
    if (item.serviceType === 'Repair' && !showRepair) return false
    if ((item.serviceType === 'Maintenance' || item.serviceType === 'Cleaning') && !showMaintenance) return false
    
    const matchesDateFrom = !dateFrom || item.date >= dateFrom
    const matchesDateTo = !dateTo || item.date <= dateTo
    const matchesService = serviceTypeFilter === 'all' ||
      item.title?.toLowerCase().includes(serviceTypeFilter.toLowerCase())
    const matchesTech = technicianFilter === 'all' || item.technician === technicianFilter
    const matchesLocation = !locationFilter ||
      item.location?.toLowerCase().includes(locationFilter.toLowerCase()) ||
      item.address?.toLowerCase().includes(locationFilter.toLowerCase())
    return matchesDateFrom && matchesDateTo && matchesService && matchesTech && matchesLocation
  })

  const completedItems = filteredItems.filter((i: any) => i.status === 'Completed')
  const calculateTotal = (items: any[]) =>
    items.reduce((acc, item) => acc + parseInt(item.cost?.replace(/[^0-9]/g, '') || '0'), 0)
  const totalRevenue = calculateTotal(completedItems)
  const completionRate = filteredItems.length > 0
    ? Math.round((completedItems.length / filteredItems.length) * 100)
    : 0

  const issueCounts: Record<string, number> = {}
  filteredItems.forEach((item: any) => {
    const key = item.service_type || (item.title?.includes('Repair') ? 'Repair' : 'Installation')
    issueCounts[key] = (issueCounts[key] || 0) + 1
  })
  const sortedIssues = Object.entries(issueCounts).sort((a, b) => b[1] - a[1])

  // Get unique technicians
  const techSet = new Set<string>()
  allItems.forEach((i: any) => { if (i.technician) techSet.add(i.technician as string) })
  const uniqueTechnicians = Array.from(techSet)

  const technicianStats = uniqueTechnicians.map((tech: string) => {
    const techItems = filteredItems.filter((i: any) => i.technician === tech)
    const completed = techItems.filter((i: any) => i.status === 'Completed')
    const totalRevenue = completed.reduce((acc: number, item: any) => 
      acc + parseInt(item.cost?.replace(/[^0-9]/g, '') || '0'), 0)
    return {
      name: tech,
      total: techItems.length,
      completed: completed.length,
      revenue: totalRevenue,
      rate: techItems.length > 0 ? Math.round((completed.length / techItems.length) * 100) : 0
    }
  }).sort((a, b) => b.revenue - a.revenue)

  const monthlyData: Record<string, { count: number; revenue: number }> = {}
  filteredItems.forEach((item: any) => {
    if (item.date) {
      const monthKey = item.date.substring(0, 7)
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { count: 0, revenue: 0 }
      }
      monthlyData[monthKey].count++
      if (item.status === 'Completed') {
        monthlyData[monthKey].revenue += parseInt(item.cost?.replace(/[^0-9]/g, '') || '0')
      }
    }
  })
  const sortedMonths = Object.entries(monthlyData).sort((a, b) => a[0].localeCompare(b[0]))

  const serviceTypeCounts = {
    Installation: filteredItems.filter((i: any) => i.serviceType === 'Installation').length,
    Repair: filteredItems.filter((i: any) => i.serviceType === 'Repair').length,
    Maintenance: filteredItems.filter((i: any) => 
      i.serviceType === 'Maintenance' || i.serviceType === 'Cleaning'
    ).length,
  }

  const handleExportCSV = () => {
    const dateRange = dateFrom && dateTo ? `${dateFrom}_to_${dateTo}` : new Date().toISOString().split('T')[0]
    const headers = ['Service Type', 'Title', 'Client', 'Date', 'Time', 'Technician', 'Cost', 'Status', 'Location']
    const csvContent = [
      headers.join(','),
      ...filteredItems.map((item: any) => [
        `"${item.serviceType || ''}"`,
        `"${item.title || ''}"`,
        `"${item.client_name || ''}"`,
        `"${item.date || ''}"`,
        `"${item.time || ''}"`,
        `"${item.technician || ''}"`,
        `"${item.cost || ''}"`,
        `"${item.status || ''}"`,
        `"${item.location || item.address || ''}"`,
      ].join(','))
    ].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `report_${dateRange}.csv`
    link.click()
    toast.success(`CSV exported successfully (${filteredItems.length} records)`)
  }

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    
    const doc = new jsPDF()
    const dateRange = dateFrom && dateTo ? `${dateFrom} to ${dateTo}` : 'All Dates'
    
    doc.setFontSize(18)
    doc.text('Service Report', 14, 22)
    doc.setFontSize(10)
    doc.text(`Date Range: ${dateRange}`, 14, 30)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 36)
    doc.text(`Total Records: ${filteredItems.length}`, 14, 42)
    doc.text(`Total Revenue: ₱${totalRevenue.toLocaleString()}`, 14, 48)
    
    const tableData = filteredItems.map((item: any) => [
      item.title || '',
      item.client_name || '',
      item.date || '',
      item.technician || 'N/A',
      item.cost || '₱0',
      item.status || ''
    ])
    
    autoTable(doc, {
      head: [['Service', 'Client', 'Date', 'Technician', 'Cost', 'Status']],
      body: tableData,
      startY: 55,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 85, 150] }
    })
    
    const pdfBlob = doc.output('blob')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(pdfBlob)
    link.download = `report_${dateFrom || dateTo || new Date().toISOString().split('T')[0]}.pdf`
    link.click()
    toast.success(`PDF exported successfully (${filteredItems.length} records)`)
  }

  const generateOfficialReceipt = (item: any) => {
    const receiptWindow = window.open('', '_blank', 'width=600,height=800')
    if (!receiptWindow) return
    
    const receiptNumber = `OR-${Date.now().toString().slice(-8)}`
    const cost = item.cost ? parseFloat(item.cost.replace(/[^0-9.]/g, '')) : 0
    const vat = cost * 0.12
    const total = cost
    
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Official Receipt - ${receiptNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; padding: 40px; max-width: 600px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
          .company-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .company-details { font-size: 12px; color: #666; }
          .receipt-title { font-size: 18px; font-weight: bold; margin: 20px 0 10px; text-align: center; }
          .receipt-number { text-align: center; font-size: 14px; margin-bottom: 20px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
          .info-label { font-weight: bold; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          .items-table th { background: #f5f5f5; }
          .totals { margin-top: 20px; text-align: right; }
          .total-row { font-size: 16px; margin: 5px 0; }
          .grand-total { font-size: 20px; font-weight: bold; border-top: 2px solid #000; padding-top: 10px; }
          .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666; }
          .signature { margin-top: 40px; display: flex; justify-content: space-between; }
          .sig-line { text-align: center; width: 200px; }
          .sig-line .line { border-top: 1px solid #000; margin-top: 40px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">AIRCON SERVICES</div>
          <div class="company-details">
            123 Service Street, Manila City<br>
            Phone: (02) 1234-5678 | Email: info@airconservices.com
          </div>
        </div>
        
        <div class="receipt-title">OFFICIAL RECEIPT</div>
        <div class="receipt-number">Receipt No: ${receiptNumber}</div>
        
        <div class="info-row">
          <span class="info-label">Date:</span>
          <span>${new Date().toLocaleDateString()}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Client:</span>
          <span>${item.client_name || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Service:</span>
          <span>${item.title || item.service_type || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Address:</span>
          <span>${item.location || item.address || 'N/A'}</span>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${item.title || item.service_type || 'Service'} - ${item.technician || 'Technician'}</td>
              <td>1</td>
              <td>₱${cost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="totals">
          <div class="total-row">Subtotal: ₱${cost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
          <div class="total-row">VAT (12%): ₱${vat.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
          <div class="total-row grand-total">TOTAL: ₱${total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
        </div>
        
        <div class="signature">
          <div class="sig-line">
            <div>Received By</div>
            <div class="line"></div>
          </div>
          <div class="sig-line">
            <div>Authorized Signature</div>
            <div class="line"></div>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>This serve as your official receipt.</p>
          <p>Please keep this for your records.</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; cursor: pointer;">Print Receipt</button>
        </div>
      </body>
      </html>
    `
    
    receiptWindow.document.write(receiptHTML)
    receiptWindow.document.close()
    toast.success('Official receipt generated')
  }

  const handleGenerateReceipt = (item: any) => {
    setSelectedReceiptItem(item)
    setShowReceiptDialog(true)
  }

  const confirmGenerateReceipt = () => {
    if (selectedReceiptItem) {
      generateOfficialReceipt(selectedReceiptItem)
      setShowReceiptDialog(false)
      setSelectedReceiptItem(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}><ChevronLeft className="h-4 w-4 mr-2" />Back to Dashboard</Button>
          <div>
            <h1 className="text-xl font-bold text-[#005596]">Reports</h1>
            <p className="text-sm text-gray-500">Generate and export business reports</p>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-8 px-6 space-y-8">

        {/* Filter Control Panel */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#005596]" />
              Generate Report — Filter Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Date Range</Label>
                <Select value={datePreset} onValueChange={setDatePreset}>
                  <SelectTrigger><SelectValue placeholder="All Time" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="last7">Last 7 Days</SelectItem>
                    <SelectItem value="last30">Last 30 Days</SelectItem>
                    <SelectItem value="thisMonth">This Month</SelectItem>
                    <SelectItem value="lastMonth">Last Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Date From</Label>
                <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setDatePreset('custom') }} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Date To</Label>
                <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setDatePreset('custom') }} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Service Type</Label>
                <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
                  <SelectTrigger><SelectValue placeholder="All Services" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="Installation">Installation</SelectItem>
                    <SelectItem value="Repair">Repair</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Cleaning">Cleaning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
<div className="space-y-1">
              <Label className="text-xs">Technician</Label>
              <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
                <SelectTrigger><SelectValue placeholder="All Technicians" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Technicians</SelectItem>
                  {uniqueTechnicians.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Service Category Toggles */}
          <div className="flex items-center gap-4 pt-2 border-t">
            <span className="text-xs text-gray-500 font-medium">Show:</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showInstallation} 
                onChange={(e) => setShowInstallation(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Installation ({installations.length})</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showRepair} 
                onChange={(e) => setShowRepair(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Repair ({repairs.length})</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showMaintenance} 
                onChange={(e) => setShowMaintenance(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Maintenance ({maintenance.length})</span>
            </label>
          </div>

          <div className="space-y-1">
              <Label className="text-xs">Location / Area Filter</Label>
              <Input
                placeholder="Filter by location or area..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <p className="text-sm text-gray-500">
                Showing <span className="font-bold text-[#005596]">{filteredItems.length}</span> records
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500"
                onClick={() => {
                  setDateFrom(''); setDateTo(''); setServiceTypeFilter('all')
                  setTechnicianFilter('all'); setLocationFilter('')
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Visual Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-none shadow-sm border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-700 mt-1">₱{totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-1">From {completedItems.length} completed jobs</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Completion Rate</p>
                  <p className="text-3xl font-bold text-blue-700 mt-1">{completionRate}%</p>
                  <div className="mt-2">
                    <Progress value={completionRate} className="h-1.5" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{completedItems.length} of {filteredItems.length} jobs</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">Services Breakdown</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Installation</span>
                    <span className="font-bold text-orange-700">{serviceTypeCounts.Installation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Repair</span>
                    <span className="font-bold text-orange-700">{serviceTypeCounts.Repair}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Maintenance</span>
                    <span className="font-bold text-orange-700">{serviceTypeCounts.Maintenance}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">Most Frequent Issues</p>
                {sortedIssues.length === 0 ? (
                  <p className="text-sm text-gray-400">No data</p>
                ) : (
                  <div className="space-y-2">
                    {sortedIssues.slice(0, 3).map(([issue, count]) => (
                      <div key={issue} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600 truncate">{issue}</span>
                          <span className="font-bold text-purple-700 ml-2">
                            {filteredItems.length > 0 ? Math.round((count / filteredItems.length) * 100) : 0}%
                          </span>
                        </div>
                        <Progress
                          value={filteredItems.length > 0 ? (count / filteredItems.length) * 100 : 0}
                          className="h-1.5"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends */}
        {sortedMonths.length > 0 && (
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {sortedMonths.slice(-6).map(([month, data]) => (
                  <div key={month} className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 font-medium">{month}</p>
                    <p className="text-lg font-bold text-[#005596]">{data.count}</p>
                    <p className="text-xs text-green-600">₱{data.revenue.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Technician Performance */}
        {technicianStats.length > 0 && (
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Technician Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-gray-500">Technician</th>
                      <th className="text-right py-2 font-medium text-gray-500">Total Jobs</th>
                      <th className="text-right py-2 font-medium text-gray-500">Completed</th>
                      <th className="text-right py-2 font-medium text-gray-500">Rate</th>
                      <th className="text-right py-2 font-medium text-gray-500">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {technicianStats.slice(0, 5).map((tech: any) => (
                      <tr key={tech.name} className="border-b">
                        <td className="py-2 font-medium">{tech.name}</td>
                        <td className="text-right">{tech.total}</td>
                        <td className="text-right">{tech.completed}</td>
                        <td className="text-right">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${tech.rate >= 80 ? 'bg-green-100 text-green-700' : tech.rate >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {tech.rate}%
                          </span>
                        </td>
                        <td className="text-right font-medium text-green-600">₱{tech.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Export */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Data Export</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              <Button variant="outline" onClick={handleExportCSV} className="gap-2">
                <Download className="h-4 w-4" />Export as Excel/CSV ({filteredItems.length} records)
              </Button>
              <Button variant="outline" onClick={handleExportPDF} className="gap-2">
                <FileText className="h-4 w-4" />Export as PDF ({filteredItems.length} records)
              </Button>
              {filteredItems.length === 1 && (
                <Button variant="outline" onClick={() => generateOfficialReceipt(filteredItems[0])} className="gap-2 border-green-200 text-green-700 hover:bg-green-50">
                  <FileText className="h-4 w-4" />Generate Official Receipt
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card className="border-none shadow-sm">
          <CardHeader><CardTitle className="text-lg">Bookings ({filteredItems.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {filteredItems.length === 0 ? <p className="text-center py-12 text-gray-400">No bookings found</p> : (
              filteredItems
                .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg">
                    <div className="space-y-1">
                      <p className="font-bold text-[#005596] capitalize">{item.title}</p>
                      <p className="text-xs text-gray-400">{item.date} - {item.time || '09:00'} • {item.technician || 'Unassigned'}</p>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="font-bold">{item.cost || '₱0'}</p>
                        <p className={`text-[10px] font-bold uppercase ${item.status === 'Completed' ? 'text-green-500' : 'text-blue-500'}`}>{item.status}</p>
                      </div>
                      <Button variant="outline" size="sm" className="h-8" onClick={() => handleGenerateReceipt(item)}><FileText className="h-3 w-3 mr-2" />Receipt</Button>
                    </div>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </main>

      {/* Receipt Generation Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Official Receipt</DialogTitle>
          </DialogHeader>
          {selectedReceiptItem && (
            <div className="py-4 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="text-sm"><span className="font-medium">Client:</span> {selectedReceiptItem.client_name}</p>
                <p className="text-sm"><span className="font-medium">Service:</span> {selectedReceiptItem.title}</p>
                <p className="text-sm"><span className="font-medium">Date:</span> {selectedReceiptItem.date}</p>
                <p className="text-sm"><span className="font-medium">Cost:</span> {selectedReceiptItem.cost || '₱0'}</p>
              </div>
              <p className="text-sm text-gray-600">This will generate an official receipt that can be printed.</p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowReceiptDialog(false)}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={confirmGenerateReceipt}>
              Generate Receipt
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SettingsView({ settings, onBack, fetchSettings }: any) {
  const [isLoading, setIsLoading] = useState(false)
  const [notifSettings, setNotifSettings] = useState({
    email_notifications: settings?.email_notifications ?? true,
    sms_notifications: settings?.sms_notifications ?? false,
    push_notifications: settings?.push_notifications ?? true,
    new_booking_alert: settings?.new_booking_alert ?? true,
    booking_update_alert: settings?.booking_update_alert ?? true,
    payment_alert: settings?.payment_alert ?? true,
  })
  const [reminderSettings, setReminderSettings] = useState({
    reminder_enabled: settings?.reminder_enabled ?? true,
    reminder_hours_before: settings?.reminder_hours_before ?? 24,
    follow_up_enabled: settings?.follow_up_enabled ?? true,
    follow_up_days_after: settings?.follow_up_days_after ?? 7,
    maintenance_reminder_enabled: settings?.maintenance_reminder_enabled ?? true,
    maintenance_reminder_months: settings?.maintenance_reminder_months ?? 6,
  })
  const [securitySettings, setSecuritySettings] = useState({
    two_factor_enabled: settings?.two_factor_enabled ?? false,
    session_timeout_minutes: settings?.session_timeout_minutes ?? 60,
    require_password_change_days: settings?.require_password_change_days ?? 90,
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const phone = formData.get('companyPhone') as string

    if (phone && !validatePHPhone(phone)) {
      toast.error(PHONE_VALIDATION_ERROR)
      return
    }

    setIsLoading(true)
    const result = await updateSettings(formData)

    if (result.error) toast.error(result.error)
    else {
      toast.success('Company settings updated')
      fetchSettings()
    }
    setIsLoading(false)
  }

  const handleNotifSave = async () => {
    setIsLoading(true)
    const result = await updateNotificationSettings(notifSettings)
    if (result.error) toast.error(result.error)
    else {
      toast.success('Notification settings updated')
      fetchSettings()
    }
    setIsLoading(false)
  }

  const handleReminderSave = async () => {
    setIsLoading(true)
    const result = await updateReminderSettings(reminderSettings)
    if (result.error) toast.error(result.error)
    else {
      toast.success('Reminder settings updated')
      fetchSettings()
    }
    setIsLoading(false)
  }

  const handleSecuritySave = async () => {
    setIsLoading(true)
    const result = await updateSecuritySettings(securitySettings)
    if (result.error) toast.error(result.error)
    else {
      toast.success('Security settings updated')
      fetchSettings()
    }
    setIsLoading(false)
  }

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setIsLoading(true)
    const result = await changeAdminPassword(passwordForm.currentPassword, passwordForm.newPassword)
    if (result.error) toast.error(result.error)
    else {
      toast.success('Password changed successfully')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}><ChevronLeft className="h-4 w-4 mr-2" />Back to Dashboard</Button>
          <div>
            <h1 className="text-xl font-bold text-[#005596]">Settings</h1>
            <p className="text-sm text-gray-500">Manage system configuration and preferences</p>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-8 px-6 space-y-6">
        <Tabs defaultValue="company" className="w-full">
          <TabsList className="w-full justify-start h-12 bg-white border border-gray-200 p-1 mb-8 overflow-x-auto flex-nowrap">
            <TabsTrigger value="company" className="flex items-center gap-2"><Building2 className="h-4 w-4" /> Company</TabsTrigger>
            <TabsTrigger value="service-config" className="flex items-center gap-2"><SettingsIcon className="h-4 w-4" /> Service Config</TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2"><BellDot className="h-4 w-4" /> Notifications</TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-2"><BellRing className="h-4 w-4" /> Reminders</TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Security</TabsTrigger>
          </TabsList>

          <TabsContent value="company">
            <Card className="border-none shadow-sm">
              <CardHeader><CardTitle className="text-lg">Company Information</CardTitle></CardHeader>
              <CardContent>
                <form id="settings-form" onSubmit={handleSave} className="grid grid-cols-2 gap-6">
                  <div className="space-y-2"><Label>Company Name</Label><Input name="companyName" defaultValue={settings?.company_name} /></div>
                  <div className="space-y-2"><Label>Company Email</Label><Input name="companyEmail" defaultValue={settings?.company_email} /></div>
                  <div className="space-y-2"><Label>Company Phone</Label><Input name="companyPhone" placeholder="09XXXXXXXXX" maxLength={11} defaultValue={settings?.company_phone} /></div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select name="timezone" defaultValue={settings?.timezone || 'Asia/Manila'}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Asia/Manila">Asia/Manila</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2"><Label>Company Address</Label><Textarea name="companyAddress" defaultValue={settings?.company_address} /></div>
                  <div className="col-span-2 flex justify-end">
                    <Button type="submit" className="bg-[#005596]" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Company Settings
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Service & Business Config Tab */}
          <TabsContent value="service-config">
            <div className="space-y-6">
              {/* Company Branding */}
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Company Branding</CardTitle>
                  <CardDescription>Configure branding used in receipts and PDF documents</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label>Company Logo (for Receipt / PDF)</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-gray-300" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <Input type="file" accept="image/*" className="cursor-pointer" />
                        <p className="text-xs text-gray-400">PNG or JPG recommended. Max 2MB.</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Office Address</Label>
                      <Textarea
                        defaultValue={settings?.company_address}
                        placeholder="Full office address..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Business Contact Info</Label>
                      <div className="space-y-2">
                        <Input placeholder="Phone number" defaultValue={settings?.company_phone} />
                        <Input placeholder="Email address" defaultValue={settings?.company_email} />
                        <Input placeholder="Website URL (optional)" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button className="bg-[#005596]">Save Branding Settings</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Rules */}
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Notification Rules</CardTitle>
                  <CardDescription>Configure automated SMS and in-app notification triggers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { id: 'sms-client-24h', label: 'Send SMS to Client 24 hours before appointment', defaultChecked: true },
                    { id: 'sms-tech-assign', label: 'Send SMS to Technician on Assignment', defaultChecked: true },
                    { id: 'sms-client-complete', label: 'Send SMS to Client when job is Completed', defaultChecked: false },
                    { id: 'sms-client-reschedule', label: 'Notify Client on Reschedule', defaultChecked: false },
                  ].map((rule) => (
                    <div key={rule.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <Checkbox id={rule.id} defaultChecked={rule.defaultChecked} />
                      <label htmlFor={rule.id} className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                        {rule.label}
                      </label>
                    </div>
                  ))}
                  <div className="flex justify-end pt-2">
                    <Button className="bg-[#005596]">Save Notification Rules</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Message Template Editor */}
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Message Template Editor</CardTitle>
                  <CardDescription>Customize the SMS and notification messages sent to clients and technicians</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label>Client Appointment Reminder (24h before)</Label>
                    <Textarea
                      rows={3}
                      defaultValue="Hi {client_name}, this is a reminder that your {service_type} is scheduled for {date} at {time}. Please contact us at {company_phone} for any concerns."
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-400">Variables: {'{' + 'client_name}'}, {'{' + 'service_type}'}, {'{' + 'date}'}, {'{' + 'time}'}, {'{' + 'company_phone}'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Technician Assignment Notification</Label>
                    <Textarea
                      rows={3}
                      defaultValue="Hi {technician_name}, you have been assigned to a {service_type} job for {client_name} on {date} at {time}. Location: {address}."
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-400">Variables: {'{' + 'technician_name}'}, {'{' + 'service_type}'}, {'{' + 'client_name}'}, {'{' + 'date}'}, {'{' + 'time}'}, {'{' + 'address}'}</p>
                  </div>
                  <div className="flex justify-end">
                    <Button className="bg-[#005596]">Save Templates</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Notification Channels</CardTitle>
                  <CardDescription>Choose how you want to receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-[#005596]">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifSettings.email_notifications}
                      onCheckedChange={(val) => setNotifSettings({ ...notifSettings, email_notifications: val })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border">
                        <Phone className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-[#005596]">SMS Notifications</p>
                        <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifSettings.sms_notifications}
                      onCheckedChange={(val) => setNotifSettings({ ...notifSettings, sms_notifications: val })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border">
                        <Bell className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-[#005596]">Push Notifications</p>
                        <p className="text-sm text-gray-500">Receive in-app push notifications</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifSettings.push_notifications}
                      onCheckedChange={(val) => setNotifSettings({ ...notifSettings, push_notifications: val })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Alert Types</CardTitle>
                  <CardDescription>Configure which events trigger notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-[#005596]">New Booking Alerts</p>
                      <p className="text-sm text-gray-500">Get notified when a new booking is created</p>
                    </div>
                    <Switch
                      checked={notifSettings.new_booking_alert}
                      onCheckedChange={(val) => setNotifSettings({ ...notifSettings, new_booking_alert: val })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-[#005596]">Booking Update Alerts</p>
                      <p className="text-sm text-gray-500">Get notified when bookings are updated or cancelled</p>
                    </div>
                    <Switch
                      checked={notifSettings.booking_update_alert}
                      onCheckedChange={(val) => setNotifSettings({ ...notifSettings, booking_update_alert: val })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-[#005596]">Payment Alerts</p>
                      <p className="text-sm text-gray-500">Get notified on payment status changes</p>
                    </div>
                    <Switch
                      checked={notifSettings.payment_alert}
                      onCheckedChange={(val) => setNotifSettings({ ...notifSettings, payment_alert: val })}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button className="bg-[#005596]" onClick={handleNotifSave} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Notification Settings
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reminders">
            <div className="space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Appointment Reminders</CardTitle>
                  <CardDescription>Configure automatic reminder settings for appointments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-[#005596]">Enable Appointment Reminders</p>
                      <p className="text-sm text-gray-500">Send reminders before scheduled appointments</p>
                    </div>
                    <Switch
                      checked={reminderSettings.reminder_enabled}
                      onCheckedChange={(val) => setReminderSettings({ ...reminderSettings, reminder_enabled: val })}
                    />
                  </div>
                  {reminderSettings.reminder_enabled && (
                    <div className="p-4 border rounded-lg space-y-4">
                      <div className="space-y-2">
                        <Label>Send Reminder Before (hours)</Label>
                        <Select
                          value={reminderSettings.reminder_hours_before.toString()}
                          onValueChange={(val) => setReminderSettings({ ...reminderSettings, reminder_hours_before: parseInt(val) })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 hour</SelectItem>
                            <SelectItem value="2">2 hours</SelectItem>
                            <SelectItem value="6">6 hours</SelectItem>
                            <SelectItem value="12">12 hours</SelectItem>
                            <SelectItem value="24">24 hours (1 day)</SelectItem>
                            <SelectItem value="48">48 hours (2 days)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Follow-up Reminders</CardTitle>
                  <CardDescription>Automatically follow up with clients after service</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-[#005596]">Enable Follow-up Reminders</p>
                      <p className="text-sm text-gray-500">Send follow-up messages after completed services</p>
                    </div>
                    <Switch
                      checked={reminderSettings.follow_up_enabled}
                      onCheckedChange={(val) => setReminderSettings({ ...reminderSettings, follow_up_enabled: val })}
                    />
                  </div>
                  {reminderSettings.follow_up_enabled && (
                    <div className="p-4 border rounded-lg space-y-4">
                      <div className="space-y-2">
                        <Label>Send Follow-up After (days)</Label>
                        <Select
                          value={reminderSettings.follow_up_days_after.toString()}
                          onValueChange={(val) => setReminderSettings({ ...reminderSettings, follow_up_days_after: parseInt(val) })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 day</SelectItem>
                            <SelectItem value="3">3 days</SelectItem>
                            <SelectItem value="7">7 days (1 week)</SelectItem>
                            <SelectItem value="14">14 days (2 weeks)</SelectItem>
                            <SelectItem value="30">30 days (1 month)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Maintenance Reminders</CardTitle>
                  <CardDescription>Remind clients about scheduled maintenance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-[#005596]">Enable Maintenance Reminders</p>
                      <p className="text-sm text-gray-500">Send periodic maintenance reminders to clients</p>
                    </div>
                    <Switch
                      checked={reminderSettings.maintenance_reminder_enabled}
                      onCheckedChange={(val) => setReminderSettings({ ...reminderSettings, maintenance_reminder_enabled: val })}
                    />
                  </div>
                  {reminderSettings.maintenance_reminder_enabled && (
                    <div className="p-4 border rounded-lg space-y-4">
                      <div className="space-y-2">
                        <Label>Remind Every (months)</Label>
                        <Select
                          value={reminderSettings.maintenance_reminder_months.toString()}
                          onValueChange={(val) => setReminderSettings({ ...reminderSettings, maintenance_reminder_months: parseInt(val) })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3 months</SelectItem>
                            <SelectItem value="6">6 months</SelectItem>
                            <SelectItem value="12">12 months (1 year)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button className="bg-[#005596]" onClick={handleReminderSave} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Reminder Settings
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Change Password</CardTitle>
                  <CardDescription>Update your administrator password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={handlePasswordChange} disabled={isLoading || !passwordForm.currentPassword || !passwordForm.newPassword}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Change Password
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Security Settings</CardTitle>
                  <CardDescription>Configure account security options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border">
                        <ShieldCheck className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-[#005596]">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                    </div>
                    <Switch
                      checked={securitySettings.two_factor_enabled}
                      onCheckedChange={(val) => setSecuritySettings({ ...securitySettings, two_factor_enabled: val })}
                    />
                  </div>

                  <div className="p-4 border rounded-lg space-y-4">
                    <div className="space-y-2">
                      <Label>Session Timeout (minutes)</Label>
                      <Select
                        value={securitySettings.session_timeout_minutes.toString()}
                        onValueChange={(val) => setSecuritySettings({ ...securitySettings, session_timeout_minutes: parseInt(val) })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">60 minutes (1 hour)</SelectItem>
                          <SelectItem value="120">120 minutes (2 hours)</SelectItem>
                          <SelectItem value="480">480 minutes (8 hours)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">Automatically log out after this period of inactivity</p>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg space-y-4">
                    <div className="space-y-2">
                      <Label>Require Password Change Every (days)</Label>
                      <Select
                        value={securitySettings.require_password_change_days.toString()}
                        onValueChange={(val) => setSecuritySettings({ ...securitySettings, require_password_change_days: parseInt(val) })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="60">60 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="180">180 days</SelectItem>
                          <SelectItem value="365">365 days (1 year)</SelectItem>
                          <SelectItem value="0">Never</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">Force password reset after this period</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button className="bg-[#005596]" onClick={handleSecuritySave} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Security Settings
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function MiniStatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          {icon}
        </div>
        <p className="text-3xl font-bold text-[#005596]">{value}</p>
      </CardContent>
    </Card>
  )
}

function RequestsView({ requests, technicians = [], onBack, fetchRequests, router, setView, setInstallations, setRepairs, setMaintenance }: any) {
  const [isLoading, setIsLoading] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [selectedRequestForApprove, setSelectedRequestForApprove] = useState<any>(null)
  const [approveServiceCategory, setApproveServiceCategory] = useState('')
  const [approveTechnician, setApproveTechnician] = useState('')
  const [approvePriority, setApprovePriority] = useState('Normal')
  const [approveServiceStatus, setApproveServiceStatus] = useState('Scheduled')
  const [approveBookingSource, setApproveBookingSource] = useState('Website')
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Filter requests
  const filteredRequests = requests.filter((request: any) => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = !searchQuery ||
      request.full_name?.toLowerCase().includes(searchLower) ||
      request.client_name?.toLowerCase().includes(searchLower) ||
      request.phone_number?.toLowerCase().includes(searchLower) ||
      request.phone?.toLowerCase().includes(searchLower) ||
      request.email?.toLowerCase().includes(searchLower)
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'pending' && (request.status === 'Pending' || request.status === 'Pending')) ||
      (statusFilter === 'accepted' && (request.status === 'Accepted' || request.status === 'Approved')) ||
      (statusFilter === 'rejected' && request.status === 'Rejected')
    
    const matchesSource = sourceFilter === 'all' || request.source === sourceFilter
    
    const requestDate = request.created_at ? request.created_at.split('T')[0] : ''
    const matchesDateFrom = !dateFrom || requestDate >= dateFrom
    const matchesDateTo = !dateTo || requestDate <= dateTo
    
    return matchesSearch && matchesStatus && matchesSource && matchesDateFrom && matchesDateTo
  })

  const pendingCount = requests.filter((r: any) => r.status === 'Pending').length
  const acceptedCount = requests.filter((r: any) => r.status === 'Accepted' || r.status === 'Approved').length
  const rejectedCount = requests.filter((r: any) => r.status === 'Rejected').length

  const handleStatusUpdate = async (id: string, status: string) => {
    setIsLoading(true)
    const result = await updateRequestStatus(id, status)
    if (result.error) toast.error(result.error)
    else {
      toast.success(`Request ${status.toLowerCase()}`)
      fetchRequests()
    }
    setIsLoading(false)
  }

  const handleRejectClick = (id: string) => {
    setRejectingId(id)
    setRejectReason('')
    setShowRejectDialog(true)
  }

  const handleRejectConfirm = async () => {
    if (!rejectingId) return
    setIsLoading(true)
    
    const request = requests.find((r: any) => r.id === rejectingId)
    if (!request) {
      toast.error('Request not found')
      setIsLoading(false)
      return
    }

    let result
    if (request.source === 'lead') {
      result = await rejectLead(rejectingId, rejectReason)
    } else {
      result = await rejectRequest(rejectingId, rejectReason)
    }

    if (result.error) toast.error(result.error)
    else {
      toast.success('Request rejected')
      fetchRequests()
    }
    setIsLoading(false)
    setShowRejectDialog(false)
    setRejectingId(null)
  }

  const handleApproveSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedRequestForApprove) return

    setIsLoading(true)
    try {
      const form = e.currentTarget
      const appointmentDate = (form.querySelector('input[name="appointmentDate"]') as HTMLInputElement)?.value || selectedRequestForApprove.preferred_date || selectedRequestForApprove.displayDate
      const appointmentTime = (form.querySelector('input[name="appointmentTime"]') as HTMLInputElement)?.value || selectedRequestForApprove.preferred_time || selectedRequestForApprove.displayTime
      const serviceFee = (form.querySelector('input[name="serviceFee"]') as HTMLInputElement)?.value || '0'
      const partsCost = (form.querySelector('input[name="partsCost"]') as HTMLInputElement)?.value || '0'
      const totalCost = (form.querySelector('input[name="totalCost"]') as HTMLInputElement)?.value || '0'
      const notes = (form.querySelector('input[name="notes"]') as HTMLInputElement)?.value || ''

      const jobData = {
        technician: approveTechnician,
        date: appointmentDate,
        time: appointmentTime,
        cost: totalCost,
        notes,
        type: 'Standard'
      }

      let result
      if (selectedRequestForApprove.source === 'lead') {
        if (approveServiceCategory === 'Installation') {
          result = await acceptLead(selectedRequestForApprove.id, { serviceType: selectedRequestForApprove.service_type, ...jobData })
        } else if (approveServiceCategory === 'Repair') {
          result = await acceptLeadAsRepair(selectedRequestForApprove.id, { serviceType: selectedRequestForApprove.service_type, ...jobData })
        } else if (approveServiceCategory === 'Maintenance') {
          result = await acceptLeadAsMaintenance(selectedRequestForApprove.id, { serviceType: selectedRequestForApprove.service_type, ...jobData })
        }
      } else {
        if (approveServiceCategory === 'Installation') {
          result = await acceptRequestAsInstallation(selectedRequestForApprove.id, jobData)
        } else if (approveServiceCategory === 'Repair') {
          result = await acceptRequestAsRepair(selectedRequestForApprove.id, jobData)
        } else if (approveServiceCategory === 'Maintenance') {
          result = await acceptRequestAsMaintenance(selectedRequestForApprove.id, jobData)
        }
      }

      if (result?.error) {
        toast.error(result.error)
        setIsLoading(false)
        return
      }

      toast.success(`Request approved! ${approveServiceCategory} job created.`)
      
      if (approveServiceCategory === 'Installation') {
        const updated = await getInstallations()
        setInstallations(updated.data || [])
        setView('installations')
      } else if (approveServiceCategory === 'Repair') {
        const updated = await getRepairs()
        setRepairs(updated.data || [])
        setView('repairs')
      } else if (approveServiceCategory === 'Maintenance') {
        const updated = await getMaintenance()
        setMaintenance(updated.data || [])
        setView('maintenance')
      }

      setShowApproveDialog(false)
      setSelectedRequestForApprove(null)
      fetchRequests()
    } catch (error) {
      console.error('Approve error:', error)
      toast.error('Failed to approve request')
    } finally {
      setIsLoading(false)
    }
  }

  const openApproveDialog = (request: any) => {
    setSelectedRequestForApprove(request)
    setApproveServiceCategory(request.service_type || request.request_type || '')
    setApproveTechnician('')
    setApprovePriority('Normal')
    setApproveServiceStatus('Scheduled')
    setApproveBookingSource('Website')
    setShowApproveDialog(true)
  }

  const getClientName = (request: any) => {
    return request.full_name || request.client_name || 'Unknown'
  }

  const getServiceType = (request: any) => {
    return request.service_type || request.request_type || 'Service'
  }

  const getContactInfo = (request: any) => {
    return {
      phone: request.phone_number || request.phone || '',
      email: request.email || '',
      address: request.service_address || request.address || ''
    }
  }

  const getDateTime = (request: any) => {
    return {
      date: request.preferred_date || request.displayDate || '',
      time: request.preferred_time || request.displayTime || ''
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}><ChevronLeft className="h-4 w-4 mr-2" />Back to Dashboard</Button>
          <div>
            <h1 className="text-xl font-bold text-[#005596]">Client Requests</h1>
            <p className="text-sm text-gray-500">Manage incoming service requests from clients</p>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-8 px-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <MiniStatCard title="Total Requests" value={filteredRequests.length.toString()} icon={<FileText className="text-blue-600" />} />
          <MiniStatCard title="Pending" value={filteredRequests.filter((r: any) => r.status === 'Pending').length.toString()} icon={<Clock className="text-yellow-600" />} />
          <MiniStatCard title="Accepted" value={filteredRequests.filter((r: any) => r.status === 'Accepted' || r.status === 'Approved').length.toString()} icon={<CheckCircle className="text-green-600" />} />
          <MiniStatCard title="Rejected" value={filteredRequests.filter((r: any) => r.status === 'Rejected').length.toString()} icon={<X className="text-red-600" />} />
        </div>

        {/* Filters */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder="Search by name, phone, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  className="w-[140px]"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="From"
                />
                <span className="text-gray-400">-</span>
                <Input
                  type="date"
                  className="w-[140px]"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="To"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="lead">Website Lead</SelectItem>
                  <SelectItem value="request">Client Request</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500"
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('all')
                  setSourceFilter('all')
                  setDateFrom('')
                  setDateTo('')
                }}
              >
                Clear
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Showing <span className="font-bold text-[#005596]">{filteredRequests.length}</span> of <span className="font-bold">{requests.length}</span> requests
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No client requests found</p>
            </div>
          ) : (
            filteredRequests.map((request: any) => (
              <Card key={request.id} className="border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <Badge className={
                          request.status === 'Approved' || request.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                            request.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                        }>
                          {request.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {request.source === 'lead' ? 'Website Lead' : 'Client Request'}
                        </Badge>
                        <h3 className="font-bold text-lg text-[#005596]">{getServiceType(request)}</h3>
                        <span className="text-sm text-gray-400">• {format(parseISO(request.created_at), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <p className="text-gray-500 font-medium">Client</p>
                          <p className="text-[#005596] flex items-center gap-2"><UserCheck className="h-4 w-4" /> {getClientName(request)}</p>
                          {getContactInfo(request).phone && (
                            <p className="text-[#005596] flex items-center gap-2"><Phone className="h-4 w-4" /> {getContactInfo(request).phone}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 font-medium">Preferred Schedule</p>
                          <p className="text-[#005596] flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> {getDateTime(request).date} at {getDateTime(request).time}
                          </p>
                        </div>
                      </div>
                      {request.additional_info && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 italic">"{request.additional_info}"</p>
                        </div>
                      )}
                      {request.message && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 italic">"{request.message}"</p>
                        </div>
                      )}
                    </div>
                    {(request.status === 'Pending') && (
                      <div className="flex gap-2 ml-6">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => openApproveDialog(request)}
                          disabled={isLoading}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleRejectClick(request.id)}
                          disabled={isLoading}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Approve / Convert to Formal Job Modal */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              Approve Request — Convert to Formal Job
            </DialogTitle>
          </DialogHeader>
          {selectedRequestForApprove && (
            <form onSubmit={handleApproveSubmit} className="space-y-6 py-2">

              {/* Service Category */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Service Category</p>
                <div className="flex gap-4">
                  {['Installation', 'Repair', 'Maintenance'].map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={approveServiceCategory === cat}
                        onCheckedChange={() => setApproveServiceCategory(cat)}
                      />
                      <span className="text-sm font-medium">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Client Information */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Client Information</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Client Name</Label>
                    <Input defaultValue={selectedRequestForApprove.client_name} name="clientName" readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-1">
                    <Label>Contact Number</Label>
                    <Input defaultValue={selectedRequestForApprove.phone || ''} name="contactNumber" placeholder="09XXXXXXXXX" />
                  </div>
                  <div className="space-y-1">
                    <Label>Service Address</Label>
                    <Input defaultValue={selectedRequestForApprove.address || ''} name="serviceAddress" placeholder="Full address" />
                  </div>
                  <div className="space-y-1">
                    <Label>Nearest Landmark</Label>
                    <Input name="landmark" placeholder="e.g., Near SM City" />
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Technical Specifications</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Aircon Brand</Label>
                    <Input name="airconBrand" placeholder="e.g., Samsung, LG" />
                  </div>
                  <div className="space-y-1">
                    <Label>Aircon Type</Label>
                    <Select name="airconType" defaultValue="Split">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Window">Window</SelectItem>
                        <SelectItem value="Split">Split</SelectItem>
                        <SelectItem value="Inverter">Inverter</SelectItem>
                        <SelectItem value="Central">Central</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Horsepower (HP)</Label>
                    <Select name="horsepower" defaultValue="1.0">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.5">0.5 HP</SelectItem>
                        <SelectItem value="0.75">0.75 HP</SelectItem>
                        <SelectItem value="1.0">1.0 HP</SelectItem>
                        <SelectItem value="1.5">1.5 HP</SelectItem>
                        <SelectItem value="2.0">2.0 HP</SelectItem>
                        <SelectItem value="2.5">2.5 HP</SelectItem>
                        <SelectItem value="3.0">3.0 HP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Unit Age (Years)</Label>
                    <Input name="unitAge" type="number" min="0" placeholder="e.g., 3" />
                  </div>
                </div>
              </div>

              {/* Scheduling & Assignment */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Scheduling & Assignment</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Assigned Technician</Label>
                    <Select value={approveTechnician} onValueChange={setApproveTechnician}>
                      <SelectTrigger><SelectValue placeholder="Select technician" /></SelectTrigger>
                      <SelectContent>
                        {technicians.filter((t: any) => t.status === 'Active').map((t: any) => (
                          <SelectItem key={t.id} value={t.full_name}>{t.full_name}</SelectItem>
                        ))}
                        {technicians.filter((t: any) => t.status === 'Active').length === 0 && (
                          <>
                            <SelectItem value="Chris">Chris</SelectItem>
                            <SelectItem value="Emman">Emman</SelectItem>
                            <SelectItem value="Carlos">Carlos</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Priority Level</Label>
                    <Select value={approvePriority} onValueChange={setApprovePriority}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Appointment Date</Label>
                    <Input name="appointmentDate" type="date" defaultValue={selectedRequestForApprove.preferred_date || ''} />
                  </div>
                  <div className="space-y-1">
                    <Label>Appointment Time</Label>
                    <Input name="appointmentTime" type="time" defaultValue={selectedRequestForApprove.preferred_time || ''} />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label>Estimated Duration</Label>
                    <Select name="estimatedDuration" defaultValue="2 Hours">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1 Hour">1 Hour</SelectItem>
                        <SelectItem value="2 Hours">2 Hours</SelectItem>
                        <SelectItem value="3 Hours">3 Hours</SelectItem>
                        <SelectItem value="4 Hours">4 Hours</SelectItem>
                        <SelectItem value="Half Day">Half Day</SelectItem>
                        <SelectItem value="Full Day">Full Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Monitoring & Status */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Monitoring & Status</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Service Status</Label>
                    <Select value={approveServiceStatus} onValueChange={setApproveServiceStatus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Booking Source</Label>
                    <Select value={approveBookingSource} onValueChange={setApproveBookingSource}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Website">Website</SelectItem>
                        <SelectItem value="Facebook">Facebook</SelectItem>
                        <SelectItem value="Walk-in">Walk-in</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Financials */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Financials</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label>Service Fee (₱)</Label>
                    <Input name="serviceFee" type="number" placeholder="0.00" />
                  </div>
                  <div className="space-y-1">
                    <Label>Est. Parts Cost (₱)</Label>
                    <Input name="partsCost" type="number" placeholder="0.00" />
                  </div>
                  <div className="space-y-1">
                    <Label>Total Cost (₱)</Label>
                    <Input name="totalCost" type="number" placeholder="0.00" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowApproveDialog(false)}>Cancel</Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm & Approve
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <X className="h-5 w-5" />
              Reject Request
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
              <Button
                type="button"
                className="bg-red-600 hover:bg-red-700"
                onClick={handleRejectConfirm}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MaintenanceView({ maintenance, total, page, setPage, clients, onBack, fetchMaintenance, onViewDetails, clientUnits: propClientUnits, onUpdateProgress }: any) {
  const [showAdd, setShowAdd] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [type, setType] = useState('Real-Time')
  const [maintenanceData, setMaintenanceData] = useState<any[]>(maintenance)

  // New maintenance form state
  const [selectedClientId, setSelectedClientId] = useState('')
  const [selectedClientUnits, setSelectedClientUnits] = useState<any[]>([])
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([])
  const [unitServiceTypes, setUnitServiceTypes] = useState<Record<string, string>>({})

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [technicianFilter, setTechnicianFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  
  const today = new Date().toISOString().split('T')[0]
  const itemsPerPage = 20
  const totalPages = Math.ceil(total / itemsPerPage)

  // Get unique technicians
  const techSet = new Set<string>()
  maintenance.forEach((m: any) => { if (m.technician) techSet.add(m.technician as string) })
  const uniqueTechnicians = Array.from(techSet)

  // Filter maintenance
  const filteredMaintenance = maintenance.filter((item: any) => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = !searchQuery || 
      item.title?.toLowerCase().includes(searchLower) ||
      item.client_name?.toLowerCase().includes(searchLower) ||
      item.location?.toLowerCase().includes(searchLower) ||
      item.technician?.toLowerCase().includes(searchLower)
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    const matchesTech = technicianFilter === 'all' || item.technician === technicianFilter
    const matchesType = typeFilter === 'all' || item.type === typeFilter
    
    const itemDate = item.date || ''
    const matchesDateFrom = !dateFrom || itemDate >= dateFrom
    const matchesDateTo = !dateTo || itemDate <= dateTo
    
    return matchesSearch && matchesStatus && matchesTech && matchesType && matchesDateFrom && matchesDateTo
  })

  useEffect(() => {
    setMaintenanceData(maintenance)
  }, [maintenance])

  const loadMaintenanceWithItems = async () => {
    const result = await getMaintenanceWithItems(page, 20)
    if (result.error) {
      console.error('loadMaintenanceWithItems error:', result.error)
    }
    setMaintenanceData(result.data || [])
  }

  const handleClientChange = async (clientId: string) => {
    setSelectedClientId(clientId)
    setSelectedUnitIds([])
    setUnitServiceTypes({})

    if (clientId) {
      const units = await getClientUnits(clientId)
      setSelectedClientUnits(units || [])
    } else {
      setSelectedClientUnits([])
    }
  }

  const handleUnitToggle = (unitId: string) => {
    setSelectedUnitIds(prev =>
      prev.includes(unitId)
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    )
  }

  const handleServiceTypeChange = (unitId: string, serviceType: string) => {
    setUnitServiceTypes(prev => ({
      ...prev,
      [unitId]: serviceType
    }))
  }

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append('type', type)

    // Pass unit IDs and service types as JSON strings
    formData.append('unitIdsJson', JSON.stringify(selectedUnitIds))
    formData.append('serviceTypesJson', JSON.stringify(selectedUnitIds.map(id => unitServiceTypes[id] || 'Cleaning')))

    const result = await createMaintenanceWithUnits(formData)
    if (result.error) toast.error(result.error)
    else {
      toast.success('Maintenance service added with units')
      loadMaintenanceWithItems()
      setShowAdd(false)
      setSelectedClientId('')
      setSelectedUnitIds([])
      setUnitServiceTypes({})
      setSelectedClientUnits([])
    }
    setIsLoading(false)
  }

  const handleItemStatusChange = async (itemId: string, status: string) => {
    const result = await updateMaintenanceItemStatus(itemId, status)
    if (result.error) toast.error(result.error)
    else {
      toast.success(`Unit status updated to ${status}`)
      loadMaintenanceWithItems()
    }
  }

  const handleComplete = async (id: string) => {
    const result = await markMaintenanceComplete(id)
    if (result.error) toast.error(result.error)
    else {
      toast.success('Maintenance marked as completed')
      loadMaintenanceWithItems()
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}><ChevronLeft className="h-4 w-4 mr-2" />Back to Dashboard</Button>
          <div>
            <h1 className="text-xl font-bold text-[#005596]">Maintenance Monitoring</h1>
            <p className="text-sm text-gray-500">Track and manage maintenance requests</p>
          </div>
        </div>
        <Button className="bg-[#005596]" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-2" />Add Maintenance</Button>
      </header>
      <main className="container mx-auto py-8 px-6 space-y-6">
        {/* Filters Card */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder="Search maintenance..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  className="w-[140px]"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="From"
                />
                <span className="text-gray-400">-</span>
                <Input
                  type="date"
                  className="w-[140px]"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="To"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Real-Time">Real-Time</SelectItem>
                  <SelectItem value="Schedule">Schedule</SelectItem>
                </SelectContent>
              </Select>
              <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Technicians" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Technicians</SelectItem>
                  {uniqueTechnicians.map((t: string) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500"
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('all')
                  setTypeFilter('all')
                  setTechnicianFilter('all')
                  setDateFrom('')
                  setDateTo('')
                }}
              >
                Clear
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Showing <span className="font-bold text-[#005596]">{filteredMaintenance.length}</span> of <span className="font-bold">{maintenance.length}</span> jobs
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-4 gap-6">
          <MiniStatCard title="Total Maintenance" value={filteredMaintenance.length.toString()} icon={<Wrench className="text-blue-600" />} />
          <MiniStatCard title="In Progress" value={filteredMaintenance.filter((m: any) => m.status === 'In Progress').length.toString()} icon={<Clock className="text-blue-600" />} />
          <MiniStatCard title="Scheduled" value={filteredMaintenance.filter((m: any) => m.status === 'Scheduled').length.toString()} icon={<Calendar className="text-yellow-600" />} />
          <MiniStatCard title="Completed" value={filteredMaintenance.filter((m: any) => m.status === 'Completed').length.toString()} icon={<CheckCircle className="text-green-600" />} />
        </div>
        <div className="space-y-4">
          <h2 className="font-bold text-[#005596]">Maintenance Services ({filteredMaintenance.length})</h2>
          {filteredMaintenance.map((item: any) => (
            <Card key={item.id} className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#005596]">{item.title}</h3>
                      <Badge className={item.status === 'Completed' ? 'bg-green-100 text-green-700' : item.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}>
                        {item.status}
                      </Badge>
                      {item.is_multi_unit && <Badge variant="outline" className="text-[10px]">Multi-Unit</Badge>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {item.client_name}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.location}</span>
                      <span className="flex items-center gap-1"><Wrench className="h-3 w-3" /> {item.technician}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {item.date}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onViewDetails(item)}>View Details</Button>
                  </div>
                </div>

                {/* Multi-Unit Items Display */}
                {item.items && item.items.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Unit Services</p>
                    <div className="space-y-3">
                      {item.items.map((unitItem: any) => (
                        <div key={unitItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={unitItem.status === 'Done'}
                                onCheckedChange={(checked) => handleItemStatusChange(unitItem.id, checked ? 'Done' : 'Pending')}
                              />
                              <div>
                                <p className="font-medium text-sm">{unitItem.client_units?.unit_name || `Unit ${unitItem.unit_id}`}</p>
                                <p className="text-xs text-gray-500">{unitItem.client_units?.brand} {unitItem.client_units?.unit_type} - {unitItem.client_units?.horsepower}HP</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Select
                              value={unitItem.service_type}
                              onValueChange={async (val) => {
                                const { updateMaintenanceItemServiceType } = await import('@/app/actions/admin')
                                await updateMaintenanceItemServiceType(unitItem.id, val)
                                loadMaintenanceWithItems()
                              }}
                            >
                              <SelectTrigger className="w-[140px] h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Cleaning">Cleaning</SelectItem>
                                <SelectItem value="Check-up">Check-up</SelectItem>
                                <SelectItem value="Filter Replacement">Filter Replacement</SelectItem>
                                <SelectItem value="Inspection">Inspection</SelectItem>
                                <SelectItem value="Repair">Repair</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select
                              value={unitItem.status}
                              onValueChange={(val) => handleItemStatusChange(unitItem.id, val)}
                            >
                              <SelectTrigger className="w-[120px] h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Done">Done</SelectItem>
                              </SelectContent>
                            </Select>
                            {unitItem.next_cleaning_date && (
                              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                Next: {new Date(unitItem.next_cleaning_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Legacy single-unit maintenance */}
                {!item.is_multi_unit && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-medium"><span>{item.status === 'Completed' ? 'Completed' : 'Progress'}</span><span>{Math.round(calculateDynamicProgress(item))}%</span></div>
<Progress value={Math.round(calculateDynamicProgress(item))} status={item.status?.toLowerCase()?.replace(' ', '_') as any} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {maintenanceData.length === 0 && <div className="text-center py-12 text-gray-400">No maintenance services found</div>}
        </div>
      </main>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Schedule Multi-Unit Maintenance</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="py-4 space-y-6">
            {/* Client Selection */}
            <div className="space-y-2">
              <Label>Select Client *</Label>
              <Select value={selectedClientId} onValueChange={handleClientChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.filter((c: any) => !c.is_archived).map((client: any) => (
                    <SelectItem key={client.id} value={client.id}>{client.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Unit Selection - Multi-Select Checklist */}
            {selectedClientId && (
              <div className="space-y-2">
                <Label>Select Units *</Label>
                {selectedClientUnits.length === 0 ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                    No registered units found for this client. Please register units first in the Installations section.
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg max-h-[200px] overflow-y-auto">
                    {selectedClientUnits.map((unit: any) => (
                      <div key={unit.id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={`unit-${unit.id}`}
                            checked={selectedUnitIds.includes(unit.id)}
                            onCheckedChange={() => handleUnitToggle(unit.id)}
                          />
                          <label htmlFor={`unit-${unit.id}`} className="cursor-pointer">
                            <p className="font-medium text-sm">{unit.unit_name}</p>
                            <p className="text-xs text-gray-500">{unit.brand} {unit.unit_type} - {unit.horsepower}HP</p>
                          </label>
                        </div>
                        {selectedUnitIds.includes(unit.id) && (
                          <Select
                            value={unitServiceTypes[unit.id] || 'Cleaning'}
                            onValueChange={(val) => handleServiceTypeChange(unit.id, val)}
                          >
                            <SelectTrigger className="w-[140px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Cleaning">Cleaning</SelectItem>
                              <SelectItem value="Check-up">Check-up</SelectItem>
                              <SelectItem value="Filter Replacement">Filter Replacement</SelectItem>
                              <SelectItem value="Inspection">Inspection</SelectItem>
                              <SelectItem value="Repair">Repair</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {selectedClientUnits.length > 0 && (
                  <p className="text-xs text-gray-500">{selectedUnitIds.length} unit(s) selected</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Client Name</Label>
                <Input name="clientName" placeholder="Client name" required />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input name="address" placeholder="Service address" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Technician</Label>
                <Input name="technician" placeholder="Technician name" required />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input name="date" type="date" defaultValue={today} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Time</Label>
                <Input name="time" type="time" required />
              </div>
              <div className="space-y-2">
                <Label>Schedule Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Real-Time">Real-Time</SelectItem>
                    <SelectItem value="Schedule">Schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea name="notes" placeholder="Additional notes..." />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button
                type="submit"
                className="bg-[#005596]"
                disabled={isLoading || selectedUnitIds.length === 0}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Maintenance ({selectedUnitIds.length} units)
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ReportStatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-6 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-[#005596]">{value}</p>
        </div>
        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}

function TechniciansView({ technicians, onBack, fetchTechnicians }: any) {
  const [isLoading, setIsLoading] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [selectedTechnician, setSelectedTechnician] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const handleCreateTechnician = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await createTechnician(formData)
    if (result.error) toast.error(result.error)
    else {
      toast.success('Technician added successfully')
      fetchTechnicians()
      setShowAddDialog(false)
        ; (e.target as HTMLFormElement).reset()
    }
    setIsLoading(false)
  }

  const handleUpdateTechnician = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedTechnician) return
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await updateTechnician(selectedTechnician.id, formData)
    if (result.error) toast.error(result.error)
    else {
      toast.success('Technician updated successfully')
      fetchTechnicians()
      setShowEditDialog(false)
    }
    setIsLoading(false)
  }

  const handleStatusChange = async (id: string, status: string) => {
    setIsLoading(true)
    const result = await updateTechnicianStatus(id, status)
    if (result.error) toast.error(result.error)
    else {
      toast.success(`Technician marked as ${status}`)
      fetchTechnicians()
    }
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this technician?')) return
    setIsLoading(true)
    const result = await deleteTechnician(id)
    if (result.error) toast.error(result.error)
    else {
      toast.success('Technician deleted successfully')
      fetchTechnicians()
    }
    setIsLoading(false)
  }

  const filteredTechnicians = technicians.filter((tech: any) => {
    const matchesSearch =
      tech.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.phone?.includes(searchQuery) ||
      tech.specialization?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || tech.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-xl font-bold text-[#005596]">Technician Management</h1>
            <p className="text-sm text-gray-500">Manage your service technicians</p>
          </div>
        </div>
        <Button className="bg-[#00529B]" size="sm" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Technician
        </Button>
      </header>

      <main className="container mx-auto py-8 px-6 space-y-6">
        {/* Stats - now reflect filtered results */}
        <div className="grid grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Technicians</p>
                <p className="text-3xl font-bold text-[#005596]">{filteredTechnicians.length}</p>
              </div>
              <HardHat className="h-8 w-8 text-gray-300" />
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-3xl font-bold text-green-600">{filteredTechnicians.filter((t: any) => t.status === 'Active').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-gray-300" />
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">On Leave</p>
                <p className="text-3xl font-bold text-yellow-600">{filteredTechnicians.filter((t: any) => t.status === 'On Leave').length}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-300" />
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Inactive</p>
                <p className="text-3xl font-bold text-red-600">{filteredTechnicians.filter((t: any) => t.status === 'Inactive').length}</p>
              </div>
              <X className="h-8 w-8 text-gray-300" />
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Search by name, email, phone, or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="On Leave">On Leave</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500"
            onClick={() => {
              setSearchQuery('')
              setStatusFilter('all')
            }}
          >
            Clear
          </Button>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500">
          Showing <span className="font-bold text-[#005596]">{filteredTechnicians.length}</span> of <span className="font-bold">{technicians.length}</span> technicians
        </p>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Technicians ({filteredTechnicians.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredTechnicians.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <HardHat className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No technicians found</p>
                <Button className="mt-4 bg-[#005596]" size="sm" onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Technician
                </Button>
              </div>
            ) : (
              filteredTechnicians.map((tech: any) => (
                <div key={tech.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <HardHat className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#005596]">{tech.full_name}</span>
                        <Badge
                          variant="outline"
                          className={
                            tech.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200 text-[10px]' :
                              tech.status === 'On Leave' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 text-[10px]' :
                                'bg-red-50 text-red-700 border-red-200 text-[10px]'
                          }
                        >
                          {tech.status}
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                          {tech.specialization || 'General'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {tech.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {tech.email}
                          </span>
                        )}
                        {tech.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {tech.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTechnician(tech)
                        setShowDetailsDialog(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTechnician(tech)
                        setShowEditDialog(true)
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Select
                      value={tech.status}
                      onValueChange={(val) => handleStatusChange(tech.id, val)}
                    >
                      <SelectTrigger className="w-[120px] h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="On Leave">On Leave</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleDelete(tech.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Technician</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTechnician} className="space-y-5 py-4">

            {/* Personal Information */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Personal Information</p>
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input name="fullName" placeholder="Juan Dela Cruz" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Number</Label>
                  <Input name="phone" placeholder="09XXXXXXXXX" maxLength={11} />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input name="email" type="email" placeholder="juan@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <Input name="profilePicture" type="file" accept="image/*" className="cursor-pointer" />
              </div>
            </div>

            {/* Skills & Capacity */}
            <div className="space-y-3 pt-2 border-t">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Skills & Capacity</p>
              <div className="space-y-2">
                <Label>Expertise</Label>
                <Select name="specialization" defaultValue="General">
                  <SelectTrigger><SelectValue placeholder="Select expertise" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Inverter Specialist">Inverter Specialist</SelectItem>
                    <SelectItem value="Installation Expert">Installation Expert</SelectItem>
                    <SelectItem value="Repair Specialist">Repair Specialist</SelectItem>
                    <SelectItem value="Maintenance Expert">Maintenance Expert</SelectItem>
                    <SelectItem value="Split Type">Split Type</SelectItem>
                    <SelectItem value="Window Type">Window Type</SelectItem>
                    <SelectItem value="Central AC">Central AC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Max Jobs per Day</Label>
                <Select name="maxJobsPerDay" defaultValue="3">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 job</SelectItem>
                    <SelectItem value="2">2 jobs</SelectItem>
                    <SelectItem value="3">3 jobs</SelectItem>
                    <SelectItem value="4">4 jobs</SelectItem>
                    <SelectItem value="5">5 jobs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Availability & Duty Settings */}
            <div className="space-y-3 pt-2 border-t">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Availability & Duty Settings</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duty Status</Label>
                  <Select name="dutyStatus" defaultValue="Active">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="On Leave">On Leave</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Weekly Off-Day</Label>
                  <Select name="weeklyOffDay" defaultValue="Sunday">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sunday">Sunday</SelectItem>
                      <SelectItem value="Monday">Monday</SelectItem>
                      <SelectItem value="Saturday">Saturday</SelectItem>
                      <SelectItem value="Saturday-Sunday">Saturday & Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Shift Start</Label>
                  <Input name="shiftStart" type="time" defaultValue="08:00" />
                </div>
                <div className="space-y-2">
                  <Label>Shift End</Label>
                  <Input name="shiftEnd" type="time" defaultValue="17:00" />
                </div>
                <div className="space-y-2">
                  <Label>Leave Start Date</Label>
                  <Input name="leaveStart" type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Leave End Date</Label>
                  <Input name="leaveEnd" type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Hire Date</Label>
                <Input name="hireDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea name="notes" placeholder="Any additional notes..." />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#00529B]" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add Technician
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Technician</DialogTitle>
          </DialogHeader>
          {selectedTechnician && (
            <form onSubmit={handleUpdateTechnician} className="space-y-5 py-4">

              {/* Personal Information */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Personal Information</p>
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input name="fullName" defaultValue={selectedTechnician.full_name} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Contact Number</Label>
                    <Input name="phone" defaultValue={selectedTechnician.phone} maxLength={11} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input name="email" type="email" defaultValue={selectedTechnician.email} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Profile Picture</Label>
                  <Input name="profilePicture" type="file" accept="image/*" className="cursor-pointer" />
                </div>
              </div>

              {/* Skills & Capacity */}
              <div className="space-y-3 pt-2 border-t">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Skills & Capacity</p>
                <div className="space-y-2">
                  <Label>Expertise</Label>
                  <Select name="specialization" defaultValue={selectedTechnician.specialization || 'General'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Inverter Specialist">Inverter Specialist</SelectItem>
                      <SelectItem value="Installation Expert">Installation Expert</SelectItem>
                      <SelectItem value="Repair Specialist">Repair Specialist</SelectItem>
                      <SelectItem value="Maintenance Expert">Maintenance Expert</SelectItem>
                      <SelectItem value="Split Type">Split Type</SelectItem>
                      <SelectItem value="Window Type">Window Type</SelectItem>
                      <SelectItem value="Central AC">Central AC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Max Jobs per Day</Label>
                  <Select name="maxJobsPerDay" defaultValue={selectedTechnician.max_jobs_per_day?.toString() || '3'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 job</SelectItem>
                      <SelectItem value="2">2 jobs</SelectItem>
                      <SelectItem value="3">3 jobs</SelectItem>
                      <SelectItem value="4">4 jobs</SelectItem>
                      <SelectItem value="5">5 jobs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Availability & Duty Settings */}
              <div className="space-y-3 pt-2 border-t">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Availability & Duty Settings</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duty Status</Label>
                    <Select name="dutyStatus" defaultValue={selectedTechnician.status || 'Active'}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="On Leave">On Leave</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Weekly Off-Day</Label>
                    <Select name="weeklyOffDay" defaultValue={selectedTechnician.weekly_off_day || 'Sunday'}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sunday">Sunday</SelectItem>
                        <SelectItem value="Monday">Monday</SelectItem>
                        <SelectItem value="Saturday">Saturday</SelectItem>
                        <SelectItem value="Saturday-Sunday">Saturday & Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Shift Start</Label>
                    <Input name="shiftStart" type="time" defaultValue={selectedTechnician.shift_start || '08:00'} />
                  </div>
                  <div className="space-y-2">
                    <Label>Shift End</Label>
                    <Input name="shiftEnd" type="time" defaultValue={selectedTechnician.shift_end || '17:00'} />
                  </div>
                  <div className="space-y-2">
                    <Label>Leave Start Date</Label>
                    <Input name="leaveStart" type="date" defaultValue={selectedTechnician.leave_start || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label>Leave End Date</Label>
                    <Input name="leaveEnd" type="date" defaultValue={selectedTechnician.leave_end || ''} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea name="notes" defaultValue={selectedTechnician.notes} placeholder="Any additional notes..." />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#00529B]" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Technician
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Technician Details</DialogTitle>
          </DialogHeader>
          {selectedTechnician && (
            <div className="space-y-6 py-4">
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <HardHat className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#005596]">{selectedTechnician.full_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className={
                        selectedTechnician.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                          selectedTechnician.status === 'On Leave' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-red-50 text-red-700 border-red-200'
                      }
                    >
                      {selectedTechnician.status}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {selectedTechnician.specialization || 'General'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Personal Information</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Email</p>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {selectedTechnician.email || 'Not provided'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Contact Number</p>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      {selectedTechnician.phone || 'Not provided'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Hire Date</p>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {selectedTechnician.hire_date ? format(parseISO(selectedTechnician.hire_date), 'MMM d, yyyy') : 'Not provided'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Date Added</p>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {selectedTechnician.created_at ? format(parseISO(selectedTechnician.created_at), 'MMM d, yyyy') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Skills & Capacity */}
              <div className="space-y-3 pt-3 border-t">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Skills & Capacity</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Expertise</p>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {selectedTechnician.specialization || 'General'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Max Jobs per Day</p>
                    <p className="text-sm font-bold text-[#005596]">
                      {selectedTechnician.max_jobs_per_day || 3} {selectedTechnician.max_jobs_per_day === 1 ? 'job' : 'jobs'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Availability & Duty Settings */}
              <div className="space-y-3 pt-3 border-t">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Availability & Duty Settings</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Duty Status</p>
                    <Badge
                      variant="outline"
                      className={
                        selectedTechnician.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                          selectedTechnician.status === 'On Leave' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-red-50 text-red-700 border-red-200'
                      }
                    >
                      {selectedTechnician.status || 'Active'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Weekly Off-Day</p>
                    <p className="text-sm font-medium">{selectedTechnician.weekly_off_day || 'Sunday'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Regular Shift</p>
                    <p className="text-sm font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      {selectedTechnician.shift_start || '08:00'} – {selectedTechnician.shift_end || '17:00'}
                    </p>
                  </div>
                  {(selectedTechnician.leave_start || selectedTechnician.leave_end) && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 font-medium">Leave Schedule</p>
                      <p className="text-sm font-medium">
                        {selectedTechnician.leave_start || '—'} → {selectedTechnician.leave_end || '—'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2 pt-3 border-t">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</p>
                <div className="bg-gray-50 p-3 rounded border text-sm italic">
                  {selectedTechnician.notes || 'No notes provided'}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>Close</Button>
                <Button
                  className="bg-[#005596]"
                  onClick={() => {
                    setShowDetailsDialog(false)
                    setShowEditDialog(true)
                  }}
                >
                  <Edit2 className="h-4 w-4 mr-2" /> Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
