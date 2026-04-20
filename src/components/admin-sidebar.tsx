'use client'

import { useState } from 'react'
import {
  Users,
  Wrench,
  PenTool,
  CalendarDays,
  BarChart3,
  FileText,
  TrendingUp,
  Settings as SettingsIcon,
  HardHat,
  Bell,
  LogOut,
  Home,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type View = 'dashboard' | 'clients' | 'corporate' | 'installations' | 'repairs' | 'maintenance' | 'schedule' | 'reports' | 'settings' | 'requests' | 'leads' | 'technicians'

interface AdminSidebarProps {
  view: View
  onViewChange: (view: View) => void
  onSettings: () => void
  onReminders: () => void
  onSignOut: () => void
}

export function AdminSidebar({
  view,
  onViewChange,
  onSettings,
  onReminders,
  onSignOut,
}: AdminSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const navigation: {
    label: string
    icon: React.ReactNode
    view: View
  }[] = [
    { label: 'Dashboard', icon: <Home className="h-5 w-5" />, view: 'dashboard' },
    { label: 'Clients', icon: <Users className="h-5 w-5" />, view: 'clients' },
    { label: 'Corporate', icon: <Building2 className="h-5 w-5" />, view: 'corporate' },
    { label: 'Installations', icon: <Wrench className="h-5 w-5" />, view: 'installations' },
    { label: 'Repairs', icon: <PenTool className="h-5 w-5" />, view: 'repairs' },
    { label: 'Maintenance', icon: <Wrench className="h-5 w-5" />, view: 'maintenance' },
    { label: 'Schedule', icon: <CalendarDays className="h-5 w-5" />, view: 'schedule' },
    { label: 'Reports', icon: <BarChart3 className="h-5 w-5" />, view: 'reports' },
    { label: 'Requests', icon: <FileText className="h-5 w-5" />, view: 'requests' },
    { label: 'Leads', icon: <TrendingUp className="h-5 w-5" />, view: 'leads' },
    { label: 'Technicians', icon: <HardHat className="h-5 w-5" />, view: 'technicians' },
  ]

  return (
    <aside
      className={cn(
        'h-screen bg-gradient-to-b from-[#005596] to-[#003d70] flex flex-col transition-all duration-300 ease-in-out overflow-hidden border-r border-blue-400 border-opacity-20 flex-shrink-0',
        isExpanded ? 'w-64' : 'w-20'
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo Section */}
      <div className="flex items-center gap-3 h-16 px-3 border-b border-blue-400 border-opacity-20 flex-shrink-0">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden p-1">
          <img src="/logo.png" alt="Azelea Logo" className="w-full h-full object-contain" />
        </div>
        {isExpanded && (
          <div className="min-w-0 flex-1">
            <h2 className="text-white font-bold text-sm truncate">Azelea</h2>
            <p className="text-xs text-blue-100 truncate">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-hidden py-4 space-y-1 px-2">
        {navigation.map((item) => (
          <button
            key={item.view}
            onClick={() => onViewChange(item.view)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium group relative',
              view === item.view
                ? 'bg-white bg-opacity-20 text-white shadow-md'
                : 'text-blue-100 hover:bg-white hover:bg-opacity-10'
            )}
            title={item.label}
          >
            <span className="flex-shrink-0 flex items-center justify-center w-5 h-5">
              {item.icon}
            </span>
            {isExpanded && (
              <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis transition-opacity duration-200">
                {item.label}
              </span>
            )}
            {!isExpanded && (
              <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                {item.label}
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-blue-400 border-opacity-20 p-2 space-y-1 flex-shrink-0">
        <button
          onClick={onReminders}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium group relative text-blue-100 hover:bg-white hover:bg-opacity-10"
          title="Reminders"
        >
          <span className="flex-shrink-0 flex items-center justify-center w-5 h-5">
            <Bell className="h-5 w-5" />
          </span>
          {isExpanded && (
            <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis">
              Reminders
            </span>
          )}
          {!isExpanded && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
              Reminders
            </div>
          )}
        </button>

        <button
          onClick={onSettings}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium group relative',
            view === 'settings'
              ? 'bg-white bg-opacity-20 text-white shadow-md'
              : 'text-blue-100 hover:bg-white hover:bg-opacity-10'
          )}
          title="Settings"
        >
          <span className="flex-shrink-0 flex items-center justify-center w-5 h-5">
            <SettingsIcon className="h-5 w-5" />
          </span>
          {isExpanded && (
            <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis">
              Settings
            </span>
          )}
          {!isExpanded && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
              Settings
            </div>
          )}
        </button>

        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium group relative text-red-200 hover:bg-red-500 hover:bg-opacity-20"
          title="Sign Out"
        >
          <span className="flex-shrink-0 flex items-center justify-center w-5 h-5">
            <LogOut className="h-5 w-5" />
          </span>
          {isExpanded && (
            <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis">
              Sign Out
            </span>
          )}
          {!isExpanded && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
              Sign Out
            </div>
          )}
        </button>
      </div>
    </aside>
  )
}
