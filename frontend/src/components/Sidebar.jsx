import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserPlus, LogOut,
  Building2, Shield,
} from 'lucide-react';

const Sidebar = ({ user, onLogout }) => {
  const location = useLocation();

  const getInitials = (u) => {
    if (!u) return 'U';
    return `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase();
  };

  const getRoleBadgeClass = (role) => {
    if (role === 'Admin') return 'badge badge-admin';
    if (role === 'HR') return 'badge badge-hr';
    return 'badge badge-employee';
  };

  const canAdd = user?.role === 'Admin' || user?.role === 'HR';
  const isAdmin = user?.role === 'Admin';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Building2 size={20} color="white" />
        </div>
        <div>
          <div className="sidebar-logo-text">Astera HR</div>
          <div className="sidebar-logo-sub">People operations</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main Menu</div>

        <NavLink
          to="/dashboard"
          title="Dashboard"
          className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
        >
          <LayoutDashboard className="sidebar-link-icon" />
          <span className="sidebar-link-label">Dashboard</span>
        </NavLink>

        {user && (
          <NavLink
            to="/employees"
            title="Employees"
            end
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <Users className="sidebar-link-icon" />
            <span className="sidebar-link-label">Employees</span>
          </NavLink>
        )}

        {canAdd && (
          <NavLink
            to="/employees/new"
            title="Add Employee"
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <UserPlus className="sidebar-link-icon" />
            <span className="sidebar-link-label">Add Employee</span>
          </NavLink>
        )}

        {isAdmin && (
          <>
            <div className="sidebar-section-label" style={{ marginTop: 8 }}>Administration</div>
            <NavLink
              to="/employees"
              title="Manage Staff"
              className={({ isActive }) =>
                `sidebar-link${location.pathname === '/employees' && location.search.includes('role=') ? ' active' : ''}`
              }
            >
              <Shield className="sidebar-link-icon" />
              <span className="sidebar-link-label">Manage Staff</span>
            </NavLink>
          </>
        )}
      </nav>


      {/* User Footer */}
      {user && <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar">{getInitials(user)}</div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div className="sidebar-user-name truncate">
              {user?.firstName} {user?.lastName}
            </div>
            <span className={getRoleBadgeClass(user?.role)} style={{ fontSize: 10, padding: '1px 7px' }}>
              {user?.role}
            </span>
          </div>
        </div>

        <button
          className="sidebar-link"
          style={{ marginTop: 8, color: '#f87171', width: '100%' }}
          onClick={onLogout}
        >
          <LogOut className="sidebar-link-icon" />
          Sign Out
        </button>
      </div>}
    </aside>
  );
};

export default Sidebar;
