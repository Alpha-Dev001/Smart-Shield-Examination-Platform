import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api, getApiErrorMessage } from '../lib/api'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { StatCard } from '../components/ui/StatCard'

type MyClass = {
  id: string
  name: string
  teacher: { id: string; email: string }
  exams: { id: string; title: string; startAt: string; duration: number }[]
  _count: { students: number }
}

export function StudentHome() {
  const nav = useNavigate()
  const [myClass, setMyClass] = useState<MyClass | null>(null)
  const [loading, setLoading] = useState(true)
  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [leaving, setLeaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await api.get<MyClass>('/classes/my-class')
      setMyClass(res.data)
    } catch {
      setMyClass(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

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
    <div className="space-y-6">
      <div>
        <h1 className="smesh-h2">Student</h1>
        <p className="mt-1 text-sm smesh-muted">Join your class, take sessions, and view results.</p>
        <div className="mt-3">
          <a
            className="inline-flex rounded-full border border-[rgba(11,18,32,0.14)] bg-white px-4 py-2 text-sm text-[#0b1220] shadow-sm hover:bg-[rgba(7,27,58,0.03)]"
            href="/student/sessions"
          >
            Join a session
          </a>
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
              <div className="grid gap-4 md:grid-cols-4">
                <StatCard label="Active Exams" value={active} />
                <StatCard label="Upcoming Exams" value={upcoming} active />
                <StatCard label="Completed Exams" value={completed} />
                <StatCard label="Average marks" value="—" />
              </div>

              <div id="my-class" className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] scroll-mt-24">
                <div className="smesh-card p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-lg font-semibold text-[#0b1220]">{myClass.name}</div>
                      <div className="mt-1 text-sm smesh-muted">
                        Teacher: <span className="text-[#0b1220]">{myClass.teacher.email}</span>
                      </div>
                      <div className="mt-2 text-xs text-[#5b6474]">
                        Students enrolled: {myClass._count.students}
                      </div>
                    </div>
                    <Button variant="secondary" onClick={leave} disabled={leaving}>
                      {leaving ? 'Leaving…' : 'Leave class'}
                    </Button>
                  </div>

                  <div className="mt-6">
                    <div className="text-sm font-semibold text-[#0b1220]">Exams</div>
                    <div className="mt-3 grid gap-3">
                      {exams.length === 0 ? (
                        <div className="text-sm smesh-muted">No exams yet.</div>
                      ) : (
                        exams.map((e) => (
                          <div key={e.id} className="smesh-card-soft p-4">
                            <div className="font-medium text-[#0b1220]">{e.title}</div>
                            <div className="mt-1 text-xs smesh-muted">
                              Starts: {new Date(e.startAt).toLocaleString()} · Duration: {e.duration} min
                            </div>
                            <div className="mt-3 text-xs text-[#5b6474]">
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
                    <div className="text-base font-semibold text-[#0b1220]">Active exams</div>
                    {liveExam ? (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200">
                        Live
                      </span>
                    ) : null}
                  </div>

                  {liveExam ? (
                    <div className="mt-4 smesh-card-soft p-4">
                      <div className="text-sm font-semibold text-[#0b1220]">{liveExam.title}</div>
                      <div className="mt-2 text-xs smesh-muted">
                        Duration: {liveExam.duration} min
                        <br />
                        Started at: {new Date(liveExam.startAt).toLocaleTimeString()}
                      </div>
                      <Button
                        className="mt-4 w-full"
                        onClick={() => nav('/student/sessions')}
                      >
                        Start exam
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-4 text-sm smesh-muted">No active exams.</div>
                  )}
                </div>
              </div>
            </>
          )
        })()
      ) : (
        <div className="smesh-card p-6">
          <div className="text-base font-semibold text-[#0b1220]">Join a class</div>
          <p className="mt-1 text-sm smesh-muted">
            Enter the join code your teacher shared.
          </p>
          <div className="mt-4 flex max-w-md items-end gap-2">
            <div className="flex-1">
              <Input label="Join code" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} />
            </div>
            <Button onClick={join} disabled={joining}>
              {joining ? 'Joining…' : 'Join'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

