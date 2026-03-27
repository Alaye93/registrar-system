import { useEffect, useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { apiClient } from '../services/api.js'; 
import { useAuth } from '../contexts/AuthContext';
import { 
  FiPlus, FiCheckCircle, FiClock, FiXCircle, FiUserPlus, FiFilter 
} from 'react-icons/fi';
import '../styles/Management.css';

export const Enrollments = () => {
  // FIXED: Changed 'profile' to 'user' and added 'loading' for auth safety
  const { user, loading: authLoading } = useAuth();
  
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [filter, setFilter] = useState('all');

  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    status: 'enrolled'
  });

  // SAFETY GUARD: Prevent white-screen flicker during session verification
  if (authLoading) return <div className="loading-screen">Verifying Registry Access...</div>;
  if (!user) return <Navigate to="/login" replace />;

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [enrollData, studentData, courseData] = await Promise.all([
        apiClient('/enrollments'),
        apiClient('/students'),
        apiClient('/courses')
      ]);
      setEnrollments(enrollData || []);
      setStudents(studentData || []);
      setCourses(courseData || []);
    } catch (err) {
      setError('Sync Error: Could not connect to the Enrollment database.');
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = useMemo(() => {
    if (filter === 'all') return enrollments;
    return enrollments.filter(e => e.status === filter);
  }, [enrollments, filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient('/enrollments', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      setSuccessMsg('Student successfully enrolled in course.');
      setShowModal(false);
      setFormData({ student_id: '', course_id: '', status: 'enrolled' });
      
      // Refresh data
      const updatedData = await apiClient('/enrollments');
      setEnrollments(updatedData);
      
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    const confirmMsg = newStatus === 'dropped' 
      ? "Are you sure you want to drop this student? This will affect their academic record."
      : "Mark this enrollment as completed?";
    
    if (!window.confirm(confirmMsg)) return;

    try {
      await apiClient(`/enrollments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      const updatedData = await apiClient('/enrollments');
      setEnrollments(updatedData);
    } catch (err) {
      setError('Update failed: ' + err.message);
    }
  };

  const canManage = user?.role === 'admin' || user?.role === 'staff';

  return (
    <div className="management-container fade-in">
      <div className="management-header">
        <div className="header-title">
          <h1>Course Enrollments</h1>
          <nav className="breadcrumb">Registry &gt; Academic Operations &gt; Enrollments</nav>
        </div>
        <div className="header-actions">
          {canManage && (
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <FiPlus /> New Enrollment
            </button>
          )}
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="advanced-toolbar" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '5px 15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <FiFilter style={{ color: '#64748b' }} />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', padding: '5px' }}
          >
            <option value="all">All Enrollments</option>
            <option value="enrolled">Active (Enrolled)</option>
            <option value="completed">Completed</option>
            <option value="dropped">Dropped</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="table-responsive">
        <table className="erp-table">
          <thead>
            <tr>
              <th>Student Details</th>
              <th>Student ID</th>
              <th>Course / Subject</th>
              <th>Date Joined</th>
              <th>Status</th>
              {canManage && <th className="text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '50px' }}>Syncing Records...</td></tr>
            ) : filteredEnrollments.length > 0 ? (
              filteredEnrollments.map((enr) => (
                <tr key={enr.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                       <div className="avatar-mini" style={{ background: '#3b82f6', color: 'white', padding: '5px', borderRadius: '4px', fontSize: '10px' }}><FiUserPlus /></div>
                       <strong>{enr.student_name}</strong>
                    </div>
                  </td>
                  <td className="font-mono" style={{ color: '#64748b' }}>{enr.student_id}</td>
                  <td>
                    <div className="course-info">
                      <span style={{ fontWeight: '500' }}>{enr.course_code}</span>
                      <small style={{ display: 'block', color: '#666' }}>{enr.course_name}</small>
                    </div>
                  </td>
                  <td>{new Date(enr.enrollment_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge badge-${enr.status}`} style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                      background: enr.status === 'enrolled' ? '#e0f2fe' : enr.status === 'completed' ? '#dcfce7' : '#fee2e2',
                      color: enr.status === 'enrolled' ? '#0369a1' : enr.status === 'completed' ? '#15803d' : '#b91c1c'
                    }}>
                      {enr.status === 'enrolled' && <FiClock />}
                      {enr.status === 'completed' && <FiCheckCircle />}
                      {enr.status === 'dropped' && <FiXCircle />}
                      {enr.status}
                    </span>
                  </td>
                  {canManage && (
                    <td className="text-right">
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        {enr.status === 'enrolled' && (
                          <>
                            <button onClick={() => handleStatusUpdate(enr.id, 'completed')} className="action-btn-edit" title="Mark Completed" style={{ color: '#10b981' }}><FiCheckCircle /></button>
                            <button onClick={() => handleStatusUpdate(enr.id, 'dropped')} className="action-btn-delete" title="Drop Student" style={{ color: '#ef4444' }}><FiXCircle /></button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No enrollment records found for this category.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>New Enrollment Entry</h2>
              <p>Link a student to an active course catalog</p>
            </div>
            <form onSubmit={handleSubmit} className="erp-form">
               <div className="input-field">
                  <label>Select Student</label>
                  <select 
                    value={formData.student_id} 
                    onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                    required
                  >
                    <option value="">Choose Student...</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.full_name} ({s.student_id})</option>
                    ))}
                  </select>
               </div>

               <div className="input-field" style={{ marginTop: '15px' }}>
                  <label>Select Course</label>
                  <select 
                    value={formData.course_id} 
                    onChange={(e) => setFormData({...formData, course_id: e.target.value})}
                    required
                  >
                    <option value="">Choose Course...</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.course_code} - {c.course_name}</option>
                    ))}
                  </select>
               </div>

               <div className="form-actions" style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">Cancel</button>
                  <button type="submit" className="btn-primary">Confirm Enrollment</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};