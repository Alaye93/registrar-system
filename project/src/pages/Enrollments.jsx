import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FiPlus, FiCheckCircle, FiXCircle, FiRefreshCw, 
  FiAlertCircle, FiLoader, FiFilter 
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

import { apiClient } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Management.css';
import '../styles/Enrollments.css';

const ENROLLMENT_STATUS = {
  ENROLLED: 'enrolled',
  COMPLETED: 'completed',
  DROPPED: 'dropped',
};

const INITIAL_FORM_STATE = {
  student_id: '',
  course_id: '',
  status: ENROLLMENT_STATUS.ENROLLED
};

export const Enrollments = () => {
  const { user, loading: authLoading } = useAuth();

  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const canManage = useMemo(() => 
    ['admin', 'staff', 'manager'].includes(user?.role), 
  [user]);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [enrollmentsData, studentsData, coursesData] = await Promise.all([
        apiClient('/enrollments'),
        apiClient('/students'),
        apiClient('/courses')
      ]);

      setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : []);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (err) {
      console.error('Enrollment data fetch failed:', err);
      setError('Failed to load enrollment data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-dismiss notifications
  useEffect(() => {
    if (!notification.message) return;
    const timer = setTimeout(() => setNotification({ message: '', type: '' }), 5000);
    return () => clearTimeout(timer);
  }, [notification]);

  const filteredEnrollments = useMemo(() => {
    if (filter === 'all') return enrollments;
    return enrollments.filter(e => e.status === filter);
  }, [filter, enrollments]);

  const checkDuplicate = (studentId, courseId) => {
    return enrollments.some(e => 
      String(e.student_id) === String(studentId) && 
      String(e.course_id) === String(courseId) &&
      e.status === ENROLLMENT_STATUS.ENROLLED
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.student_id || !formData.course_id) {
      return setNotification({ message: 'Please select both student and course.', type: 'error' });
    }

    if (checkDuplicate(formData.student_id, formData.course_id)) {
      return setNotification({ message: 'Student is already enrolled in this course.', type: 'error' });
    }

    try {
      setSubmitting(true);
      const newEntry = await apiClient('/enrollments', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      setEnrollments(prev => [newEntry, ...prev]);
      setNotification({ message: 'Enrollment created successfully.', type: 'success' });
      setShowModal(false);
      setFormData(INITIAL_FORM_STATE);
    } catch (err) {
      setNotification({ message: err.message || 'Failed to create enrollment.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setSubmitting(true);
      await apiClient(`/enrollments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });

      setEnrollments(prev => 
        prev.map(e => e.id === id ? { ...e, status: newStatus } : e)
      );

      setNotification({ 
        message: `Status updated to ${newStatus.toUpperCase()}.`, 
        type: 'success' 
      });
    } catch (err) {
      setNotification({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="page-loader">
        <FiLoader className="spin" size={32} />
        <p>Authenticating Commander...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="management-container">
      <header className="module-header">
        <div className="header-title">
          <h1>Enrollment Management</h1>
          <p className="subtitle">Track and manage student course registrations</p>
        </div>

        <div className="header-actions">
          <button className="btn-refresh" onClick={fetchData} disabled={loading}>
            <FiRefreshCw className={loading ? 'spin' : ''} />
            Sync Data
          </button>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus /> New Enrollment
          </button>
        </div>
      </header>

      {notification.message && (
        <div className={`notification-banner ${notification.type}`}>
          <FiAlertCircle /> {notification.message}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="filter-group">
          <label><FiFilter /> Filter by Status</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Enrollments</option>
            <option value={ENROLLMENT_STATUS.ENROLLED}>Active</option>
            <option value={ENROLLMENT_STATUS.COMPLETED}>Completed</option>
            <option value={ENROLLMENT_STATUS.DROPPED}>Dropped</option>
          </select>
        </div>

        <div className="stats-mini">
          Showing <strong>{filteredEnrollments.length}</strong> of {enrollments.length} records
        </div>
      </div>

      {/* Data Table */}
      <div className="table-responsive">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Course</th>
              <th>Status</th>
              {canManage && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading && enrollments.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 4 : 3} className="loading-row">
                  <FiLoader className="spin" /> Loading enrollments...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={canManage ? 4 : 3} className="error-state">
                  <FiAlertCircle /> {error}
                </td>
              </tr>
            ) : filteredEnrollments.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 4 : 3} className="empty-state">
                  No enrollments found for the selected filter.
                </td>
              </tr>
            ) : (
              filteredEnrollments.map(enrollment => (
                <tr key={enrollment.id}>
                  <td>
                    <div className="entity-info">
                      <span className="primary-text">{enrollment.student_name}</span>
                      <span className="secondary-text">ID: {enrollment.student_id}</span>
                    </div>
                  </td>
                  <td>{enrollment.course_name}</td>
                  <td>
                    <span className={`status-badge status-${enrollment.status}`}>
                      {enrollment.status.toUpperCase()}
                    </span>
                  </td>
                  {canManage && (
                    <td className="actions-cell">
                      {enrollment.status === ENROLLMENT_STATUS.ENROLLED && (
                        <>
                          <button 
                            className="btn-icon btn-complete"
                            onClick={() => handleUpdateStatus(enrollment.id, ENROLLMENT_STATUS.COMPLETED)}
                            disabled={submitting}
                          >
                            <FiCheckCircle />
                          </button>
                          <button 
                            className="btn-icon btn-drop"
                            onClick={() => handleUpdateStatus(enrollment.id, ENROLLMENT_STATUS.DROPPED)}
                            disabled={submitting}
                          >
                            <FiXCircle />
                          </button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Enrollment Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>New Enrollment</h2>
                <button onClick={() => setShowModal(false)} className="modal-close">
                  <FiX size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label>Select Student</label>
                  <select
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    required
                  >
                    <option value="">— Choose Student —</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.full_name} ({s.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Select Course</label>
                  <select
                    value={formData.course_id}
                    onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                    required
                  >
                    <option value="">— Choose Course —</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.course_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Confirm Enrollment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};