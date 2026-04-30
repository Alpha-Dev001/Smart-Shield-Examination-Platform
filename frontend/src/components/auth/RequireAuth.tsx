import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth, type Role } from '../../store/auth'

export function RequireAuth({ role }: { role?: Role }) {
  const auth = useAuth()
  const loc = useLocation()

  if (!auth.isHydrated) {
    return (
      <div className="flex min-h-full items-center justify-center text-sm smesh-muted">
        Loading…
      </div>
    )
  }

  if (!auth.accessToken || !auth.user) {
    return <Navigate to="/login" state={{ from: loc }} replace />
  }

  if (role && auth.user.role !== role) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

