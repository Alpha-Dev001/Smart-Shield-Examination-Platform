import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { api } from '../lib/api'
import { AdminShell } from '../components/admin/AdminShell'
import { useNavigate } from 'react-router-dom'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['TEACHER', 'STUDENT']),
  classId: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Class {
  id: string
  name: string
  joinCode: string
}

export function AdminCreateUserPage() {
  const navigate = useNavigate()
  const [classes, setClasses] = useState<Class[]>([])
  const [loadingClasses, setLoadingClasses] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'STUDENT',
      classId: '',
    },
  })

  const selectedRole = form.watch('role')

  // Load classes when component mounts
  useEffect(() => {
    const loadClasses = async () => {
      setLoadingClasses(true)
      try {
        const response = await api.get<Class[]>('/admin/classes')
        setClasses(response.data)
      } catch (error) {
        console.error('Failed to load classes:', error)
        toast.error('Failed to load classes')
      } finally {
        setLoadingClasses(false)
      }
    }
    loadClasses()
  }, [])

  async function onSubmit(values: FormValues) {
    try {
      // Validate that student has a class assigned
      if (values.role === 'STUDENT' && !values.classId) {
        toast.error('Students must be assigned to a class')
        return
      }

      // Prepare payload
      const payload = {
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        role: values.role,
        ...(values.role === 'STUDENT' && values.classId && { classId: values.classId }),
      }

      console.log('Creating user with payload:', { ...payload, password: '[REDACTED]' })

      const response = await api.post('/admin/users', payload)
      toast.success(response.data?.message || 'User created successfully')

      // Reset form
      form.reset()

      // Navigate back to users management
      navigate('/admin?tab=users')
    } catch (error: any) {
      console.error('Failed to create user:', error)
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })

      // More specific error handling
      if (error.response?.status === 409) {
        toast.error(`Email "${values.email}" is already in use. Please use a different email.`)
      } else {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to create user'
        toast.error(errorMessage)
      }
    }
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              onClick={() => navigate('/admin?tab=users')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Users
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-[#071B3A] flex items-center gap-3">
                <UserPlus className="h-8 w-8" />
                Create New User
              </h1>
              <p className="mt-2 text-sm text-[#5b6474]">Add a new teacher or student to the system</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="smesh-card p-8">
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-6 sm:grid-cols-2">
              <Input
                label="First Name"
                error={form.formState.errors.firstName?.message}
                {...form.register('firstName')}
              />
              <Input
                label="Last Name"
                error={form.formState.errors.lastName?.message}
                {...form.register('lastName')}
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              autoComplete="email"
              error={form.formState.errors.email?.message}
              {...form.register('email')}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              error={form.formState.errors.password?.message}
              {...form.register('password')}
            />

            <div>
              <div className="mb-3 text-sm font-medium text-[#1b2a44]">User Role</div>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border border-[rgba(7,27,58,0.1)] rounded-lg cursor-pointer hover:bg-[rgba(7,27,58,0.02)] transition-colors">
                  <input
                    type="radio"
                    value="TEACHER"
                    className="h-4 w-4 accent-[#071B3A]"
                    {...form.register('role')}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[#0b1220]">Teacher</div>
                    <div className="text-sm text-[#5b6474]">Can create classes, exams, and manage students</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border border-[rgba(7,27,58,0.1)] rounded-lg cursor-pointer hover:bg-[rgba(7,27,58,0.02)] transition-colors">
                  <input
                    type="radio"
                    value="STUDENT"
                    className="h-4 w-4 accent-[#071B3A]"
                    {...form.register('role')}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[#0b1220]">Student</div>
                    <div className="text-sm text-[#5b6474]">Can take exams and view results</div>
                  </div>
                </label>
              </div>
              {form.formState.errors.role?.message && (
                <span className="mt-2 block text-xs text-rose-600">
                  {form.formState.errors.role?.message}
                </span>
              )}
            </div>

            {selectedRole === 'STUDENT' && (
              <div>
                <label className="block text-sm font-medium text-[#1b2a44] mb-2">
                  Assign to Class (Required for Students)
                </label>
                <select
                  className="w-full px-3 py-2 border border-[rgba(7,27,58,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#071B3A] focus:border-transparent"
                  {...form.register('classId')}
                >
                  <option value="">Select a class</option>
                  {loadingClasses ? (
                    <option>Loading classes...</option>
                  ) : classes.length === 0 ? (
                    <option>No classes available</option>
                  ) : (
                    classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.joinCode})
                      </option>
                    ))
                  )}
                </select>
                {form.formState.errors.classId?.message && (
                  <span className="mt-1 block text-xs text-rose-600">
                    {form.formState.errors.classId?.message}
                  </span>
                )}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-[#071B3A] hover:bg-[#051629] text-white"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Creating User...' : 'Create User'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/admin?tab=users')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminShell>
  )
}
