import { User, Mail, Calendar, Shield, Settings } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useAuth } from '../store/auth'

export function TeacherSettingsPage() {
  const { user } = useAuth()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-12 h-12 bg-[rgba(7,27,58,0.1)] rounded-xl flex items-center justify-center">
          <Settings className="h-6 w-6 text-[#071B3A]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#071B3A] [font-family:Inter,system-ui,-apple-system,sans-serif]">Settings</h1>
          <p className="mt-2 text-sm smesh-muted">View your account information.</p>
        </div>
      </div>

      <div className="smesh-card p-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 bg-[rgba(7,27,58,0.1)] rounded-full flex items-center justify-center">
            <User className="h-12 w-12 text-[#071B3A]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#0b1220] [font-family:Inter,system-ui,-apple-system,sans-serif]">
              {user?.email?.split('@')[0] || 'Teacher'}
            </h2>
            <p className="text-sm text-[#5b6474]">Teacher Account</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 py-3 border-b border-[rgba(11,18,32,0.08)]">
            <div className="w-10 h-10 bg-[rgba(7,27,58,0.05)] rounded-lg flex items-center justify-center">
              <Mail className="h-5 w-5 text-[#071B3A]" />
            </div>
            <div>
              <div className="font-medium text-[#0b1220]">Email Address</div>
              <div className="text-sm text-[#5b6474]">{user?.email || 'Loading...'}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 py-3 border-b border-[rgba(11,18,32,0.08)]">
            <div className="w-10 h-10 bg-[rgba(7,27,58,0.05)] rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-[#071B3A]" />
            </div>
            <div>
              <div className="font-medium text-[#0b1220]">Role</div>
              <div className="text-sm text-[#5b6474]">Teacher</div>
            </div>
          </div>

          <div className="flex items-center gap-4 py-3 border-b border-[rgba(11,18,32,0.08)]">
            <div className="w-10 h-10 bg-[rgba(7,27,58,0.05)] rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-[#071B3A]" />
            </div>
            <div>
              <div className="font-medium text-[#0b1220]">Member Since</div>
              <div className="text-sm text-[#5b6474]">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Loading...'}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[rgba(11,18,32,0.08)]">
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => window.location.href = '/teacher'}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
