import { Link, Outlet, useLocation } from 'react-router-dom'
import { BookOpen, GraduationCap, LayoutDashboard, LogOut, School, Settings, Users } from 'lucide-react'
import { Button } from '../ui/Button'
import { useAuth } from '../../store/auth'

export function AppShell() {
  const auth = useAuth()
  const user = auth.user
  const loc = useLocation()

  if (!user) return <Outlet />

  const isTeacher = user.role === 'TEACHER'
  const active = (path: string) =>
    loc.pathname === path

  const pageTitle = (() => {
    const p = loc.pathname
    if (p.startsWith('/teacher/sessions/')) return 'Session monitoring'
    if (p.startsWith('/teacher/exams/')) return 'Exam'
    if (p.startsWith('/teacher/classes/')) return 'Class'
    if (p.startsWith('/teacher')) return 'Teacher dashboard'
    if (p.startsWith('/student/results/')) return 'My results'
    if (p.startsWith('/student/sessions/')) return 'Take session'
    if (p.startsWith('/student/sessions')) return 'Sessions'
    if (p.startsWith('/student/settings')) return 'Settings'
    if (p.startsWith('/student/class')) return 'My class'
    if (p.startsWith('/student')) return 'Student dashboard'
    return 'Dashboard'
  })()

  const navItem = (
    href: string,
    label: string,
    Icon: any,
  ) => (
    <Link
      to={href}
      className={[
        'group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200',
        active(href)
          ? 'bg-white/90 text-[#071B3A] shadow-md'
          : 'text-white/90 hover:bg-white/10',
      ].join(' ')}
    >
      <div
        className={[
          'h-8 w-8 rounded-lg grid place-items-center transition-all duration-200',
          active(href)
            ? 'bg-[#071B3A] text-white'
            : 'bg-white/10 text-white group-hover:bg-white/20',
        ].join(' ')}
      >
        <Icon className="h-4 w-4" />
      </div>
      <span>{label}</span>
    </Link>
  )

  return (
    <div className="min-h-screen">
      <aside className="hidden flex-col bg-[#071B3A] text-white md:flex fixed left-0 top-0 h-screen w-[260px] z-50">
        {/* Header */}
        <div className="border-b border-white/10">
          <div className="px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <div className="text-xl font-bold text-white">S</div>
              </div>
              <div>
                <div className="text-2xl font-bold tracking-wide">SMESH</div>
                <div className="text-xs text-white/60 font-medium">Smart Examination Hub</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6">
          <div className="px-6 pb-4">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Main Menu</h3>
          </div>
          <nav className="px-3 space-y-1">
            {isTeacher ? (
              <>
                {navItem('/teacher', 'Dashboard', LayoutDashboard)}
                {navItem('/teacher/classes', 'Classes', School)}
                {navItem('/teacher/settings', 'Settings', Settings)}
              </>
            ) : (
              <>
                {navItem('/student', 'Dashboard', LayoutDashboard)}
                {navItem('/student/class', 'My Class', GraduationCap)}
                {navItem('/student/sessions', 'Sessions', BookOpen)}
                {navItem('/student/settings', 'Settings', Settings)}
              </>
            )}
          </nav>
        </div>

        <div className="mt-auto border-t border-white/10 px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-xs font-medium text-white">{user.email}</div>
              <div className="text-[11px] text-white/70">{user.role}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => auth.logout()}
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
                {isTeacher ? 'Teacher' : 'Student'} Dashboard
              </div>
              <div className="mt-1 text-lg font-semibold text-[#0b1220] [font-family:Inter,system-ui,-apple-system,sans-serif]">
                Welcome back, {user.email?.split('@')[0] || 'User'}
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
              <button
                type="button"
                aria-label="Settings"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(11,18,32,0.14)] bg-white text-[#071B3A] shadow-sm transition hover:bg-[rgba(7,27,58,0.03)] md:hidden"
                onClick={() => {
                  // UI-only placeholder (no settings screen yet)
                }}
              >
                <Settings className="h-4 w-4" />
              </button>
              <Button variant="secondary" onClick={() => auth.logout()} className="gap-2 md:hidden">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="px-4 pt-24 sm:px-6 sm:pt-28 pb-6 sm:pb-8">

          <div className="mb-6 flex flex-wrap gap-2 md:hidden">
            <Link
              to={isTeacher ? '/teacher' : '/student'}
              className={[
                'rounded-full border px-4 py-2 text-sm shadow-sm transition',
                active(isTeacher ? '/teacher' : '/student')
                  ? 'border-[rgba(7,27,58,0.45)] bg-[#071B3A] text-white'
                  : 'border-[rgba(11,18,32,0.14)] bg-white hover:bg-[rgba(7,27,58,0.03)]',
              ].join(' ')}
            >
              Dashboard
            </Link>
            <Link
              to={isTeacher ? '/teacher#classes' : '/student/class'}
              className={[
                'rounded-full border px-4 py-2 text-sm shadow-sm transition',
                active(isTeacher ? '/teacher#classes' : '/student/class')
                  ? 'border-[rgba(7,27,58,0.45)] bg-[#071B3A] text-white'
                  : 'border-[rgba(11,18,32,0.14)] bg-white hover:bg-[rgba(7,27,58,0.03)]',
              ].join(' ')}
            >
              {isTeacher ? 'Classes' : 'My class'}
            </Link>
            {!isTeacher ? (
              <Link
                to="/student/sessions"
                className={[
                  'rounded-full border px-4 py-2 text-sm shadow-sm transition',
                  active('/student/sessions')
                    ? 'border-[rgba(7,27,58,0.45)] bg-[#071B3A] text-white'
                    : 'border-[rgba(11,18,32,0.14)] bg-white hover:bg-[rgba(7,27,58,0.03)]',
                ].join(' ')}
              >
                Sessions
              </Link>
            ) : null}
          </div>

          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}

