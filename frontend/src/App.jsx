import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { 
  HiOutlineLogout, 
  HiOutlineViewGrid, 
  HiOutlineUsers, 
  HiOutlineOfficeBuilding, 
  HiOutlineBookOpen, 
  HiOutlineUserGroup,
  HiOutlineCalendar,
  HiOutlineExclamationCircle
} from 'react-icons/hi';
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
 * Logout Confirmation Modal Component
 */
const LogoutConfirmModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="logout-modal-overlay" onClick={onCancel}>
      <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="logout-modal-icon">
          <HiOutlineExclamationCircle />
        </div>
        <h3 className="logout-modal-title">Confirm Logout</h3>
        <p className="logout-modal-message">Are you sure you want to logout?</p>
        <div className="logout-modal-actions">
          <button className="logout-modal-btn cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="logout-modal-btn confirm" onClick={onConfirm}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Sidebar Navigation Component for Admin Dashboard
 */
const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    logout();
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src="/logo.png" alt="Optima" className="sidebar-logo" />
        <span className="sidebar-brand">Optima</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <span className="nav-section-title">MENU</span>
          <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} end>
            <HiOutlineViewGrid className="sidebar-icon" />
            <span>Dashboard</span>
          </NavLink>
          {isAdmin() && (
            <>
              <NavLink to="/faculty" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <HiOutlineUsers className="sidebar-icon" />
                <span>Faculty</span>
              </NavLink>
              <NavLink to="/rooms" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <HiOutlineOfficeBuilding className="sidebar-icon" />
                <span>Rooms</span>
              </NavLink>
              <NavLink to="/subjects" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <HiOutlineBookOpen className="sidebar-icon" />
                <span>Subjects</span>
              </NavLink>
              <NavLink to="/classes" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <HiOutlineUserGroup className="sidebar-icon" />
                <span>Classes</span>
              </NavLink>
            </>
          )}
          <NavLink to="/timetable" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <HiOutlineCalendar className="sidebar-icon" />
            <span>Timetable</span>
          </NavLink>
        </div>

        <div className="nav-section">
          <span className="nav-section-title">OTHER</span>
          <button onClick={handleLogoutClick} className="sidebar-link logout-link">
            <HiOutlineLogout className="sidebar-icon" />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role}</span>
          </div>
        </div>
      </div>

      <LogoutConfirmModal 
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </aside>
  );
};

/**
 * Navigation Component for non-admin users
 */
const Navigation = () => {
  const { isAuthenticated, user, logout, isAdmin, loading } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    logout();
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  if (loading) return null;

  return (
    <header className="header">
      <div className="header-content">
        <h1>
          <img src="/logo.png" alt="Optima" className="logo-icon" />
          Optima
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
              <button onClick={handleLogoutClick} className="logout-btn">
                <HiOutlineLogout style={{ fontSize: '1rem' }} />
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

      <LogoutConfirmModal 
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </header>
  );
};

/**
 * Main App Content Component
 */
const AppContent = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();
  
  // Check if we're on faculty-timetable page or login page (standalone, no nav)
  const isFacultyTimetablePage = location.pathname === '/faculty-timetable';
  const isLoginPage = location.pathname === '/login';

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

  // Render login page without navigation (standalone)
  if (isLoginPage && !isAuthenticated) {
    return <LoginPage />;
  }

  // Admin users get sidebar layout
  if (isAuthenticated && isAdmin()) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-main">
          <main className="dashboard-content">
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/timetable" element={<TimetablePage />} />
              <Route path="/faculty" element={<FacultyPage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/subjects" element={<SubjectsPage />} />
              <Route path="/classes" element={<ClassesPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    );
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
        padding: '1.5rem', 
        color: '#64748b',
        fontSize: '0.875rem',
        borderTop: '1px solid #e2e8f0',
        background: '#ffffff'
      }}>
        Optima - University Resource Scheduling System
      </footer>
    </div>
  );
};

/**
 * Main Application Component
 * Optima - University Resource Scheduling System
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
