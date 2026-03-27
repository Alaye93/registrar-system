import { useEffect, useState, useCallback, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { apiClient } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiCalendar, FiBarChart2, FiFilter, FiDownload, 
  FiRefreshCw, FiGrid, FiList, FiAlertCircle, FiCheckCircle 
} from 'react-icons/fi';
import '../styles/Management.css';

/**
 * MyAttendance Component
 * Refined for DCSC Registrar System
 * Focus: High-performance filtering and professional academic reporting.
 */
export const MyCourses = () => {
  // Standardizing 'user' and 'loading' from your AuthContext
  const { user, loading: authLoading } = useAuth();
  
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewType, setViewType] = useState('table'); 
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const fetchMyAttendance = useCallback(async (silent = false) => {
    if (!user?.id) return;

    try {
      if (!silent) setLoading(true);
      setError('');

      // Backend route joins attendance, enrollments, and courses
      const response = await apiClient(`/attendance/student/${user.id}`);
      setAttendanceRecords(response || []);
    } catch (err) {
      console.error('REGISTRY_API_ERROR:', err);
      setError('Communication error with the Academic Server. Please check your connection.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyAttendance();
  }, [fetchMyAttendance]);

  // Auth Guard: Prevents component from rendering while checking session
  if (authLoading) return <div className="loading-screen">Authenticating Registrar Records...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter((record) => {
      const matchCourse = selectedCourse ? record.course_id === selectedCourse : true;
      const recordDate = new Date(record.date);
      const matchStart = dateRange.start ? recordDate >= new Date(dateRange.start) : true;
      const matchEnd = dateRange.end ? recordDate <= new Date(dateRange.end) : true;
      return matchCourse && matchStart && matchEnd;
    });
  }, [attendanceRecords, selectedCourse, dateRange]);

  const uniqueCourses = useMemo(() => {
    const map = new Map();
    attendanceRecords.forEach(r => {
      if (r.course_id && !map.has(r.course_id)) {
        map.set(r.course_id, { id: r.course_id, code: r.course_code, name: r.course_name });
      }
    });
    return Array.from(map.values());
  }, [attendanceRecords]);

  const stats = useMemo(() => {
    const total = filteredRecords.length;
    const present = filteredRecords.filter(r => r.status?.toLowerCase() === 'present').length;
    const rate = total > 0 ? ((present / total) * 100).toFixed(1) : '0.0';
    return { 
      total, 
      present, 
      absent: filteredRecords.filter(r => r.status?.toLowerCase() === 'absent').length, 
      excused: filteredRecords.filter(r => r.status?.toLowerCase() === 'excused').length, 
      rate 
    };
  }, [filteredRecords]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchMyAttendance(true);
  };

  return (
    <div className="management-container attendance-module fade-in">
      {/* Module Header */}
      <div className="management-header">
        <div className="header-title">
          <h1>Attendance Tracking</h1>
          <nav className="breadcrumb">Academic Portal &gt; {user.full_name} &gt; Attendance</nav>
        </div>
        <div className="header-actions">
          <button 
            className={`btn-ghost ${isRefreshing ? 'spinning' : ''}`} 
            onClick={handleRefresh}
            disabled={loading}
          >
            <FiRefreshCw /> {isRefreshing ? 'Syncing...' : 'Sync SQL'}
          </button>
          <button className="btn-primary" onClick={() => window.print()}>
            <FiDownload /> Export PDF
          </button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="stats-summary-grid">
        <div className={`stat-card-luxury ${parseFloat(stats.rate) < 75 ? 'warning' : 'success'}`}>
          <div className="stat-icon"><FiBarChart2 /></div>
          <div className="stat-content">
            <span className="stat-label">Attendance Rate</span>
            <div className="stat-value">{stats.rate}%</div>
            <div className="stat-progress-bar">
              <div 
                className="progress" 
                style={{ 
                  width: `${stats.rate}%`, 
                  background: parseFloat(stats.rate) < 75 ? '#ef4444' : '#10b981' 
                }}
              ></div>
            </div>
            {parseFloat(stats.rate) < 75 && (
              <small className="warning-text"><FiAlertCircle /> Below 75% Requirement</small>
            )}
          </div>
        </div>

        <div className="stat-card-simple present">
          <span className="label">Present</span>
          <span className="value">{stats.present}</span>
        </div>
        <div className="stat-card-simple absent">
          <span className="label">Absent</span>
          <span className="value">{stats.absent}</span>
        </div>
        <div className="stat-card-simple excused">
          <span className="label">Excused</span>
          <span className="value">{stats.excused}</span>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="filters-container-advanced">
        <div className="filter-group">
          <label><FiFilter /> Course Selection</label>
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
            <option value="">All Academic Courses</option>
            {uniqueCourses.map((c) => (
              <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label><FiCalendar /> Start Date</label>
          <input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} />
        </div>

        <div className="filter-group">
          <label><FiCalendar /> End Date</label>
          <input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} />
        </div>
        
        <div className="filter-group toggle-group">
          <label>View Mode</label>
          <div className="toggle-buttons">
            <button className={viewType === 'table' ? 'active' : ''} onClick={() => setViewType('table')}><FiList /></button>
            <button className={viewType === 'grid' ? 'active' : ''} onClick={() => setViewType('grid')}><FiGrid /></button>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Main Content Area */}
      {loading ? (
        <div className="loader-cell">Decrypting SQL Server records...</div>
      ) : filteredRecords.length === 0 ? (
        <div className="empty-state-container">
           <FiCalendar size={50} color="#cbd5e1" />
           <h3>No Records Found</h3>
           <p>Adjust your filters or contact the Registrar if you believe this is an error.</p>
        </div>
      ) : viewType === 'table' ? (
        <div className="table-wrapper">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Course Code</th>
                <th>Course Title</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id} className={`row-status-${record.status?.toLowerCase()}`}>
                  <td className="bold-text">{new Date(record.date).toLocaleDateString('en-GB')}</td>
                  <td><span className="code-badge">{record.course_code}</span></td>
                  <td>{record.course_name}</td>
                  <td>
                    <span className={`pill-badge pill-${record.status?.toLowerCase()}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="italic-text">{record.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="attendance-grid-view">
          {filteredRecords.map((record) => (
            <div key={record.id} className={`mini-card status-${record.status?.toLowerCase()}`}>
              <div className="card-date">{new Date(record.date).toDateString()}</div>
              <div className="card-title">{record.course_name}</div>
              <div className="card-status">{record.status}</div>
            </div>
          ))}
        </div>
      )}

      {/* Official Footer */}
      <div className="erp-module-footer">
        <div className="footer-info">
          <span><FiCheckCircle /> System: EduRegistrar ERP v2.0</span>
          <span>Access Level: {user.role?.toUpperCase()} ({user.full_name})</span>
        </div>
      </div>

      <style jsx="true">{`
        .attendance-module { animation: fadeIn 0.4s ease-out; }
        .stat-progress-bar { height: 8px; background: #f1f5f9; border-radius: 4px; margin-top: 12px; overflow: hidden; }
        .progress { height: 100%; transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
        .code-badge { background: #f1f5f9; padding: 4px 10px; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: #475569; }
        .warning-text { color: #ef4444; display: block; margin-top: 8px; font-weight: 600; font-size: 0.75rem; }
        .spinning { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .empty-state-container { text-align: center; padding: 60px; background: #f8fafc; border-radius: 12px; border: 2px dashed #e2e8f0; margin-top: 20px; }
      `}</style>
    </div>
  );
};