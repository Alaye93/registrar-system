import { useNavigate } from 'react-router-dom';
import { FiShieldOff, FiArrowLeft, FiHome } from 'react-icons/fi';
import '../styles/Auth.css';

/**
 * Unauthorized Access Component
 * System: EduRegistrar ERP v2.0
 * Purpose: Handles 403 Forbidden scenarios for Role-Based Access Control (RBAC).
 */
export const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-container unauthorized-page fade-in">
      <div className="auth-card security-border">
        <div className="unauthorized-content">
          <div className="security-icon-wrapper">
            <FiShieldOff size={64} className="error-icon-pulse" />
          </div>
          
          <h1 className="error-title">Access Restricted</h1>
          <div className="error-divider"></div>
          
          <p className="error-message">
            Your current account privileges do not permit access to this administrative module. 
            Please contact the <strong>DCSC IT Department</strong> if you believe this is an error.
          </p>

          <div className="unauthorized-actions">
            <button 
              onClick={() => navigate(-1)} 
              className="btn-ghost"
            >
              <FiArrowLeft /> Go Back
            </button>
            
            <button 
              onClick={() => navigate('/dashboard')} 
              className="btn-primary"
            >
              <FiHome /> Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="security-footer">
        <small>Protocol: RBAC-Enforced-Session | IP Logged</small>
      </div>

      <style jsx="true">{`
        .unauthorized-page { background: #f8fafc; }
        .security-border { border-top: 4px solid #ef4444; text-align: center; padding: 40px; }
        .security-icon-wrapper { color: #ef4444; margin-bottom: 20px; }
        .error-title { color: #1e293b; font-size: 1.75rem; font-weight: 800; margin: 0; }
        .error-divider { height: 2px; width: 50px; background: #e2e8f0; margin: 15px auto; }
        .error-message { color: #64748b; line-height: 1.6; margin-bottom: 30px; max-width: 320px; margin-left: auto; margin-right: auto; }
        .unauthorized-actions { display: flex; gap: 12px; justify-content: center; }
        .security-footer { margin-top: 20px; color: #94a3b8; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; }
        
        .error-icon-pulse {
          animation: pulse-red 2s infinite;
        }

        @keyframes pulse-red {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};