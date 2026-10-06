import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('ems_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle global auth errors (exclude login endpoint so toast errors display properly)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginEndpoint = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginEndpoint) {
      localStorage.removeItem('ems_token');
      localStorage.removeItem('ems_user');
      if (window.location.pathname !== '/dashboard') {
        window.location.href = '/dashboard';
      }
    }
    return Promise.reject(error);
  }
);

// ---- Auth ----
export const login = (credentials) => API.post('/auth/login', credentials);
export const getMe = () => API.get('/auth/me');

// ---- Employees ----
export const getEmployees = async (params) => {
  const response = await API.get('/employees', { params });

  response.data.employees = response.data.employees.map((employee) => ({
    ...employee,
    id: employee.id || employee._id,
    firstName: employee.firstName || employee.personal?.firstName || '',
    lastName: employee.lastName || employee.personal?.lastName || '',
    department: employee.department || employee.employment?.department || '',
    position: employee.position || employee.employment?.designation || '',
    status: employee.status || employee.employment?.status || 'Active',
    hireDate: employee.hireDate || employee.employment?.joiningDate,
    phone: employee.phone || employee.contact?.mobileNumber || '',
    address: employee.address || employee.contact?.currentAddress?.address || '',
    salary: employee.salary ?? employee.employment?.salary,
  }));

  return response;
};
export const getEmployee = (id) => API.get(`/employees/${id}`);
export const createEmployee = (data) => API.post('/employees', data);
export const updateEmployee = (id, data) => API.put(`/employees/${id}`, data);
export const deleteEmployee = (id) => API.delete(`/employees/${id}`);
export const getDashboardStats = () => API.get('/employees/stats');

export default API;
