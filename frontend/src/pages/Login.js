import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SplashScreen from '../components/SplashScreen';

const Login = () => {
  const [showSplash, setShowSplash] = useState(() => {
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    return !hasSeenSplash;
  });

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSplashComplete = () => {
    sessionStorage.setItem('hasSeenSplash', 'true');
    setShowSplash(false);
  };

  const validateField = (name, value) => {
    const errors = {};

    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) {
        errors.email = 'Email is required';
      } else if (!emailRegex.test(value)) {
        errors.email = 'Invalid email format';
      }
    }

    if (name === 'password') {
      if (!value) {
        errors.password = 'Password is required';
      } else if (value.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Real-time validation
    const errors = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: errors[name]
    }));

    // Clear general error when user starts typing
    if (error) setError('');
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const errors = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: errors[name]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    const emailErrors = validateField('email', formData.email);
    const passwordErrors = validateField('password', formData.password);
    const allErrors = { ...emailErrors, ...passwordErrors };

    if (Object.keys(allErrors).length > 0) {
      setFieldErrors(allErrors);
      return;
    }

    setLoading(true);

    try {
      await login(formData);
      navigate('/');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to login. Please check your credentials.';
      setError(errorMessage);

      // Highlight fields on auth error
      if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('password')) {
        setFieldErrors({
          email: ' ',
          password: ' '
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Luminar</h1>
        <p>Enter the magical arena</p>

        <div className="auth-switcher">
          <Link to="/login" className="auth-switcher-btn active">Login</Link>
          <Link to="/register" className="auth-switcher-btn">Sign Up</Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your email"
              className={fieldErrors.email ? 'input-error' : ''}
              required
              autoComplete="email"
            />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your password"
                className={fieldErrors.password ? 'input-error' : ''}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Entering...
              </>
            ) : 'Enter Arena'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
