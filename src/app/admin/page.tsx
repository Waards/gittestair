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
  markRepairComplete
} from '@/app/actions/admin'
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
  X
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type View = 'dashboard' | 'clients' | 'installations' | 'repairs' | 'schedule' | 'reports' | 'settings'

export default function AdminDashboard() {
  const [view, setView] = useState<View>('dashboard')
  const [clients, setClients] = useState<any[]>([])
  const [installations, setInstallations] = useState<any[]>([])
  const [repairs, setRepairs] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)
  const [showReminders, setShowReminders] = useState(false)
  const [showTechnicians, setShowTechnicians] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setIsFetching(true)
    try {
      const [clientsData, installData, repairsData, apptsData, settingsData] = await Promise.all([
        getClients(),
        getInstallations(),
        getRepairs(),
        getAppointments(),
        getSettings()
      ])
      setClients(clientsData || [])
      setInstallations(installData || [])
      setRepairs(repairsData || [])
      setAppointments(apptsData || [])
      setSettings(settingsData)
    } catch (error) {
      toast.error('Failed to fetch dashboard data')
    } finally {
      setIsFetching(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (view === 'clients') return <ClientsView 
    clients={clients} 
    isFetching={isFetching} 
    onBack={() => setView('dashboard')} 
    fetchClients={fetchAllData}
  />
  
  if (view === 'installations') return <InstallationsView 
    installations={installations} 
    clients={clients}
    onBack={() => setView('dashboard')} 
    fetchInstallations={fetchAllData}
  />

  if (view === 'repairs') return <RepairsView 
    repairs={repairs} 
    clients={clients}
    onBack={() => setView('dashboard')} 
    fetchRepairs={fetchAllData}
  />

  if (view === 'schedule') return <ScheduleView 
    appointments={appointments} 
    onBack={() => setView('dashboard')} 
    fetchAppointments={fetchAllData}
  />

  if (view === 'reports') return <ReportsView 
    installations={installations}
    repairs={repairs}
    clients={clients}
    onBack={() => setView('dashboard')} 
  />

  if (view === 'settings') return <SettingsView 
    settings={settings}
    onBack={() => setView('dashboard')} 
    fetchSettings={fetchAllData}
  />

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0F172A] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#0F172A]">Azelea Admin</h1>
            <p className="text-xs text-gray-500">Welcome back, Administrator</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2 border-gray-200">
            <Bell className="h-4 w-4" />
            Send Notification
          </Button>
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
          <StatCard title="Installations" value={installations.length.toString()} icon={<Wrench className="text-green-600" />} />
          <StatCard title="Repairs" value={repairs.length.toString()} icon={<PenTool className="text-orange-600" />} />
          <StatCard title="Pending Bookings" value={(installations.filter(i => i.status !== 'Completed').length + repairs.filter(r => r.status !== 'Completed').length).toString()} icon={<Clock className="text-yellow-600" />} />
          <StatCard title="Completed" value={(installations.filter(i => i.status === 'Completed').length + repairs.filter(r => r.status === 'Completed').length).toString()} icon={<CheckCircle className="text-green-600" />} />
          <StatCard title="Today's Bookings" value={(installations.filter(i => i.date === new Date().toISOString().split('T')[0]).length + repairs.filter(r => r.date === new Date().toISOString().split('T')[0]).length).toString()} icon={<TrendingUp className="text-blue-600" />} />
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
                        <p className="font-bold text-[#0F172A]">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.client_name} • {item.date}</p>
                      </div>
                    </div>
                    <Badge variant={item.status === 'Completed' ? 'default' : 'secondary'} className={item.status === 'Completed' ? 'bg-green-100 text-green-700 border-green-200' : ''}>
                      {item.status}
                    </Badge>
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
            icon={<UserCheck className="w-8 h-8 text-[#0F172A]" />}
            onClick={() => setView('clients')}
          />
          <ActionCard 
            title="Installations" 
            description="Monitor installation projects" 
            icon={<Wrench className="w-8 h-8 text-[#0F172A]" />}
            onClick={() => setView('installations')}
          />
          <ActionCard 
            title="Repairs" 
            description="Track repair requests" 
            icon={<PenTool className="w-8 h-8 text-[#0F172A]" />}
            onClick={() => setView('repairs')}
          />
          <ActionCard 
            title="Schedule" 
            description="View and manage appointments" 
            icon={<CalendarDays className="w-8 h-8 text-[#0F172A]" />}
            onClick={() => setView('schedule')}
          />
          <ActionCard 
            title="Reports" 
            description="View business analytics" 
            icon={<BarChart3 className="w-8 h-8 text-[#0F172A]" />}
            onClick={() => setView('reports')}
          />
          <ActionCard 
            title="Settings" 
            description="Configure system preferences" 
            icon={<SettingsIcon className="w-8 h-8 text-[#0F172A]" />}
            onClick={() => setView('settings')}
          />
          <ActionCard 
            title="Reminders" 
            description="Manage follow-up reminders" 
            icon={<BellRing className="w-8 h-8 text-[#0F172A]" />}
            onClick={() => setShowReminders(true)}
          />
          <ActionCard 
            title="Technicians" 
            description="Manage technician schedules" 
            icon={<Users className="w-8 h-8 text-[#0F172A]" />}
            onClick={() => setShowTechnicians(true)}
          />
        </div>
      </main>

      {/* Modals */}
      <Dialog open={showReminders} onOpenChange={setShowReminders}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Upcoming Reminders
            </DialogTitle>
          </DialogHeader>
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
            <p className="text-gray-500">No upcoming reminders</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTechnicians} onOpenChange={setShowTechnicians}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Technicians</DialogTitle>
          </DialogHeader>
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
            <p className="text-gray-500">No technicians found</p>
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
            <p className="text-3xl font-bold text-[#0F172A]">{value}</p>
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
        <h3 className="font-bold text-[#0F172A]">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </Card>
  )
}

