import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { apiClient } from '../services/api.js';
import { 
  FiUsers, FiUserCheck, FiUserMinus, FiSearch, FiPlus, 
  FiX, FiMail, FiPhone, FiHash, FiShield, FiUserPlus 
} from 'react-icons/fi';
import '../styles/Management.css';

/**
 * Student Information Management
 * Official Registrar System: Ethiopian Defense Command and Staff College
 * Developed by: Abinet Zerihun Arega
 */
export const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    StudentID: '',
    FullName: '',
    Email: '',
    Phone: '',
    Status: 'Active'
  });

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiClient('/students');
      setStudents(data || []);
    } catch (err) {
      console.error('Database Error:', err);
      setError('System Error: Access to Secure SQL Server failed.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Derived Analytics
  const stats = useMemo(() => ({
    total: students.length,
    active: students.filter(s => s.Status?.toLowerCase() === 'active').length,
    inactive: students.filter(s => s.Status?.toLowerCase() !== 'active').length
  }), [students]);

  // Search Logic
  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.StudentID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.Email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient('/students', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setShowModal(false);
      setFormData({ StudentID: '', FullName: '', Email: '', Phone: '', Status: 'Active' });
      fetchStudents(); 
    } catch (err) {
      setError('Failed to save student record. Check for duplicate ID.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="management-container fade-in">
      
      {/* --- PROFESSIONAL COMMAND HEADER --- */}
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
              <span className="module-tag">REGISTRAR OFFICE</span>
              <span className="divider">|</span>
              <span className="academic-year">AY 2018 E.C. (2026 G.C.)</span>
            </div>
          </div>
        </div>

        <div className="header-actions-military">
          <div className="system-status">
            <span className="status-dot"></span> Secure Encrypted Connection
          </div>
          <button className="btn-command-primary" onClick={() => setShowModal(true)}>
            <FiPlus /> Register New Entry
          </button>
        </div>
      </div>

      {/* --- STATS RIBBON --- */}
      <div className="mini-stats-ribbon">
        <div className="mini-stat-card">
          <div className="stat-icon blue"><FiUsers /></div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Enrolled Officers</p>
          </div>
        </div>
        <div className="mini-stat-card">
          <div className="stat-icon green"><FiUserCheck /></div>
          <div className="stat-info">
            <h3>{stats.active}</h3>
            <p>Active Personnel</p>
          </div>
        </div>
        <div className="mini-stat-card">
          <div className="stat-icon red"><FiUserMinus /></div>
          <div className="stat-info">
            <h3>{stats.inactive}</h3>
            <p>Inactive/Withdrawn</p>
          </div>
        </div>
      </div>

      {/* --- CONTROLS --- */}
      <div className="table-controls">
        <div className="search-box">
          <FiSearch />
          <input 
            type="text" 
            placeholder="Search by Rank, Name, or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* --- DATA TABLE --- */}
      <div className="table-wrapper">
        <div className="table-container">
          {loading ? (
            <div className="loader-cell">Fetching Secured SQL Records...</div>
          ) : (
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Military/Student ID</th>
                  <th>Officer Full Name</th>
                  <th>Contact Information</th>
                  <th>Academic Status</th>
                  <th>Command Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state-cell">
                      No records matching "{searchTerm}" found in the central database.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(student => (
                    <tr key={student.StudentID}>
                      <td><span className="code-badge">{student.StudentID}</span></td>
                      <td className="bold-text">{student.FullName}</td>
                      <td>
                        <div className="contact-details">
                          <small><FiMail /> {student.Email}</small>
                          <small><FiPhone /> {student.Phone || '-'}</small>
                        </div>
                      </td>
                      <td>
                        <span className={`pill-badge pill-${student.Status?.toLowerCase()}`}>
                          {student.Status}
                        </span>
                      </td>
                      <td>
                        <button className="btn-ghost-sm">View Profile</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- REGISTRATION MODAL --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FiUserPlus size={24} color="#1e293b" />
                <h2 style={{ margin: 0 }}>Personnel Enrollment</h2>
              </div>
              <FiX className="modal-close" style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
            </div>
            
            <form className="modal-form" style={{ marginTop: '20px' }} onSubmit={handleSaveStudent}>
              <div className="form-group">
                <label><FiHash /> Military Student ID</label>
                <input 
                  name="StudentID"
                  type="text" 
                  placeholder="e.g. DCSC/OFF/001/26" 
                  value={formData.StudentID}
                  onChange={handleFormChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Full Name & Rank</label>
                <input 
                  name="FullName"
                  type="text" 
                  placeholder="Enter Officer Full Name" 
                  value={formData.FullName}
                  onChange={handleFormChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label><FiMail /> Official Email</label>
                <input 
                  name="Email"
                  type="email" 
                  placeholder="officer@dcsc.edu.et" 
                  value={formData.Email}
                  onChange={handleFormChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label><FiPhone /> Secure Line / Phone</label>
                <input 
                  name="Phone"
                  type="text" 
                  placeholder="+251..." 
                  value={formData.Phone}
                  onChange={handleFormChange}
                />
              </div>
              
              <div className="modal-actions" style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Discard</button>
                <button type="submit" className="btn-command-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Syncing...' : 'Confirm Enrollment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Internal Component-Specific Styling */}
      <style jsx="true">{`
        .contact-details { display: flex; flex-direction: column; gap: 2px; }
        .contact-details small { display: flex; align-items: center; gap: 5px; color: #64748b; font-size: 12px; }
        .empty-state-cell { text-align: center; padding: 60px; color: #94a3b8; font-style: italic; }
        .code-badge { background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-family: monospace; color: #1e293b; font-weight: 600; }
        .bold-text { font-weight: 600; color: #0f172a; }
      `}</style>
    </div>
  );
};