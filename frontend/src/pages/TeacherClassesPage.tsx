import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Users, Calendar, Search } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '../lib/api'
import { Button } from '../components/ui/Button'
import { StatCard } from '../components/ui/StatCard'

type ClassSummary = {
  id: string
  name: string
  joinCode: string
  createdAt: string
  _count?: { students: number; exams: number }
}

export function TeacherClassesPage() {
  const nav = useNavigate()
  const [classes, setClasses] = useState<ClassSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

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

  const filteredClasses = classes.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.joinCode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalStudents = classes.reduce((sum, c) => sum + (c._count?.students ?? 0), 0)
  const totalExams = classes.reduce((sum, c) => sum + (c._count?.exams ?? 0), 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#071B3A] [font-family:Inter,system-ui,-apple-system,sans-serif]">Classes</h1>
          <p className="mt-2 text-sm smesh-muted">Manage your classes, students, and exams.</p>
        </div>
        <div className="flex gap-3">
          <Button
            className="shadow-md"
            onClick={() => nav('/teacher')}
          >
            Back to Dashboard
          </Button>
          <Button
            onClick={() => nav('/teacher/create-class')}
            className="shadow-md px-6 py-3"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Class
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
        <StatCard
          label="Total Classes"
          value={loading ? '—' : classes.length}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Total Students"
          value={loading ? '—' : totalStudents}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Total Exams"
          value={loading ? '—' : totalExams}
          icon={<Calendar className="h-5 w-5" />}
        />
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#071B3A] focus:border-transparent shadow-sm transition-all duration-200"
          />
        </div>
        <div className="mt-2 text-sm text-slate-600">
          {loading ? 'Loading...' : `${filteredClasses.length} of ${classes.length} classes`}
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="smesh-card-soft p-8 text-center col-span-full">
            <div className="w-12 h-12 bg-[rgba(7,27,58,0.1)] rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-[#071B3A]" />
            </div>
            <div className="text-lg font-medium text-[#0b1220] mb-2">Loading Classes...</div>
            <div className="text-sm text-[#5b6474]">Please wait while we fetch your classes</div>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="smesh-card-soft p-8 text-center col-span-full">
            <Users className="mx-auto h-16 w-16 text-[#5b6474] mb-4" />
            <div className="text-xl font-bold text-[#0b1220] mb-2">
              {searchTerm ? 'No Classes Found' : 'No Classes Yet'}
            </div>
            <div className="text-sm text-[#5b6474] mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first class to get started with managing students and exams'}
            </div>
            {!searchTerm && (
              <Button className="shadow-md px-6 py-3">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Class
              </Button>
            )}
          </div>
        ) : (
          filteredClasses.map((c) => (
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
                  <div className="flex-1">
                    <div className="text-xl font-bold text-[#0b1220] mb-2 [font-family:Inter,system-ui,-apple-system,sans-serif]">{c.name}</div>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-[rgba(7,27,58,0.1)] rounded-lg">
                        <span className="text-sm font-bold text-[#071B3A] font-mono">{c.joinCode}</span>
                      </div>
                      <span className="text-xs text-[#5b6474] font-medium">Join Code</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-[#071B3A] rounded-xl flex items-center justify-center shadow-sm">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-[rgba(7,27,58,0.03)] p-3 rounded-xl text-center border border-[rgba(7,27,58,0.1)]">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="h-4 w-4 text-[#071B3A]" />
                      <span className="text-lg font-bold text-[#0b1220]">{c._count?.students ?? 0}</span>
                    </div>
                    <div className="text-xs text-[#5b6474] font-medium">Students</div>
                  </div>
                  <div className="bg-[rgba(7,27,58,0.03)] p-3 rounded-xl text-center border border-[rgba(7,27,58,0.1)]">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Calendar className="h-4 w-4 text-[#071B3A]" />
                      <span className="text-lg font-bold text-[#0b1220]">{c._count?.exams ?? 0}</span>
                    </div>
                    <div className="text-xs text-[#5b6474] font-medium">Exams</div>
                  </div>
                </div>

                {/* Action button */}
                <div className="pt-3 border-t border-[rgba(7,27,58,0.1)]">
                  <Button
                    variant="secondary"
                    onClick={(e) => e.preventDefault()}
                    className="w-full bg-[rgba(7,27,58,0.05)] hover:bg-[rgba(7,27,58,0.1)] text-[#071B3A] border border-[rgba(7,27,58,0.2)] hover:border-[rgba(7,27,58,0.3)] font-medium rounded-lg transition-all duration-200"
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
  )
}
