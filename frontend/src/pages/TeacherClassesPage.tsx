import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Users, Calendar, Search } from 'lucide-react'
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

export function TeacherClassesPage() {
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
        },
        {
          id: 'class-4',
          name: 'Biology Essentials',
          joinCode: 'BIO2024',
          createdAt: new Date().toISOString(),
          _count: { students: 30, exams: 5 }
        },
        {
          id: 'class-5',
          name: 'Computer Science',
          joinCode: 'CS2024',
          createdAt: new Date().toISOString(),
          _count: { students: 28, exams: 6 }
        },
        {
          id: 'class-6',
          name: 'English Literature',
          joinCode: 'ENG2024',
          createdAt: new Date().toISOString(),
          _count: { students: 20, exams: 2 }
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
            onClick={() => window.location.href = '/teacher'}
          >
            Back to Dashboard
          </Button>
          <Button
            className="shadow-md"
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

      {/* Search and Filters */}
      <div className="smesh-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#5b6474]" />
              <input
                type="text"
                placeholder="Search classes by name or join code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[rgba(11,18,32,0.14)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#071B3A] focus:border-transparent"
              />
            </div>
          </div>
          <div className="text-sm text-[#5b6474]">
            {loading ? 'Loading...' : `${filteredClasses.length} of ${classes.length} classes`}
          </div>
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
              className="bg-white p-6 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] rounded-xl border-2 border-slate-200 hover:border-slate-300"
            >
              <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-lg font-bold text-[#0b1220] mb-1 [font-family:Inter,system-ui,-apple-system,sans-serif]">{c.name}</div>
                    <div className="flex items-center gap-2">
                      <span className="bg-[rgba(7,27,58,0.1)] px-3 py-1 rounded-lg text-xs font-bold text-[#071B3A] font-mono">
                        {c.joinCode}
                      </span>
                      <span className="text-xs text-[#5b6474]">Join Code</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-[rgba(7,27,58,0.05)] rounded-xl flex items-center justify-center">
                    <Users className="h-5 w-5 text-[#071B3A]" />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[rgba(7,27,58,0.02)] p-3 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="h-4 w-4 text-[#071B3A]" />
                      <span className="text-lg font-bold text-[#0b1220]">{c._count?.students ?? 0}</span>
                    </div>
                    <div className="text-xs text-[#5b6474]">Students</div>
                  </div>
                  <div className="bg-[rgba(7,27,58,0.02)] p-3 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Calendar className="h-4 w-4 text-[#071B3A]" />
                      <span className="text-lg font-bold text-[#0b1220]">{c._count?.exams ?? 0}</span>
                    </div>
                    <div className="text-xs text-[#5b6474]">Exams</div>
                  </div>
                </div>

                {/* Action */}
                <div className="pt-2 border-t border-[rgba(11,18,32,0.08)]">
                  <Button
                    variant="secondary"
                    onClick={(e) => e.preventDefault()}
                    className="w-full"
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
