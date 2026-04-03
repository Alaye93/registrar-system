import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiPieChart, FiUsers, FiBook, FiUserCheck, 
  FiBriefcase, FiLogOut, FiChevronRight 
} from 'react-icons/fi';
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
      {/* HEADER WITH LOGO */}
      <div className="sidebar-header">
        <img 
          src="/logo.png" 
          alt="EDCSC Logo" 
          className="sidebar-logo-img" 
        />
        <div className="brand-info">
          <div className="logo-badge">EDCSC</div>
          <h2 className="brand-name">Registrar & Alumni</h2>
        </div>
      </div>

      {/* COMMAND MENU - Made Bigger & Prominent */}
      <div className="command-menu-header">
        COMMAND MENU
      </div>

      {/* NAVIGATION */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path} 
            className={({ isActive }) => 
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.name}</span>
            <FiChevronRight className="nav-arrow" />
          </NavLink>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <FiLogOut size={18} />
          <span>SIGN OUT SYSTEM</span>
        </button>
        
        <div className="secured-info">
          SECURED • CLEARANCE LEVEL 4
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;