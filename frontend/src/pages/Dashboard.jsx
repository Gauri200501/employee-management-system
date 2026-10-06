import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, UserCheck, Clock, TrendingUp, Plus, UserMinus, UserX,
  ArrowUpRight, BriefcaseBusiness,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import DashboardCard from '../components/DashboardCard';
import Loading from '../components/Loading';
import { getDashboardStats, getEmployees } from '../services/employeeService';
import EmployeeForm from '../components/EmployeeForm';
import toast from 'react-hot-toast';

const CHART_COLORS = ['#167d72', '#7a91b8', '#d39b51', '#65a294', '#bd7770', '#8b7cae', '#5496a0', '#c47f9c', '#849556'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="dashboard-tooltip">
      <span>{label}</span>
      <strong>{payload[0].value} employees</strong>
    </div>
  );
};

const getInitials = (employee) =>
  (`${employee.firstName?.[0] || ''}${employee.lastName?.[0] || ''}` || employee.email?.[0] || 'U').toUpperCase();

const getEmployeeName = (employee) =>
  [employee.firstName, employee.lastName].filter(Boolean).join(' ') || employee.email || 'Team member';

const Dashboard = ({ currentUser }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const statsRequest = getDashboardStats();
      const employeesRequest = currentUser
        ? getEmployees({ page: 1, limit: 5 })
        : Promise.resolve({ data: { employees: [] } });
      const [statsRes, empRes] = await Promise.all([statsRequest, employeesRequest]);
      setStats(statsRes.data.stats);
      setRecentEmployees(empRes.data.employees);
    } catch {
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <Loading />;

  const deptData = (stats?.byDepartment || []).map((department) => ({
    name: department.department,
    count: Number(department.count),
  }));

  const roleData = (stats?.byRole || []).map((role) => ({
    name: role.role,
    value: Number(role.count),
  }));

  const total = Number(stats?.total) || 0;
  const active = Number(stats?.active) || 0;
  const activeRate = total ? Math.round((active / total) * 100) : 0;
  const statusItems = [
    { label: 'Active', value: active, color: '#25856d', icon: UserCheck },
    { label: 'On leave', value: Number(stats?.onLeave) || 0, color: '#bd842d', icon: Clock },
    { label: 'Inactive', value: Number(stats?.inactive) || 0, color: '#73838a', icon: UserX },
    { label: 'Terminated', value: Number(stats?.terminated) || 0, color: '#b95b56', icon: UserMinus },
  ];
  const canAdd = currentUser?.role === 'Admin' || currentUser?.role === 'HR';

  return (
    <div className="dashboard-page animate-fade-in">
      <section className="dashboard-welcome">
        <div className="dashboard-welcome-copy">
          <span className="dashboard-eyebrow"><BriefcaseBusiness size={14} /> People overview</span>
          <h2>Your workforce, at a glance.</h2>
          <p>{currentUser ? `Welcome back, ${currentUser.firstName}. Here’s the latest across your team.` : 'Here’s the latest high-level view of our workforce.'}</p>
          <div className="dashboard-welcome-meta">
            <span><i /> Workforce data is up to date</span>
            <span>{deptData.length} departments</span>
          </div>
        </div>
        <div className="dashboard-welcome-side">
          <div className="dashboard-welcome-total">
            <span>Total team members</span>
            <strong>{total}</strong>
            <small><span>{activeRate}%</span> currently active</small>
          </div>
          {canAdd && (
            <button className="btn dashboard-add-button" id="add-employee-dashboard-btn" onClick={() => setAddOpen(true)}>
              <Plus size={16} /> Add employee
            </button>
          )}
        </div>
      </section>

      <section className="dashboard-stats" aria-label="Workforce summary">
        <DashboardCard icon={Users} label="Total employees" value={total} iconClass="icon-indigo" colorClass="stat-card-indigo" />
        <DashboardCard icon={UserCheck} label="Active employees" value={active} iconClass="icon-green" colorClass="stat-card-green" />
        <DashboardCard icon={Clock} label="On leave" value={Number(stats?.onLeave) || 0} iconClass="icon-orange" colorClass="stat-card-cyan" />
        <DashboardCard icon={TrendingUp} label="Recent hires · 30 days" value={Number(stats?.recentHires) || 0} iconClass="icon-purple" colorClass="stat-card-purple" />
      </section>

      <section className="dashboard-analytics">
        <article className="dashboard-panel dashboard-departments">
          <div className="dashboard-panel-heading">
            <div>
              <span className="dashboard-panel-kicker">TEAM STRUCTURE</span>
              <h3>Employees by department</h3>
              <p>How your people are distributed across teams</p>
            </div>
            {currentUser && (
              <button className="dashboard-panel-icon" aria-label="View employees" onClick={() => navigate('/employees')}>
                <ArrowUpRight size={17} />
              </button>
            )}
          </div>
          {deptData.length ? (
            <div className="dashboard-department-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} layout="vertical" margin={{ top: 4, right: 18, bottom: 0, left: 4 }} barSize={13}>
                  <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#849398', fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={106} axisLine={false} tickLine={false} tick={{ fill: '#53676d', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f8f7' }} />
                  <Bar dataKey="count" fill="#328c7f" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="dashboard-chart-empty">Department data will appear here when employees are added.</div>
          )}
        </article>

        <article className="dashboard-panel dashboard-roles">
          <div className="dashboard-panel-heading">
            <div>
              <span className="dashboard-panel-kicker">ACCESS &amp; PERMISSIONS</span>
              <h3>Role distribution</h3>
              <p>Team members by account role</p>
            </div>
          </div>
          {roleData.length ? (
            <div className="dashboard-role-content">
              <div className="dashboard-role-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={roleData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={67} paddingAngle={3} stroke="none">
                      {roleData.map((role, index) => (
                        <Cell key={role.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} employees`, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="dashboard-role-total"><strong>{total}</strong><span>people</span></div>
              </div>
              <div className="dashboard-role-legend">
                {roleData.map((role, index) => (
                  <div className="dashboard-role-item" key={role.name}>
                    <span className="dashboard-role-dot" style={{ background: CHART_COLORS[index % CHART_COLORS.length] }} />
                    <span>{role.name}</span>
                    <strong>{role.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="dashboard-chart-empty">Role distribution will appear when data is available.</div>
          )}
        </article>
      </section>

      <section className="dashboard-bottom">
        {currentUser ? <article className="dashboard-panel dashboard-recent">
          <div className="dashboard-panel-heading">
            <div>
              <span className="dashboard-panel-kicker">YOUR PEOPLE</span>
              <h3>Recently added</h3>
              <p>The latest members to join your workforce</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/employees')}>View directory <ArrowUpRight size={14} /></button>
          </div>
          {recentEmployees.length ? (
            <div className="dashboard-recent-list">
              {recentEmployees.map((employee) => (
                <button
                  className="dashboard-employee-row"
                  key={employee.id}
                  onClick={() => navigate(`/employees/${employee.id}`)}
                >
                  <span className="avatar">{getInitials(employee)}</span>
                  <span className="dashboard-employee-info">
                    <strong>{getEmployeeName(employee)}</strong>
                    <small>{employee.position || employee.department || employee.role || 'Workforce member'}</small>
                  </span>
                  <span className={`badge ${employee.status === 'Active' ? 'badge-active' : employee.status === 'On Leave' ? 'badge-leave' : employee.status === 'Terminated' ? 'badge-terminated' : 'badge-inactive'}`}>
                    {employee.status || 'Not set'}
                  </span>
                  <ArrowUpRight className="dashboard-employee-arrow" size={15} />
                </button>
              ))}
            </div>
          ) : (
            <div className="dashboard-chart-empty">No employees to show yet.</div>
          )}
        </article> : <article className="dashboard-panel dashboard-recent dashboard-private-note">
          <div className="dashboard-panel-heading">
            <div>
              <span className="dashboard-panel-kicker">EMPLOYEE PRIVACY</span>
              <h3>Employee profiles are private</h3>
              <p>Names and personal records are only available to authorized team members.</p>
            </div>
          </div>
        </article>}

        <article className="dashboard-panel dashboard-status">
          <div className="dashboard-panel-heading">
            <div>
              <span className="dashboard-panel-kicker">WORKFORCE HEALTH</span>
              <h3>Employee status</h3>
              <p>Current team availability</p>
            </div>
          </div>
          <div className="dashboard-status-list">
            {statusItems.map((item) => {
              const Icon = item.icon;
              const percentage = total ? Math.round((item.value / total) * 100) : 0;
              return (
                <div className="dashboard-status-item" key={item.label}>
                  <div className="dashboard-status-heading">
                    <span className="dashboard-status-label"><Icon size={15} style={{ color: item.color }} /> {item.label}</span>
                    <strong>{item.value}<small>{percentage}%</small></strong>
                  </div>
                  <div className="dashboard-status-track">
                    <span style={{ width: `${percentage}%`, background: item.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <EmployeeForm
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={fetchData}
        currentUser={currentUser}
      />
    </div>
  );
};

export default Dashboard;
