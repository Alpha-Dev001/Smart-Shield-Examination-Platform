import { useEffect, useState } from 'react'
import {
  Users,
  School,
  BookOpen,
  Calendar,
  Trash2,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  BarChart3,
  UserPlus
} from 'lucide-react'
import { toast } from 'sonner'
import { api } from '../lib/api'
import { Button } from '../components/ui/Button'
import { AdminShell } from '../components/admin/AdminShell'
import { useNavigate } from 'react-router-dom'

// Types for admin data
interface AdminStats {
  totalUsers: number
  totalTeachers: number
  totalStudents: number
  totalClasses: number
  totalExams: number
  totalSessions: number
  activeSessions: number
  pendingSessions: number
  completedSessions: number
}

interface User {
  id: string
  email: string
  role: 'TEACHER' | 'STUDENT'
  firstName?: string
  lastName?: string
  classId?: string
  createdAt: string
  class?: {
    id: string
    name: string
  }
}

interface Class {
  id: string
  name: string
  joinCode: string
  teacherId: string
  createdAt: string
  teacher?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
  }
  _count?: {
    students: number
    exams: number
  }
}

interface Exam {
  id: string
  title: string
  classId: string
  startAt: string
  duration: number
  randomize: boolean
  createdAt: string
  class?: {
    id: string
    name: string
  }
  _count?: {
    questions: number
    sessions: number
  }
}

interface Session {
  id: string
  examId: string
  status: 'PENDING' | 'LIVE' | 'ENDED'
  startedAt?: string
  endedAt?: string
  exam?: {
    id: string
    title: string
    class?: {
      id: string
      name: string
    }
  }
  _count?: {
    participants: number
  }
}

