import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { api, getApiErrorMessage } from '../lib/api'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { StatCard } from '../components/ui/StatCard'

type ClassSummary = {
  id: string
  name: string
  joinCode: string
  createdAt: string
  _count?: { students: number; exams: number }
}

export function TeacherHome() {
  const [classes, setClasses] = useState<ClassSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await api.get<ClassSummary[]>('/classes')
      setClasses(res.data)
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function createClass() {
    if (!name.trim()) return
    setCreating(true)
    try {
      await api.post('/classes', { name: name.trim() })
      setName('')
      toast.success('Class created')
      await load()
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="smesh-h2">Teacher</h1>
          <p className="mt-1 text-sm smesh-muted">Manage classes, exams, sessions and results.</p>
        </div>

        <div className="flex w-full max-w-md items-end gap-2">
          <div className="flex-1">
            <Input label="New class name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <Button onClick={createClass} disabled={creating} className="gap-2">
            <Plus className="h-4 w-4" />
            Create
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Classes" value={loading ? '—' : classes.length} />
        <StatCard
          label="Students"
          value={
            loading
              ? '—'
              : classes.reduce((sum, c) => sum + (c._count?.students ?? 0), 0)
          }
          active
        />
        <StatCard
          label="Exams"
          value={
            loading ? '—' : classes.reduce((sum, c) => sum + (c._count?.exams ?? 0), 0)
          }
        />
        <StatCard label="Live sessions" value="—" />
      </div>

      <div id="classes" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 scroll-mt-24">
        {loading ? (
          <div className="text-sm smesh-muted">Loading…</div>
        ) : classes.length === 0 ? (
          <div className="text-sm smesh-muted">No classes yet.</div>
        ) : (
          classes.map((c) => (
            <Link
              key={c.id}
              to={`/teacher/classes/${c.id}`}
              className="smesh-card p-5 transition hover:shadow-[0_12px_30px_rgba(7,27,58,0.10)]"
            >
              <div className="text-base font-semibold text-[#0b1220]">{c.name}</div>
              <div className="mt-1 text-sm smesh-muted">
                Join code:{' '}
                <span className="font-mono text-[#0b1220] break-all">{c.joinCode}</span>
              </div>
              <div className="mt-3 flex gap-3 text-xs text-[#5b6474]">
                <span>Students: {c._count?.students ?? 0}</span>
                <span>Exams: {c._count?.exams ?? 0}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

