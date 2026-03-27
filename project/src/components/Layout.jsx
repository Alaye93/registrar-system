import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';
import './styles/Sidebar.css';

const Layout = () => {
  const { user } = useAuth();

  return (
    <div className="app-layout">
      /* Sidebar stays fixed on the left */
      <Sidebar />

      <div className="main-wrapper">
        {/* Top Header Bar */}
        <header className="top-header">
          <div className="header-left">
            <span className="college-title">DIRECTORATE REGISTRAR AND ALUMNI</span>
          </div>
          <div className="header-right">
            <div className="user-profile">
              <span className="user-name">{user?.full_name}</span>
              <span className="user-role-tag">{user?.role}</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="content-area">
          {/* The Outlet renders the current page (Dashboard, Courses, etc.) */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;