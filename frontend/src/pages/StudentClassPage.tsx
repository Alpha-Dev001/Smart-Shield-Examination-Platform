import { useAuth } from '../store/auth'
import { GraduationCap } from 'lucide-react'

export function StudentClassPage() {
  const auth = useAuth()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-[rgba(7,27,58,0.1)] rounded-2xl flex items-center justify-center mb-4">
          <GraduationCap className="h-8 w-8 text-[#071B3A]" />
        </div>
        <h1 className="smesh-h2">My Class</h1>
        <p className="mt-2 text-sm smesh-muted">View your class information and enrollment status</p>
      </div>

      <div className="smesh-card p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-[rgba(7,27,58,0.1)] rounded-xl flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-[#071B3A]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#0b1220]">Class Details</h2>
            <p className="text-sm smesh-muted">Your current class enrollment information</p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3">
          <div className="smesh-card-soft p-6 text-center">
            <div className="text-xs font-medium text-[#5b6474] mb-2">Class ID</div>
            <div className="text-lg font-bold text-[#0b1220] font-mono">
              {auth.user?.classId || '—'}
            </div>
            <div className="mt-2 text-xs text-[#5b6474]">
              {auth.user?.classId ? 'Assigned' : 'Not assigned'}
            </div>
          </div>

          <div className="smesh-card-soft p-6 text-center">
            <div className="text-xs font-medium text-[#5b6474] mb-2">Enrollment Status</div>
            <div className="text-lg font-bold text-[#0b1220]">
              {auth.user?.classId ? (
                <span className="text-[#0b1220]">Enrolled</span>
              ) : (
                <span className="text-[#5b6474]">Not Enrolled</span>
              )}
            </div>
            <div className="mt-2 text-xs text-[#5b6474]">
              {auth.user?.classId ? 'Active student' : 'Join a class to get started'}
            </div>
          </div>

          <div className="smesh-card-soft p-6 text-center">
            <div className="text-xs font-medium text-[#5b6474] mb-2">Class Teacher</div>
            <div className="text-lg font-bold text-[#0b1220]">
              —
            </div>
            <div className="mt-2 text-xs text-[#5b6474]">
              Teacher information will appear here
            </div>
          </div>
        </div>

        {!auth.user?.classId && (
          <div className="mt-8 smesh-card p-6 text-center">
            <div className="text-base font-semibold text-[#0b1220] mb-2">Not Enrolled in a Class</div>
            <div className="text-sm text-[#5b6474] mb-6 max-w-md mx-auto">
              Join a class using the join code provided by your teacher to access exams and sessions.
            </div>
            <button
              onClick={() => window.location.href = '/student'}
              className="inline-flex items-center gap-2 rounded-full bg-[#071B3A] px-6 py-3 text-sm text-white shadow-md hover:bg-[#0b2a5e] transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
