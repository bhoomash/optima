/**
 * Protected Route Component
 * Wraps routes that require authentication and/or specific roles
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute - Protects routes based on authentication and roles
 * @param {React.ReactNode} children - Child components to render if authorized
 * @param {string[]} allowedRoles - Array of roles allowed to access this route (optional)
 * @param {boolean} requireAdmin - Shorthand for requiring admin role
 * @param {boolean} requireFaculty - Shorthand for requiring faculty or admin role
 */
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  requireAdmin = false,
  requireFaculty = false 
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Determine required roles
  let requiredRoles = [...allowedRoles];
  if (requireAdmin) {
    requiredRoles = ['admin'];
  }
  if (requireFaculty) {
    requiredRoles = ['admin', 'faculty'];
  }

  // Check role-based access if roles are specified
  if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role)) {
    return (
      <div style={styles.unauthorizedContainer}>
        <div style={styles.unauthorizedCard}>
          <div style={styles.iconWrapper}>
            <span style={styles.icon}>🚫</span>
          </div>
          <h2 style={styles.title}>Access Denied</h2>
          <p style={styles.message}>
            You don't have permission to access this page.
          </p>
          <p style={styles.roleInfo}>
            Your role: <strong>{user?.role || 'Unknown'}</strong>
            <br />
            Required: <strong>{requiredRoles.join(' or ')}</strong>
          </p>
          <button 
            onClick={() => window.history.back()} 
            style={styles.backButton}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // User is authenticated and authorized
  return children;
};

/**
 * AdminRoute - Shorthand for admin-only routes
 */
export const AdminRoute = ({ children }) => (
  <ProtectedRoute requireAdmin>{children}</ProtectedRoute>
);

/**
 * FacultyRoute - Shorthand for faculty and admin routes
 */
export const FacultyRoute = ({ children }) => (
  <ProtectedRoute requireFaculty>{children}</ProtectedRoute>
);

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #E5E7EB',
    borderTop: '4px solid #1a73e8',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    marginTop: '16px',
    color: '#6B7280',
    fontSize: '14px'
  },
  unauthorizedContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px'
  },
  unauthorizedCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    padding: '48px',
    textAlign: 'center',
    maxWidth: '400px'
  },
  iconWrapper: {
    marginBottom: '24px'
  },
  icon: {
    fontSize: '64px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1F2937',
    margin: '0 0 16px 0'
  },
  message: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '0 0 16px 0'
  },
  roleInfo: {
    fontSize: '13px',
    color: '#9CA3AF',
    margin: '0 0 24px 0',
    padding: '12px',
    backgroundColor: '#F9FAFB',
    borderRadius: '6px'
  },
  backButton: {
    backgroundColor: '#1a73e8',
    color: '#ffffff',
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  }
};

export default ProtectedRoute;
