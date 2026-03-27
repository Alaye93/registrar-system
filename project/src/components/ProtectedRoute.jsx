import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'sans-serif'
      }}>
        <div>Loading System...</div>
      </div>
    );
  }

  // 1. If no user is logged in, send them to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Role Check: Use user.role (from your AuthContext/JWT)
  // We check if allowedRoles exists, then verify if the user's role is included
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.warn(`Access Denied: Role '${user.role}' not in approved list:`, allowedRoles);
    return <Navigate to="/unauthorized" replace />;
  }

  /* 3. THE FIX: 
    If this is used as a wrapper <ProtectedRoute>Page</ProtectedRoute>, return children.
    If it is used as a layout <Route element={<ProtectedRoute />} />, return <Outlet />.
  */
  return children ? children : <Outlet />;
};