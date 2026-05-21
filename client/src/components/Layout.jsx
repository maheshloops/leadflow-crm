import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const NAV = [
  { to: '/', label: 'All Leads', exact: true },
  { to: '/pipeline', label: 'Pipeline' },
  { to: '/analytics', label: 'Analytics' }
];

export default function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif', background: '#0f0f11', color: '#f0eff4' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: '#16161a', borderRight: '1px solid #2e2e38', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #2e2e38' }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>⚡ LeadFlow</div>
          <div style={{ fontSize: 11, color: '#5c5b72', marginTop: 2 }}>CRM Dashboard</div>
        </div>

        <nav style={{ flex: 1, padding: '12px 10px' }}>
          {NAV.map(({ to, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              style={({ isActive }) => ({
                display: 'block',
                padding: '9px 12px',
                borderRadius: 8,
                marginBottom: 2,
                fontSize: 13,
                fontWeight: 500,
                textDecoration: 'none',
                color: isActive ? '#a594ff' : '#a09fb8',
                background: isActive ? 'rgba(124,106,247,0.12)' : 'transparent',
                transition: 'all 0.15s'
              })}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '12px 10px', borderTop: '1px solid #2e2e38' }}>
          <div style={{ padding: '10px 12px', background: '#1e1e24', borderRadius: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{user?.name || 'Admin'}</div>
            <div style={{ fontSize: 11, color: '#5c5b72', marginBottom: 8 }}>{user?.role}</div>
            <button
              onClick={handleLogout}
              style={{ fontSize: 11, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Sign out →
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
