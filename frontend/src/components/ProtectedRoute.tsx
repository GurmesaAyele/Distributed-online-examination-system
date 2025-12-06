import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  role?: string
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role && user.role !== role) {
    return <Navigate to={`/${user.role}`} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
