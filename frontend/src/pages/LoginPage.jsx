/**
 * Login Page Component
 * Handles user and faculty authentication
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HiOutlineLockClosed, HiOutlineUser, HiOutlineExclamation, HiOutlineEye, HiOutlineEyeOff, HiOutlineArrowLeft } from 'react-icons/hi';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';

const LoginPage = () => {
  const [loginType, setLoginType] = useState('admin'); // 'admin' or 'faculty'
  
  // Admin login state
  const [adminForm, setAdminForm] = useState({
    email: 'bhoomashr@gmail.com',
    password: 'admin123'
  });
  
  // Faculty login state
  const [facultyForm, setFacultyForm] = useState({
    facultyId: 'FAC001',
    name: 'Dr. Rajesh Kumar'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const { login, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Clear errors when switching login type or mounting
  useEffect(() => {
    clearError();
    setLocalError('');
  }, [clearError, loginType]);

  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdminForm(prev => ({ ...prev, [name]: value }));
    setLocalError('');
  };

  const handleFacultyChange = (e) => {
    const { name, value } = e.target;
    setFacultyForm(prev => ({ ...prev, [name]: value }));
    setLocalError('');
  };

  const validateAdminForm = () => {
    if (!adminForm.email.trim()) {
      setLocalError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(adminForm.email)) {
      setLocalError('Please enter a valid email');
      return false;
    }
    if (!adminForm.password) {
      setLocalError('Password is required');
      return false;
    }
    return true;
  };

  const validateFacultyForm = () => {
    if (!facultyForm.facultyId.trim()) {
      setLocalError('Faculty ID is required');
      return false;
    }
    if (!facultyForm.name.trim()) {
      setLocalError('Name is required');
      return false;
    }
    return true;
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAdminForm()) return;
    
    setIsSubmitting(true);
    setLocalError('');
    
    const result = await login(adminForm.email, adminForm.password);
    
    setIsSubmitting(false);
    
    if (!result.success) {
      setLocalError(result.error);
    }
  };

  const handleFacultySubmit = async (e) => {
    e.preventDefault();
    
    if (!validateFacultyForm()) return;
    
    setIsSubmitting(true);
    setLocalError('');
    
    try {
      const response = await authApi.facultyLogin({
        facultyId: facultyForm.facultyId.trim(),
        name: facultyForm.name.trim()
      });
      
      if (response.data.success) {
        // Store faculty token and info
        localStorage.setItem('facultyToken', response.data.data.token);
        localStorage.setItem('facultyInfo', JSON.stringify(response.data.data.faculty));
        
        // Redirect to faculty timetable page
        navigate('/faculty-timetable', { replace: true });
      }
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Invalid faculty ID or name');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || error;

  return (
    <div style={styles.container}>
      {/* Left Side - Login Form */}
      <div style={styles.leftPanel}>
        <div style={styles.formContainer}>
          <button 
            onClick={() => navigate('/timetable')} 
            style={styles.backBtn}
          >
            <HiOutlineArrowLeft style={{ marginRight: '6px' }} /> Back to Home
          </button>
          <h1 style={styles.title}>LOGIN</h1>
          <p style={styles.subtitle}>
            {loginType === 'admin' 
              ? 'Access your admin dashboard to manage schedules' 
              : 'View your personalized timetable'}
          </p>

          {/* Login Type Tabs */}
          <div style={styles.tabs}>
            <button
              style={{
                ...styles.tab,
                ...(loginType === 'admin' ? styles.activeTab : {})
              }}
              onClick={() => setLoginType('admin')}
            >
              Admin
            </button>
            <button
              style={{
                ...styles.tab,
                ...(loginType === 'faculty' ? styles.activeTab : {})
              }}
              onClick={() => setLoginType('faculty')}
            >
              Faculty
            </button>
          </div>

          {displayError && (
            <div style={styles.errorBox}>
              <HiOutlineExclamation style={styles.errorIcon} />
              {displayError}
            </div>
          )}

          {/* Admin Login Form */}
          {loginType === 'admin' && (
            <form onSubmit={handleAdminSubmit} style={styles.form}>
              <div style={styles.inputWrapper}>
                <HiOutlineUser style={styles.inputIcon} />
                <input
                  type="email"
                  name="email"
                  value={adminForm.email}
                  onChange={handleAdminChange}
                  placeholder="Username"
                  style={styles.input}
                  disabled={isSubmitting}
                  autoComplete="email"
                />
              </div>

              <div style={styles.inputWrapper}>
                <HiOutlineLockClosed style={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={adminForm.password}
                  onChange={handleAdminChange}
                  placeholder="Password"
                  style={styles.input}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.showPasswordBtn}
                >
                  {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                </button>
              </div>

              <button
                type="submit"
                style={{
                  ...styles.submitBtn,
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Login Now'}
              </button>
            </form>
          )}

          {/* Faculty Login Form */}
          {loginType === 'faculty' && (
            <form onSubmit={handleFacultySubmit} style={styles.form}>
              <div style={styles.inputWrapper}>
                <HiOutlineUser style={styles.inputIcon} />
                <input
                  type="text"
                  name="facultyId"
                  value={facultyForm.facultyId}
                  onChange={handleFacultyChange}
                  placeholder="Faculty ID (e.g., FAC001)"
                  style={styles.input}
                  disabled={isSubmitting}
                />
              </div>

              <div style={styles.inputWrapper}>
                <HiOutlineUser style={styles.inputIcon} />
                <input
                  type="text"
                  name="name"
                  value={facultyForm.name}
                  onChange={handleFacultyChange}
                  placeholder="Full Name"
                  style={styles.input}
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                style={{
                  ...styles.submitBtn,
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Verifying...' : 'View Timetable'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Right Side - Image Panel */}
      <div style={styles.rightPanel}>
        <img 
          src="/login.png" 
          alt="Login illustration"
          style={styles.rightImage}
        />
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    gap: 0
  },
  leftPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    position: 'relative',
    overflow: 'auto',
    borderRight: 'none',
    backgroundColor: '#ffffff'
  },
  formContainer: {
    width: '100%',
    maxWidth: '380px',
    zIndex: 1
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    color: '#8b7355',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '8px 0',
    marginBottom: '16px',
    transition: 'color 0.2s'
  },
  title: {
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
    fontSize: '32px',
    fontWeight: '800',
    color: '#1e293b',
    margin: '0 0 12px 0',
    letterSpacing: '-0.02em'
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: '0 0 32px 0',
    lineHeight: 1.5
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px'
  },
  tab: {
    padding: '10px 24px',
    border: '1px solid #d4c4b0',
    backgroundColor: '#faf8f5',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    color: '#6b5b4f',
    transition: 'all 0.2s',
    borderRadius: '8px'
  },
  activeTab: {
    background: '#8b7355',
    color: '#ffffff',
    borderColor: '#8b7355'
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    padding: '12px 16px',
    marginBottom: '20px',
    color: '#dc2626',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  errorIcon: {
    fontSize: '18px',
    flexShrink: 0
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    fontSize: '18px',
    color: '#a89686',
    pointerEvents: 'none'
  },
  input: {
    width: '100%',
    padding: '14px 16px 14px 48px',
    fontSize: '14px',
    border: '1px solid #d4c4b0',
    borderRadius: '12px',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
    fontFamily: "'Inter', sans-serif",
    backgroundColor: '#fffdf9'
  },
  showPasswordBtn: {
    position: 'absolute',
    right: '14px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '4px',
    color: '#a89686',
    display: 'flex',
    alignItems: 'center'
  },
  submitBtn: {
    background: '#8b7355',
    color: '#ffffff',
    padding: '14px 32px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '8px',
    width: 'fit-content',
    alignSelf: 'center'
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    borderLeft: 'none'
  },
  rightImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain'
  }
};

// Add responsive styles for mobile
const mediaQuery = window.matchMedia('(max-width: 768px)');
if (mediaQuery.matches) {
  styles.container.flexDirection = 'column';
  styles.rightPanel.display = 'none';
}

export default LoginPage;
