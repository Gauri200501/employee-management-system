const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getDashboardStats,
} = require('../controllers/employeeController');

// Aggregate workforce statistics are public; employee records remain protected.
router.get('/stats', getDashboardStats);

// CRUD
// Directory view accessible to all authenticated users (salaries hidden for non-HR/Admin in controller)
router.get('/', protect, getAllEmployees);
router.get('/:id', protect, getEmployeeById);
router.post('/', protect, authorize('Admin', 'HR'), createEmployee);
router.put('/:id', protect, updateEmployee);
router.delete('/:id', protect, authorize('Admin'), deleteEmployee);

module.exports = router;
