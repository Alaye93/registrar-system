import { useEffect, useState, useMemo, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { apiClient } from '../services/api.js'; 
import { useAuth } from '../contexts/AuthContext';
import { 
  FiCheckSquare, 
  FiUserX, 
  FiCalendar, 
  FiFilter, 
  FiPlus, 
  FiBarChart2, 
  FiInfo,
  FiX
} from 'react-icons/fi';
import '../styles/Management.css';

/**
 * Attendance Tracking Module - EduRegistrar ERP
 * Corrected Version
 */
export const Attendance = () => {
  // 1. AUTHENTICATION & STATE
  const { user, loading: authLoading } = useAuth(); 
  const [enrollments, setEnrollments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    enrollment_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    notes: '',
  });

  // 2. DATA FETCHING LOGIC
  const fetchEnrollments = useCallback(async () => {
    try {
      const data = await apiClient('/enrollments/active');
      setEnrollments(data || []);
    } catch (err) {
      setError('Registry Connection Error: Could not sync active enrollments.');
    }
  }, []);

  const fetchAttendanceForCourse = useCallback(async (courseId) => {
    if (!courseId) return;
    try {
      setLoading(true);
      const data = await apiClient(`/attendance?courseId=${courseId}`);
      setAttendanceRecords(data || []);
    } catch (err) {
      setError('Failed to load historical attendance for this unit.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  useEffect(() => {
    if (selectedCourse) {
      fetchAttendanceForCourse(selectedCourse);
    } else {
      setAttendanceRecords([]);
    }
  }, [selectedCourse, fetchAttendanceForCourse]);

  // 3. COMPUTED VALUES (MEMOIZED)
  const uniqueCourses = useMemo(() => {
    const map = new Map();
    enrollments.forEach(e => {
      if (e.course_id) {
        map.set(String(e.course_id), { id: String(e.course_id), name: e.course_name });
      }
    });
    return Array.from(map.values());
  }, [enrollments]);

  const stats = useMemo(() => {
    const init = { present: 0, absent: 0, excused: 0 };
    if (!attendanceRecords.length) return init;
    return attendanceRecords.reduce((acc, rec) => {
      const s = rec.status?.toLowerCase();
      // Corrected: Safe property check
      if (Object.prototype.hasOwnProperty.call(acc, s)) {
        acc[s]++;
      }
      return acc;
    }, init);
  }, [attendanceRecords]);

  // 4. EVENT HANDLERS
  const resetForm = () => {
    setFormData({ 
      enrollment_id: '', 
      date: new Date().toISOString().split('T')[0], 
      status: 'present', 
      notes: '' 
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return setError("Authentication expired.");
    setIsSubmitting(true);

    try {
      await apiClient('/attendance', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          marked_by: user.id,
        }),
      });

      setShowModal(false);
      resetForm();
      if (selectedCourse) fetchAttendanceForCourse(selectedCourse);
    } catch (err) {
      setError(err.message || 'Failed to save attendance entry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkAttendance = async () => {
    if (!selectedCourse || !user?.id) return;
    
    const targetDate = new Date().toISOString().split('T')[0];
    const courseEnrollments = enrollments.filter(e => String(e.course_id) === String(selectedCourse));
    
    if (courseEnrollments.length === 0) return setError('No students enrolled in this course.');

    if (!window.confirm(`Bulk Action: Mark all ${courseEnrollments.length} students as Present for ${targetDate}?`)) return;

    try {
      setIsSubmitting(true);
      const payload = courseEnrollments.map(enr => ({
        enrollment_id: enr.id,
        date: targetDate,
        status: 'present',
        marked_by: user.id,
      }));

      await apiClient('/attendance/bulk', {
        method: 'POST',
        body: JSON.stringify({ records: payload }),
      });

      fetchAttendanceForCourse(selectedCourse);
    } catch (err) {
      setError('Bulk update failed. Some records may already exist for today.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. RENDER LOGIC
  if (authLoading) return <div className="loading-screen">Verifying Session...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="management-container fade-in">
      <div className="management-header">
        <div>
          <h1>Attendance Tracking</h1>
          <nav className="breadcrumb">Academic Registry &gt; Attendance Management</nav>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary">
          <FiPlus /> New Record
        </button>
      </div>

      <div className="toolbar-section">
        <div className="filter-group">
          <FiFilter className="filter-icon" />
          <select 
            value={selectedCourse} 
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="search-select"
          >
            <option value="">Select a Course to View...</option>
            {uniqueCourses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {selectedCourse && (
          <button 
            onClick={handleBulkAttendance} 
            className="btn-secondary"
            disabled={isSubmitting}
          >
            <FiCheckSquare /> Mark All Present Today
          </button>
        )}
      </div>

      {error && (
        <div className="alert-box error">
          <FiInfo /> {error}
          <FiX className="close-alert" onClick={() => setError('')} />
        </div>
      )}

      {selectedCourse && (
        <div className="stats-grid">
          <div className="stat-card present">
            <div className="stat-icon"><FiBarChart2 /></div>
            <div className="stat-content">
              <h3>{stats.present}</h3>
              <p>Present</p>
            </div>
          </div>
          <div className="stat-card absent">
            <div className="stat-icon"><FiUserX /></div>
            <div className="stat-content">
              <h3>{stats.absent}</h3>
              <p>Absent</p>
            </div>
          </div>
          <div className="stat-card excused">
            <div className="stat-icon"><FiCalendar /></div>
            <div className="stat-content">
              <h3>{stats.excused}</h3>
              <p>Excused</p>
            </div>
          </div>
        </div>
      )}

      <div className="table-wrapper card-shadow">
        {loading ? (
          <div className="table-loader">Syncing with Registry...</div>
        ) : (
          <table className="erp-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Student Name</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Marked By</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.length > 0 ? (
                attendanceRecords.map((record) => (
                  <tr key={record.id}>
                    <td><strong>{new Date(record.date).toLocaleDateString()}</strong></td>
                    <td className="student-name-cell">{record.full_name}</td>
                    <td>
                      <span className={`status-pill ${record.status}`}>
                        {record.status}
                      </span>
                    </td>
                    <td><small className="notes-text">{record.notes || '--'}</small></td>
                    <td><span className="marked-by-tag">{record.marked_by_name || 'System'}</span></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-row">
                    {selectedCourse 
                      ? "No attendance entries found for this academic period." 
                      : "Please filter by course to load records."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Record Manual Attendance</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="erp-form">
              <div className="form-group">
                <label>Select Student & Course</label>
                <select 
                  value={formData.enrollment_id} 
                  onChange={(e) => setFormData({...formData, enrollment_id: e.target.value})} 
                  required
                >
                  <option value="">Choose an active enrollment...</option>
                  {enrollments.map((e) => (
                    <option key={e.id} value={e.id}>{e.full_name} — {e.course_name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="excused">Excused</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Administrative Notes</label>
                <textarea 
                  placeholder="Reason for absence or late arrival..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Commit to Registry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .toolbar-section { display: flex; gap: 15px; margin-bottom: 25px; align-items: center; }
        .filter-group { position: relative; flex: 1; max-width: 400px; }
        .filter-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #64748b; pointer-events: none; }
        .search-select { width: 100%; padding: 10px 10px 10px 35px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.95rem; background: white; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
        .stat-card { display: flex; align-items: center; gap: 15px; padding: 20px; border-radius: 12px; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .stat-icon { font-size: 1.5rem; padding: 10px; border-radius: 10px; display: flex; align-items: center; }
        .stat-content h3 { margin: 0; font-size: 1.5rem; line-height: 1; }
        .stat-content p { margin: 5px 0 0 0; font-size: 0.85rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        .present { border-left: 4px solid #10b981; }
        .present .stat-icon { background: #ecfdf5; color: #10b981; }
        .absent { border-left: 4px solid #ef4444; }
        .absent .stat-icon { background: #fef2f2; color: #ef4444; }
        .excused { border-left: 4px solid #f59e0b; }
        .excused .stat-icon { background: #fffbeb; color: #f59e0b; }
        .status-pill { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
        .status-pill.present { background: #d1fae5; color: #065f46; }
        .status-pill.absent { background: #fee2e2; color: #991b1b; }
        .status-pill.excused { background: #fef3c7; color: #92400e; }
        .table-wrapper { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .empty-row { text-align: center; padding: 60px !important; color: #94a3b8; }
        .marked-by-tag { font-size: 0.8rem; color: #6366f1; font-weight: 500; background: #eef2ff; padding: 2px 8px; border-radius: 4px; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal-card { background: white; border-radius: 16px; width: 100%; max-width: 500px; padding: 30px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
        .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8; display: flex; }
        .erp-form .form-group { margin-bottom: 20px; }
        .erp-form label { display: block; margin-bottom: 8px; font-weight: 500; color: #1e293b; font-size: 0.9rem; }
        .erp-form input, .erp-form select, .erp-form textarea { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; font-family: inherit; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 30px; }
      `}</style>
    </div>
  );
};