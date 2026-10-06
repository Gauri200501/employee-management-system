import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import EmployeeTable from '../components/EmployeeTable';
import SearchBar from '../components/SearchBar';
import DepartmentFilter from '../components/DepartmentFilter';
import EmployeeForm from '../components/EmployeeForm';
import Loading from '../components/Loading';
import { getEmployees } from '../services/employeeService';
import toast from 'react-hot-toast';

const Employees = ({ currentUser, defaultAddOpen = false }) => {
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(defaultAddOpen);
  const [editTarget, setEditTarget] = useState(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getEmployees({
        page, limit: 10, search, department, status, role,
      });
      setEmployees(data.employees);
      setPagination(data.pagination);
    } catch (err) {
      toast.error('Failed to load employees.');
    } finally {
      setLoading(false);
    }
  }, [page, search, department, status, role]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(fetchEmployees, 300);
    return () => clearTimeout(timer);
  }, [fetchEmployees]);

  // Reset to page 1 on filter change
  useEffect(() => { setPage(1); }, [search, department, status, role]);

  const canAdd = currentUser?.role === 'Admin' || currentUser?.role === 'HR';

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">Employees</h1>
            <p className="page-subtitle">
              {pagination ? `${pagination.total} total employees` : 'Manage your workforce'}
            </p>
          </div>
          {canAdd && (
            <button className="btn btn-primary gap-2" id="add-employee-btn" onClick={() => setAddOpen(true)}>
              <Plus size={16} /> Add Employee
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="page-toolbar">
        <div className="toolbar-left">
          <SearchBar value={search} onChange={setSearch} />
          <DepartmentFilter
            department={department}
            status={status}
            role={role}
            onDepartmentChange={setDepartment}
            onStatusChange={setStatus}
            onRoleChange={currentUser?.role === 'Admin' ? setRole : null}
          />
        </div>
        {(search || department || status || role) && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setSearch(''); setDepartment(''); setStatus(''); setRole(''); }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading ? (
        <Loading />
      ) : (
        <EmployeeTable
          employees={employees}
          pagination={pagination}
          onPageChange={setPage}
          onRefresh={fetchEmployees}
          onEdit={(emp) => setEditTarget(emp)}
          currentUser={currentUser}
        />
      )}

      <EmployeeForm
        isOpen={addOpen || !!editTarget}
        onClose={() => { setAddOpen(false); setEditTarget(null); }}
        onSuccess={fetchEmployees}
        employee={editTarget}
        currentUser={currentUser}
      />
    </div>
  );
};

export default Employees;

