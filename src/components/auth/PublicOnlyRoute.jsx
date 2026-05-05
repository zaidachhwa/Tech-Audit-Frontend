import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * PublicOnlyRoute — wraps login/register pages.
 * If the user is already logged in with a valid role, send them
 * straight to their own dashboard instead of showing the login page.
 */
export default function PublicOnlyRoute({ children }) {
  const { user } = useAuth();

  if (user && user.role) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
}
