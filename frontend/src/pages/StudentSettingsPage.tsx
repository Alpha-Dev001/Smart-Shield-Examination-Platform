import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../store/auth'
import { getApiErrorMessage } from '../lib/api'
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react'

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ProfileValues = z.infer<typeof profileSchema>
type PasswordValues = z.infer<typeof passwordSchema>

export function StudentSettingsPage() {
  const auth = useAuth()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '', // TODO: Add firstName to user model
      lastName: '', // TODO: Add lastName to user model
      email: auth.user?.email || '',
    },
  })

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onProfileSubmit = async (data: ProfileValues) => {
    setIsLoading(true)
    try {
      // TODO: Implement profile update API call
      console.log('Profile update:', data)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  const onPasswordSubmit = async (data: PasswordValues) => {
    setIsLoading(true)
    try {
      // TODO: Implement password change API call
      console.log('Password change:', data)
      toast.success('Password changed successfully')
      passwordForm.reset()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">View your account information</p>
      </div>

      {/* User Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">User Information</h2>
            <p className="text-sm text-gray-600">Your account details</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">Student ID</span>
            <span className="text-sm text-gray-600 font-mono">{auth.user?.id}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">Email</span>
            <span className="text-sm text-gray-600">{auth.user?.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">Role</span>
            <span className="text-sm text-gray-600 capitalize">{auth.user?.role?.toLowerCase()}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">Class ID</span>
            <span className="text-sm text-gray-600">{auth.user?.classId || 'Not assigned'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">Account Status</span>
            <span className="text-sm text-green-600 font-medium">Active</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm font-medium text-gray-700">Member Since</span>
            <span className="text-sm text-gray-600">
              {auth.user?.createdAt ? new Date(auth.user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'Unknown'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
