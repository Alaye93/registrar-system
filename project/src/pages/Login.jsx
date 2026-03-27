import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi'; // Icons for a "Super" look
import '../styles/Auth.css';

export const Login = () => {
  const navigate = useNavigate();
  // FIXED: Added 'loading' and 'user' from context
  const { signIn, user, loading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // REDIRECT IF ALREADY LOGGED IN
  // If the user is already authenticated, don't show the login screen
  if (user && !authLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 1. Basic Validation
    if (!formData.email || !formData.password) {
      setError('Please provide both email and password.');
      setLoading(false);
      return;
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid academic email address.');
      setLoading(false);
      return;
    }

    try {
      // 3. Call the SQL Server-based signIn
      const result = await signIn(formData.email, formData.password);

      if (result.success) {
        navigate('/dashboard');
      } else {
        // Handle specific error messages from your Node.js backend
        setError(result.message || 'Authentication failed. Check your credentials.');
      }
    } catch (err) {
      setError('Server Connection Error. Please verify the backend API is online.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="loading-screen">Verifying Session...</div>;

  return (
    <div className="auth-outer-wrapper">
      <div className="auth-container fade-in">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
               <FiShield size={40} color="#2563eb" />
            </div>
            <h1>EDCSC Registrar</h1>
            <p>Defence Command and Staff College</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
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
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-login-submit" disabled={loading}>
              {loading ? (
                <span className="spinner-small">Authenticating...</span>
              ) : (
                'Sign In to Portal'
              )}
            </button>
            
            <div className="auth-footer-note">
              <p>© 2026 EDCSC Information Systems Unit</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};