// VIEW COMPONENTS

function ClientsView({ clients, isFetching, onBack, fetchClients }: any) {
  const [isLoading, setIsLoading] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)

  const handleCreateClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setGeneratedPassword(null)
    const formData = new FormData(e.currentTarget)
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

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-xl font-bold text-[#0F172A]">Manage Clients</h1>
            <p className="text-sm text-gray-500">Add and manage client accounts</p>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-8 px-4 space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle>Create New Client</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleCreateClient} className="space-y-4">
                <div className="space-y-2"><Label>Full Name</Label><Input name="fullName" placeholder="John Doe" required /></div>
                <div className="space-y-2"><Label>Email Address</Label><Input name="email" type="email" placeholder="john@example.com" required /></div>
                <Button type="submit" className="w-full bg-[#0F172A]" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Client
                </Button>
              </form>
              {generatedPassword && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg space-y-2">
                  <span className="text-sm font-medium text-blue-700">Generated Password (select and copy)</span>
                  <Input 
                    readOnly 
                    value={generatedPassword} 
                    className="text-lg font-mono font-bold text-blue-900 bg-white border-blue-200 select-all"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle>Client List</CardTitle></CardHeader>
            <CardContent>
              {isFetching ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : (
                <Table>
                  <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {clients.map((client: any) => (
                      <TableRow key={client.id}><TableCell>{client.full_name}</TableCell><TableCell>{client.email}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function InstallationsView({ installations, clients, onBack, fetchInstallations }: any) {
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
            <h1 className="text-xl font-bold text-[#0F172A]">Installation Monitoring</h1>
            <p className="text-sm text-gray-500">Track and manage installation projects</p>
          </div>
        </div>
        <Button className="bg-[#0F172A]" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-2" />Add Installation</Button>
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
          <h2 className="font-bold text-[#0F172A]">Installations ({installations.length})</h2>
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
                        <h3 className="font-bold text-[#0F172A]">{item.title}</h3>
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
                    <Button variant="outline" size="sm">View Details</Button>
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
                  className={`p-6 border rounded-xl text-center space-y-2 transition-all ${type === 'Real-Time' ? 'border-[#0F172A] bg-blue-50 ring-2 ring-[#0F172A]/10' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <Clock className="mx-auto h-8 w-8 text-[#0F172A]" />
                  <div className="font-bold">Real-Time Installation</div>
                  <div className="text-xs text-gray-500">Start immediately</div>
                </button>
                <button 
                  onClick={() => setType('Schedule')}
                  className={`p-6 border rounded-xl text-center space-y-2 transition-all ${type === 'Schedule' ? 'border-[#0F172A] bg-blue-50 ring-2 ring-[#0F172A]/10' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <Calendar className="mx-auto h-8 w-8 text-[#0F172A]" />
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
                <Button type="submit" className="bg-[#0F172A]" disabled={isLoading}>
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

function RepairsView({ repairs, clients, onBack, fetchRepairs }: any) {
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
            <h1 className="text-xl font-bold text-[#0F172A]">Repairs Monitoring</h1>
            <p className="text-sm text-gray-500">Track and manage repair requests</p>
          </div>
        </div>
        <Button className="bg-[#0F172A]" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-2" />Add Repair</Button>
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
          <h2 className="font-bold text-[#0F172A]">Repairs ({repairs.length})</h2>
          {repairs.map((item: any) => (
            <Card key={item.id} className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#0F172A]">{item.title}</h3>
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
                    <Button variant="outline" size="sm">View Details</Button>
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
                  className={`p-6 border rounded-xl text-center space-y-2 transition-all ${type === 'Real-Time' ? 'border-[#0F172A] bg-blue-50 ring-2 ring-[#0F172A]/10' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <Clock className="mx-auto h-8 w-8 text-[#0F172A]" />
                  <div className="font-bold">Real-Time Repair</div>
                  <div className="text-xs text-gray-500">Start immediately</div>
                </button>
                <button 
                  onClick={() => setType('Schedule')}
                  className={`p-6 border rounded-xl text-center space-y-2 transition-all ${type === 'Schedule' ? 'border-[#0F172A] bg-blue-50 ring-2 ring-[#0F172A]/10' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <Calendar className="mx-auto h-8 w-8 text-[#0F172A]" />
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
                <Button type="submit" className="bg-[#0F172A]" disabled={isLoading}>
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
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
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
            <h1 className="text-xl font-bold text-[#0F172A]">Calendar & Schedule</h1>
            <p className="text-sm text-gray-500">Manage appointments and bookings</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-[#0F172A] h-9" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-2" />Add Appointment</Button>
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
                        <span className="font-bold text-[#0F172A]">{apt.time}</span>
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
              <div className="space-y-1"><Label>Phone Number</Label><Input name="phone" placeholder="+63" required /></div>
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
              <Button type="submit" className="bg-[#0F172A]" disabled={isLoading}>
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
                      <h4 className="font-bold text-[#0F172A] text-lg">{apt.client_name}</h4>
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
                        <span className="font-medium text-[#0F172A]">{apt.cost}</span>
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
            <h1 className="text-xl font-bold text-[#0F172A]">Reports</h1>
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
                    <p className="font-bold text-[#0F172A] capitalize">{item.title}</p>
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

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await updateSettings(formData)
    if (result.error) toast.error(result.error)
    else {
      toast.success('Settings updated')
      fetchSettings()
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}><ChevronLeft className="h-4 w-4 mr-2" />Back to Dashboard</Button>
          <div>
            <h1 className="text-xl font-bold text-[#0F172A]">Settings</h1>
            <p className="text-sm text-gray-500">Manage system configuration and preferences</p>
          </div>
        </div>
        <Button className="bg-[#0F172A]" type="submit" form="settings-form" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
        </Button>
      </header>
      <main className="container mx-auto py-8 px-6 space-y-6">
        <Tabs defaultValue="company" className="w-full">
          <TabsList className="w-full justify-start h-12 bg-white border border-gray-200 p-1 mb-8">
            <TabsTrigger value="company" className="flex items-center gap-2"><Building2 className="h-4 w-4" /> Company</TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2"><BellDot className="h-4 w-4" /> Notifications</TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2"><Cpu className="h-4 w-4" /> System</TabsTrigger>
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
                  <div className="space-y-2"><Label>Company Phone</Label><Input name="companyPhone" defaultValue={settings?.company_phone} /></div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select name="timezone" defaultValue={settings?.timezone || 'Asia/Manila'}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Asia/Manila">Asia/Manila</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2"><Label>Company Address</Label><Textarea name="companyAddress" defaultValue={settings?.company_address} /></div>
                </form>
              </CardContent>
            </Card>
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
        <p className="text-3xl font-bold text-[#0F172A]">{value}</p>
      </CardContent>
    </Card>
  )
}

function ReportStatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-6 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-[#0F172A]">{value}</p>
        </div>
        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}
