import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Users, Calendar, BookOpen, TrendingUp, School } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '../lib/api'
import { Button } from '../components/ui/Button'

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
      toast.error('Failed to load classes. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])


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
            onClick={() => nav('/teacher/create-class')}
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
          onClick={() => nav('/teacher/classes')}
        >
          <Users className="h-8 w-8 mx-auto mb-3 text-[#071B3A]" />
          <div className="font-medium text-[#0b1220]">Manage Classes</div>
          <div className="text-xs text-[#5b6474] mt-1">Create and organize classes</div>
        </div>
        <div
          className="bg-white p-6 text-center cursor-pointer hover:shadow-md transition-shadow rounded border-2 border-slate-300"
          onClick={() => nav('/teacher/classes')}
        >
          <Calendar className="h-8 w-8 mx-auto mb-3 text-[#071B3A]" />
          <div className="font-medium text-[#0b1220]">Create Exams</div>
          <div className="text-xs text-[#5b6474] mt-1">Select a class to create exams</div>
        </div>
        <div
          className="bg-white p-6 text-center cursor-pointer hover:shadow-md transition-shadow rounded border-2 border-slate-300"
          onClick={() => nav('/teacher/create-class')}
        >
          <Plus className="h-8 w-8 mx-auto mb-3 text-[#071B3A]" />
          <div className="font-medium text-[#0b1220]">Create Class</div>
          <div className="text-xs text-[#5b6474] mt-1">Set up a new class</div>
        </div>
        <div
          className="bg-white p-6 text-center cursor-pointer hover:shadow-md transition-shadow rounded border-2 border-slate-300"
          onClick={() => nav('/teacher/classes')}
        >
          <TrendingUp className="h-8 w-8 mx-auto mb-3 text-[#071B3A]" />
          <div className="font-medium text-[#0b1220]">View Results</div>
          <div className="text-xs text-[#5b6474] mt-1">Select a class to view results</div>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="smesh-card p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-[#0b1220] [font-family:Inter,system-ui,-apple-system,sans-serif]">Dashboard Overview</h3>
            <p className="text-sm text-[#5b6474] mt-1 [font-family:Inter,system-ui,-apple-system,sans-serif]">Key metrics and performance indicators</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[rgba(7,27,58,0.05)] rounded-lg border border-[rgba(7,27,58,0.1)]">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-[#5b6474] [font-family:Inter,system-ui,-apple-system,sans-serif]">Live</span>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-gradient-to-br from-[#071B3A] to-[#051629] p-6 rounded-xl border border-[rgba(7,27,58,0.1)] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <School className="h-6 w-6 text-white" />
              </div>
              <div className="text-xs text-white/70 bg-white/10 px-2 py-1 rounded-full backdrop-blur-sm">
                Active
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2 [font-family:Inter,system-ui,-apple-system,sans-serif]">
              {loading ? '—' : classes.length}
            </div>
            <div className="text-sm text-white/80 [font-family:Inter,system-ui,-apple-system,sans-serif]">Total Classes</div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-xs text-white/60 [font-family:Inter,system-ui,-apple-system,sans-serif]">
                {loading ? 'Loading...' : `${classes.length} active this semester`}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#071B3A] to-[#051629] p-6 rounded-xl border border-[rgba(7,27,58,0.1)] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="text-xs text-white/70 bg-white/10 px-2 py-1 rounded-full backdrop-blur-sm">
                Total
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2 [font-family:Inter,system-ui,-apple-system,sans-serif]">
              {loading ? '—' : classes.reduce((sum, c) => sum + (c._count?.students ?? 0), 0)}
            </div>
            <div className="text-sm text-white/80 [font-family:Inter,system-ui,-apple-system,sans-serif]">Total Students</div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-xs text-white/60 [font-family:Inter,system-ui,-apple-system,sans-serif]">
                {loading ? 'Loading...' : `Across ${classes.length} classes`}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#071B3A] to-[#051629] p-6 rounded-xl border border-[rgba(7,27,58,0.1)] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="text-xs text-white/70 bg-white/10 px-2 py-1 rounded-full backdrop-blur-sm">
                Created
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2 [font-family:Inter,system-ui,-apple-system,sans-serif]">
              {loading ? '—' : classes.reduce((sum, c) => sum + (c._count?.exams ?? 0), 0)}
            </div>
            <div className="text-sm text-white/80 [font-family:Inter,system-ui,-apple-system,sans-serif]">Total Exams</div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-xs text-white/60 [font-family:Inter,system-ui,-apple-system,sans-serif]">
                {loading ? 'Loading...' : `${Math.max(0, classes.reduce((sum, c) => sum + (c._count?.exams ?? 0), 0) - 2)} scheduled`}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#071B3A] to-[#051629] p-6 rounded-xl border border-[rgba(7,27,58,0.1)] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="text-xs text-white/70 bg-white/10 px-2 py-1 rounded-full backdrop-blur-sm">
                Live
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2 [font-family:Inter,system-ui,-apple-system,sans-serif]">
              {loading ? '—' : '0'}
            </div>
            <div className="text-sm text-white/80 [font-family:Inter,system-ui,-apple-system,sans-serif]">Active Sessions</div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-xs text-white/60 [font-family:Inter,system-ui,-apple-system,sans-serif]">
                {loading ? 'Loading...' : 'No sessions currently active'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Classes List */}
      <div className="smesh-card p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-[#0b1220] [font-family:Inter,system-ui,-apple-system,sans-serif]">Your Classes</h3>
            <p className="text-sm text-[#5b6474] mt-1 [font-family:Inter,system-ui,-apple-system,sans-serif]">Manage your classes and track student progress</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-[#071B3A] text-white rounded-lg text-sm font-medium shadow">
              {loading ? 'Loading...' : `${classes.length} class${classes.length !== 1 ? 'es' : ''}`}
            </div>
            <Button
              onClick={() => nav('/teacher/create-class')}
              className="shadow bg-[#071B3A] hover:bg-[#051629] text-white px-6 py-3 font-semibold rounded-lg transition-colors duration-200"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Class
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full">
              <div className="smesh-card-soft p-8 text-center">
                <div className="w-12 h-12 bg-[rgba(7,27,58,0.1)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-6 border-2 border-[#071B3A] border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="text-lg font-medium text-[#0b1220] mb-2">Loading Classes</div>
                <div className="text-sm text-[#5b6474]">Please wait while we fetch your classes...</div>
              </div>
            </div>
          ) : classes.length === 0 ? (
            <div className="col-span-full">
              <div className="smesh-card-soft p-8 text-center">
                <div className="w-16 h-16 bg-[rgba(7,27,58,0.1)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-[#071B3A]" />
                </div>
                <div className="text-xl font-bold text-[#0b1220] mb-3 [font-family:Inter,system-ui,-apple-system,sans-serif]">No Classes Yet</div>
                <div className="text-sm text-[#5b6474] mb-4 max-w-md mx-auto">Create your first class to start managing students and conducting exams</div>
                <Button
                  onClick={() => nav('/teacher/classes')}
                  className="shadow bg-[#071B3A] hover:bg-[#051629] text-white px-6 py-3 font-semibold rounded-lg transition-colors duration-200"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Class
                </Button>
              </div>
            </div>
          ) : (
            classes.map((c) => (
              <Link
                key={c.id}
                to={`/teacher/classes/${c.id}`}
                className="group relative bg-white p-6 transition-all duration-200 hover:shadow-md rounded-xl border border-slate-200 hover:border-slate-300 overflow-hidden"
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[rgba(7,27,58,0.01)] to-[rgba(7,27,58,0.02)] opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>

                <div className="relative z-10">
                  {/* Header with icon */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-[#071B3A] rounded-lg flex items-center justify-center shadow-sm">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-600 font-medium">Active</span>
                    </div>
                  </div>

                  {/* Class name */}
                  <div className="mb-4">
                    <h4 className="text-lg font-bold text-[#0b1220] mb-2 [font-family:Inter,system-ui,-apple-system,sans-serif]">{c.name}</h4>
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-1 bg-[rgba(7,27,58,0.1)] rounded">
                        <span className="text-xs font-bold text-[#071B3A] font-mono">{c.joinCode}</span>
                      </div>
                      <span className="text-xs text-[#5b6474] font-medium">Join Code</span>
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-[rgba(7,27,58,0.03)] p-2 rounded-lg text-center border border-[rgba(7,27,58,0.1)]">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users className="h-3 w-3 text-[#071B3A]" />
                        <span className="text-sm font-bold text-[#0b1220]">{c._count?.students ?? 0}</span>
                      </div>
                      <div className="text-xs text-[#5b6474] font-medium">Students</div>
                    </div>
                    <div className="bg-[rgba(7,27,58,0.03)] p-2 rounded-lg text-center border border-[rgba(7,27,58,0.1)]">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Calendar className="h-3 w-3 text-[#071B3A]" />
                        <span className="text-sm font-bold text-[#0b1220]">{c._count?.exams ?? 0}</span>
                      </div>
                      <div className="text-xs text-[#5b6474] font-medium">Exams</div>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="pt-2 border-t border-[rgba(7,27,58,0.1)]">
                    <Button
                      variant="secondary"
                      onClick={(e) => {
                        e.preventDefault()
                        nav(`/teacher/classes/${c.id}`)
                      }}
                      className="w-full bg-[rgba(7,27,58,0.05)] hover:bg-[rgba(7,27,58,0.1)] text-[#071B3A] border border-[rgba(7,27,58,0.2)] hover:border-[rgba(7,27,58,0.3)] font-medium rounded text-sm transition-colors duration-200"
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

