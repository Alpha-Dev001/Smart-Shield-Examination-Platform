import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { api, getApiErrorMessage } from '../lib/api'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

type ClassDetail = {
  id: string
  name: string
  joinCode: string
  createdAt: string
  _count: { students: number }
  students: { id: string; email: string; createdAt: string }[]
  exams: { id: string; title: string; startAt: string; duration: number }[]
}

export function TeacherClassPage() {
  const { classId } = useParams()
  const nav = useNavigate()
  const [data, setData] = useState<ClassDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const [title, setTitle] = useState('')
  const [startAt, setStartAt] = useState('')
  const [duration, setDuration] = useState('60')
  const [randomize, setRandomize] = useState(false)
  const [creatingExam, setCreatingExam] = useState(false)

  const isoExample = useMemo(() => new Date().toISOString().slice(0, 16), [])

  async function load() {
    if (!classId) return
    setLoading(true)
    try {
      const res = await api.get<ClassDetail>(`/classes/${classId}`)
      setData(res.data)
    } catch (e) {
      toast.error(getApiErrorMessage(e))
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId])

  async function removeStudent(studentId: string) {
    if (!classId) return
    try {
      await api.delete(`/classes/${classId}/students/${studentId}`)
      toast.success('Student removed')
      await load()
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    }
  }

  async function deleteClass() {
    if (!classId) return
    try {
      await api.delete(`/classes/${classId}`)
      toast.success('Class deleted')
      nav('/teacher', { replace: true })
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    }
  }

  async function createExam() {
    if (!classId) return
    if (!title.trim() || !startAt.trim()) return
    setCreatingExam(true)
    try {
      await api.post(`/exams/class/${classId}`, {
        title: title.trim(),
        startAt: new Date(startAt).toISOString(),
        duration: Number(duration),
        randomize,
      })
      toast.success('Exam created')
      setTitle('')
      setStartAt('')
      setDuration('60')
      setRandomize(false)
      await load()
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    } finally {
      setCreatingExam(false)
    }
  }

  if (loading) return <div className="text-sm smesh-muted">Loading…</div>
  if (!data) return <div className="text-sm smesh-muted">Class not found.</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link className="text-sm smesh-muted hover:underline" to="/teacher">
            ← Back
          </Link>
          <h1 className="mt-2 smesh-h2">{data.name}</h1>
          <div className="mt-1 text-sm smesh-muted">
            Join code:{' '}
            <span className="font-mono text-[#0b1220] break-all">{data.joinCode}</span>
          </div>
        </div>
        <Button variant="danger" onClick={deleteClass}>
          Delete class
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="smesh-card p-6">
          <h2 className="text-base font-semibold text-[#0b1220]">Students</h2>
          <p className="mt-1 text-sm smesh-muted">
            {data.students.length} enrolled
          </p>
          <div className="mt-4 space-y-2">
            {data.students.length === 0 ? (
              <div className="text-sm smesh-muted">No students yet.</div>
            ) : (
              data.students.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between smesh-card-soft px-4 py-3"
                >
                  <div>
                    <div className="text-sm font-medium text-[#0b1220]">{s.email}</div>
                    <div className="text-xs text-[#5b6474]">
                      Joined: {new Date(s.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Button variant="secondary" onClick={() => removeStudent(s.id)}>
                    Remove
                  </Button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="smesh-card p-6">
          <h2 className="text-base font-semibold text-[#0b1220]">Exams</h2>
          <p className="mt-1 text-sm smesh-muted">Create exams and add questions.</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[#1b2a44]">
                Start at (local)
              </span>
              <input
                type="datetime-local"
                value={startAt}
                placeholder={isoExample}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full rounded-xl border border-[rgba(11,18,32,0.16)] bg-white px-4 py-2.5 text-sm outline-none shadow-sm transition focus:border-[rgba(7,27,58,0.35)] focus:ring-2 focus:ring-[rgba(7,27,58,0.16)]"
              />
            </label>
            <Input
              label="Duration (minutes)"
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-[#1b2a44]">
              <input
                type="checkbox"
                checked={randomize}
                onChange={(e) => setRandomize(e.target.checked)}
                className="h-4 w-4 accent-[#071B3A]"
              />
              Randomize questions per student
            </label>
          </div>

          <div className="mt-3">
            <Button onClick={createExam} disabled={creatingExam} className="w-full">
              {creatingExam ? 'Creating…' : 'Create exam'}
            </Button>
          </div>

          <div className="mt-6 space-y-2">
            {data.exams.length === 0 ? (
              <div className="text-sm smesh-muted">No exams yet.</div>
            ) : (
              data.exams.map((e) => (
                <Link
                  key={e.id}
                  to={`/teacher/exams/${e.id}`}
                  className="block smesh-card-soft px-4 py-3 transition hover:shadow-[0_10px_22px_rgba(7,27,58,0.08)]"
                >
                  <div className="text-sm font-medium text-[#0b1220]">{e.title}</div>
                  <div className="text-xs smesh-muted">
                    Starts: {new Date(e.startAt).toLocaleString()} · {e.duration} min
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

