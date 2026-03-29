'use client'

import { useState } from 'react'
import {
  Home,
  Settings as SettingsIcon,
  Bell,
  Wrench,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type View = 'dashboard' | 'settings'

interface ClientSidebarProps {
  view: View
  onViewChange: (view: View) => void
  onRequestService: () => void
  onNotifications: () => void
  onSignOut: () => void
  unreadNotifications: number
}

export function ClientSidebar({
  view,
  onViewChange,
  onRequestService,
  onNotifications,
  onSignOut,
  unreadNotifications
}: ClientSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const navigation: {
    label: string
    icon: React.ReactNode
    view: View
  }[] = [
    { label: 'Overview', icon: <Home className="h-5 w-5" />, view: 'dashboard' },
    { label: 'Settings', icon: <SettingsIcon className="h-5 w-5" />, view: 'settings' },
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
            <p className="text-xs text-blue-100 truncate">Client Portal</p>
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

        <hr className="border-blue-400 border-opacity-20 mx-2 my-2" />

        <button
          onClick={onRequestService}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium group relative text-blue-100 hover:bg-white hover:bg-opacity-10"
          title="Request Service"
        >
          <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 text-amber-300">
            <Wrench className="h-5 w-5" />
          </span>
          {isExpanded && (
            <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis">
              Request Service
            </span>
          )}
          {!isExpanded && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
              Request Service
            </div>
          )}
        </button>

      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-blue-400 border-opacity-20 p-2 space-y-1 flex-shrink-0">
        <button
          onClick={onNotifications}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium group relative text-blue-100 hover:bg-white hover:bg-opacity-10"
          title="Notifications"
        >
          <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 relative">
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-[#003d70]"></span>
            )}
          </span>
          {isExpanded && (
            <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis flex items-center justify-between">
              Notifications
              {unreadNotifications > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadNotifications}
                </span>
              )}
            </span>
          )}
          {!isExpanded && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
              Notifications
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
