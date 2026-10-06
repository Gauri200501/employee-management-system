import { Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/employees': 'Employees',
  '/employees/new': 'Add Employee',
};

const Navbar = ({ user }) => {
  const location = useLocation();
  const title = pageTitles[location.pathname] ||
    (location.pathname.includes('/employees/') ? 'Employee Details' : 'EMS Portal');

  const getInitials = (u) => {
    if (!u) return 'U';
    return `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-title">{title}</h1>
        <span className="navbar-breadcrumb">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      <div className="navbar-right">
        {user ? (
          <>
            <button className="btn btn-ghost btn-icon" title="Notifications">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-2" style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 12 }}>
              <div className="avatar">{getInitials(user)}</div>
              <div className="flex-col" style={{ display: 'flex', lineHeight: 1.3 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{user.firstName} {user.lastName}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.position}</span>
              </div>
            </div>
          </>
        ) : (
          <span className="navbar-public-tag">Public overview</span>
        )}
      </div>
    </header>
  );
};

export default Navbar;
