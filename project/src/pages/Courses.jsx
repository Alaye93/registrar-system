import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiShield, FiDatabase, 
  FiX, FiCpu, FiLock, FiActivity, FiLayers, FiTerminal, FiRefreshCw 
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

import { apiClient } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Courses.css';

export const Courses = () => {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [systemAlert, setSystemAlert] = useState({ msg: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  // Advanced Data Sync Engine
  const syncDatabase = useCallback(async () => {
    try {
      setLoading(true);
      setSystemAlert({ msg: 'SYNCING WITH SECURE REGISTRY...', type: 'info' });

      const data = await apiClient('/courses');
      const coursesData = Array.isArray(data) ? data : (data?.payload || data || []);

      setCourses(coursesData);
      setSystemAlert({ msg: 'REGISTRY SYNCHRONIZED • ENCRYPTION ACTIVE', type: 'success' });
    } catch (err) {
      console.error('Course registry sync failed:', err);
      
      // Tactical Failover Cache
      setCourses([
        { id: 1, course_code: 'TAC-900', course_name: 'Electronic Warfare Strategy', instructor_name: 'Gen. Assefa', credits: 4, status: 'active' },
        { id: 2, course_code: 'CYB-404', course_name: 'Network Fortress Defense', instructor_name: 'Col. Meron', credits: 3, status: 'active' },
        { id: 3, course_code: 'CMD-701', course_name: 'Advanced Command Leadership', instructor_name: 'Brig. Gen. Tesfaye', credits: 5, status: 'active' }
      ]);
      
      setSystemAlert({ msg: 'OFFLINE MODE • LOCAL CACHE ENGAGED', type: 'warning' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    syncDatabase();
  }, [syncDatabase]);

  // Intelligent Search Filter
  const filteredCourses = useMemo(() => {
    if (!searchTerm) return courses;
    const term = searchTerm.toLowerCase();
    return courses.filter(course => 
      course.course_name?.toLowerCase().includes(term) ||
      course.course_code?.toLowerCase().includes(term) ||
      course.instructor_name?.toLowerCase().includes(term)
    );
  }, [courses, searchTerm]);

  // New Course Modal Form State
  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    instructor_name: '',
    credits: 3,
    status: 'active'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.course_code || !formData.course_name) return;

    try {
      setSubmitting(true);
      const newCourse = await apiClient('/courses', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      setCourses(prev => [newCourse, ...prev]);
      setSystemAlert({ msg: 'NEW MODULE REGISTERED SUCCESSFULLY', type: 'success' });
      setShowModal(false);
      setFormData({ course_code: '', course_name: '', instructor_name: '', credits: 3, status: 'active' });
    } catch (err) {
      setSystemAlert({ msg: 'REGISTRATION FAILED • CHECK SECURE LINK', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="strategic-dashboard">
      {/* CRT Scanline Overlay */}
      <div className="crt-overlay"></div>

      {/* Top Command Bar */}
      <header className="command-bar">
        <div className="command-brand">
          <div className="logo-hex"><FiShield size={28} /></div>
          <div className="brand-text">
            <span className="unit-tag">ACADEMIC REGISTRAR • SECTOR 01</span>
            <h1>STRATEGIC COURSE REGISTRY</h1>
          </div>
        </div>

        <div className="system-diagnostics">
          <div className={`diag-item ${systemAlert.type}`}>
            <FiActivity className="pulse" />
            <span>{systemAlert.msg || 'SYSTEM NOMINAL'}</span>
          </div>
          <div className="diag-item gold">
            <FiLock />
            <span>CLEARANCE: {user.role?.toUpperCase() || 'COMMAND'}</span>
          </div>
        </div>
      </header>

      {/* Main Operations Area */}
      <main className="operations-grid">
        {/* Tactical Sidebar */}
        <aside className="ops-sidebar">
          <div className="tool-card">
            <label><FiSearch /> ARCHIVE INTELLIGENCE SEARCH</label>
            <input 
              type="text" 
              placeholder="ENTER COURSE CODE OR NAME..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="tool-card stats">
            <div className="stat-row">
              <span className="label">TOTAL MODULES</span>
              <span className="value highlight">{courses.length}</span>
            </div>
            <div className="progress-bar">
              <div className="fill" style={{ width: `${Math.min((courses.length / 30) * 100, 100)}%` }}></div>
            </div>
          </div>

          <button className="btn-action-gold" onClick={() => setShowModal(true)}>
            <FiPlus /> REGISTER NEW MODULE
          </button>

          <button className="btn-refresh" onClick={syncDatabase} disabled={loading}>
            <FiRefreshCw className={loading ? 'spin' : ''} /> RE-SCAN REGISTRY
          </button>
        </aside>

        {/* Encrypted Data Terminal */}
        <section className="data-terminal">
          <div className="terminal-header">
            <FiTerminal /> ENCRYPTED COURSE REGISTRY STREAM
            <div className="header-dots">•••</div>
          </div>

          <div className="table-wrapper">
            <table className="tactical-table">
              <thead>
                <tr>
                  <th><FiLayers /> MODULE CODE</th>
                  <th>SPECIFICATIONS</th>
                  <th>CREDITS</th>
                  <th>STATUS</th>
                  <th>COMMAND</th>
                </tr>
              </thead>
              <tbody>
                {loading && courses.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="loading-state">SYNCHRONIZING WITH CENTRAL COMMAND...</td>
                  </tr>
                ) : filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">NO MATCHING MODULES IN REGISTRY</td>
                  </tr>
                ) : (
                  filteredCourses.map(course => (
                    <tr key={course.id} className="table-row">
                      <td className="code-font">{course.course_code}</td>
                      <td>
                        <div className="bold-text">{course.course_name}</div>
                        <div className="dim-text">Instructor: {course.instructor_name || 'CLASSIFIED'}</div>
                      </td>
                      <td className="center-text">{course.credits} CH</td>
                      <td>
                        <span className={`status-pill ${course.status}`}>
                          {course.status?.toUpperCase() || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="action-cells">
                        <button className="mini-btn edit"><FiEdit2 /></button>
                        <button className="mini-btn delete"><FiTrash2 /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* New Module Registration Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay">
            <motion.div 
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
            >
              <div className="modal-header">
                <h2>REGISTER NEW STRATEGIC MODULE</h2>
                <button onClick={() => setShowModal(false)} className="modal-close">
                  <FiX size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label>MODULE CODE</label>
                  <input
                    type="text"
                    value={formData.course_code}
                    onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                    placeholder="TAC-XXX"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>MODULE NAME</label>
                  <input
                    type="text"
                    value={formData.course_name}
                    onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                    placeholder="Advanced Electronic Warfare Strategy"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>PRIMARY INSTRUCTOR</label>
                  <input
                    type="text"
                    value={formData.instructor_name}
                    onChange={(e) => setFormData({ ...formData, instructor_name: e.target.value })}
                    placeholder="Gen. Assefa Kebede"
                  />
                </div>

                <div className="form-group">
                  <label>CREDITS (CH)</label>
                  <input
                    type="number"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                    min="1"
                    max="6"
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                    ABORT MISSION
                  </button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'REGISTERING...' : 'CONFIRM REGISTRY'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};