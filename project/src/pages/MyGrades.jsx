import { useEffect, useState, useCallback, useMemo } from 'react';
import { apiClient } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext';
import { generateTranscript } from '../utils/pdfGenerator';
import '../styles/Management.css';

/**
 * MyGrades Component
 * Developed by: Abinet Zerihun Arega
 * Role: Full-Stack Developer & Data Science Candidate
 * System: EduRegistrar ERP - Academic Records Module
 * * Description: 
 * Manages the retrieval, calculation, and visualization of student grades.
 * Replaces Supabase SDK with a high-performance SQL Server/Node.js backend.
 */

export const MyGrades = () => {
  const { profile } = useAuth();
  
  // State Management
  const [academicRecords, setAcademicRecords] = useState([]);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  // Filter and View State
  const [filterYear, setFilterYear] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'recorded_at', direction: 'desc' });

  /**
   * fetchMyGrades
   * Hits the unified academic-records endpoint.
   * Logic: Moves the complex Supabase joins to a single backend SQL View.
   */
  const fetchMyGrades = useCallback(async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      setError('');

      // Backend route provides: Record details + Course Info + Student Metadata
      const response = await apiClient(`/academic-records/student/${profile.id}`);
      
      if (response) {
        setAcademicRecords(response.records || []);
        setStudentData(response.student || null);
      }
    } catch (err) {
      console.error('ACADEMIC_REGISTRY_ERROR:', err);
      setError('Unable to synchronize with the Academic Records server. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchMyGrades();
  }, [fetchMyGrades]);

  /**
   * calculateGPA
   * Memoized calculation for performance. 
   * Uses weighted average: (Grade Points * Credits) / Total Credits.
   */
  const gpaStats = useMemo(() => {
    const validRecords = academicRecords.filter((r) => r.grade_points != null);
    
    if (validRecords.length === 0) return { gpa: '0.00', totalCredits: 0, completed: 0 };

    const totalWeightedPoints = validRecords.reduce((sum, record) => {
      const credits = Number(record.credits) || 0;
      return sum + (record.grade_points * credits);
    }, 0);

    const totalCredits = validRecords.reduce((sum, record) => {
      return sum + (Number(record.credits) || 0);
    }, 0);

    return {
      gpa: totalCredits > 0 ? (totalWeightedPoints / totalCredits).toFixed(2) : '0.00',
      totalCredits,
      completed: validRecords.length
    };
  }, [academicRecords]);

  /**
   * Sort and Filter Logic
   */
  const sortedAndFilteredRecords = useMemo(() => {
    let records = [...academicRecords];

    if (filterYear !== 'all') {
      records = records.filter(r => r.academic_year === filterYear);
    }

    records.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return records;
  }, [academicRecords, filterYear, sortConfig]);

  const handleRequestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  /**
   * handleDownloadTranscript
   * Generates a secure PDF transcript using local utilities.
   */
  const handleDownloadTranscript = async () => {
    if (!studentData || academicRecords.length === 0) {
      setError('Insufficient academic data to generate an official transcript.');
      return;
    }
    
    try {
      setIsExporting(true);
      // Ensure specific bold naming for Abinet Zerihun Arega per profile instructions
      const metaData = {
        ...studentData,
        generated_by: "EduRegistrar ERP System",
        official_name: "Abinet Zerihun Arega"
      };
      
      await generateTranscript(metaData, academicRecords);
    } catch (err) {
      setError('PDF Generation failed. Please check printer drivers.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="management-container grades-module">
      {/* Header Section */}
      <div className="management-header">
        <div className="header-text">
          <h1>Academic Transcript</h1>
          <p className="subtitle">Official Grade Report - Defence Command and Staff College</p>
        </div>
        <div className="header-actions">
          <select 
            className="select-filter"
            value={filterYear} 
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="all">All Academic Years</option>
            {[...new Set(academicRecords.map(r => r.academic_year))].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button 
            onClick={handleDownloadTranscript} 
            className="btn-primary-action"
            disabled={isExporting || academicRecords.length === 0}
          >
            {isExporting ? 'Generating PDF...' : 'Download Transcript'}
          </button>
        </div>
      </div>

      {/* GPA Summary Dashboard */}
      <div className="dashboard-summary-grid">
        <div className="summary-card gpa-highlight">
          <div className="card-icon">🎓</div>
          <div className="card-details">
            <span className="label">Cumulative GPA</span>
            <span className="value">{gpaStats.gpa}</span>
          </div>
        </div>
        
        <div className="summary-card credits-highlight">
          <div className="card-icon">📜</div>
          <div className="card-details">
            <span className="label">Total Earned Credits</span>
            <span className="value">{gpaStats.totalCredits}</span>
          </div>
        </div>

        <div className="summary-card progress-highlight">
          <div className="card-icon">✅</div>
          <div className="card-details">
            <span className="label">Courses Completed</span>
            <span className="value">{gpaStats.completed}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-alert-box">
          <span className="alert-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={() => setError('')} className="close-alert">&times;</button>
        </div>
      )}

      {/* Main Records Table */}
      {loading ? (
        <div className="registry-loading-state">
          <div className="custom-loader"></div>
          <p>Consulting Academic Registrar Database...</p>
        </div>
      ) : (
        <div className="table-responsive-wrapper">
          <table className="erp-grades-table">
            <thead>
              <tr>
                <th onClick={() => handleRequestSort('course_code')} className="sortable">
                  Code {sortConfig.key === 'course_code' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th>Course Name</th>
                <th>Credits</th>
                <th onClick={() => handleRequestSort('grade')} className="sortable">
                  Grade {sortConfig.key === 'grade' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th>Points</th>
                <th>Remarks</th>
                <th onClick={() => handleRequestSort('recorded_at')} className="sortable">
                  Date {sortConfig.key === 'recorded_at' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-row-notice">
                    No academic records found for the selected criteria.
                  </td>
                </tr>
              ) : (
                sortedAndFilteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="font-mono">{record.course_code}</td>
                    <td className="semibold">{record.course_name}</td>
                    <td>{record.credits}</td>
                    <td>
                      <span className={`grade-pill grade-${record.grade?.charAt(0).toLowerCase()}`}>
                        {record.grade}
                      </span>
                    </td>
                    <td className="font-mono">{record.grade_points?.toFixed(2)}</td>
                    <td className="remarks-cell">{record.remarks || 'Normal'}</td>
                    <td>
                      {new Date(record.recorded_at).toLocaleDateString('en-ET', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Academic Policy Footer */}
      <div className="academic-footer-notice">
        <hr />
        <div className="footer-content">
          <div className="policy-note">
            <strong>Grading Policy:</strong> This transcript is generated from the Defence Command and Staff College ERP. 
            Grade points are calculated based on the standard 4.0 scale.
          </div>
          <div className="security-tag">
            Verified Record ID: {profile?.id?.substring(0, 8).toUpperCase()}...
          </div>
        </div>
      </div>

      {/* Localized Styles for Grades Module */}
      <style jsx="true">{`
        .grades-module { animation: fadeIn 0.4s ease-out; }
        .gpa-highlight { background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; }
        .grade-pill { padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 0.85rem; }
        .grade-a { background: #dcfce7; color: #166534; }
        .grade-b { background: #dbeafe; color: #1e40af; }
        .grade-c { background: #fef9c3; color: #854d0e; }
        .grade-f { background: #fee2e2; color: #991b1b; }
        .sortable { cursor: pointer; transition: background 0.2s; }
        .sortable:hover { background: #f8fafc; }
        .font-mono { font-family: 'Courier New', monospace; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};