'use client'

import { useState, useEffect } from 'react'
import { createClientUser, getClients } from '@/app/actions/admin'
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
  Settings,
  LogOut,
  ChevronLeft,
  LayoutDashboard,
  CalendarDays,
  BarChart3,
  BellRing,
  UserCheck
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type View = 'dashboard' | 'clients'

export default function AdminDashboard() {
  const [view, setView] = useState<View>('dashboard')
  const [clients, setClients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const data = await getClients()
      setClients(data || [])
    } catch (error) {
      toast.error('Failed to fetch clients')
    } finally {
      setIsFetching(false)
    }
  }

  const handleCreateClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setGeneratedPassword(null)

    const formData = new FormData(e.currentTarget)
    const result = await createClientUser(formData)

    if (result.error) {
      toast.error(result.error)
    } else if (result.success && result.password) {
      toast.success('Client created successfully')
      setGeneratedPassword(result.password)
      fetchClients()
      ;(e.target as HTMLFormElement).reset()
    }
    setIsLoading(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Password copied to clipboard')
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (view === 'clients') {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setView('dashboard')}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
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
              <CardHeader>
                <CardTitle>Create New Client</CardTitle>
                <CardDescription>
                  Add a new client to the system. A password will be auto-generated.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateClient} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" name="fullName" placeholder="John Doe" required className="bg-gray-50 border-gray-200" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" name="email" type="email" placeholder="john@example.com" required className="bg-gray-50 border-gray-200" />
                  </div>
                  <Button type="submit" className="w-full bg-[#0F172A] hover:bg-[#1E293B]" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Client
                  </Button>
                </form>

                {generatedPassword && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-700 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Generated Password
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyToClipboard(generatedPassword)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-2xl font-mono font-bold break-all text-blue-900">{generatedPassword}</p>
                    <p className="text-xs text-blue-600">
                      Please copy this password and share it securely with the client.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Client List</CardTitle>
                <CardDescription>
                  Manage your existing clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isFetching ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : clients.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No clients found</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="font-semibold text-[#0F172A]">Name</TableHead>
                        <TableHead className="font-semibold text-[#0F172A]">Email</TableHead>
                        <TableHead className="font-semibold text-[#0F172A]">Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.map((client) => (
                        <TableRow key={client.id} className="hover:bg-gray-50/50">
                          <TableCell className="font-medium">{client.full_name}</TableCell>
                          <TableCell>{client.email}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(client.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
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
          <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2 border-gray-200">
            <Settings className="h-4 w-4" />
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
          <StatCard title="Total Bookings" value="7" icon={<Calendar className="text-blue-600" />} />
          <StatCard title="Installations" value="6" icon={<Wrench className="text-green-600" />} />
          <StatCard title="Repairs" value="2" icon={<PenTool className="text-orange-600" />} />
          <StatCard title="Pending Bookings" value="0" icon={<Clock className="text-yellow-600" />} />
          <StatCard title="Completed" value="0" icon={<CheckCircle className="text-green-600" />} />
          <StatCard title="Today's Bookings" value="0" icon={<TrendingUp className="text-blue-600" />} />
        </div>

        {/* Recent Bookings */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-gray-400">No bookings found</p>
            </div>
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
          />
          <ActionCard 
            title="Repairs" 
            description="Track repair requests" 
            icon={<PenTool className="w-8 h-8 text-[#0F172A]" />}
          />
          <ActionCard 
            title="Schedule" 
            description="View and manage appointments" 
            icon={<CalendarDays className="w-8 h-8 text-[#0F172A]" />}
          />
          <ActionCard 
            title="Reports" 
            description="View business analytics" 
            icon={<BarChart3 className="w-8 h-8 text-[#0F172A]" />}
          />
          <ActionCard 
            title="Settings" 
            description="Configure system preferences" 
            icon={<Settings className="w-8 h-8 text-[#0F172A]" />}
          />
          <ActionCard 
            title="Reminders" 
            description="Manage follow-up reminders" 
            icon={<BellRing className="w-8 h-8 text-[#0F172A]" />}
          />
          <ActionCard 
            title="Technicians" 
            description="Manage technician schedules" 
            icon={<Users className="w-8 h-8 text-[#0F172A]" />}
          />
        </div>
      </main>
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
