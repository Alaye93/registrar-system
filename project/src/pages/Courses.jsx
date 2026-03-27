import { useEffect, useState, useMemo, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { apiClient } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiDownload, 
  FiBook, FiActivity, FiShield, FiX 
} from 'react-icons/fi'; 
import '../styles/Management.css';

/**
 * Course Catalog Management - Final Build
 * Official Registrar System: Ethiopian Defense Command and Staff College
 * Developed by: Abinet Zerihun Arega
 */
export const Courses = () => {
  const { user, loading: authLoading } = useAuth();
  
  const [courses, setCourses] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    description: '',
    credits: 3,
    instructor_id: '',
    semester: 'Semester I',
    academic_year: '2018 E.C.',
    status: 'active',
  });

  const fetchCourses = useCallback(async () => {
    try {
      const data = await apiClient('/courses');
      setCourses(data || []);
    } catch (err) {
      setError('System Error: Unable to sync with registrar database.');
    }
  }, []);

  const fetchStaff = useCallback(async () => {
    try {
      const data = await apiClient('/staff');
      setStaff(data || []);
    } catch (err) {
      console.error('Staff fetch failed');
    }
  }, []);

  useEffect(() => {
    if (user) {
      const fetchInitialData = async () => {
        setLoading(true);
        await Promise.all([fetchCourses(), fetchStaff()]);
        setLoading(false);
      };
      fetchInitialData();
    }
  }, [user, fetchCourses, fetchStaff]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = 
        course.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.course_code?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || course.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [courses, searchTerm, filterStatus]);

  const resetForm = () => {
    setFormData({ 
        course_code: '', 
        course_name: '', 
        description: '', 
        credits: 3, 
        instructor_id: '', 
        semester: 'Semester I', 
        academic_year: '2018 E.C.', 
        status: 'active' 
    });
    setEditingCourse(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...formData, credits: parseInt(formData.credits) };
      const method = editingCourse ? 'PUT' : 'POST';
      const endpoint = editingCourse ? `/courses/${editingCourse.id}` : '/courses';

      await apiClient(endpoint, {
        method: method,
        body: JSON.stringify(payload)
      });

      setSuccessMsg(editingCourse ? 'Course updated successfully' : 'New course cataloged');
      setShowModal(false);
      resetForm();
      fetchCourses();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('CRITICAL: Are you sure you want to remove this course from the official catalog?')) return;
    try {
      await apiClient(`/courses/${id}`, { method: 'DELETE' });
      setSuccessMsg('Course removed successfully');
      fetchCourses();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Delete failed: ' + err.message);
    }
  };

  const exportToCSV = () => {
    const headers = 'Code,Name,Credits,Instructor,Status\n';
    const rows = filteredCourses.map(c => 
      `${c.course_code},${c.course_name},${c.credits},${c.instructor_name || 'Unassigned'},${c.status}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EDCSC_Course_Catalog.csv`;
    a.click();
  };

  if (authLoading) return <div className="loading-screen">Verifying Command Access...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const canManage = user?.role === 'admin' || user?.role === 'staff';

  return (
    <div className="management-container fade-in">
      
      {/* --- RE-ENGINEERED MILITARY HEADER --- */}
      <div className="management-header erp-command-header">
        <div className="header-title-group">
          <div className="institution-badge">
            <FiShield className="badge-icon" />
          </div>
          <div className="text-stack">
            <nav className="breadcrumb-military">
              FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA • MOD
            </nav>
            <h1>Ethiopian Defense Command and Staff College</h1>
            <div className="sub-header">
              <span className="module-tag">COURSE CATALOG</span>
              <span className="divider">|</span>
              <span className="academic-year">AY 2018 E.C. (2026 G.C.)</span>
            </div>
          </div>
        </div>

        {/* This container ensures both connection status and buttons are visible */}
        <div className="header-actions-military" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
          <div className="system-status">
            <span className="status-dot"></span> Secure Encrypted Connection
          </div>
          <div className="button-group" style={{ display: 'flex', gap: '10px' }}>
             <button onClick={exportToCSV} className="btn-ghost-sm"><FiDownload /> Export Catalog</button>
             {canManage && (
                <button 
                  onClick={() => { resetForm(); setShowModal(true); }} 
                  className="btn-command-primary"
                >
                  <FiPlus /> Add New Course
                </button>
             )}
          </div>
        </div>
      </div>

      {/* --- ANALYTICS --- */}
      <div className="mini-stats-ribbon">
        <div className="mini-stat-card">
          <div className="stat-icon blue"><FiBook /></div>
          <div className="stat-info">
            <h3>{courses.length}</h3>
            <p>Cataloged Modules</p>
          </div>
        </div>
        <div className="mini-stat-card">
          <div className="stat-icon green"><FiActivity /></div>
          <div className="stat-info">
            <h3>{courses.filter(c => c.status === 'active').length}</h3>
            <p>Active Curriculum</p>
          </div>
        </div>
      </div>

      {/* --- SEARCH & FILTERS --- */}
      <div className="advanced-toolbar" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', gap: '20px' }}>
        <div className="search-box" style={{ flex: 1 }}>
          <FiSearch />
          <input 
            type="text" 
            placeholder="Search catalog by code or title..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>STATUS:</label>
            <select className="command-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Modules</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* --- TABLE --- */}
      <div className="table-wrapper">
        <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Module Title & Description</th>
                  <th>Assigned Instructor</th>
                  <th>Credits</th>
                  <th>Status</th>
                  {canManage && <th className="text-right">Command Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center" style={{ padding: '40px' }}>Synchronizing with Defense Servers...</td></tr>
                ) : filteredCourses.length === 0 ? (
                  <tr><td colSpan="6" className="text-center" style={{ padding: '40px', color: '#94a3b8' }}>No courses found matching your criteria.</td></tr>
                ) : (
                  filteredCourses.map((course) => (
                    <tr key={course.id}>
                      <td><span className="code-badge">{course.course_code}</span></td>
                      <td>
                        <div className="bold-text">{course.course_name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{course.description}</div>
                      </td>
                      <td>{course.instructor_name || <span style={{ color: '#ef4444' }}>Unassigned</span>}</td>
                      <td><strong>{course.credits} CH</strong></td>
                      <td><span className={`pill-badge pill-${course.status}`}>{course.status}</span></td>
                      {canManage && (
                        <td className="text-right">
                          <button className="btn-ghost-sm" style={{ color: '#2563eb' }} onClick={() => { setEditingCourse(course); setFormData(course); setShowModal(true); }}><FiEdit2 /></button>
                          <button className="btn-ghost-sm" style={{ color: '#ef4444' }} onClick={() => handleDelete(course.id)}><FiTrash2 /></button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
        </div>
      </div>

      {/* --- REGISTRATION MODAL --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                <FiBook /> {editingCourse ? 'Modify Entry' : 'New Catalog Entry'}
              </h2>
              <FiX className="modal-close" style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form" style={{ marginTop: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div className="form-group">
                  <label>Module Code</label>
                  <input value={formData.course_code} onChange={(e) => setFormData({...formData, course_code: e.target.value})} placeholder="e.g. MS601" required />
                </div>
                <div className="form-group">
                  <label>Credit Hours</label>
                  <input type="number" value={formData.credits} onChange={(e) => setFormData({...formData, credits: e.target.value})} required />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Module Title</label>
                <input value={formData.course_name} onChange={(e) => setFormData({...formData, course_name: e.target.value})} placeholder="Full Title of Course" required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Lead Instructor</label>
                  <select value={formData.instructor_id} onChange={(e) => setFormData({...formData, instructor_id: e.target.value})}>
                    <option value="">Select Staff</option>
                    {staff.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Registry Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">Discard</button>
                <button type="submit" className="btn-command-primary">Confirm Registry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .command-select { padding: 8px 12px; border-radius: 6px; border: 1px solid #cbd5e1; background: white; font-size: 13px; font-weight: 600; }
        .code-badge { background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-weight: 700; color: #475569; }
        .bold-text { font-weight: 600; color: #1e293b; }
      `}</style>
    </div>
  );
};