import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Users, Calendar, BookOpen, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { api, getApiErrorMessage } from '../lib/api'
import { Button } from '../components/ui/Button'
import { StatCard } from '../components/ui/StatCard'

type ClassSummary = {
  id: string
  name: string
  joinCode: string
  createdAt: string
  _count?: { students: number; exams: number }
}

export function TeacherHome() {
  const nav = useNavigate()
  const [classes, setClasses] = useState<ClassSummary[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const res = await api.get<ClassSummary[]>('/classes')
      setClasses(res.data)
    } catch (error) {
      console.error('Failed to load classes:', error)
      // Use mock data for development when API is not available
      const mockClasses: ClassSummary[] = [
        {
          id: 'class-1',
          name: 'Advanced Mathematics',
          joinCode: 'MATH2024',
          createdAt: new Date().toISOString(),
          _count: { students: 25, exams: 3 }
        },
        {
          id: 'class-2',
          name: 'Physics 101',
          joinCode: 'PHYS2024',
          createdAt: new Date().toISOString(),
          _count: { students: 18, exams: 2 }
        },
        {
          id: 'class-3',
          name: 'Chemistry Lab',
          joinCode: 'CHEM2024',
          createdAt: new Date().toISOString(),
          _count: { students: 22, exams: 4 }
        }
      ]
      setClasses(mockClasses)
      toast.info('Using demo data - Backend API not available')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function createClass(name: string) {
    if (!name.trim()) return
    try {
      await api.post('/classes', { name: name.trim() })
      toast.success('Class created')
      await load()
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#071B3A] [font-family:Inter,system-ui,-apple-system,sans-serif]">Teacher Dashboard</h1>
          <p className="mt-2 text-sm smesh-muted">Manage classes, create exams, and monitor student progress.</p>
        </div>
        <div>
          <Button
            className="shadow-md"
            onClick={() => nav('/teacher')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Class
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          className="bg-white p-6 text-center cursor-pointer hover:shadow-md transition-shadow rounded border-2 border-slate-300"
          onClick={() => nav('/teacher')}
        >
          <Users className="h-8 w-8 mx-auto mb-3 text-[#071B3A]" />
          <div className="font-medium text-[#0b1220]">Manage Classes</div>
          <div className="text-xs text-[#5b6474] mt-1">Create and organize classes</div>
        </div>
        <div
          className="bg-white p-6 text-center cursor-pointer hover:shadow-md transition-shadow rounded border-2 border-slate-300"
          onClick={() => nav('/teacher')}
        >
          <Calendar className="h-8 w-8 mx-auto mb-3 text-[#071B3A]" />
          <div className="font-medium text-[#0b1220]">Create Exams</div>
          <div className="text-xs text-[#5b6474] mt-1">Design assessments</div>
        </div>
        <div
          className="bg-white p-6 text-center cursor-pointer hover:shadow-md transition-shadow rounded border-2 border-slate-300"
          onClick={() => nav('/teacher')}
        >
          <BookOpen className="h-8 w-8 mx-auto mb-3 text-[#071B3A]" />
          <div className="font-medium text-[#0b1220]">Monitor Sessions</div>
          <div className="text-xs text-[#5b6474] mt-1">Live exam tracking</div>
        </div>
        <div
          className="bg-white p-6 text-center cursor-pointer hover:shadow-md transition-shadow rounded border-2 border-slate-300"
          onClick={() => nav('/teacher')}
        >
          <TrendingUp className="h-8 w-8 mx-auto mb-3 text-[#071B3A]" />
          <div className="font-medium text-[#0b1220]">View Results</div>
          <div className="text-xs text-[#5b6474] mt-1">Student performance</div>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="smesh-card p-6">
        <h3 className="text-lg font-bold text-[#0b1220] mb-4 [font-family:Inter,system-ui,-apple-system,sans-serif]">Overview</h3>
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Classes"
            value={loading ? '—' : classes.length}
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            label="Total Students"
            value={
              loading
                ? '—'
                : classes.reduce((sum, c) => sum + (c._count?.students ?? 0), 0)
            }
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            label="Total Exams"
            value={
              loading ? '—' : classes.reduce((sum, c) => sum + (c._count?.exams ?? 0), 0)
            }
            icon={<Calendar className="h-5 w-5" />}
          />
          <StatCard
            label="Active Sessions"
            value="—"
            icon={<BookOpen className="h-5 w-5" />}
          />
        </div>
      </div>

      {/* Classes List */}
      <div className="smesh-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#0b1220] [font-family:Inter,system-ui,-apple-system,sans-serif]">Your Classes</h3>
          <div className="text-sm text-[#5b6474]">
            {loading ? 'Loading...' : `${classes.length} class${classes.length !== 1 ? 'es' : ''} total`}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="text-center py-8 text-[#5b6474]">
              <div className="text-sm">Loading classes...</div>
            </div>
          ) : classes.length === 0 ? (
            <div className="smesh-card-soft p-8 text-center col-span-full">
              <Users className="mx-auto h-12 w-12 text-[#5b6474] mb-3" />
              <div className="text-lg font-medium text-[#0b1220] mb-2">No Classes Yet</div>
              <div className="text-sm text-[#5b6474] mb-4">Create your first class to get started</div>
              <Button
                onClick={() => nav('/teacher')}
                className="shadow-md"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Class
              </Button>
            </div>
          ) : (
            classes.map((c) => (
              <Link
                key={c.id}
                to={`/teacher/classes/${c.id}`}
                className="smesh-card p-6 transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-lg font-bold text-[#0b1220] mb-2 [font-family:Inter,system-ui,-apple-system,sans-serif]">{c.name}</div>
                    <div className="flex items-center gap-2 text-sm text-[#5b6474] mb-3">
                      <span className="bg-[rgba(7,27,58,0.1)] px-2 py-1 rounded text-xs font-medium text-[#071B3A]">
                        {c.joinCode}
                      </span>
                      <span className="text-xs text-[#5b6474]">Join Code</span>
                    </div>
                    <div className="flex gap-4 text-xs text-[#5b6474]">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-[#5b6474]" />
                        <span>{c._count?.students ?? 0} Students</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-[#5b6474]" />
                        <span>{c._count?.exams ?? 0} Exams</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={(e) => {
                        e.preventDefault()
                        nav(`/teacher/classes/${c.id}`)
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

