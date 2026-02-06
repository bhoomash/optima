import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute, { AdminRoute } from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import FacultyPage from './pages/FacultyPage';
import RoomsPage from './pages/RoomsPage';
import SubjectsPage from './pages/SubjectsPage';
import ClassesPage from './pages/ClassesPage';
import TimetablePage from './pages/TimetablePage';
import LoginPage from './pages/LoginPage';
import FacultyTimetablePage from './pages/FacultyTimetablePage';

/**
 * Navigation Component with Auth-aware buttons
 */
const Navigation = () => {
  const { isAuthenticated, user, logout, isAdmin, loading } = useAuth();

  if (loading) return null;

  return (
    <header className="header">
      <div className="header-content">
        <h1>
          📚 Smart University Scheduler
        </h1>
        {isAuthenticated ? (
          <>
            <nav>
              <NavLink 
                to="/" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                end
              >
                Dashboard
              </NavLink>
              {isAdmin() && (
                <>
                  <NavLink 
                    to="/faculty" 
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    Faculty
                  </NavLink>
                  <NavLink 
                    to="/rooms" 
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    Rooms
                  </NavLink>
                  <NavLink 
                    to="/subjects" 
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    Subjects
                  </NavLink>
                  <NavLink 
                    to="/classes" 
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    Classes
                  </NavLink>
                </>
              )}
              <NavLink 
                to="/timetable" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Timetable
              </NavLink>
            </nav>
            <div className="user-section">
              <span className="user-info">
                {user?.name} 
                <span className="role-badge">{user?.role}</span>
              </span>
              <button onClick={logout} className="logout-btn">
                Logout
              </button>
            </div>
          </>
        ) : (
          <nav>
            <NavLink 
              to="/timetable" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Timetable
            </NavLink>
            <NavLink 
              to="/login" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Login
            </NavLink>
          </nav>
        )}
      </div>
    </header>
  );
};

/**
 * Main App Content Component
 */
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  // Check if we're on faculty-timetable page (standalone, no nav)
  const isFacultyTimetablePage = location.pathname === '/faculty-timetable';

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Render faculty timetable without navigation
  if (isFacultyTimetablePage) {
    return <FacultyTimetablePage />;
  }

  return (
    <div className="app-container">
      <Navigation />

      {/* Main Content */}
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
          } />

          {/* Protected Routes - All authenticated users */}
          <Route path="/" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Timetable - PUBLIC (no login required for students) */}
          <Route path="/timetable" element={<TimetablePage />} />

          {/* Admin Only Routes */}
          <Route path="/faculty" element={
            <AdminRoute>
              <FacultyPage />
            </AdminRoute>
          } />
          <Route path="/rooms" element={
            <AdminRoute>
              <RoomsPage />
            </AdminRoute>
          } />
          <Route path="/subjects" element={
            <AdminRoute>
              <SubjectsPage />
            </AdminRoute>
          } />
          <Route path="/classes" element={
            <AdminRoute>
              <ClassesPage />
            </AdminRoute>
          } />

          {/* Catch all - redirect to dashboard or timetable */}
          <Route path="*" element={
            <Navigate to={isAuthenticated ? "/" : "/timetable"} replace />
          } />
        </Routes>
      </main>

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '1rem', 
        color: '#666',
        fontSize: '0.85rem'
      }}>
        Smart University Resource Scheduling System © 2026
      </footer>
    </div>
  );
};

/**
 * Main Application Component
 * Smart University Resource Scheduling System
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
