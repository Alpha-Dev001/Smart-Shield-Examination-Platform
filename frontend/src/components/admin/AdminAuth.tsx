import { useState } from 'react'
import { Lock, Shield, Eye, EyeOff } from 'lucide-react'
import { Button } from '../ui/Button'
import { useAuth } from '../../store/auth'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  // Check if user is already authenticated and is admin
  const { user } = useAuth()

  if (user?.role === 'ADMIN') {
    return <>{children}</>
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login({ email, password })

      // After login, the auth store should have the user data
      // The RequireAdmin wrapper will handle the role check
      toast.success('Admin access granted')
      navigate('/admin')
    } catch (error: any) {
      console.error('Admin login failed:', error)
      const errorMessage = error.response?.data?.message || 'Invalid credentials'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#071B3A] rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#0b1220] mb-2">Admin Access</h1>
          <p className="text-[#5b6474]">Enter your admin credentials to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#0b1220] mb-2">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-[rgba(7,27,58,0.1)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#071B3A] focus:border-transparent"
              placeholder="admin@smesh.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0b1220] mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[rgba(7,27,58,0.1)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#071B3A] focus:border-transparent"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#5b6474] hover:text-[#071B3A]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#071B3A] hover:bg-[#051629] text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Authenticating...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Access Admin Panel
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-[#5b6474]">
            This area is restricted to authorized administrators only
          </p>
        </div>
      </div>
    </div>
  )
}
