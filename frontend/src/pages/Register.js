import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' });

  const { register } = useAuth();
  const navigate = useNavigate();

  const calculatePasswordStrength = (password) => {
    if (!password) return { score: 0, text: '', color: '' };

    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    score = Object.values(checks).filter(Boolean).length;

    const strength = {
      0: { text: '', color: '' },
      1: { text: 'Very Weak', color: '#ff4646' },
      2: { text: 'Weak', color: '#ff8e46' },
      3: { text: 'Fair', color: '#f5bd1f' },
      4: { text: 'Good', color: '#4fb848' },
      5: { text: 'Strong', color: '#22d3ee' }
    };

    return { score, ...strength[score] };
  };

  const validateField = (name, value) => {
    const errors = {};

    if (name === 'username') {
      if (!value) {
        errors.username = 'Username is required';
      } else if (value.length < 3) {
        errors.username = 'Username must be at least 3 characters';
      } else if (value.length > 30) {
        errors.username = 'Username must be less than 30 characters';
      } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        errors.username = 'Username can only contain letters, numbers, and underscores';
      }
    }

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

    if (name === 'confirmPassword') {
      if (!value) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (value !== formData.password) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    if (name === 'displayName' && value && value.length > 50) {
      errors.displayName = 'Display name must be less than 50 characters';
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Update password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Real-time validation
    const errors = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: errors[name]
    }));

    // Revalidate confirmPassword when password changes
    if (name === 'password' && formData.confirmPassword) {
      const confirmErrors = validateField('confirmPassword', formData.confirmPassword);
      setFieldErrors(prev => ({
        ...prev,
        confirmPassword: confirmErrors.confirmPassword
      }));
    }

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
    const allErrors = {
      ...validateField('username', formData.username),
      ...validateField('email', formData.email),
      ...validateField('password', formData.password),
      ...validateField('confirmPassword', formData.confirmPassword),
      ...validateField('displayName', formData.displayName)
    };

    if (Object.keys(allErrors).length > 0) {
      setFieldErrors(allErrors);
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to register. Please try again.';
      setError(errorMessage);

      // Highlight relevant field based on error
      if (errorMessage.toLowerCase().includes('username')) {
        setFieldErrors(prev => ({ ...prev, username: ' ' }));
      }
      if (errorMessage.toLowerCase().includes('email')) {
        setFieldErrors(prev => ({ ...prev, email: ' ' }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="magical-cat">
          <svg viewBox="0 0 512 512" fill="#a890fe" opacity="0.8" width="60" height="60">
            <path d="M226.5 92.9c14.3 7.3 22.8 23 22.8 39.1V160h64v-28c0-16.1 8.5-31.8 22.8-39.1 18.1-9.2 39.8-5.3 53.7 9.7L420.5 137c15.8-9.1 33.5-13.8 51.5-13.8h24c8.8 0 16 7.2 16 16v50.2c0 24.3-11.4 47.1-30.8 61.4L441 280.9V416c0 53-43 96-96 96H167c-53 0-96-43-96-96V280.9l-40.2-30.1C11.4 236.5 0 213.7 0 189.4V139.2c0-8.8 7.2-16 16-16h24c18 0 35.7 4.7 51.5 13.8l30.7-34.4c13.9-15 35.6-18.9 53.7-9.7z" />
          </svg>
        </div>
        <h1>Luminar</h1>
        <p>Join the magical arena</p>

        <div className="auth-switcher">
          <Link to="/login" className="auth-switcher-btn">Login</Link>
          <Link to="/register" className="auth-switcher-btn active">Sign Up</Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Choose a username"
              className={fieldErrors.username ? 'input-error' : ''}
              required
              minLength="3"
              maxLength="30"
              autoComplete="username"
            />
            {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
          </div>

          <div className="form-group">
            <label>Display Name</label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Your display name (optional)"
              className={fieldErrors.displayName ? 'input-error' : ''}
              maxLength="50"
              autoComplete="name"
            />
            {fieldErrors.displayName && <span className="field-error">{fieldErrors.displayName}</span>}
          </div>

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
                placeholder="Create a password"
                className={fieldErrors.password ? 'input-error' : ''}
                required
                minLength="6"
                autoComplete="new-password"
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
            {formData.password && passwordStrength.text && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div
                    className="strength-fill"
                    style={{
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      backgroundColor: passwordStrength.color
                    }}
                  ></div>
                </div>
                <span className="strength-text" style={{ color: passwordStrength.color }}>
                  {passwordStrength.text}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Confirm your password"
                className={fieldErrors.confirmPassword ? 'input-error' : ''}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : 'Join Arena'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
