import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '../services/api.js';
import { FiUserPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiCheckCircle } from 'react-icons/fi';
import '../styles/Management.css';

/**
 * Staff Management Component
 * Author: Abinet Zerihun Arega
 * Role: Full-Stack Developer & Network Administrator
 */
export const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    staff_id: '',
    department: '',
    position: '',
    phone: '',
    hire_date: new Date().toISOString().split('T')[0],
    status: 'active',
  });

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient('/staff');
      setStaff(data || []);
    } catch (err) {
      setError('Failed to sync with Staff Registry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const method = editingStaff ? 'PUT' : 'POST';
      const endpoint = editingStaff ? `/staff/${editingStaff.id}` : '/staff';

      await apiClient(endpoint, {
        method: method,
        body: JSON.stringify(formData),
      });

      setShowModal(false);
      resetForm();
      fetchStaff();
    } catch (err) {
      setError(err.message || 'Registry Update Conflict');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (member) => {
    setEditingStaff(member);
    setFormData({
      full_name: member.full_name || '',
      email: member.email || '',
      password: '', 
      staff_id: member.staff_id || '',
      department: member.department || '',
      position: member.position || '',
      phone: member.phone || '',
      hire_date: member.hire_date ? new Date(member.hire_date).toISOString().split('T')[0] : '',
      status: member.status || 'active',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Confirm permanent removal from DCSC Staff Records?')) return;
    try {
      await apiClient(`/staff/${id}`, { method: 'DELETE' });
      fetchStaff();
    } catch (err) {
      setError('Deletion restricted by foreign key constraints.');
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '', email: '', password: '', staff_id: '',
      department: '', position: '', phone: '',
      hire_date: new Date().toISOString().split('T')[0],
      status: 'active',
    });
    setEditingStaff(null);
    setError('');
  };

  const filteredStaff = staff.filter((s) =>
    (s.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.staff_id?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.department?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="management-container fade-in">
      <div className="management-header">
        <div>
          <h1>Staff Registry</h1>
          <p className="subtitle">Personnel Management System - DCSC</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary">
          <FiUserPlus /> Register New Personnel
        </button>
      </div>

      <div className="advanced-toolbar">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Filter by name, ID, or department..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <FiX onClick={() => setError('')} className="close-btn" />
          {error}
        </div>
      )}

      <div className="table-wrapper">
        {loading ? (
          <div className="loader-cell">Updating Personnel Records...</div>
        ) : (
          <table className="erp-table">
            <thead>
              <tr>
                <th>ID Number</th>
                <th>Full Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((member) => (
                <tr key={member.id}>
                  <td className="font-mono bold-text">{member.staff_id}</td>
                  <td>
                    <div className="user-info-cell">
                      <span className="semibold">{member.full_name}</span>
                      <small>{member.email}</small>
                    </div>
                  </td>
                  <td>{member.department}</td>
                  <td><span className="position-tag">{member.position}</span></td>
                  <td>
                    <span className={`pill-badge pill-${member.status?.toLowerCase()}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button onClick={() => handleEdit(member)} className="btn-icon edit" title="Edit">
                      <FiEdit2 />
                    </button>
                    <button onClick={() => handleDelete(member.id)} className="btn-icon delete" title="Remove">
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>{editingStaff ? 'Update Personnel Record' : 'Initial Registration'}</h2>
              <FiX className="modal-close" onClick={() => setShowModal(false)} />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="input-group">
                  <label>Full Name</label>
                  <input name="full_name" value={formData.full_name} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Staff ID (DCSC-XXX)</label>
                  <input name="staff_id" value={formData.staff_id} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Official Email</label>
                  <input name="email" type="email" value={formData.email} onChange={handleChange} required disabled={editingStaff} />
                </div>
                {!editingStaff && (
                  <div className="input-group">
                    <label>System Password</label>
                    <input name="password" type="password" onChange={handleChange} required />
                  </div>
                )}
                <div className="input-group">
                  <label>Department</label>
                  <input name="department" value={formData.department} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Position</label>
                  <input name="position" value={formData.position} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on-leave">On Leave</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Processing...' : (editingStaff ? 'Update Record' : 'Confirm Registration')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="erp-footer">
        <FiCheckCircle /> DCSC Personnel Management System v2.0 | Security Verified
      </div>

      <style jsx="true">{`
        .user-info-cell { display: flex; flex-direction: column; }
        .user-info-cell small { color: #64748b; font-size: 0.75rem; }
        .position-tag { background: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-size: 0.85rem; border: 1px solid #e2e8f0; }
        .actions-cell { display: flex; gap: 8px; }
        .btn-icon { border: none; background: none; cursor: pointer; padding: 6px; border-radius: 4px; transition: 0.2s; }
        .btn-icon.edit:hover { background: #dbeafe; color: #1e40af; }
        .btn-icon.delete:hover { background: #fee2e2; color: #b91c1c; }
      `}</style>
    </div>
  );
};