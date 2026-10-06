import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Trash2, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import { deleteEmployee } from '../services/employeeService';
import toast from 'react-hot-toast';

const statusBadge = (status) => {
  const map = {
    Active: 'badge-active',
    Inactive: 'badge-inactive',
    'On Leave': 'badge-leave',
    Terminated: 'badge-terminated',
  };
  return `badge ${map[status] || 'badge-inactive'}`;
};

const roleBadge = (role) => {
  const map = { Admin: 'badge-admin', HR: 'badge-hr', Employee: 'badge-employee' };
  return `badge ${map[role] || 'badge-employee'}`;
};

const getInitials = (emp) =>
  `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`.toUpperCase();

const EmployeeTable = ({ employees, pagination, onPageChange, onRefresh, onEdit, currentUser }) => {
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = currentUser?.role === 'Admin';
  const canEdit = currentUser?.role === 'Admin' || currentUser?.role === 'HR';

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteEmployee(deleteTarget.id);
      toast.success(`${deleteTarget.firstName} ${deleteTarget.lastName} deleted successfully.`);
      setDeleteTarget(null);
      onRefresh?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete employee.');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = pagination?.totalPages || 1;
  const currentPage = pagination?.page || 1;

  const getPageNumbers = () => {
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  if (!employees?.length) {
    return (
      <div className="glass-card">
        <div className="empty-state">
          <div className="empty-icon"><Users size={28} /></div>
          <div className="empty-title">No employees found</div>
          <div className="empty-text">Try adjusting your search or filters.</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="glass-card table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>ID</th>
              <th>Department</th>
              <th>Position</th>
              <th>Role</th>
              <th>Status</th>
              <th>Hire Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} onClick={() => navigate(`/employees/${emp.id}`)}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      {getInitials(emp)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {emp.firstName} {emp.lastName}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{emp.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-secondary)' }}>
                    {emp.employeeId}
                  </span>
                </td>
                <td>{emp.department}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{emp.position}</td>
                <td><span className={roleBadge(emp.role)}>{emp.role}</span></td>
                <td><span className={statusBadge(emp.status)}>{emp.status}</span></td>
                <td style={{ color: 'var(--text-secondary)' }}>
                  {emp.hireDate ? new Date(emp.hireDate).toLocaleDateString('en-IN') : '—'}
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2" style={{ justifyContent: 'flex-end' }}>
                    <button
                      className="btn btn-ghost btn-icon-sm"
                      title="View"
                      onClick={() => navigate(`/employees/${emp.id}`)}
                    >
                      <Eye size={15} />
                    </button>
                    {canEdit && (
                      <button
                        className="btn btn-ghost btn-icon-sm"
                        title="Edit"
                        onClick={() => onEdit ? onEdit(emp) : navigate(`/employees/${emp.id}`)}
                      >
                        <Pencil size={15} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        className="btn btn-ghost btn-icon-sm"
                        title="Delete"
                        style={{ color: '#f87171' }}
                        onClick={() => setDeleteTarget(emp)}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination && (
          <div className="pagination">
            <span className="pagination-info">
              Showing {((currentPage - 1) * pagination.limit) + 1}–
              {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} employees
            </span>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft size={14} />
              </button>
              {getPageNumbers().map((p) => (
                <button
                  key={p}
                  className={`pagination-btn ${p === currentPage ? 'active' : ''}`}
                  onClick={() => onPageChange(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="pagination-btn"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Employee"
        message={`Are you sure you want to permanently delete ${deleteTarget?.firstName} ${deleteTarget?.lastName}? This action cannot be undone.`}
        confirmLabel="Delete Employee"
      />
    </>
  );
};

export default EmployeeTable;
