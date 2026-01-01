'use client'

import { useState, useEffect } from 'react'
import { createClientUser, getClients } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { toast } from 'sonner'
import { Loader2, Copy, CheckCircle2 } from 'lucide-react'

export default function AdminDashboard() {
  const [clients, setClients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)

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

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
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
                <Input id="fullName" name="fullName" placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" placeholder="john@example.com" required />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Client
              </Button>
            </form>

            {generatedPassword && (
              <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-primary flex items-center gap-2">
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
                <p className="text-2xl font-mono font-bold break-all">{generatedPassword}</p>
                <p className="text-xs text-muted-foreground">
                  Please copy this password and share it securely with the client.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
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
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
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
    </div>
  )
}
