import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Shield, UserPlus, Search, RefreshCw, Edit2, Trash2, X, 
  CheckCircle, AlertTriangle, ArrowLeft, Users, Activity, 
  Briefcase, Calendar, Mail, Phone 
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

/**
 Ethiopian Defense Command and Staff College
 */

export const Staff = () => {
  const navigate = useNavigate();

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    staff_id: '',
    department: '',
    position: '',
    phone: '',
    hire_date: new Date().toISOString().split('T')[0],
    status: 'active',
    clearance_level: 'Level 2'
  });

  // Fetch Staff Data
  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // TODO: Replace with real API when backend is ready
      // const data = await apiClient('/staff');
      // setStaff(data || []);

      const mockData = [
        { 
          id: '1', 
          full_name: 'Maj. Gen. Elias Tekle', 
          email: 'e.tekle@edcsc.gov.et', 
          staff_id: 'DCSC-001', 
          department: 'Strategic Command', 
          position: 'Commanding Officer', 
          phone: '+251 911 000 001', 
          hire_date: '2015-05-12', 
          status: 'active', 
          clearance_level: 'Top Secret' 
        },
        { 
          id: '2', 
          full_name: 'Col. Sarah Mengistu', 
          email: 's.mengistu@edcsc.gov.et', 
          staff_id: 'DCSC-042', 
          department: 'Intelligence', 
          position: 'Chief Analyst', 
          phone: '+251 911 000 042', 
          hire_date: '2018-11-20', 
          status: 'active', 
          clearance_level: 'Top Secret' 
        },
        { 
          id: '3', 
          full_name: 'Capt. Dawit Abebe', 
          email: 'd.abebe@edcsc.gov.et', 
          staff_id: 'DCSC-105', 
          department: 'Logistics', 
          position: 'Supply Chain Manager', 
          phone: '+251 911 000 105', 
          hire_date: '2020-02-15', 
          status: 'on-leave', 
          clearance_level: 'Level 2' 
        },
        { 
          id: '4', 
          full_name: 'Lt. Bethlehem Haile', 
          email: 'b.haile@edcsc.gov.et', 
          staff_id: 'DCSC-218', 
          department: 'Communications', 
          position: 'Signal Officer', 
          phone: '+251 911 000 218', 
          hire_date: '2021-08-30', 
          status: 'active', 
          clearance_level: 'Level 3' 
        },
      ];

      setStaff(mockData);
    } catch (err) {
      console.error(err);
      setError('Failed to load personnel registry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const filteredStaff = useMemo(() => {
    return staff.filter(member => {
      const matchesSearch = 
        member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.staff_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [staff, searchTerm, statusFilter]);

  const stats = useMemo(() => ({
    total: staff.length,
    active: staff.filter(s => s.status === 'active').length,
    onLeave: staff.filter(s => s.status === 'on-leave').length,
    inactive: staff.filter(s => s.status === 'inactive').length,
  }), [staff]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      staff_id: '',
      department: '',
      position: '',
      phone: '',
      hire_date: new Date().toISOString().split('T')[0],
      status: 'active',
      clearance_level: 'Level 2'
    });
    setEditingStaff(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // TODO: Replace with real API call later
      if (editingStaff) {
        setStaff(prev => prev.map(s => s.id === editingStaff.id ? { ...s, ...formData } : s));
      } else {
        const newMember = {
          ...formData,
          id: Date.now().toString()
        };
        setStaff(prev => [...prev, newMember]);
      }

      setShowModal(false);
      resetForm();
    } catch (err) {
      setError('Failed to save personnel data.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (member) => {
    setEditingStaff(member);
    setFormData(member);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('CONFIRM PERMANENT REMOVAL FROM PERSONNEL RECORDS?')) return;
    setStaff(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="students-page">   {/* Main wrapper */}

      {/* HEADER */}
      <div className="students-header">
        <div className="header-left">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-3 hover:bg-white/10 rounded-xl transition-colors"
          >
            <ArrowLeft size={22} />
          </button>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-2xl">
              <Shield size={32} className="text-blue-500" />
            </div>
            <div>
              <h1>Academic staff Personnel</h1>
              <p className="header-subtitle">EDCSC • Staff Registry Sector</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-all"
        >
          <UserPlus size={18} />
          Enroll New Staff
        </button>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        {[
          { label: "Total Strength", value: stats.total, color: "text-blue-400" },
          { label: "Active Personnel", value: stats.active, color: "text-emerald-400" },
          { label: "On Leave / Inactive", value: stats.onLeave + stats.inactive, color: "text-amber-400" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card"
          >
            <p className="stat-label">{stat.label}</p>
            <p className={`stat-value ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* CONTROL BAR */}
      <div className="control-bar">
        <div className="search-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search by name, ID or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#1e293b] border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="on-leave">On Leave</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="table-container">
        <table className="officer-table">
          <thead>
            <tr>
              <th>Personnel</th>
              <th>ID / Position</th>
              <th>Department</th>
              <th>Clearance</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredStaff.map((member) => (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td>
                    <div className="flex items-center gap-4">
                      <div className="avatar">
                        {member.full_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{member.full_name}</p>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="font-mono text-blue-400">{member.staff_id}</p>
                    <p className="text-sm text-slate-400">{member.position}</p>
                  </td>
                  <td className="text-sm text-slate-300">{member.department}</td>
                  <td>
                    <span className="text-xs font-bold px-3 py-1 rounded border border-purple-500/30 text-purple-400">
                      {member.clearance_level}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${member.status}`}>
                      {member.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(member)} className="action-btn">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(member.id)} className="action-btn">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {filteredStaff.length === 0 && !loading && (
          <div className="empty-state">
            <p>No personnel records found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* MODAL - Enrollment / Edit */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="modal-content"
            >
              <div className="modal-header">
                <h2>{editingStaff ? 'Edit Personnel Record' : 'Enroll New Staff Member'}</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-body">
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input name="full_name" value={formData.full_name} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Staff ID</label>
                    <input name="staff_id" value={formData.staff_id} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label>Department</label>
                    <input name="department" value={formData.department} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Position</label>
                    <input name="position" value={formData.position} onChange={handleChange} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label>Phone</label>
                    <input name="phone" value={formData.phone} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Clearance Level</label>
                    <select name="clearance_level" value={formData.clearance_level} onChange={handleChange}>
                      <option value="Level 1">Level 1 - Restricted</option>
                      <option value="Level 2">Level 2 - Confidential</option>
                      <option value="Level 3">Level 3 - Secret</option>
                      <option value="Top Secret">Top Secret</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 text-slate-400 hover:text-white font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold disabled:opacity-70 flex items-center gap-2"
                  >
                    {submitting ? "Saving..." : editingStaff ? "Update Record" : "Enroll Staff"}
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