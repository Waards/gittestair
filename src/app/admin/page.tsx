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
  deleteTechnician
} from '@/app/actions/admin'
import { getLeads, updateLeadStatus, convertLeadToClient, deleteLead } from '@/app/actions/leads'
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
  HardHat
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Progress } from '@/components/ui/progress'
import { validatePHPhone, PHONE_VALIDATION_ERROR, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

type View = 'dashboard' | 'clients' | 'installations' | 'repairs' | 'schedule' | 'reports' | 'settings' | 'requests' | 'leads' | 'technicians'

export default function AdminDashboard() {
  const [view, setView] = useState<View>('dashboard')
  const [clients, setClients] = useState<any[]>([])
  const [installations, setInstallations] = useState<any[]>([])
  const [repairs, setRepairs] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [technicians, setTechnicians] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)
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
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setIsFetching(true)
    try {
      const results = await Promise.allSettled([
        getClients(),
        getInstallations(),
        getRepairs(),
        getAppointments(),
        getSettings(),
        getClientRequests(),
        getNotifications(),
        getLeads(),
        getTechnicians()
      ])
      
      if (results[0].status === 'fulfilled') setClients(results[0].value || [])
      if (results[1].status === 'fulfilled') setInstallations(results[1].value || [])
      if (results[2].status === 'fulfilled') setRepairs(results[2].value || [])
      if (results[3].status === 'fulfilled') setAppointments(results[3].value || [])
      if (results[4].status === 'fulfilled') setSettings(results[4].value)
      if (results[5].status === 'fulfilled') setRequests(results[5].value || [])
      if (results[6].status === 'fulfilled') setNotifications(results[6].value || [])
      if (results[7].status === 'fulfilled') setLeads(results[7].value || [])
      if (results[8].status === 'fulfilled') setTechnicians(results[8].value || [])

      if (results.some(r => r.status === 'rejected')) {
        const rejected = results.filter(r => r.status === 'rejected')
        console.error('Some data failed to load:', rejected)
        toast.warning('Some dashboard data could not be loaded')
      }
    } catch (error) {
      console.error('fetchAllData error:', error)
      toast.error('Failed to fetch dashboard data')
    } finally {
      setIsFetching(false)
    }
  }

  const handleViewBookingDetails = (booking: any) => {
    setSelectedBooking(booking)
    setShowBookingDetails(true)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {view === 'dashboard' && (
        <div className="flex flex-col w-full">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#005596] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#005596]">Azelea Admin</h1>
                <p className="text-xs text-gray-500">Welcome back, Administrator</p>
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
              <Button variant="outline" size="sm" onClick={() => setView('settings')} className="hidden sm:flex items-center gap-2 border-gray-200">
                <SettingsIcon className="h-4 w-4" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="flex items-center gap-2 border-gray-200 text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </header>

          <main className="container mx-auto py-8 px-6 space-y-8">
            {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Clients" value={clients.length.toString()} icon={<Users className="text-blue-600" />} />
                <StatCard title="Total Bookings" value={(installations.length + repairs.length).toString()} icon={<Calendar className="text-blue-600" />} />
                <StatCard title="Total Leads" value={leads.length.toString()} icon={<TrendingUp className="text-purple-600" />} />
                <StatCard title="Installations" value={installations.length.toString()} icon={<Wrench className="text-green-600" />} />
                <StatCard title="Repairs" value={repairs.length.toString()} icon={<PenTool className="text-orange-600" />} />
                <StatCard title="Pending Bookings" value={(installations.filter(i => i.status !== 'Completed').length + repairs.filter(r => r.status !== 'Completed').length).toString()} icon={<Clock className="text-yellow-600" />} />
                <StatCard title="Completed" value={(installations.filter(i => i.status === 'Completed').length + repairs.filter(r => r.status === 'Completed').length).toString()} icon={<CheckCircle className="text-green-600" />} />
              </div>


            {/* Recent Bookings */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {installations.length === 0 && repairs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-gray-400">No bookings found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[...installations, ...repairs]
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

            {/* Action Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <ActionCard 
                title="Manage Clients" 
                description="View and manage client records" 
                icon={<UserCheck className="w-8 h-8 text-[#005596]" />}
                onClick={() => setView('clients')}
              />
              <ActionCard 
                title="Installations" 
                description="Monitor installation projects" 
                icon={<Wrench className="w-8 h-8 text-[#005596]" />}
                onClick={() => setView('installations')}
              />
              <ActionCard 
                title="Repairs" 
                description="Track repair requests" 
                icon={<PenTool className="w-8 h-8 text-[#005596]" />}
                onClick={() => setView('repairs')}
              />
              <ActionCard 
                title="Schedule" 
                description="View and manage appointments" 
                icon={<CalendarDays className="w-8 h-8 text-[#005596]" />}
                onClick={() => setView('schedule')}
              />
              <ActionCard 
                title="Reports" 
                description="View business analytics" 
                icon={<BarChart3 className="w-8 h-8 text-[#005596]" />}
                onClick={() => setView('reports')}
              />
                <ActionCard 
                  title="Client Requests" 
                  description="View and manage service requests" 
                  icon={<FileText className="w-8 h-8 text-[#005596]" />}
                  onClick={() => setView('requests')}
                />
                <ActionCard 
                  title="Generated Leads" 
                  description="View leads from landing page" 
                  icon={<TrendingUp className="w-8 h-8 text-[#005596]" />}
                  onClick={() => setView('leads')}
                />
                <ActionCard 
                  title="Settings" 

                description="Configure system preferences" 
                icon={<SettingsIcon className="w-8 h-8 text-[#005596]" />}
                onClick={() => setView('settings')}
              />
              <ActionCard 
                title="Reminders" 
                description="Manage follow-up reminders" 
                icon={<BellRing className="w-8 h-8 text-[#005596]" />}
                onClick={() => setShowReminders(true)}
              />
              <ActionCard 
                  title="Technicians" 
                  description="Manage technician schedules" 
                  icon={<HardHat className="w-8 h-8 text-[#005596]" />}
                  onClick={() => setView('technicians')}
                />
            </div>
          </main>
        </div>
      )}

      {view === 'clients' && (
        <ClientsView 
          clients={clients} 
          isFetching={isFetching} 
          onBack={() => setView('dashboard')} 
          fetchClients={fetchAllData}
        />
      )}

      {view === 'installations' && (
        <InstallationsView 
          installations={installations} 
          clients={clients}
          onBack={() => setView('dashboard')} 
          fetchInstallations={fetchAllData}
          onViewDetails={handleViewBookingDetails}
        />
      )}

      {view === 'repairs' && (
        <RepairsView 
          repairs={repairs} 
          clients={clients}
          onBack={() => setView('dashboard')} 
          fetchRepairs={fetchAllData}
          onViewDetails={handleViewBookingDetails}
        />
      )}

      {view === 'schedule' && (
        <ScheduleView 
          appointments={appointments} 
          onBack={() => setView('dashboard')} 
          fetchAppointments={fetchAllData}
        />
      )}

      {view === 'reports' && (
        <ReportsView 
          installations={installations}
          repairs={repairs}
          clients={clients}
          onBack={() => setView('dashboard')} 
        />
      )}

      {view === 'settings' && (
        <SettingsView 
          settings={settings}
          onBack={() => setView('dashboard')} 
          fetchSettings={fetchAllData}
        />
      )}

      {view === 'requests' && (
        <RequestsView 
          requests={requests}
          onBack={() => setView('dashboard')} 
          fetchRequests={fetchAllData}
        />
      )}

      {view === 'leads' && (
          <LeadsView 
            leads={leads}
            onBack={() => setView('dashboard')} 
            fetchLeads={fetchAllData}
            onGoToClients={() => setView('clients')}
          />
        )}

      {view === 'technicians' && (
        <TechniciansView 
          technicians={technicians}
          onBack={() => setView('dashboard')} 
          fetchTechnicians={fetchAllData}
        />
      )}


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
                  size="xs" 
                  className="text-xs text-blue-600 hover:text-blue-700"
                  onClick={async () => {
                    for (const n of notifications.filter(notif => !notif.is_read)) {
                      await markNotificationAsRead(n.id)
                    }
                    fetchAllData()
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
                      fetchAllData()
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
            <DialogTitle>Booking Details</DialogTitle>
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
                      <span>{selectedBooking.progress}% Completed</span>
                    </div>
                    <Progress value={selectedBooking.progress} className="h-2" />
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
    </div>
  )
}

function LeadsView({ leads, onBack, fetchLeads, onGoToClients }: any) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)

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
        <div className="grid grid-cols-1 gap-4">
          {leads.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No leads found</p>
            </div>
          ) : (
            leads.map((lead: any) => (
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
                        <>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleAddClient(lead.id)}
                            disabled={isLoading}
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Add Client
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
                        </>
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Full Name</p>
                  <p className="text-sm font-bold">{selectedLead.full_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Client Type</p>
                  <p className="text-sm font-bold">{selectedLead.client_type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Email</p>
                  <p className="text-sm">{selectedLead.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Phone</p>
                  <p className="text-sm">{selectedLead.phone_number}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-gray-500 font-medium">Service Address</p>
                  <p className="text-sm">{selectedLead.service_address}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Service Type</p>
                  <p className="text-sm font-bold text-blue-600">{selectedLead.service_type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Preferred Schedule</p>
                  <p className="text-sm">{selectedLead.preferred_date} at {selectedLead.preferred_time}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-gray-500 font-medium">Additional Information</p>
                  <div className="bg-gray-50 p-3 rounded border text-sm italic">
                    {selectedLead.additional_info || 'No additional information provided'}
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

function ClientsView({ clients, isFetching, onBack, fetchClients }: any) {
  const [isLoading, setIsLoading] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showArchived, setShowArchived] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const itemsPerPage = 5

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
      ;(e.target as HTMLFormElement).reset()
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
    const matchesSearch = 
      client.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone?.includes(searchQuery) ||
      client.address?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = typeFilter === 'all' || 
      (client.client_type || 'Residential').toLowerCase() === typeFilter.toLowerCase()
    
    const matchesArchived = showArchived ? client.is_archived === true : client.is_archived !== true
    
    return matchesSearch && matchesType && matchesArchived
  })

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

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
              setCurrentPage(1)
            }}
          >
            {showArchived ? <ArchiveRestore className="h-4 w-4 mr-2" /> : <Archive className="h-4 w-4 mr-2" />}
            {showArchived ? 'Show Active Clients' : 'Show Archived Clients'}
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              className="pl-10" 
              placeholder="Search by name, email, phone, or address..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          <Select value={typeFilter} onValueChange={(val) => { setTypeFilter(val); setCurrentPage(1) }}>
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

        <div className="grid grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Clients</p>
                <p className="text-3xl font-bold text-[#005596]">{activeClientsCount}</p>
              </div>
              <Users className="h-8 w-8 text-gray-300" />
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Residential</p>
                <p className="text-3xl font-bold text-[#005596]">{residentialCount}</p>
              </div>
              <Home className="h-8 w-8 text-gray-300" />
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Corporate</p>
                <p className="text-3xl font-bold text-[#005596]">{corporateCount}</p>
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
            ) : paginatedClients.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>{showArchived ? 'No archived clients found' : 'No clients found'}</p>
              </div>
            ) : (
              paginatedClients.map((client: any) => (
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
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredClients.length)} of {filteredClients.length} clients
                </p>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      className={currentPage === page ? 'bg-[#005596]' : ''}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
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

function InstallationsView({ installations, clients, onBack, fetchInstallations, onViewDetails }: any) {
  const [showAdd, setShowAdd] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [type, setType] = useState('Real-Time')
  const today = new Date().toISOString().split('T')[0]

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

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}><ChevronLeft className="h-4 w-4 mr-2" />Back to Dashboard</Button>
          <div>
            <h1 className="text-xl font-bold text-[#005596]">Installation Monitoring</h1>
            <p className="text-sm text-gray-500">Track and manage installation projects</p>
          </div>
        </div>
        <Button className="bg-[#005596]" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-2" />Add Installation</Button>
      </header>
      <main className="container mx-auto py-8 px-6 space-y-6">
        <Card className="border-none shadow-sm p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input className="pl-10" placeholder="Search installations by client, service type, or technician..." />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Status</SelectItem></SelectContent>
            </Select>
          </div>
        </Card>
        <div className="grid grid-cols-4 gap-6">
          <MiniStatCard title="Total Installations" value={installations.length.toString()} icon={<Wrench className="text-blue-600" />} />
          <MiniStatCard title="Scheduled" value={installations.filter((i: any) => i.status === 'Scheduled').length.toString()} icon={<Calendar className="text-yellow-600" />} />
          <MiniStatCard title="In Progress" value={installations.filter((i: any) => i.status === 'In Progress').length.toString()} icon={<Clock className="text-blue-600" />} />
          <MiniStatCard title="Completed" value={installations.filter((i: any) => i.status === 'Completed').length.toString()} icon={<CheckCircle className="text-green-600" />} />
        </div>
        <div className="space-y-4">
          <h2 className="font-bold text-[#005596]">Installations ({installations.length})</h2>
          {installations.map((item: any) => (
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
                    <span>Installation Progress</span>
                    <span>{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
          {installations.length === 0 && <div className="text-center py-12 text-gray-400">No installations found</div>}
        </div>
      </main>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Installation (from existing client)</DialogTitle></DialogHeader>
          <div className="py-4 space-y-6">
            <div className="space-y-2">
              <Label>Installation Type *</Label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setType('Real-Time')}
                  className={`p-6 border rounded-xl text-center space-y-2 transition-all ${type === 'Real-Time' ? 'border-[#005596] bg-blue-50 ring-2 ring-[#005596]/10' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <Clock className="mx-auto h-8 w-8 text-[#005596]" />
                  <div className="font-bold">Real-Time Installation</div>
                  <div className="text-xs text-gray-500">Start immediately</div>
                </button>
                <button 
                  onClick={() => setType('Schedule')}
                  className={`p-6 border rounded-xl text-center space-y-2 transition-all ${type === 'Schedule' ? 'border-[#005596] bg-blue-50 ring-2 ring-[#005596]/10' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <Calendar className="mx-auto h-8 w-8 text-[#005596]" />
                  <div className="font-bold">Schedule Installation</div>
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
                    <SelectContent>
                      {clients.map((c: any) => <SelectItem key={c.id} value={c.full_name}>{c.full_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Service Type *</Label>
                  <Select name="serviceType" required>
                    <SelectTrigger><SelectValue placeholder="Select installation type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Air Conditioning Installation">Air Conditioning Installation</SelectItem>
                      <SelectItem value="Split Type Installation">Split Type Installation</SelectItem>
                      <SelectItem value="Window Type Installation">Window Type Installation</SelectItem>
                      <SelectItem value="Inverter Installation">Inverter Installation</SelectItem>
                      <SelectItem value="Central AC Installation">Central AC Installation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Technician *</Label>
                <Select name="technician" required>
                  <SelectTrigger><SelectValue placeholder="Select technician" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chris">Chris</SelectItem>
                    <SelectItem value="Emman">Emman</SelectItem>
                    <SelectItem value="Carlos">Carlos</SelectItem>
                    <SelectItem value="Arnold">Arnold</SelectItem>
                    <SelectItem value="Bobby">Bobby</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label>Cost *</Label>
                  <Select name="cost" required>
                    <SelectTrigger><SelectValue placeholder="Select cost" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="₱1,500">₱1,500</SelectItem>
                      <SelectItem value="₱2,500">₱2,500</SelectItem>
                      <SelectItem value="₱3,500">₱3,500</SelectItem>
                      <SelectItem value="₱5,000">₱5,000</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Date *</Label>
                  <Input name="date" type="date" min={today} required />
                </div>
                <div className="space-y-1">
                  <Label>Time *</Label>
                  <Input name="time" type="time" required />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Address *</Label>
                <Input name="address" placeholder="Installation address" required />
              </div>

              <div className="space-y-1">
                <Label>Notes</Label>
                <Textarea name="notes" placeholder="Additional notes" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#005596]" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add Installation
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function RepairsView({ repairs, clients, onBack, fetchRepairs, onViewDetails }: any) {
  const [showAdd, setShowAdd] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [type, setType] = useState('Real-Time')
  const today = new Date().toISOString().split('T')[0]

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.append('type', type)
    const result = await createRepair(formData)
    if (result.error) toast.error(result.error)
    else {
      toast.success('Repair added')
      fetchRepairs()
      setShowAdd(false)
    }
    setIsLoading(false)
  }

  const handleComplete = async (id: string) => {
    const result = await markRepairComplete(id)
    if (result.error) toast.error(result.error)
    else {
      toast.success('Repair marked as completed')
      fetchRepairs()
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}><ChevronLeft className="h-4 w-4 mr-2" />Back to Dashboard</Button>
          <div>
            <h1 className="text-xl font-bold text-[#005596]">Repairs Monitoring</h1>
            <p className="text-sm text-gray-500">Track and manage repair requests</p>
          </div>
        </div>
        <Button className="bg-[#005596]" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-2" />Add Repair</Button>
      </header>
      <main className="container mx-auto py-8 px-6 space-y-6">
        <Card className="border-none shadow-sm p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input className="pl-10" placeholder="Search repairs by client, service type, or technician..." />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Status</SelectItem></SelectContent>
            </Select>
          </div>
        </Card>
        <div className="grid grid-cols-4 gap-6">
          <MiniStatCard title="Total Repairs" value={repairs.length.toString()} icon={<PenTool className="text-blue-600" />} />
          <MiniStatCard title="In Progress" value={repairs.filter((r: any) => r.status === 'In Progress').length.toString()} icon={<Clock className="text-blue-600" />} />
          <MiniStatCard title="Scheduled" value={repairs.filter((r: any) => r.status === 'Scheduled').length.toString()} icon={<Calendar className="text-yellow-600" />} />
          <MiniStatCard title="Completed" value={repairs.filter((r: any) => r.status === 'Completed').length.toString()} icon={<CheckCircle className="text-green-600" />} />
        </div>
        <div className="space-y-4">
          <h2 className="font-bold text-[#005596]">Repairs ({repairs.length})</h2>
          {repairs.map((item: any) => (
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
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-medium"><span>Progress</span><span>{item.progress}%</span></div>
                  <Progress value={item.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
          {repairs.length === 0 && <div className="text-center py-12 text-gray-400">No repairs found</div>}
        </div>
      </main>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Repair (from existing client)</DialogTitle></DialogHeader>
          <div className="py-4 space-y-6">
            <div className="space-y-2">
              <Label>Repair Type *</Label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setType('Real-Time')}
                  className={`p-6 border rounded-xl text-center space-y-2 transition-all ${type === 'Real-Time' ? 'border-[#005596] bg-blue-50 ring-2 ring-[#005596]/10' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <Clock className="mx-auto h-8 w-8 text-[#005596]" />
                  <div className="font-bold">Real-Time Repair</div>
                  <div className="text-xs text-gray-500">Start immediately</div>
                </button>
                <button 
                  onClick={() => setType('Schedule')}
                  className={`p-6 border rounded-xl text-center space-y-2 transition-all ${type === 'Schedule' ? 'border-[#005596] bg-blue-50 ring-2 ring-[#005596]/10' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <Calendar className="mx-auto h-8 w-8 text-[#005596]" />
                  <div className="font-bold">Schedule Repair</div>
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
                    <SelectContent>
                      {clients.map((c: any) => <SelectItem key={c.id} value={c.full_name}>{c.full_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Service Type *</Label>
                  <Select name="serviceType" required>
                    <SelectTrigger><SelectValue placeholder="Select repair type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Air Conditioning Repair">Air Conditioning Repair</SelectItem>
                      <SelectItem value="Compressor Repair">Compressor Repair</SelectItem>
                      <SelectItem value="Refrigerant Leak Repair">Refrigerant Leak Repair</SelectItem>
                      <SelectItem value="Electrical Issue Repair">Electrical Issue Repair</SelectItem>
                      <SelectItem value="Thermostat Repair">Thermostat Repair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Technician *</Label>
                <Select name="technician" required>
                  <SelectTrigger><SelectValue placeholder="Select technician" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chris">Chris</SelectItem>
                    <SelectItem value="Emman">Emman</SelectItem>
                    <SelectItem value="Carlos">Carlos</SelectItem>
                    <SelectItem value="Arnold">Arnold</SelectItem>
                    <SelectItem value="Bobby">Bobby</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label>Cost *</Label>
                  <Select name="cost" required>
                    <SelectTrigger><SelectValue placeholder="Select cost" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="₱500">₱500</SelectItem>
                      <SelectItem value="₱1,000">₱1,000</SelectItem>
                      <SelectItem value="₱1,500">₱1,500</SelectItem>
                      <SelectItem value="₱2,500">₱2,500</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Date *</Label>
                  <Input name="date" type="date" min={today} required />
                </div>
                <div className="space-y-1">
                  <Label>Time *</Label>
                  <Input name="time" type="time" required />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Address *</Label>
                <Input name="address" placeholder="Repair address" required />
              </div>

              <div className="space-y-1">
                <Label>Notes</Label>
                <Textarea name="notes" placeholder="Additional notes" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#005596]" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add Repair
                </Button>
              </div>
            </form>
          </div>
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
  
  const today = new Date().toISOString().split('T')[0]

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  })

  const getDayAppointments = (day: Date) => {
    return appointments.filter((apt: any) => isSameDay(parseISO(apt.date), day))
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

  const todayAppointments = appointments.filter((apt: any) => 
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
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
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
                <div key={apt.id} className="p-4 border rounded-xl space-y-3 bg-gray-50/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className="mb-2 bg-blue-100 text-blue-700 border-blue-200">
                        {apt.service_type}
                      </Badge>
                      <h4 className="font-bold text-[#005596] text-lg">{apt.client_name}</h4>
                    </div>
                    <span className="font-bold text-blue-600 bg-white px-2 py-1 rounded border shadow-sm text-sm">
                      {apt.time}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                      <span>{apt.address}</span>
                    </div>
                    {apt.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{apt.phone}</span>
                      </div>
                    )}
                    {apt.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{apt.email}</span>
                      </div>
                    )}
                    {apt.cost && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-[#005596]">{apt.cost}</span>
                      </div>
                    )}
                  </div>
                  
                  {apt.notes && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-gray-100 text-sm italic text-gray-500">
                      "{apt.notes}"
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setShowDayDetails(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ReportsView({ installations, repairs, clients, onBack }: any) {
  const completedInstallations = installations.filter((i: any) => i.status === 'Completed')
  const completedRepairs = repairs.filter((r: any) => r.status === 'Completed')
  
  const calculateTotal = (items: any[]) => {
    return items.reduce((acc, item) => {
      const val = parseInt(item.cost?.replace(/[^0-9]/g, '') || '0')
      return acc + val
    }, 0)
  }

  const totalRevenue = calculateTotal([...completedInstallations, ...completedRepairs])

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}><ChevronLeft className="h-4 w-4 mr-2" />Back to Dashboard</Button>
          <div>
            <h1 className="text-xl font-bold text-[#005596]">Reports</h1>
            <p className="text-sm text-gray-500">Overall summary (no analytics/graphs)</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export CSV</Button>
          <Button variant="outline" size="sm"><FileText className="h-4 w-4 mr-2" />Export PDF</Button>
        </div>
      </header>
      <main className="container mx-auto py-8 px-6 space-y-8">
        <div className="grid grid-cols-4 gap-6">
          <ReportStatCard title="Total Revenue" value={`₱${totalRevenue.toLocaleString()}`} icon={<TrendingUp className="text-green-500" />} />
          <ReportStatCard title="Profit" value={`₱${(totalRevenue * 0.4).toLocaleString()}`} icon={<TrendingUp className="text-blue-500" />} />
          <ReportStatCard title="Services Completed" value={(completedInstallations.length + completedRepairs.length).toString()} icon={<Calendar className="text-blue-500" />} />
          <ReportStatCard title="Total Clients" value={clients.length.toString()} icon={<Users className="text-purple-500" />} />
        </div>
        <Card className="border-none shadow-sm">
          <CardHeader><CardTitle className="text-lg">Recent Bookings</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[...installations, ...repairs].length === 0 ? <p className="text-center py-12 text-gray-400">No bookings found</p> : (
              [...installations, ...repairs]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg">
                  <div className="space-y-1">
                    <p className="font-bold text-[#005596] capitalize">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.date} - {item.time || '09:00'}</p>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="font-bold">{item.cost || '₱0'}</p>
                      <p className={`text-[10px] font-bold uppercase ${item.status === 'Completed' ? 'text-green-500' : 'text-red-500'}`}>{item.status}</p>
                    </div>
                    <Button variant="outline" size="sm" className="h-8"><FileText className="h-3 w-3 mr-2" />Receipt</Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>
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
          <TabsList className="w-full justify-start h-12 bg-white border border-gray-200 p-1 mb-8">
            <TabsTrigger value="company" className="flex items-center gap-2"><Building2 className="h-4 w-4" /> Company</TabsTrigger>
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
                      onCheckedChange={(val) => setNotifSettings({...notifSettings, email_notifications: val})}
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
                      onCheckedChange={(val) => setNotifSettings({...notifSettings, sms_notifications: val})}
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
                      onCheckedChange={(val) => setNotifSettings({...notifSettings, push_notifications: val})}
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
                      onCheckedChange={(val) => setNotifSettings({...notifSettings, new_booking_alert: val})}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-[#005596]">Booking Update Alerts</p>
                      <p className="text-sm text-gray-500">Get notified when bookings are updated or cancelled</p>
                    </div>
                    <Switch 
                      checked={notifSettings.booking_update_alert} 
                      onCheckedChange={(val) => setNotifSettings({...notifSettings, booking_update_alert: val})}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-[#005596]">Payment Alerts</p>
                      <p className="text-sm text-gray-500">Get notified on payment status changes</p>
                    </div>
                    <Switch 
                      checked={notifSettings.payment_alert} 
                      onCheckedChange={(val) => setNotifSettings({...notifSettings, payment_alert: val})}
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
                      onCheckedChange={(val) => setReminderSettings({...reminderSettings, reminder_enabled: val})}
                    />
                  </div>
                  {reminderSettings.reminder_enabled && (
                    <div className="p-4 border rounded-lg space-y-4">
                      <div className="space-y-2">
                        <Label>Send Reminder Before (hours)</Label>
                        <Select 
                          value={reminderSettings.reminder_hours_before.toString()} 
                          onValueChange={(val) => setReminderSettings({...reminderSettings, reminder_hours_before: parseInt(val)})}
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
                      onCheckedChange={(val) => setReminderSettings({...reminderSettings, follow_up_enabled: val})}
                    />
                  </div>
                  {reminderSettings.follow_up_enabled && (
                    <div className="p-4 border rounded-lg space-y-4">
                      <div className="space-y-2">
                        <Label>Send Follow-up After (days)</Label>
                        <Select 
                          value={reminderSettings.follow_up_days_after.toString()} 
                          onValueChange={(val) => setReminderSettings({...reminderSettings, follow_up_days_after: parseInt(val)})}
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
                      onCheckedChange={(val) => setReminderSettings({...reminderSettings, maintenance_reminder_enabled: val})}
                    />
                  </div>
                  {reminderSettings.maintenance_reminder_enabled && (
                    <div className="p-4 border rounded-lg space-y-4">
                      <div className="space-y-2">
                        <Label>Remind Every (months)</Label>
                        <Select 
                          value={reminderSettings.maintenance_reminder_months.toString()} 
                          onValueChange={(val) => setReminderSettings({...reminderSettings, maintenance_reminder_months: parseInt(val)})}
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
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input 
                      type="password" 
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input 
                      type="password" 
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
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
                      onCheckedChange={(val) => setSecuritySettings({...securitySettings, two_factor_enabled: val})}
                    />
                  </div>

                  <div className="p-4 border rounded-lg space-y-4">
                    <div className="space-y-2">
                      <Label>Session Timeout (minutes)</Label>
                      <Select 
                        value={securitySettings.session_timeout_minutes.toString()} 
                        onValueChange={(val) => setSecuritySettings({...securitySettings, session_timeout_minutes: parseInt(val)})}
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
                        onValueChange={(val) => setSecuritySettings({...securitySettings, require_password_change_days: parseInt(val)})}
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

function RequestsView({ requests, onBack, fetchRequests }: any) {
  const [isLoading, setIsLoading] = useState(false)

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
        <div className="grid grid-cols-1 gap-4">
          {requests.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No client requests found</p>
            </div>
          ) : (
            requests.map((request: any) => (
              <Card key={request.id} className="border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <Badge className={
                          request.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                          request.status === 'Rejected' ? 'bg-red-100 text-red-700' : 
                          'bg-yellow-100 text-yellow-700'
                        }>
                          {request.status}
                        </Badge>
                        <h3 className="font-bold text-lg text-[#005596]">{request.request_type}</h3>
                        <span className="text-sm text-gray-400">• {format(parseISO(request.created_at), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <p className="text-gray-500 font-medium">Client</p>
                          <p className="text-[#005596] flex items-center gap-2"><UserCheck className="h-4 w-4" /> {request.client_name}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 font-medium">Preferred Schedule</p>
                          <p className="text-[#005596] flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> {request.preferred_date} at {request.preferred_time}
                          </p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 italic">"{request.message || 'No message provided'}"</p>
                      </div>
                    </div>
                    {request.status === 'Pending' && (
                      <div className="flex gap-2 ml-6">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleStatusUpdate(request.id, 'Approved')}
                          disabled={isLoading}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleStatusUpdate(request.id, 'Rejected')}
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
      ;(e.target as HTMLFormElement).reset()
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

  const activeCount = technicians.filter((t: any) => t.status === 'Active').length
  const inactiveCount = technicians.filter((t: any) => t.status === 'Inactive').length
  const onLeaveCount = technicians.filter((t: any) => t.status === 'On Leave').length

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
        <div className="grid grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Technicians</p>
                <p className="text-3xl font-bold text-[#005596]">{technicians.length}</p>
              </div>
              <HardHat className="h-8 w-8 text-gray-300" />
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-3xl font-bold text-green-600">{activeCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-gray-300" />
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">On Leave</p>
                <p className="text-3xl font-bold text-yellow-600">{onLeaveCount}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-300" />
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Inactive</p>
                <p className="text-3xl font-bold text-red-600">{inactiveCount}</p>
              </div>
              <X className="h-8 w-8 text-gray-300" />
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
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
        </div>

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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Technician</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTechnician} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input name="fullName" placeholder="Juan Dela Cruz" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input name="email" type="email" placeholder="juan@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input name="phone" placeholder="09XXXXXXXXX" maxLength={11} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Specialization</Label>
              <Select name="specialization" defaultValue="General">
                <SelectTrigger>
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Installation">Installation</SelectItem>
                  <SelectItem value="Repair">Repair</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Split Type">Split Type</SelectItem>
                  <SelectItem value="Window Type">Window Type</SelectItem>
                  <SelectItem value="Central AC">Central AC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Hire Date</Label>
              <Input name="hireDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea name="notes" placeholder="Any additional notes..." />
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Technician</DialogTitle>
          </DialogHeader>
          {selectedTechnician && (
            <form onSubmit={handleUpdateTechnician} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input name="fullName" defaultValue={selectedTechnician.full_name} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input name="email" type="email" defaultValue={selectedTechnician.email} />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input name="phone" defaultValue={selectedTechnician.phone} maxLength={11} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Specialization</Label>
                <Select name="specialization" defaultValue={selectedTechnician.specialization || 'General'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Installation">Installation</SelectItem>
                    <SelectItem value="Repair">Repair</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Split Type">Split Type</SelectItem>
                    <SelectItem value="Window Type">Window Type</SelectItem>
                    <SelectItem value="Central AC">Central AC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea name="notes" defaultValue={selectedTechnician.notes} placeholder="Any additional notes..." />
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Technician Details</DialogTitle>
          </DialogHeader>
          {selectedTechnician && (
            <div className="space-y-6 py-4">
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
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Email</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {selectedTechnician.email || 'Not provided'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium">Phone</p>
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
                  <p className="text-xs text-gray-500 font-medium">Created At</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    {selectedTechnician.created_at ? format(parseISO(selectedTechnician.created_at), 'MMM d, yyyy') : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-gray-500 font-medium">Notes</p>
                  <div className="bg-gray-50 p-3 rounded border text-sm italic">
                    {selectedTechnician.notes || 'No notes provided'}
                  </div>
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
