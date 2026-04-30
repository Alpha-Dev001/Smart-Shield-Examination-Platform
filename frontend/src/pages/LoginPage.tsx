import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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
      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={form.formState.errors.email?.message}
          {...form.register('email')}
        />
        <div>
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            error={form.formState.errors.password?.message}
            {...form.register('password')}
          />
          <div className="mt-2 text-right text-xs">
            <button
              type="button"
              className="text-[#071B3A]/70 hover:text-[#071B3A] hover:underline"
              onClick={() => toast.message('Password reset is not implemented yet.')}
            >
              Forgot password?
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Logging in…' : 'Login'}
        </Button>

        <label className="flex items-center gap-2 text-xs text-[#5b6474]">
          <input type="checkbox" className="h-4 w-4 accent-[#071B3A]" />
          Remember Me
        </label>

        <p className="pt-2 text-center text-sm text-[#5b6474]">
          No account?{' '}
          <Link className="font-medium text-[#071B3A] hover:underline" to="/register">
            Register
          </Link>
        </p>
      </form>
    </AuthSplitLayout>
  )
}

