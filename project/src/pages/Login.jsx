import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import '../styles/Auth.css';

export const Login = () => {
  const navigate = useNavigate();
  const { signIn, user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (user && !authLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Please provide both your email and password.');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const result = await signIn(formData.email, formData.password);

      if (result?.success) {
        navigate('/dashboard');
      } else {
        setError(result?.message || 'Authentication failed. Please check your credentials.');
      }
    } catch {
      setError('Unable to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="loading-screen">Verifying session...</div>;
  }

  return (
    <div className="auth-outer-wrapper">
      <div className="auth-container fade-in">
        <div className="auth-card">
          <header className="auth-header">
            <div className="auth-logo">
              <FiShield size={40} color="#2563eb" />
            </div>
            <h1>EDCSC Registrar</h1>
            <p>Defence Command and Staff College</p>
          </header>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <h2>Secure Login</h2>

            {error && (
              <div className="error-alert">
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={loading}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-login-submit" 
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-small">Authenticating...</span>
              ) : (
                'Sign In to Portal'
              )}
            </button>

            <footer className="auth-footer-note">
              <p>© 2026 EDCSC Information Systems Unit</p>
            </footer>
          </form>
        </div>
      </div>
    </div>
  );
};