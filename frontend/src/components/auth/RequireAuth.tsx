import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth, type Role } from '../../store/auth'

export function RequireAuth({ role }: { role?: Role }) {
  const auth = useAuth()
  const loc = useLocation()

  console.log('RequireAuth check:', {
    path: loc.pathname,
    isHydrated: auth.isHydrated,
    hasToken: !!auth.accessToken,
    hasUser: !!auth.user,
    userRole: auth.user?.role,
    requiredRole: role
  })

  if (!auth.isHydrated) {
    return (
      <div className="flex min-h-full items-center justify-center text-sm smesh-muted">
        Loading…
      </div>
    )
  }

  if (!auth.accessToken || !auth.user) {
    console.log('RequireAuth: No token or user, redirecting to login')
    return <Navigate to="/login" state={{ from: loc }} replace />
  }

  if (role && auth.user.role !== role) {
    console.log('RequireAuth: Role mismatch, redirecting to home')
    return <Navigate to="/" replace />
  }

  console.log('RequireAuth: Authentication successful')
  return <Outlet />
}

