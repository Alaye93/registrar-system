import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShieldOff, FiArrowLeft, FiHome, FiAlertTriangle, FiLock } from 'react-icons/fi';
import '../styles/Auth.css';

/**
 * Unauthorized Access Page
 * EDCSC Registrar System - Security Protocol
 * Handles 403 Forbidden with professional military protocol
 */

export const Unauthorized = () => {
  const navigate = useNavigate();

  const handleGoBack = () => navigate(-1);
  const handleGoHome = () => navigate('/dashboard');

  return (
    <div className="auth-container unauthorized-page">
      <div className="auth-card security-border">
        <div className="unauthorized-content">
          {/* Security Icon with Advanced Animation */}
          <div className="security-icon-wrapper">
            <FiShieldOff size={78} className="error-icon-pulse" />
            <div className="security-ring-1"></div>
            <div className="security-ring-2"></div>
          </div>

          <div className="error-header">
            <div className="error-code">ERROR 403 • ACCESS DENIED</div>
            <h1 className="error-title">UNAUTHORIZED ACCESS</h1>
          </div>

          <div className="error-divider"></div>

          <p className="error-message">
            Your current security clearance does not permit access to this restricted module.<br />
            This attempt has been logged under <strong>Protocol RBAC-403</strong>.
          </p>

          <div className="security-notice">
            <FiAlertTriangle size={20} />
            <span>Contact DCSC IT Security Division if you believe this is an error.</span>
          </div>

          <div className="unauthorized-actions">
            <button 
              onClick={handleGoBack} 
              className="btn-ghost"
            >
              <FiArrowLeft size={18} />
              RETURN TO PREVIOUS PAGE
            </button>
            
            <button 
              onClick={handleGoHome} 
              className="btn-primary"
            >
              <FiHome size={18} />
              RETURN TO DASHBOARD
            </button>
          </div>
        </div>
      </div>

      {/* Security Footer */}
      <div className="security-footer">
        <div className="protocol-info">
          <FiLock size={14} /> PROTOCOL RBAC-ENFORCED • SESSION LOGGED • IP RECORDED
        </div>
        <div className="system-info">
          ETHIOPIAN DEFENSE COMMAND AND STAFF COLLEGE • 2026
        </div>
      </div>
    </div>
  );
};