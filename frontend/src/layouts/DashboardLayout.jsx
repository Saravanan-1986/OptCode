import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Terminal, 
  FolderKanban, 
  History, 
  BookOpen, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  Mail, 
  ChevronDown, 
  Sparkles,
  Code2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/projects?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Compiler', path: '/compiler', icon: Terminal },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'Optimization History', path: '/history', icon: History },
    { label: 'Documentation', path: '/documentation', icon: BookOpen },
  ];

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <aside className="sidebar">
        <div>
          <NavLink to="/dashboard" className="brand-logo">
            <div className="brand-icon-box">
              <Code2 size={22} />
            </div>
            <div>
              <span className="brand-title">CodeOpt</span>
            </div>
          </NavLink>

          <nav className="nav-menu">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
          
          <button
            onClick={logout}
            className="nav-link"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            <LogOut size={18} color="#ef4444" />
            <span style={{ color: '#ef4444' }}>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="main-wrapper">
        {/* Top Header Bar */}
        <header className="top-header">
          <form onSubmit={handleSearchSubmit} className="search-box">
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search projects, passes, IR instructions..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="header-right">
            <button className="header-icon-btn" title="Messages" onClick={() => navigate('/documentation')}>
              <Mail size={18} />
            </button>
            <button className="header-icon-btn" title="Notifications" onClick={() => navigate('/history')}>
              <Bell size={18} />
              <span className="badge-dot"></span>
            </button>

            {/* User Profile dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                className="user-profile-btn"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1d64f2 0%, #3b82f6 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '14px',
                  boxShadow: '0 2px 6px rgba(29, 100, 242, 0.3)'
                }}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="user-info-text">
                  <div className="user-name">{user?.name || 'User'}</div>
                  <div className="user-role">{user?.role || 'Compiler Researcher'}</div>
                </div>
                <ChevronDown size={16} color="#64748b" />
              </button>

              {showProfileMenu && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '52px',
                    width: '210px',
                    background: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-xl)',
                    border: '1px solid var(--border-light)',
                    padding: '8px',
                    zIndex: 50,
                    animation: 'fadeIn 0.15s ease'
                  }}
                >
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>{user?.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
                  </div>
                  <button
                    onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}
                    className="nav-link"
                    style={{ width: '100%', fontSize: '13px', padding: '10px 12px', background: 'transparent' }}
                  >
                    <Settings size={16} />
                    <span>Account Settings</span>
                  </button>
                  <button
                    onClick={() => { setShowProfileMenu(false); logout(); }}
                    className="nav-link"
                    style={{ width: '100%', fontSize: '13px', padding: '10px 12px', color: '#ef4444', background: 'transparent' }}
                  >
                    <LogOut size={16} color="#ef4444" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
