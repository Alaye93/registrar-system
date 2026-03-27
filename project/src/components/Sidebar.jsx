import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiUsers, 
  FiBook, 
  FiUserCheck, 
  FiBriefcase, 
  FiLogOut, 
  FiPieChart 
} from 'react-icons/fi'; // Install react-icons: npm install react-icons
import "./styles/Sidebar.css";

const Sidebar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FiPieChart /> },
    { name: 'Students', path: '/students', icon: <FiUsers /> },
    { name: 'Courses', path: '/courses', icon: <FiBook /> },
    { name: 'Staff', path: '/staff', icon: <FiUserCheck /> },
    { name: 'Enrollments', path: '/enrollments', icon: <FiBriefcase /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-badge">EDCSC</div>
        <h2 className="brand-name">Registrar & Alumni</h2>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path} 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <FiLogOut />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;