import { useEffect, useState } from 'react';
import {
  FiUsers, FiBookOpen, FiUserCheck,
  FiClock, FiPlus, FiFileText
} from 'react-icons/fi';
import { apiClient } from '../services/api.js';
import '../styles/Dashboard.css';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    staff: 0,
    courses: 0,
    enrollments: 0
  });

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [st, sf, co, en] = await Promise.all([
        apiClient('/students'),
        apiClient('/staff'),
        apiClient('/courses'),
        apiClient('/enrollments')
      ]);

      setStats({
        students: st?.length || 0,
        staff: sf?.length || 0,
        courses: co?.length || 0,
        enrollments: en?.length || 0
      });

      // MOCK activities (later replace with API)
      setActivities([
        "Student John Doe registered for CS101",
        "Transcript generated for ID-2045",
        "New staff member added",
        "Course 'Data Structures' updated"
      ]);

    } catch (err) {
      console.error("Dashboard data fetch error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">

      {/* HEADER */}
      <header className="dashboard-header">
        <div>
          <h1>Registrar Dashboard</h1>
          <span>Academic Management System</span>
        </div>

        <div className="header-right">
          <span className="status active">System Active</span>
        </div>
      </header>

      {/* STATS */}
      <section className="stats-grid">
        <StatCard
          icon={<FiUsers />}
          label="Total Students"
          value={stats.students}
        />
        <StatCard
          icon={<FiUserCheck />}
          label="Staff Members"
          value={stats.staff}
        />
        <StatCard
          icon={<FiBookOpen />}
          label="Courses"
          value={stats.courses}
        />
        <StatCard
          icon={<FiClock />}
          label="Enrollments"
          value={stats.enrollments}
        />
      </section>

      {/* MAIN SECTION */}
      <div className="main-grid">

        {/* RECENT ACTIVITIES */}
        <div className="card">
          <h3>Recent Activities</h3>
          <ul className="activity-list">
            {activities.map((act, index) => (
              <li key={index}>{act}</li>
            ))}
          </ul>
        </div>

        {/* QUICK ACTIONS */}
        <div className="card">
          <h3>Quick Actions</h3>
          <div className="actions">
            <button><FiPlus /> Add Student</button>
            <button><FiBookOpen /> Add Course</button>
            <button><FiFileText /> Generate Report</button>
          </div>
        </div>

      </div>

      {/* STUDENT TABLE (IMPORTANT) */}
      <div className="card">
        <h3>Student Records</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Program</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>001</td>
              <td>John Doe</td>
              <td>Computer Science</td>
              <td>Active</td>
            </tr>
            <tr>
              <td>002</td>
              <td>Jane Smith</td>
              <td>Information Systems</td>
              <td>Pending</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
};

/* STAT CARD */
const StatCard = ({ icon, label, value }) => (
  <div className="stat-card">
    <div className="icon">{icon}</div>
    <div>
      <span>{label}</span>
      <h2>{value}</h2>
    </div>
  </div>
);