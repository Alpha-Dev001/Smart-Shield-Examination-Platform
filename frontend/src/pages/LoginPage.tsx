import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useAuth } from '../store/auth'
import { getApiErrorMessage } from '../lib/api'
import { AuthSplitLayout } from '../components/layout/AuthSplitLayout'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const auth = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const from = (loc.state as any)?.from?.pathname ?? '/'

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: FormValues) {
    try {
      await auth.login(values)
      toast.success('Logged in')
      nav(from, { replace: true })
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    }
  }

  return (
    <AuthSplitLayout title="Login">
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <label className="smesh-form-label mb-2 block">Email</label>
          <input
            type="email"
            autoComplete="email"
            className="smesh-form-input w-full px-4 py-3 border border-[rgba(11,18,32,0.14)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#071B3A] focus:border-transparent transition-all duration-200"
            placeholder="Enter your email"
            {...form.register('email')}
          />
          {form.formState.errors.email?.message && (
            <p className="mt-1 text-xs text-rose-600 smesh-form-text">{form.formState.errors.email?.message}</p>
          )}
        </div>

        <div>
          <label className="smesh-form-label mb-2 block">Password</label>
          <input
            type="password"
            autoComplete="current-password"
            className="smesh-form-input w-full px-4 py-3 border border-[rgba(11,18,32,0.14)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#071B3A] focus:border-transparent transition-all duration-200"
            placeholder="Enter your password"
            {...form.register('password')}
          />
          {form.formState.errors.password?.message && (
            <p className="mt-1 text-xs text-rose-600 smesh-form-text">{form.formState.errors.password?.message}</p>
          )}
          <div className="mt-3 text-right">
            <button
              type="button"
              className="smesh-form-link hover:underline"
              onClick={() => toast.message('Password reset is not implemented yet.')}
            >
              Forgot password?
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-[#071B3A] to-[#0a2347] hover:from-[#051629] hover:to-[#071B3A] text-white px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border border-white/20 backdrop-blur-sm"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Logging in…' : 'Login'}
        </Button>

        <label className="flex items-center gap-3 smesh-form-text cursor-pointer">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[#071B3A] rounded"
          />
          Remember Me
        </label>

      </form>
    </AuthSplitLayout>
  )
}

