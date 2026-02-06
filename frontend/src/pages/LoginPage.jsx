/**
 * Login Page Component
 * Handles user and faculty authentication
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';

const LoginPage = () => {
  const [loginType, setLoginType] = useState('admin'); // 'admin' or 'faculty'
  
  // Admin login state
  const [adminForm, setAdminForm] = useState({
    email: '',
    password: ''
  });
  
  // Faculty login state
  const [facultyForm, setFacultyForm] = useState({
    facultyId: '',
    name: ''
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
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Welcome</h1>
          <p style={styles.subtitle}>Sign in to access the University Scheduler</p>
        </div>

        {/* Login Type Tabs */}
        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(loginType === 'admin' ? styles.activeTab : {})
            }}
            onClick={() => setLoginType('admin')}
          >
            🔐 Admin Login
          </button>
          <button
            style={{
              ...styles.tab,
              ...(loginType === 'faculty' ? styles.activeTab : {})
            }}
            onClick={() => setLoginType('faculty')}
          >
            👨‍🏫 Faculty Login
          </button>
        </div>

        {displayError && (
          <div style={styles.errorBox}>
            <span style={styles.errorIcon}>⚠️</span>
            {displayError}
          </div>
        )}

        {/* Admin Login Form */}
        {loginType === 'admin' && (
          <form onSubmit={handleAdminSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                name="email"
                value={adminForm.email}
                onChange={handleAdminChange}
                placeholder="Enter your email"
                style={styles.input}
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.passwordContainer}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={adminForm.password}
                  onChange={handleAdminChange}
                  placeholder="Enter your password"
                  style={styles.input}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.showPasswordBtn}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
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
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Faculty Login Form */}
        {loginType === 'faculty' && (
          <form onSubmit={handleFacultySubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Faculty ID</label>
              <input
                type="text"
                name="facultyId"
                value={facultyForm.facultyId}
                onChange={handleFacultyChange}
                placeholder="Enter your faculty ID (e.g., FAC001)"
                style={styles.input}
                disabled={isSubmitting}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                name="name"
                value={facultyForm.name}
                onChange={handleFacultyChange}
                placeholder="Enter your full name"
                style={styles.input}
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              style={{
                ...styles.submitBtn,
                backgroundColor: '#059669',
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Verifying...' : 'View My Timetable'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: '20px'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    padding: '40px',
    width: '100%',
    maxWidth: '450px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1F2937',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0
  },
  tabs: {
    display: 'flex',
    marginBottom: '24px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #E5E7EB'
  },
  tab: {
    flex: 1,
    padding: '12px 16px',
    border: 'none',
    backgroundColor: '#F9FAFB',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6B7280',
    transition: 'all 0.2s'
  },
  activeTab: {
    backgroundColor: '#1a73e8',
    color: '#ffffff'
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    border: '1px solid #FCA5A5',
    borderRadius: '6px',
    padding: '12px 16px',
    marginBottom: '24px',
    color: '#DC2626',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  errorIcon: {
    fontSize: '16px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  },
  input: {
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
    boxSizing: 'border-box'
  },
  passwordContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  showPasswordBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px'
  },
  submitBtn: {
    backgroundColor: '#1a73e8',
    color: '#ffffff',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '8px'
  }
};

export default LoginPage;
