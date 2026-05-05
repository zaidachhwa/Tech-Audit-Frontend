import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute — guards every protected page.
 *
 * Logic:
 *  1. No user in context (not logged in)  → redirect to that role's login page
 *  2. User exists but role doesn't match  → redirect to /unauthorized
 *  3. User exists + role matches          → render the page
 *
 * The role check ALSO validates that `user.role` is explicitly set.
 * Old sessions without a role field are treated as unauthenticated.
 */
export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();

  // No session or incomplete session (missing role means invalid/old session)
  if (!user || !user.role) {
    return <Navigate to={`/${role}/login`} replace />;
  }

  // Logged in but accessing a route for a different role
  if (user.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  // All good — render the protected page
  return children;
}
