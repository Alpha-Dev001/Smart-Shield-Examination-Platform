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
        'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition',
        active(href)
          ? 'bg-white/10 text-white ring-1 ring-white/10'
          : 'text-white/80 hover:bg-white/5 hover:text-white',
      ].join(' ')}
    >
      <div
        className={[
          'h-8 w-8 rounded-xl border border-white/10 bg-white/5 grid place-items-center transition',
          active(href) ? 'bg-white/10' : 'group-hover:bg-white/10',
        ].join(' ')}
      >
        <Icon className="h-4 w-4" />
      </div>
      <span>{label}</span>
    </Link>
  )

  return (
    <div className="min-h-screen">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[260px_1fr]">
        <aside className="hidden flex-col bg-[#071B3A] text-white md:flex">
          <div className="px-6 py-6">
            <div className="text-3xl font-semibold tracking-wide [font-family:ui-serif,Georgia,Cambria,'Times New Roman',Times,serif]">
              SMESH
            </div>
            <div className="mt-2 text-xs text-white/70">Exam monitoring system</div>
          </div>

          <div className="px-6 pb-3 text-[11px] font-medium uppercase tracking-wide text-white/60">
            Navigation
          </div>

          <nav className="flex flex-1 flex-col gap-1 px-4">
            {isTeacher ? (
              <>
                {navItem('/teacher', 'Dashboard', LayoutDashboard)}
                {navItem('/teacher#classes', 'Classes', School)}
                {navItem('/teacher#classes', 'Students', Users)}
              </>
            ) : (
              <>
                {navItem('/student', 'Dashboard', LayoutDashboard)}
                {navItem('/student/class', 'My class', GraduationCap)}
                {navItem('/student/sessions', 'Sessions', BookOpen)}
                {navItem('/student/settings', 'Settings', Settings)}
              </>
            )}
          </nav>

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

        <main className="smesh-orbs overflow-hidden px-4 py-5 sm:px-6 sm:py-8">
          <header className="mb-6 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs font-medium uppercase tracking-wide text-[#5b6474]">
                {isTeacher ? 'Teacher' : 'Student'}
              </div>
              <div className="mt-1 truncate text-2xl font-semibold text-[#0b1220]">
                {pageTitle}
              </div>
            </div>
            <div className="flex items-center gap-2">
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
          </header>

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
              to={isTeacher ? '/teacher#classes' : '/student#my-class'}
              className={[
                'rounded-full border px-4 py-2 text-sm shadow-sm transition',
                active(isTeacher ? '/teacher' : '/student')
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
        </main>
      </div>
    </div>
  )
}