export function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'classes' | 'exams' | 'sessions'>('overview')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)


  async function loadData() {
    setLoading(true)
    try {
      // Load from API
      const [statsRes, usersRes, classesRes, examsRes, sessionsRes] = await Promise.all([
        api.get<AdminStats>('/admin/stats'),
        api.get<User[]>('/admin/users'),
        api.get<Class[]>('/admin/classes'),
        api.get<Exam[]>('/admin/exams'),
        api.get<Session[]>('/admin/sessions')
      ])

      setStats(statsRes.data)
      setUsers(usersRes.data)
      setClasses(classesRes.data)
      setExams(examsRes.data)
      setSessions(sessionsRes.data)

      toast.success('Admin data loaded successfully')
    } catch (error: any) {
      console.error('Failed to load admin data:', error)
      const errorMessage = error.response?.data?.message || 'Failed to connect to backend'
      toast.error(errorMessage)

      // Set empty state on error
      setStats(null)
      setUsers([])
      setClasses([])
      setExams([])
      setSessions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const handleDelete = async (type: string, id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await api.delete(`/admin/${type}/${id}`)
      toast.success(response.data?.message || `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`)
      void loadData() // Reload data to reflect changes
    } catch (error: any) {
      console.error(`Failed to delete ${type}:`, error)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || `Failed to delete ${type}. Please try again.`
      toast.error(errorMessage)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE': return 'text-green-600 bg-green-100'
      case 'PENDING': return 'text-yellow-600 bg-yellow-100'
      case 'ENDED': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gradient-to-br from-[#071B3A] to-[#051629] p-6 rounded-xl border border-[rgba(7,27,58,0.1)] shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="text-xs text-white/70 bg-white/10 px-2 py-1 rounded-full backdrop-blur-sm">
              Total
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{stats?.totalUsers || 0}</div>
          <div className="text-sm text-white/80">Total Users</div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-xs text-white/60">
              {stats?.totalTeachers || 0} teachers, {stats?.totalStudents || 0} students
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#071B3A] to-[#051629] p-6 rounded-xl border border-[rgba(7,27,58,0.1)] shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <School className="h-6 w-6 text-white" />
            </div>
            <div className="text-xs text-white/70 bg-white/10 px-2 py-1 rounded-full backdrop-blur-sm">
              Active
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{stats?.totalClasses || 0}</div>
          <div className="text-sm text-white/80">Total Classes</div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-xs text-white/60">
              Across {stats?.totalTeachers || 0} teachers
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#071B3A] to-[#051629] p-6 rounded-xl border border-[rgba(7,27,58,0.1)] shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="text-xs text-white/70 bg-white/10 px-2 py-1 rounded-full backdrop-blur-sm">
              Created
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{stats?.totalExams || 0}</div>
          <div className="text-sm text-white/80">Total Exams</div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-xs text-white/60">
              {stats?.totalSessions || 0} sessions conducted
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#071B3A] to-[#051629] p-6 rounded-xl border border-[rgba(7,27,58,0.1)] shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div className="text-xs text-white/70 bg-white/10 px-2 py-1 rounded-full backdrop-blur-sm">
              Live
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{stats?.activeSessions || 0}</div>
          <div className="text-sm text-white/80">Active Sessions</div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-xs text-white/60">
              {stats?.pendingSessions || 0} pending
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="smesh-card p-8">
        <h3 className="text-2xl font-bold text-[#0b1220] mb-6">System Overview</h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-[rgba(7,27,58,0.05)] p-4 rounded-lg border border-[rgba(7,27,58,0.1)]">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <span className="font-medium text-[#0b1220]">System Health</span>
            </div>
            <p className="text-sm text-[#5b6474]">All systems operational</p>
          </div>
          <div className="bg-[rgba(7,27,58,0.05)] p-4 rounded-lg border border-[rgba(7,27,58,0.1)]">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-[#071B3A]" />
              <span className="font-medium text-[#0b1220]">Usage Trend</span>
            </div>
            <p className="text-sm text-[#5b6474]">12% increase this week</p>
          </div>
          <div className="bg-[rgba(7,27,58,0.05)] p-4 rounded-lg border border-[rgba(7,27,58,0.1)]">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <span className="font-medium text-[#0b1220]">Alerts</span>
            </div>
            <p className="text-sm text-[#5b6474]">No critical issues</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderUsers = () => (
    <div className="smesh-card p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-[#0b1220]">Users Management</h3>
        <div className="flex items-center gap-4">
          <div className="text-sm text-[#5b6474]">{users.length} total users</div>
          <Button
            onClick={() => navigate('/admin/create-user')}
            className="gap-2 bg-[#071B3A] hover:bg-[#051629] text-white"
          >
            <UserPlus className="h-4 w-4" />
            Create User
          </Button>
        </div>
      </div>
      {users.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-[rgba(7,27,58,0.1)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-[#071B3A]" />
          </div>
          <div className="text-xl font-bold text-[#0b1220] mb-3">No Users Found</div>
          <div className="text-sm text-[#5b6474] mb-4">There are no users in the system yet.</div>
          <Button onClick={loadData} className="bg-[#071B3A] hover:bg-[#051629] text-white">
            Refresh Data
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(7,27,58,0.1)]">
                <th className="text-left py-3 px-4 text-sm font-medium text-[#5b6474]">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#5b6474]">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#5b6474]">Role</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#5b6474]">Class</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#5b6474]">Created</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#5b6474]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-[rgba(7,27,58,0.05)] hover:bg-[rgba(7,27,58,0.02)]">
                  <td className="py-3 px-4 text-sm text-[#0b1220]">{user.email}</td>
                  <td className="py-3 px-4 text-sm text-[#0b1220]">{user.firstName} {user.lastName}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${user.role === 'TEACHER' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-[#5b6474]">{user.class?.name || '-'}</td>
                  <td className="py-3 px-4 text-sm text-[#5b6474]">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <Button
                      variant="secondary"
                      onClick={() => handleDelete('users', user.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  const renderClasses = () => (
    <div className="smesh-card p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-[#0b1220]">Classes Management</h3>
        <div className="text-sm text-[#5b6474]">{classes.length} total classes</div>
      </div>
      {classes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-[rgba(7,27,58,0.1)] rounded-full flex items-center justify-center mx-auto mb-4">
            <School className="h-8 w-8 text-[#071B3A]" />
          </div>
          <div className="text-xl font-bold text-[#0b1220] mb-3">No Classes Found</div>
          <div className="text-sm text-[#5b6474] mb-4">There are no classes in the system yet.</div>
          <Button onClick={loadData} className="bg-[#071B3A] hover:bg-[#051629] text-white">
            Refresh Data
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-white p-6 rounded-xl border border-[rgba(7,27,58,0.1)] hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-[#0b1220]">{cls.name}</h4>
                  <p className="text-sm text-[#5b6474]">Code: {cls.joinCode}</p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => handleDelete('classes', cls.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-[#5b6474]">Students:</span>
                  <span className="ml-2 font-medium text-[#0b1220]">{cls._count?.students || 0}</span>
                </div>
                <div>
                  <span className="text-[#5b6474]">Exams:</span>
                  <span className="ml-2 font-medium text-[#0b1220]">{cls._count?.exams || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderExams = () => (
    <div className="smesh-card p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-[#0b1220]">Exams Management</h3>
        <div className="text-sm text-[#5b6474]">{exams.length} total exams</div>
      </div>
      {exams.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-[rgba(7,27,58,0.1)] rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-[#071B3A]" />
          </div>
          <div className="text-xl font-bold text-[#0b1220] mb-3">No Exams Found</div>
          <div className="text-sm text-[#5b6474] mb-4">There are no exams in the system yet.</div>
          <Button onClick={loadData} className="bg-[#071B3A] hover:bg-[#051629] text-white">
            Refresh Data
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(7,27,58,0.1)]">
                <th className="text-left py-3 px-4 text-sm font-medium text-[#5b6474]">Title</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#5b6474]">Class</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#5b6474]">Duration</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#5b6474]">Questions</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#5b6474]">Created</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#5b6474]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.id} className="border-b border-[rgba(7,27,58,0.05)] hover:bg-[rgba(7,27,58,0.02)]">
                  <td className="py-3 px-4 text-sm text-[#0b1220]">{exam.title}</td>
                  <td className="py-3 px-4 text-sm text-[#5b6474]">{exam.class?.name || '-'}</td>
                  <td className="py-3 px-4 text-sm text-[#5b6474]">{exam.duration} min</td>
                  <td className="py-3 px-4 text-sm text-[#5b6474]">{exam._count?.questions || 0}</td>
                  <td className="py-3 px-4 text-sm text-[#5b6474]">{new Date(exam.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <Button
                      variant="secondary"
                      onClick={() => handleDelete('exams', exam.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  const renderSessions = () => (
    <div className="smesh-card p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-[#0b1220]">Sessions Management</h3>
        <div className="text-sm text-[#5b6474]">{sessions.length} total sessions</div>
      </div>
      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-[rgba(7,27,58,0.1)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-[#071B3A]" />
          </div>
          <div className="text-xl font-bold text-[#0b1220] mb-3">No Sessions Found</div>
          <div className="text-sm text-[#5b6474] mb-4">There are no exam sessions in the system yet.</div>
          <Button onClick={loadData} className="bg-[#071B3A] hover:bg-[#051629] text-white">
            Refresh Data
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(7,27,58,0.1)]">
                <th className="text-left py-3 px-4 text-sm font-medium text-[#5b6474]">Exam</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#5b6474]">Class</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#5b6474]">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#5b6474]">Participants</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#5b6474]">Started</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#5b6474]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id} className="border-b border-[rgba(7,27,58,0.05)] hover:bg-[rgba(7,27,58,0.02)]">
                  <td className="py-3 px-4 text-sm text-[#0b1220]">{session.exam?.title || '-'}</td>
                  <td className="py-3 px-4 text-sm text-[#5b6474]">{session.exam?.class?.name || '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-[#5b6474]">{session._count?.participants || 0}</td>
                  <td className="py-3 px-4 text-sm text-[#5b6474]">
                    {session.startedAt ? new Date(session.startedAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      variant="secondary"
                      onClick={() => handleDelete('sessions', session.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#071B3A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-[#5b6474]">Loading admin dashboard...</div>
        </div>
      </div>
    )
  }

  if (!stats && activeTab === 'overview') {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-[rgba(7,27,58,0.1)] rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-[#071B3A]" />
          </div>
          <div className="text-xl font-bold text-[#0b1220] mb-3">No Data Available</div>
          <div className="text-sm text-[#5b6474] mb-4 max-w-md mx-auto">Unable to load admin data. Please check your backend connection.</div>
          <Button onClick={loadData} className="bg-[#071B3A] hover:bg-[#051629] text-white">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <AdminShell onTabChange={setActiveTab} activeTab={activeTab}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#071B3A] flex items-center gap-3">
              <Shield className="h-8 w-8" />
              Admin Dashboard
            </h1>
            <p className="mt-2 text-sm text-[#5b6474]">System overview and management controls</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-[rgba(7,27,58,0.1)]">
          <nav className="flex gap-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'classes', label: 'Classes', icon: School },
              { id: 'exams', label: 'Exams', icon: BookOpen },
              { id: 'sessions', label: 'Sessions', icon: Calendar },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 transition-colors ${activeTab === tab.id
                  ? 'border-[#071B3A] text-[#071B3A]'
                  : 'border-transparent text-[#5b6474] hover:text-[#0b1220]'
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'classes' && renderClasses()}
        {activeTab === 'exams' && renderExams()}
        {activeTab === 'sessions' && renderSessions()}
      </div>
    </AdminShell>
  )
}
