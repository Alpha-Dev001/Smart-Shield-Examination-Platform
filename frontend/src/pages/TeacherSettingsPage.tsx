import { useAuth } from '../store/auth'
import { User } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useNavigate } from 'react-router-dom'

export function TeacherSettingsPage() {
  const { user } = useAuth()
  const nav = useNavigate()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-[rgba(7,27,58,0.1)] rounded-2xl flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-[#071B3A]" />
        </div>
        <h1 className="smesh-h2">Account Settings</h1>
        <p className="mt-2 text-sm smesh-muted">View and manage your account information</p>
      </div>

      {/* User Information */}
      <div className="smesh-card p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-[rgba(7,27,58,0.1)] rounded-xl flex items-center justify-center">
            <User className="h-6 w-6 text-[#071B3A]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#0b1220]">Profile Information</h2>
            <p className="text-sm smesh-muted">Your account details and status</p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <div className="smesh-card-soft p-4">
              <div className="text-xs font-medium text-[#5b6474] mb-1">Teacher ID</div>
              <div className="text-sm font-mono text-[#0b1220]">{user?.id}</div>
            </div>

            <div className="smesh-card-soft p-4">
              <div className="text-xs font-medium text-[#5b6474] mb-1">Email Address</div>
              <div className="text-sm text-[#0b1220]">{user?.email}</div>
            </div>

            <div className="smesh-card-soft p-4">
              <div className="text-xs font-medium text-[#5b6474] mb-1">Account Role</div>
              <div className="text-sm text-[#0b1220] capitalize">{user?.role?.toLowerCase()}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="smesh-card-soft p-4">
              <div className="text-xs font-medium text-[#5b6474] mb-1">Department</div>
              <div className="text-sm text-[#0b1220]">Education</div>
            </div>

            <div className="smesh-card-soft p-4">
              <div className="text-xs font-medium text-[#5b6474] mb-1">Account Status</div>
              <div className="text-sm text-[#0b1220]">
                <span className="text-[#0b1220] font-medium">Active</span>
              </div>
            </div>

            <div className="smesh-card-soft p-4">
              <div className="text-xs font-medium text-[#5b6474] mb-1">Member Since</div>
              <div className="text-sm text-[#0b1220]">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : 'Unknown'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
