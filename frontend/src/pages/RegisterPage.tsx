import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useAuth, type Role } from '../store/auth'
import { getApiErrorMessage } from '../lib/api'
import { AuthSplitLayout } from '../components/layout/AuthSplitLayout'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['TEACHER', 'STUDENT']),
})

type FormValues = z.infer<typeof schema>

export function RegisterPage() {
  const auth = useAuth()
  const nav = useNavigate()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', role: 'STUDENT' },
  })

  async function onSubmit(values: FormValues) {
    try {
      await auth.register(values as { email: string; password: string; role: Role })
      toast.success('Account created')
      nav('/', { replace: true })
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    }
  }

  return (
    <AuthSplitLayout title="Register">
      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        <Input
          label="Email"
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
          <div className="mb-2 text-sm font-medium text-[#1b2a44]">Role</div>
          <label className="flex items-center gap-2 text-sm text-[#0b1220]">
            <input
              type="radio"
              value="TEACHER"
              className="h-4 w-4 accent-[#071B3A]"
              {...form.register('role')}
            />
            Teacher
          </label>
          <label className="mt-2 flex items-center gap-2 text-sm text-[#0b1220]">
            <input
              type="radio"
              value="STUDENT"
              className="h-4 w-4 accent-[#071B3A]"
              {...form.register('role')}
            />
            Student
          </label>
          {form.formState.errors.role?.message ? (
            <span className="mt-2 block text-xs text-rose-600">
              {form.formState.errors.role?.message}
            </span>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Registering…' : 'Register now'}
        </Button>

        <label className="flex items-center gap-2 text-xs text-[#5b6474]">
          <input type="checkbox" className="h-4 w-4 accent-[#071B3A]" />
          Remember Me
        </label>

        <p className="pt-2 text-center text-sm text-[#5b6474]">
          Already have an account?{' '}
          <Link className="font-medium text-[#071B3A] hover:underline" to="/login">
            Login
          </Link>
        </p>
      </form>
    </AuthSplitLayout>
  )
}

