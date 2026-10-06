import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { createEmployee, updateEmployee } from '../services/employeeService';

const DEPARTMENTS = ['Engineering','Marketing','Sales','HR','Finance','Operations','Legal','Design','Product'];
const STATUSES = ['Active','Inactive','On Leave','Terminated'];
const ROLES = ['Employee','HR','Admin'];

const initialForm = {
  firstName: '', lastName: '', email: '', password: '',
  phone: '', department: 'Engineering', position: '',
  role: 'Employee', salary: '', hireDate: '', status: 'Active', address: '',
};

const EmployeeForm = ({ isOpen, onClose, onSuccess, employee, currentUser }) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = !!employee;

  useEffect(() => {
    if (isOpen) {
      if (employee) {
        setForm({
          firstName: employee.firstName || '',
          lastName: employee.lastName || '',
          email: employee.email || '',
          password: '',
          phone: employee.phone || '',
          department: employee.department || 'Engineering',
          position: employee.position || '',
          role: employee.role || 'Employee',
          salary: employee.salary || '',
          hireDate: employee.hireDate ? String(employee.hireDate).split('T')[0] : '',
          status: employee.status || 'Active',
          address: employee.address || '',
        });
      } else {
        setForm(initialForm);
      }
      setErrors({});
    }
  }, [isOpen, employee]);

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!isEdit && !form.password) e.password = 'Password is required';
    if (form.password && form.password.length < 6)
      e.password = 'Password must be at least 6 characters';
    if (!form.department) e.department = 'Department is required';
    if (!form.position.trim()) e.position = 'Position is required';
    if (!form.hireDate) e.hireDate = 'Hire date is required';
    return e;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setIsSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.password || !payload.password.trim()) delete payload.password;
      if (payload.salary === '') delete payload.salary;

      if (isEdit) {
        await updateEmployee(employee.id, payload);
        toast.success('Employee updated successfully!');
      } else {
        await createEmployee(payload);
        toast.success('Employee created successfully!');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Employee' : 'Add New Employee'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Section: Personal Info */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>
                Personal Information
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="field-firstName">
                    First Name <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    id="field-firstName"
                    type="text"
                    className={`form-input${errors.firstName ? ' error' : ''}`}
                    value={form.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    placeholder="John"
                  />
                  {errors.firstName && <span className="form-error">{errors.firstName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="field-lastName">
                    Last Name <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    id="field-lastName"
                    type="text"
                    className={`form-input${errors.lastName ? ' error' : ''}`}
                    value={form.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    placeholder="Doe"
                  />
                  {errors.lastName && <span className="form-error">{errors.lastName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="field-email">
                    Email Address <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    id="field-email"
                    type="email"
                    className={`form-input${errors.email ? ' error' : ''}`}
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="john@company.com"
                  />
                  {errors.email && <span className="form-error">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="field-password">
                    {isEdit ? 'New Password (leave blank to keep)' : 'Password'} {!isEdit && <span style={{ color: 'var(--danger)' }}>*</span>}
                  </label>
                  <input
                    id="field-password"
                    type="password"
                    className={`form-input${errors.password ? ' error' : ''}`}
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder={isEdit ? '••••••••' : 'Min. 6 characters'}
                  />
                  {errors.password && <span className="form-error">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="field-phone">
                    Phone Number
                  </label>
                  <input
                    id="field-phone"
                    type="tel"
                    className="form-input"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="field-hireDate">
                    Hire Date <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    id="field-hireDate"
                    type="date"
                    className={`form-input${errors.hireDate ? ' error' : ''}`}
                    value={form.hireDate}
                    onChange={(e) => handleChange('hireDate', e.target.value)}
                  />
                  {errors.hireDate && <span className="form-error">{errors.hireDate}</span>}
                </div>
              </div>
            </div>

            {/* Section: Work Info */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>
                Work Information
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="field-department">Department <span style={{color:'var(--danger)'}}>*</span></label>
                  <select id="field-department" className="form-select"
                    value={form.department} onChange={(e) => handleChange('department', e.target.value)}>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {errors.department && <span className="form-error">{errors.department}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="field-position">Position <span style={{color:'var(--danger)'}}>*</span></label>
                  <input id="field-position" type="text" className="form-input"
                    value={form.position} onChange={(e) => handleChange('position', e.target.value)} placeholder="Software Engineer" />
                  {errors.position && <span className="form-error">{errors.position}</span>}
                </div>

                {currentUser?.role === 'Admin' && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="field-role">Role</label>
                    <select id="field-role" className="form-select"
                      value={form.role} onChange={(e) => handleChange('role', e.target.value)}>
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="field-status">Status</label>
                  <select id="field-status" className="form-select"
                    value={form.status} onChange={(e) => handleChange('status', e.target.value)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="field-salary">Salary (₹)</label>
                  <input id="field-salary" type="number" className="form-input" min="0" step="1000"
                    value={form.salary} onChange={(e) => handleChange('salary', e.target.value)} placeholder="e.g. 850000" />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="form-group">
              <label className="form-label" htmlFor="field-address">Address</label>
              <textarea id="field-address" className="form-textarea" rows={2}
                value={form.address} onChange={(e) => handleChange('address', e.target.value)} placeholder="Street, City, State" />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="submit-employee-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="spinner spinner-sm" />
                  Saving...
                </span>
              ) : (
                <><Save size={16} /> {isEdit ? 'Save Changes' : 'Create Employee'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
