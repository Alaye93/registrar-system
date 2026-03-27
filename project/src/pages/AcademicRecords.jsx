import { useEffect, useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { apiClient } from '../services/api.js'; 
import { useAuth } from '../contexts/AuthContext';
import { generateTranscript } from '../utils/pdfGenerator';
import '../styles/Management.css';

export const AcademicRecords = () => {
  // FIXED: Changed 'profile' to 'user' to match your AuthContext
  const { user, loading: authLoading } = useAuth(); 
  
  const [enrollments, setEnrollments] = useState([]);
  const [academicRecords, setAcademicRecords] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    enrollment_id: '',
    grade: '',
    grade_points: '',
    remarks: '',
  });

  // SAFETY CHECK: Prevent rendering while auth is loading or user is missing
  if (authLoading) return <div className="loading-screen">Verifying Access...</div>;
  if (!user) return <Navigate to="/login" replace />;

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchAcademicRecords(selectedStudent);
    } else {
      setAcademicRecords([]);
    }
  }, [selectedStudent]);

  const fetchInitialData = async () => {
    try {
      const data = await apiClient('/enrollments/active'); 
      setEnrollments(data || []);
    } catch (err) {
      setError('Failed to load student enrollment list.');
    }
  };

  const fetchAcademicRecords = async (studentId) => {
    try {
      setLoading(true);
      const data = await apiClient(`/academic-records?studentId=${studentId}`);
      setAcademicRecords(data || []);
    } catch (err) {
      setError('Error fetching transcript data.');
    } finally {
      setLoading(false);
    }
  };

  const convertGradeToPoints = (grade) => {
    const gradeMap = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D': 1.0, 'F': 0.0,
    };
    return gradeMap[grade] || 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'grade') {
      const points = convertGradeToPoints(value);
      setFormData(prev => ({ ...prev, grade: value, grade_points: points }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return setError("Session expired. Please re-login.");

    try {
      await apiClient('/academic-records', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          recorded_by: user.id // FIXED: Using user.id
        })
      });
      setShowModal(false);
      resetForm();
      if (selectedStudent) fetchAcademicRecords(selectedStudent);
    } catch (err) {
      setError(err.message);
    }
  };

  // GPA & CREDIT CALCULATION
  const stats = useMemo(() => {
    if (academicRecords.length === 0) return { gpa: '0.00', credits: 0 };
    let totalWeightedPoints = 0;
    let totalCredits = 0;

    academicRecords.forEach(rec => {
      totalWeightedPoints += (rec.grade_points * (rec.credits || 0));
      totalCredits += (rec.credits || 0);
    });

    return {
      gpa: totalCredits > 0 ? (totalWeightedPoints / totalCredits).toFixed(2) : '0.00',
      credits: totalCredits
    };
  }, [academicRecords]);

  const uniqueStudents = useMemo(() => {
    const map = new Map();
    enrollments.forEach(e => {
        if (e.student_id && !map.has(e.student_id)) {
            map.set(e.student_id, { id: e.student_id, name: e.full_name || e.student_name });
        }
    });
    return Array.from(map.values());
  }, [enrollments]);

  const resetForm = () => {
    setFormData({ enrollment_id: '', grade: '', grade_points: '', remarks: '' });
    setError('');
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <div>
          <h1>Academic Records & Transcripts</h1>
          <p>Official Student Grade Management</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary">
          + Record Grade
        </button>
      </div>

      <div className="filters-section" style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
        <select 
          value={selectedStudent} 
          onChange={(e) => setSelectedStudent(e.target.value)}
          className="search-select"
        >
          <option value="">Select Student to View Transcript...</option>
          {uniqueStudents.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        
        {selectedStudent && academicRecords.length > 0 && (
          <button 
            onClick={() => generateTranscript(selectedStudent, academicRecords)} 
            className="btn-secondary"
          >
            Generate PDF Transcript
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {selectedStudent && (
        <div className="stats-row" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div className="stat-card" style={{ flex: 1, padding: '20px', background: '#f0f7ff', borderRadius: '10px', borderLeft: '5px solid #007bff' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>Cumulative GPA</span>
            <h2 style={{ margin: '5px 0', color: '#007bff' }}>{stats.gpa}</h2>
          </div>
          <div className="stat-card" style={{ flex: 1, padding: '20px', background: '#f6fff0', borderRadius: '10px', borderLeft: '5px solid #28a745' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>Total Earned Credits</span>
            <h2 style={{ margin: '5px 0', color: '#28a745' }}>{stats.credits}</h2>
          </div>
        </div>
      )}

      <div className="table-container">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px' }}>Loading records...</p>
        ) : academicRecords.length > 0 ? (
          <table className="erp-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Credits</th>
                <th>Grade</th>
                <th>Points</th>
                <th>Status</th>
                <th>Date Recorded</th>
              </tr>
            </thead>
            <tbody>
              {academicRecords.map(rec => (
                <tr key={rec.id}>
                  <td><strong>{rec.course_code}</strong> - {rec.course_name}</td>
                  <td>{rec.credits}</td>
                  <td><span className={`grade-badge grade-${rec.grade?.charAt(0)}`}>{rec.grade}</span></td>
                  <td>{rec.grade_points?.toFixed(2)}</td>
                  <td>{rec.grade === 'F' ? <span style={{color: 'red'}}>Failed</span> : <span style={{color: 'green'}}>Passed</span>}</td>
                  <td>{new Date(rec.recorded_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999', background: '#fafafa', borderRadius: '10px' }}>
            {selectedStudent ? "No grade records found for this student." : "Please select a student to view their academic history."}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Commit Grade to Record</h2>
              <p>This action will update the student's official transcript.</p>
            </div>
            <form onSubmit={handleSubmit} className="erp-form">
              <label>Select Course Enrollment</label>
              <select name="enrollment_id" value={formData.enrollment_id} onChange={handleChange} required>
                <option value="">Select Student & Course...</option>
                {enrollments.map(e => (
                  <option key={e.id} value={e.id}>{e.full_name} - {e.course_name}</option>
                ))}
              </select>

              <label>Letter Grade</label>
              <select name="grade" value={formData.grade} onChange={handleChange} required>
                <option value="">-- Select Grade --</option>
                {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>

              <div style={{ marginTop: '10px', fontSize: '13px', color: '#666' }}>
                GPA Weight: <strong>{formData.grade_points || '0.00'}</strong>
              </div>

              <div className="form-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-primary">Update Transcript</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};