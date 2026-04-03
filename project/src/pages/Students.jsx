import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Shield, UserPlus, Search, RefreshCw, Filter, Edit2, X, 
  ArrowLeft, CheckCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { apiClient } from '../services/api';
import '../styles/Students.css';

const cn = (...inputs) => twMerge(clsx(inputs));

/**
 * EDCSC Officer Registry v3.2
 * Professional Tactical Interface - Ethiopian Defense Command and Staff College
 */

export const Students = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    StudentID: '',
    FullName: '',
    Email: '',
    Phone: '',
    Status: 'Active',
    Rank: 'Lieutenant'
  });

  // Fetch Students
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // TODO: Uncomment when backend is fully ready
      // const data = await apiClient('/students');
      // setStudents(data || []);

      // Mock data for development
      const mockData = [
        { 
          id: '1', 
          StudentID: 'OFF-001', 
          FullName: 'Lt. Abel Tesfaye', 
          Email: 'a.tesfaye@edcsc.gov.et', 
          Phone: '+251 911 111 001', 
          Status: 'Active', 
          Rank: 'Lieutenant',
          EnrolledDate: '2023-01-15' 
        },
        { 
          id: '2', 
          StudentID: 'OFF-042', 
          FullName: 'Cpt. Meron Bekele', 
          Email: 'm.bekele@edcsc.gov.et', 
          Phone: '+251 911 111 042', 
          Status: 'Active', 
          Rank: 'Captain',
          EnrolledDate: '2023-03-20' 
        },
        { 
          id: '3', 
          StudentID: 'OFF-105', 
          FullName: 'Maj. Yared Girma', 
          Email: 'y.girma@edcsc.gov.et', 
          Phone: '+251 911 111 105', 
          Status: 'On-Leave', 
          Rank: 'Major',
          EnrolledDate: '2022-11-10' 
        },
        { 
          id: '4', 
          StudentID: 'OFF-218', 
          FullName: 'Lt. Eden Solomon', 
          Email: 'e.solomon@edcsc.gov.et', 
          Phone: '+251 911 111 218', 
          Status: 'Active', 
          Rank: 'Lieutenant',
          EnrolledDate: '2024-01-05' 
        },
      ];

      setStudents(mockData);
    } catch (err) {
      console.error(err);
      setError('Failed to load officer registry. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = 
        student.FullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.StudentID.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || 
                           student.Status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [students, searchTerm, statusFilter]);

  const stats = useMemo(() => ({
    total: students.length,
    active: students.filter(s => s.Status === 'Active').length,
    onLeave: students.filter(s => s.Status === 'On-Leave').length,
    inactive: students.filter(s => s.Status === 'Inactive').length,
  }), [students]);

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // TODO: Replace with real API when backend is ready
      // await apiClient('/students', { method: 'POST', body: JSON.stringify(formData) });

      const newStudent = {
        id: Date.now().toString(),
        StudentID: formData.StudentID || `OFF-${Math.floor(Math.random() * 999)}`,
        FullName: formData.FullName,
        Email: formData.Email,
        Phone: formData.Phone,
        Status: formData.Status,
        Rank: formData.Rank,
        EnrolledDate: new Date().toISOString().split('T')[0]
      };

      setStudents(prev => [newStudent, ...prev]);
      setShowModal(false);

      setFormData({
        StudentID: '',
        FullName: '',
        Email: '',
        Phone: '',
        Status: 'Active',
        Rank: 'Lieutenant'
      });
    } catch (err) {
      setError('Enrollment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="students-page">
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
              <h1>Academic Registrar Management System</h1>
              <h2 className="header-subtitle">Academic Staff Management Dashboard</h2>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStudents}
            disabled={loading}
            className="p-3 hover:bg-white/10 rounded-xl transition-all disabled:opacity-50"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-all"
          >
            <UserPlus size={18} />
            Enroll New Officer
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        {[
          { label: "Total Strength", value: stats.total, color: "text-blue-400" },
          { label: "Active Duty", value: stats.active, color: "text-emerald-400" },
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
            placeholder="Search by name or officer ID..."
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
              <th>Officer</th>
              <th>ID / Rank</th>
              <th>Contact</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredStudents.map((student) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td>
                    <div className="flex items-center gap-4">
                      <div className="avatar">
                        {student.FullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {student.FullName}
                        </p>
                        <p className="text-xs text-slate-500">Enrolled {student.EnrolledDate}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="font-mono text-blue-400">{student.StudentID}</p>
                    <p className="text-sm text-slate-400">{student.Rank}</p>
                  </td>
                  <td className="text-sm text-slate-300">
                    <div>{student.Email}</div>
                    <div className="text-xs text-slate-500 mt-1">{student.Phone}</div>
                  </td>
                  <td>
                    <span className={`status-badge ${student.Status.toLowerCase()}`}>
                      {student.Status}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <button className="action-btn">
                        <Edit2 size={18} />
                      </button>
                      <button className="action-btn">
                        <X size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {filteredStudents.length === 0 && !loading && (
          <div className="empty-state">
            <p>No officers match your search criteria.</p>
          </div>
        )}
      </div>

      {/* ENROLLMENT MODAL */}
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
                <h2>Enroll New Officer</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-body">
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      name="FullName"
                      value={formData.FullName}
                      onChange={handleInputChange}
                      required
                      placeholder="Full Name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Officer ID</label>
                    <input
                      name="StudentID"
                      value={formData.StudentID}
                      onChange={handleInputChange}
                      placeholder="OFF-XXX"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="Email"
                    value={formData.Email}
                    onChange={handleInputChange}
                    placeholder="officer@edcsc.gov.et"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      name="Phone"
                      value={formData.Phone}
                      onChange={handleInputChange}
                      placeholder="+251 911 XXX XXX"
                    />
                  </div>
                  <div className="form-group">
                    <label>Rank</label>
                    <select
                      name="Rank"
                      value={formData.Rank}
                      onChange={handleInputChange}
                    >
                      <option value="Lieutenant">Lieutenant</option>
                      <option value="Captain">Captain</option>
                      <option value="Major">Major</option>
                      <option value="Colonel">Colonel</option>
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
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold disabled:opacity-70 flex items-center gap-2"
                  >
                    {isSubmitting ? "Processing..." : "Confirm Enrollment"}
                    {!isSubmitting && <CheckCircle size={18} />}
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