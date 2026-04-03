import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages - Using NAMED imports (consistent with your components)
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { Courses } from './pages/Courses';
import { Enrollments } from './pages/Enrollments';
import { Attendance } from './pages/Attendance';
import { AcademicRecords } from './pages/AcademicRecords';
import { Staff } from './pages/Staff';
import { MyCourses } from './pages/MyCourses';
import { MyAttendance } from './pages/MyAttendance';
import { MyGrades } from './pages/MyGrades';
import { Unauthorized } from './pages/Unauthorized';
import './index.css'

function App() {
  // Global Interactive Glow Effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      document.querySelectorAll('.tactical-card').forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / card.clientWidth) * 100;
        const y = ((e.clientY - rect.top) / card.clientHeight) * 100;
        card.style.setProperty('--x', `${x}%`);
        card.style.setProperty('--y', `${y}%`);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <AuthProvider>
      <div className="hq-dashboard-layout">
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/students" element={<Students />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/enrollments" element={<Enrollments />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/academic-records" element={<AcademicRecords />} />
              <Route path="/staff" element={<Staff />} />
              
              <Route path="/my-courses" element={<MyCourses />} />
              <Route path="/my-attendance" element={<MyAttendance />} />
              <Route path="/my-grades" element={<MyGrades />} />
            </Route>

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;