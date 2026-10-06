import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeDetails from './components/EmployeeDetails';
import Loading from './components/Loading';
import { getMe } from './services/employeeService';

function ProtectedLayout({ user, onLogout, children }) {
  return (
    <div className="app-layout">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="main-content">
        <Navbar user={user} />
        <div className="page-container">
          {children}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);

  const [authLoading, setAuthLoading] = useState(() => Boolean(localStorage.getItem('ems_token')));

  useEffect(() => {
    const token = localStorage.getItem('ems_token');
    if (!token) return;

    let isMounted = true;
    getMe()
      .then(({ data }) => {
        if (isMounted) setUser(data.employee);
      })
      .catch(() => {
        if (isMounted) toast.error('Unable to verify your session. Please contact your administrator.');
      })
      .finally(() => {
        if (isMounted) setAuthLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ems_token');
    localStorage.removeItem('ems_user');
    setUser(null);
  };

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e1d2e',
            color: '#f1f0ff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      <Routes>
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/dashboard"
          element={
            authLoading ? <Loading fullPage /> : (
              <ProtectedLayout user={user} onLogout={handleLogout}>
                <Dashboard currentUser={user} />
              </ProtectedLayout>
            )
          }
        />

        {/* Employee records and management tools remain protected. */}
        <Route
          path="/employees"
          element={
            authLoading ? <Loading fullPage /> : user ? (
              <ProtectedLayout user={user} onLogout={handleLogout}>
                <Employees currentUser={user} />
              </ProtectedLayout>
            ) : <Navigate to="/dashboard" replace />
          }
        />

        <Route
          path="/employees/new"
          element={
            authLoading ? <Loading fullPage /> : user ? (
              <ProtectedLayout user={user} onLogout={handleLogout}>
                <Employees currentUser={user} defaultAddOpen={true} />
              </ProtectedLayout>
            ) : <Navigate to="/dashboard" replace />
          }
        />

        <Route
          path="/employees/:id"
          element={
            authLoading ? <Loading fullPage /> : user ? (
              <ProtectedLayout user={user} onLogout={handleLogout}>
                <EmployeeDetails currentUser={user} />
              </ProtectedLayout>
            ) : <Navigate to="/dashboard" replace />
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
