const DEPARTMENTS = [
  'All Departments',
  'Engineering',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'Legal',
  'Design',
  'Product',
];

const STATUSES = ['All Status', 'Active', 'Inactive', 'On Leave', 'Terminated'];
const ROLES = ['All Roles', 'Admin', 'HR', 'Employee'];

const DepartmentFilter = ({ department, status, role, onDepartmentChange, onStatusChange, onRoleChange }) => {
  const selectStyle = {
    padding: '9px 32px 9px 12px',
    background: 'var(--bg-input)',
    border: 'var(--glass-border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b688e' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    minWidth: 148,
  };

  return (
    <>
      <select
        id="department-filter"
        style={selectStyle}
        value={department}
        onChange={(e) => onDepartmentChange(e.target.value === 'All Departments' ? '' : e.target.value)}
      >
        {DEPARTMENTS.map((d) => (
          <option key={d} value={d === 'All Departments' ? '' : d}>{d}</option>
        ))}
      </select>

      <select
        id="status-filter"
        style={selectStyle}
        value={status}
        onChange={(e) => onStatusChange(e.target.value === 'All Status' ? '' : e.target.value)}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s === 'All Status' ? '' : s}>{s}</option>
        ))}
      </select>

      {onRoleChange && (
        <select
          id="role-filter"
          style={selectStyle}
          value={role}
          onChange={(e) => onRoleChange(e.target.value === 'All Roles' ? '' : e.target.value)}
        >
          {ROLES.map((r) => (
            <option key={r} value={r === 'All Roles' ? '' : r}>{r}</option>
          ))}
        </select>
      )}
    </>
  );
};

export default DepartmentFilter;
