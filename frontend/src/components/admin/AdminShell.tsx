import { LogOut, BarChart3, Users, School, BookOpen, Calendar, UserPlus } from 'lucide-react'
import { Button } from '../ui/Button'
import { useAuth } from '../../store/auth'
import { useNavigate } from 'react-router-dom'

export function AdminShell({ children, onTabChange, activeTab }: {
  children: React.ReactNode
  onTabChange?: (tab: 'overview' | 'users' | 'classes' | 'exams' | 'sessions') => void
  activeTab?: 'overview' | 'users' | 'classes' | 'exams' | 'sessions'
}) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const navItem = (
    tab: 'overview' | 'users' | 'classes' | 'exams' | 'sessions',
    label: string,
    Icon: any,
  ) => {
    const isActive = activeTab === tab
    return (
      <button
        onClick={() => onTabChange?.(tab)}
        className={[
          'group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 w-full text-left',
          isActive
            ? 'bg-white/90 text-[#071B3A] shadow-md'
            : 'text-white/90 hover:bg-white/10',
        ].join(' ')}
      >
        <div
          className={[
            'h-8 w-8 rounded-lg grid place-items-center transition-all duration-200',
            isActive
              ? 'bg-[#071B3A] text-white'
              : 'bg-white/10 text-white group-hover:bg-white/20',
          ].join(' ')}
        >
          <Icon className="h-4 w-4" />
        </div>
        <span>{label}</span>
      </button>
    )
  }

  return (
    <div className="min-h-screen">
      <aside className="hidden flex-col bg-[#071B3A] text-white md:flex fixed left-0 top-0 h-screen w-[260px] z-50">
        {/* Header */}
        <div className="border-b border-white/10">
          <div className="px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <img src="/logo.png" alt="SMESH Logo" className="w-8 h-8" />
              </div>
              <div>
                <div className="text-2xl font-bold tracking-wide">SMESH</div>
                <div className="text-xs text-white/60 font-medium">Admin Panel</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6">
          <div className="px-6 pb-4">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Admin Menu</h3>
          </div>
          <nav className="px-3 space-y-1">
            {navItem('overview', 'Dashboard', BarChart3)}
            {navItem('users', 'Users', Users)}
            {navItem('classes', 'Classes', School)}
            {navItem('exams', 'Exams', BookOpen)}
            {navItem('sessions', 'Sessions', Calendar)}
            <button
              onClick={() => navigate('/admin/create-user')}
              className="group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 w-full text-left text-white/90 hover:bg-white/10"
            >
              <div className="h-8 w-8 rounded-lg grid place-items-center transition-all duration-200 bg-white/10 text-white group-hover:bg-white/20">
                <UserPlus className="h-4 w-4" />
              </div>
              <span>Create User</span>
            </button>
          </nav>
        </div>

        <div className="mt-auto border-t border-white/10 px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-xs font-medium text-white">
                {user?.email || 'Admin User'}
              </div>
              <div className="text-[11px] text-white/70">
                {user?.role || 'Administrator'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  logout()
                  navigate('/')
                }}
                className="gap-2 border-white/20 bg-white/10 text-white hover:bg-white/15"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </aside>

      <main className="smesh-orbs overflow-hidden md:ml-[260px] min-h-screen">
        {/* Top Bar */}
        <header className="fixed top-0 left-0 right-0 bg-[#f6f7fb] border-b border-[rgba(11,18,32,0.08)] px-6 py-4 shadow-sm z-40 md:left-[260px]">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#5b6474] [font-family:Inter,system-ui,-apple-system,sans-serif]">
                Admin Dashboard
              </div>
              <div className="text-lg font-semibold text-[#0b1220] [font-family:Inter,system-ui,-apple-system,sans-serif]">
                Welcome back, {user?.email?.split('@')[0] || 'Administrator'}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-4 text-sm [font-family:Inter,system-ui,-apple-system,sans-serif]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[#5b6474] font-medium">Online</span>
                </div>
                <div className="text-[#5b6474]">•</div>
                <div className="text-[#5b6474] font-medium">{new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="px-4 pt-24 sm:px-6 sm:pt-28 pb-6 sm:pb-8">
          <div className="mx-auto w-full max-w-6xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
