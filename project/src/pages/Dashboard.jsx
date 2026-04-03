import { motion } from "framer-motion";
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, BookOpen, UserCheck, Clock, 
  Plus, FileText, UserPlus, Shield, Activity, 
  RefreshCw, Lock, AlertCircle 
} from 'lucide-react';
import { apiClient } from '../services/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const [data, setData] = useState({
    students: [],
    staff: [],
    courses: [],
    enrollments: []
  });

  const [loading, setLoading] = useState(true);
  const [telemetry, setTelemetry] = useState({
    status: 'INITIALIZING',
    txId: 'PENDING',
    lastSync: null
  });

  const abortControllerRef = useRef(null);

  // Advanced Data Fetch with AbortController
  const fetchAllData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setTelemetry(prev => ({ ...prev, status: 'SYNCING' }));

    try {
      const [students, staff, courses, enrollments] = await Promise.all([
        apiClient('/students', { signal: controller.signal }),
        apiClient('/staff', { signal: controller.signal }),
        apiClient('/courses', { signal: controller.signal }),
        apiClient('/enrollments', { signal: controller.signal })
      ]);

      setData({
        students: students || [],
        staff: staff || [],
        courses: courses || [],
        enrollments: enrollments || []
      });

      setTelemetry({
        status: 'ACTIVE',
        txId: `TX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        lastSync: new Date().toISOString()
      });
    } catch (err) {
      if (err.name === 'AbortError') return;

      console.error('Dashboard fetch failed:', err);
      setTelemetry({
        status: 'CRITICAL_ERROR',
        txId: 'FAULT',
        lastSync: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    return () => abortControllerRef.current?.abort();
  }, [fetchAllData]);

  // Tactical Statistics
  const stats = useMemo(() => [
    {
      label: 'OFFICERs',
      value: data.students.length,
      icon: <Users size={24} />,
      color: '#c5a059'
    },
    {
      label: 'FACULTY PERSONNEL',
      value: data.staff.length,
      icon: <UserCheck size={24} />,
      color: '#3b82f6'
    },
    {
      label: 'ACTIVE Personnel',
      value: data.courses.length,
      icon: <BookOpen size={24} />,
      color: '#10b981'
    },
    {
      label: 'DEPLOYMENTS',
      value: data.enrollments.length,
      icon: <Clock size={24} />,
      color: '#f59e0b'
    }
  ], [data]);

  // Professional PDF Export
  const handleExportReport = useCallback(() => {
    const win = window.open('', '_blank');
    if (!win) {
      alert('Please allow popups to export report');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>EDCSC Registrar Intelligence Report - ${telemetry.txId}</title>
        <style>
          body { font-family: 'Courier New', monospace; margin: 40px; color: #111; background: #f8f8f8; }
          .header { text-align: center; border-bottom: 4px double #000; padding-bottom: 20px; margin-bottom: 30px; }
          .watermark { position: fixed; top: 45%; left: 50%; transform: translate(-50%, -50%) rotate(-35deg); 
                       font-size: 90px; opacity: 0.08; color: #c5a059; pointer-events: none; z-index: -1; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #333; padding: 12px; text-align: left; }
          th { background: #1a1a1a; color: #c5a059; }
          .footer { margin-top: 60px; text-align: center; font-size: 10px; color: #666; }
        </style>
      </head>
      <body>
        <div class="watermark">CLASSIFIED</div>
        <div class="header">
          <h1>ETHIOPIAN DEFENSE COMMAND AND STAFF COLLEGE</h1>
          <p>REGISTRAR INTELLIGENCE DIVISION • OFFICIAL REPORT</p>
          <p>Transaction ID: ${telemetry.txId} | Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        <table>
          <thead>
            <tr><th>SECTOR</th><th>STRENGTH</th></tr>
          </thead>
          <tbody>
            ${stats.map(s => `
              <tr>
                <td>${s.label}</td>
                <td style="font-weight: bold; font-size: 1.2em;">${s.value}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          © 2026 EDCSC • SECURITY CLEARANCE: LEVEL 4 • CONFIDENTIAL
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `;

    win.document.write(htmlContent);
    win.document.close();
  }, [telemetry.txId, stats]);

  return (
    <div className="dashboard-container">
      {/* COMMAND HEADER */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="military-breadcrumb">
            <Shield size={16} /> COMMAND LEVEL 04 • REGISTRAR INTELLIGENCE
          </div>
          <h1>REGISTRAR INTELLIGENCE</h1>
          <div className="sync-timestamp">
            TX_REF: <span className="time">{telemetry.txId}</span> • 
            {telemetry.lastSync && new Date(telemetry.lastSync).toLocaleTimeString()}
          </div>
        </div>

        <div className="status-corner">
          <div className={`status ${telemetry.status.toLowerCase()}`}>
            {loading ? 'ANALYZING...' : telemetry.status}
          </div>
          <button 
            className="btn-refresh" 
            onClick={fetchAllData} 
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            RE-SCAN SECTOR
          </button>
        </div>
      </header>

      {/* TACTICAL STATS GRID */}
      <section className="stats-grid">
        {stats.map((stat, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="stat-card"
            style={{ borderLeftColor: stat.color }}
          >
            <div className="stat-icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <span className="stat-label">{stat.label}</span>
              <h2 className="stat-value">
                {loading ? '——' : stat.value.toLocaleString()}
              </h2>
            </div>
          </motion.div>
        ))}
      </section>

      {/* MAIN OPERATIONAL AREA */}
      <div className="main-grid-layout">
        {/* COMMAND ACTIONS */}
        <div className="card tactical-panel">
          <div className="panel-header">
            <h3>COMMAND ACTIONS</h3>
          </div>
          <div className="actions-vertical">
            <button onClick={() => navigate('/students')}>
              <UserPlus size={18} /> ENROLL OFFICER
            </button>
            <button onClick={() => navigate('/courses')}>
              <Plus size={18} /> DEFINE COURSE
            </button>
            <button className="btn-report" onClick={handleExportReport}>
              <FileText size={18} /> EXPORT OFFICIAL REPORT
            </button>
          </div>
        </div>

        {/* RECENT REGISTRY LOGS */}
        <div className="card log-panel">
          <div className="panel-header">
            <h3>RECENT REGISTRY LOGS</h3>
            <button 
              className="view-all-link" 
              onClick={() => navigate('/students')}
            >
              ACCESS FULL ARCHIVE →
            </button>
          </div>

          <div className="table-wrapper">
            {loading ? (
              <div className="tactical-loader">
                <RefreshCw size={28} className="spin" />
                <p>DECRYPTING SECURE LOGS...</p>
              </div>
            ) : (
              <table className="tactical-table">
                <thead>
                  <tr>
                    <th>OFFICER_ID</th>
                    <th>NAME</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {data.students.slice(0, 6).map((student) => (
                    <tr key={student.id || student.StudentID}>
                      <td className="font-mono text-gold">
                        {student.StudentID || student.id}
                      </td>
                      <td>{student.full_name || student.FullName || '—'}</td>
                      <td>
                        <span className={`status-pill ${(student.status || 'active').toLowerCase()}`}>
                          {student.status || 'ACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {data.students.length === 0 && (
                    <tr>
                      <td colSpan="3" className="no-data">No recent registry activity</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* SECURE FOOTER */}
      <footer className="dashboard-footer">
        <div className="footer-line" />
        <p>
          <Lock size={14} style={{ marginRight: '6px' }} />
          SECURED BY EDCSC PROTOCOL-X • CLEARANCE LEVEL 4 • © 2026
        </p>
      </footer>
    </div>
  );
};

// At the very bottom of Dashboard.jsx
export default Dashboard;   // ← Add this if it's not there
// OR keep it as:
export { Dashboard };