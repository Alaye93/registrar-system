import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const { user } = useAuth();

  return (
    <div className="app-layout">
      {/* Fixed Tactical Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-wrapper">
        
        {/* Top Professional Header */}
        <header className="top-header">
          <div className="header-left">
            <div className="command-info">
              <span className="command-level">COMMAND LEVEL 04</span>
              <span className="system-title">REGISTRAR INTELLIGENCE</span>
            </div>
          </div>

          <div className="header-right">
            <div className="user-profile">
              <div className="user-info">
                <span className="user-name">{user?.full_name || 'Commander'}</span>
                <span className="user-role">{user?.role?.toUpperCase() || 'OFFICER'}</span>
              </div>
              <div className="user-avatar">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'C'}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;