import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api, getApiErrorMessage } from '../lib/api'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { StatCard } from '../components/ui/StatCard'
import { BookOpen, TrendingUp, Calendar, Award, Users } from 'lucide-react'
import { useAuth } from '../store/auth'

type MyClass = {
  id: string
  name: string
  teacher: { id: string; email: string }
  exams: { id: string; title: string; startAt: string; duration: number }[]
  _count: { students: number }
}

export function StudentHome() {
  const nav = useNavigate()
  const auth = useAuth()
  const [myClass, setMyClass] = useState<MyClass | null>(null)
  const [loading, setLoading] = useState(true)
  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [leaving, setLeaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      // Debug: Log auth state
      console.log('Auth state:', {
        token: !!auth.accessToken,
        user: auth.user,
        isHydrated: auth.isHydrated
      })

      const res = await api.get<MyClass>('/classes/my-class')
      setMyClass(res.data)
    } catch (error) {
      console.error('Failed to load class data:', error)
      // Debug: Log detailed error info
      if (error && typeof error === 'object' && 'response' in error) {
        console.error('Error response:', error.response)
        console.error('Error status:', error.response?.status)
        console.error('Error data:', error.response?.data)
      }
      toast.error('Failed to load class data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Only load data if auth is hydrated and user is authenticated
    if (auth.isHydrated && auth.accessToken && auth.user) {
      void load()
    }
  }, [auth.isHydrated, auth.accessToken, auth.user])

  async function join() {
    if (!joinCode.trim()) return
    setJoining(true)
    try {
      await api.post('/classes/join', { joinCode: joinCode.trim() })
      toast.success('Joined class')
      setJoinCode('')
      await load()
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    } finally {
      setJoining(false)
    }
  }

  async function leave() {
    setLeaving(true)
    try {
      await api.post('/classes/leave', {})
      toast.success('Left class')
      await load()
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    } finally {
      setLeaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#071B3A] [font-family:Inter,system-ui,-apple-system,sans-serif]">Student Dashboard</h1>
          <p className="mt-2 text-sm smesh-muted">Manage your classes, take exams, and track your progress.</p>
        </div>
        <div>
          <Button
            className="shadow-md"
            onClick={() => nav('/student/sessions')}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Join Session
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          className="bg-white p-6 text-center cursor-pointer hover:shadow-md transition-shadow rounded border-2 border-slate-300"
          onClick={() => nav('/student/sessions')}
        >
          <BookOpen className="h-8 w-8 mx-auto mb-3 text-[#071B3A]" />
          <div className="font-medium text-[#0b1220]">Join Session</div>
          <div className="text-xs text-[#5b6474] mt-1">Enter session ID to join</div>
        </div>
        <div
          className="bg-white p-6 text-center cursor-pointer hover:shadow-md transition-shadow rounded border-2 border-slate-300"
          onClick={() => nav('/student/class')}
        >
          <Users className="h-8 w-8 mx-auto mb-3 text-[#071B3A]" />
          <div className="font-medium text-[#0b1220]">My Class</div>
          <div className="text-xs text-[#5b6474] mt-1">View class information</div>
        </div>
        <div
          className="bg-white p-6 text-center cursor-pointer hover:shadow-md transition-shadow rounded border-2 border-slate-300"
          onClick={() => nav('/student/settings')}
        >
          <Award className="h-8 w-8 mx-auto mb-3 text-[#071B3A]" />
          <div className="font-medium text-[#0b1220]">Settings</div>
          <div className="text-xs text-[#5b6474] mt-1">Manage account</div>
        </div>
      </div>

      {loading ? (
        <div className="text-sm smesh-muted">Loading…</div>
      ) : myClass ? (
        (() => {
          const now = Date.now()
          const exams = myClass.exams ?? []
          const upcoming = exams.filter((e) => new Date(e.startAt).getTime() > now).length
          const completed = exams.filter((e) => new Date(e.startAt).getTime() <= now).length
          const active = Math.min(1, exams.length) // sessions are separate; keep this UI-only
          const liveExam = exams
            .slice()
            .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
            .find((e) => {
              const t = new Date(e.startAt).getTime()
              return Math.abs(t - now) < 1000 * 60 * 60 * 2 // within ~2h window
            }) ?? exams[0]

          return (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Active Exams"
                  value={active}
                  icon={<BookOpen className="h-5 w-5" />}
                />
                <StatCard
                  label="Upcoming Exams"
                  value={upcoming}
                  active
                  icon={<Calendar className="h-5 w-5" />}
                />
                <StatCard
                  label="Completed Exams"
                  value={completed}
                  icon={<Award className="h-5 w-5" />}
                />
                <StatCard
                  label="Average Score"
                  value="—"
                  icon={<TrendingUp className="h-5 w-5" />}
                />
              </div>

              <div id="my-class" className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] scroll-mt-24">
                <div className="smesh-card p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-lg font-bold text-[#0b1220] [font-family:Inter,system-ui,-apple-system,sans-serif]">{myClass.name}</div>
                      <div className="mt-1 text-sm smesh-muted">
                        Teacher: <span className="text-[#0b1220]">{myClass.teacher.email}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-[#5b6474]">
                        <Users className="h-3 w-3" />
                        Students enrolled: {myClass._count.students}
                      </div>
                    </div>
                    <Button variant="secondary" onClick={leave} disabled={leaving}>
                      {leaving ? 'Leaving…' : 'Leave class'}
                    </Button>
                  </div>

                  <div className="mt-8">
                    <div className="text-sm font-bold text-[#0b1220] mb-4 [font-family:Inter,system-ui,-apple-system,sans-serif]">
                      Exams Schedule
                    </div>
                    <div className="space-y-3">
                      {exams.length === 0 ? (
                        <div className="smesh-card-soft p-6 text-center">
                          <div className="text-sm smesh-muted">No exams scheduled yet.</div>
                        </div>
                      ) : (
                        exams.map((e) => (
                          <div key={e.id} className="smesh-card-soft p-5">
                            <div className="font-bold text-[#0b1220] mb-2 [font-family:Inter,system-ui,-apple-system,sans-serif]">{e.title}</div>
                            <div className="flex flex-wrap gap-4 text-xs smesh-muted mb-3">
                              <div>{new Date(e.startAt).toLocaleDateString()}</div>
                              <div>{new Date(e.startAt).toLocaleTimeString()}</div>
                              <div>{e.duration} min</div>
                            </div>
                            <div className="text-xs text-[#5b6474]">
                              Sessions are started by your teacher. When you get a session ID, you can join it from the Sessions page.
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="smesh-card p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-base font-bold text-[#0b1220] [font-family:Inter,system-ui,-apple-system,sans-serif]">
                      <BookOpen className="h-5 w-5" />
                      Active Exam
                    </div>
                    {liveExam ? (
                      <span className="rounded-full bg-[rgba(7,27,58,0.1)] px-3 py-1 text-xs font-medium text-[#071B3A]">
                        Live Now
                      </span>
                    ) : null}
                  </div>

                  {liveExam ? (
                    <div className="mt-6 smesh-card-soft p-6">
                      <div className="text-lg font-bold text-[#0b1220] mb-3 [font-family:Inter,system-ui,-apple-system,sans-serif]">{liveExam.title}</div>
                      <div className="space-y-2 text-xs smesh-muted mb-6">
                        <div>Duration: {liveExam.duration} minutes</div>
                        <div>Started: {new Date(liveExam.startAt).toLocaleTimeString()}</div>
                      </div>
                      <Button
                        className="w-full shadow-md"
                        onClick={() => nav('/student/sessions')}
                      >
                        Start Exam Now
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-6 text-center py-8">
                      <BookOpen className="mx-auto h-12 w-12 text-[#5b6474] mb-3" />
                      <div className="text-sm smesh-muted">No active exams at the moment.</div>
                      <div className="mt-2 text-xs text-[#5b6474]">Check back when your teacher starts a session.</div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )
        })()
      ) : (
        <div className="smesh-card p-8 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-[rgba(7,27,58,0.1)] rounded-2xl flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-[#071B3A]" />
            </div>
            <div className="text-xl font-bold text-[#0b1220] mb-2 [font-family:Inter,system-ui,-apple-system,sans-serif]">Join Your Class</div>
            <p className="text-sm smesh-muted">
              Enter the join code your teacher shared to get started with your exams.
            </p>
          </div>
          <div className="flex max-w-md mx-auto items-end gap-3">
            <div className="flex-1">
              <Input
                label="Class Join Code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter code..."
                className="text-center text-lg font-mono tracking-wider"
              />
            </div>
            <Button
              onClick={join}
              disabled={joining}
              className="shadow-md px-6"
            >
              {joining ? 'Joining…' : 'Join Class'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

