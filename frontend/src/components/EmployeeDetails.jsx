import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Pencil, Trash2, Mail, Phone,
  MapPin, Calendar, DollarSign, Briefcase, Shield,
} from 'lucide-react';
import { getEmployee, deleteEmployee } from '../services/employeeService';
import Loading from './Loading';
import EmployeeForm from './EmployeeForm';
import ConfirmDialog from './ConfirmDialog';
import toast from 'react-hot-toast';

const statusBadge = (s) => {
  const m = { Active: 'badge-active', Inactive: 'badge-inactive', 'On Leave': 'badge-leave', Terminated: 'badge-terminated' };
  return `badge ${m[s] || ''}`;
};
const roleBadge = (r) => {
  const m = { Admin: 'badge-admin', HR: 'badge-hr', Employee: 'badge-employee' };
  return `badge ${m[r] || ''}`;
};
const getInitials = (e) => `${e?.firstName?.[0] || ''}${e?.lastName?.[0] || ''}`.toUpperCase();

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3" style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
    <div style={{
      width: 34, height: 34, borderRadius: 8, background: 'var(--bg-input)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)', flexShrink: 0,
    }}>
      <Icon size={16} />
    </div>
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500, marginTop: 2 }}>{value || '—'}</div>
    </div>
  </div>
);

const EmployeeDetails = ({ currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const { data } = await getEmployee(id);
      setEmployee(data.employee);
    } catch {
      toast.error('Failed to load employee details.');
      navigate('/employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployee(); }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteEmployee(id);
      toast.success('Employee deleted.');
      navigate('/employees');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <Loading />;
  if (!employee) return null;

  const canEdit = currentUser?.role === 'Admin' || currentUser?.role === 'HR' || currentUser?.id === employee.id;
  const canDelete = currentUser?.role === 'Admin' && currentUser?.id !== employee.id;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4" style={{ marginBottom: 28 }}>
        <button className="btn btn-ghost gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex gap-2">
          {canEdit && (
            <button className="btn btn-ghost gap-2" id="edit-employee-btn" onClick={() => setEditOpen(true)}>
              <Pencil size={15} /> Edit
            </button>
          )}
          {canDelete && (
            <button className="btn btn-danger gap-2" id="delete-employee-btn" onClick={() => setDeleteOpen(true)}>
              <Trash2 size={15} /> Delete
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24 }}>
        {/* Left – Profile Card */}
        <div className="glass-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16, alignSelf: 'start' }}>
          <div className="avatar avatar-xl" style={{ fontSize: 28 }}>
            {getInitials(employee)}
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
              {employee.firstName} {employee.lastName}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 10 }}>{employee.position}</p>
            <div className="flex gap-2" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
              <span className={statusBadge(employee.status)}>{employee.status}</span>
              <span className={roleBadge(employee.role)}>{employee.role}</span>
            </div>
          </div>

          <div style={{ width: '100%', background: 'var(--bg-input)', borderRadius: 8, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>EMPLOYEE ID</span>
            <span style={{ fontFamily: 'monospace', color: 'var(--primary-light)', fontWeight: 700 }}>{employee.employeeId}</span>
          </div>

          <div style={{ width: '100%', background: 'var(--bg-input)', borderRadius: 8, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>DEPARTMENT</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{employee.department}</span>
          </div>

          {employee.salary && (
            <div style={{ width: '100%', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', borderRadius: 8, padding: '12px 16px', border: '1px solid rgba(99,102,241,0.2)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Annual Salary</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary-light)', marginTop: 4 }}>
                ₹{Number(employee.salary).toLocaleString('en-IN')}
              </div>
            </div>
          )}
        </div>

        {/* Right – Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Contact Information
            </h3>
            <InfoRow icon={Mail} label="Email Address" value={employee.email} />
            <InfoRow icon={Phone} label="Phone Number" value={employee.phone} />
            <InfoRow icon={MapPin} label="Address" value={employee.address} />
          </div>

          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Employment Details
            </h3>
            <InfoRow icon={Briefcase} label="Position" value={employee.position} />
            <InfoRow icon={Shield} label="Role" value={employee.role} />
            <InfoRow icon={Calendar} label="Hire Date" value={employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'} />
            <InfoRow icon={Calendar} label="Member Since" value={employee.createdAt ? new Date(employee.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'} />
          </div>
        </div>
      </div>

      {/* Modals */}
      <EmployeeForm
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={fetchEmployee}
        employee={employee}
        currentUser={currentUser}
      />

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Employee"
        message={`Are you sure you want to permanently delete ${employee.firstName} ${employee.lastName}?`}
        confirmLabel="Yes, Delete"
      />
    </div>
  );
};

export default EmployeeDetails;
