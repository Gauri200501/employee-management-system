const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Login employee
// @route   POST /api/auth/login
// @access  Public
const loginEmployee = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    const employee = await Employee.findOne({ email: cleanEmail });
    if (!employee) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    const employmentStatus = employee.employment?.status || 'Active';
    if (employmentStatus === 'Terminated' || employmentStatus === 'Inactive') {
      return res.status(403).json({ message: 'Account is inactive or terminated.' });
    }

    if (!(await employee.matchPassword(cleanPassword))) {
      return res.status(401).json({ message: 'Invalid password. Note: passwords are case-sensitive.' });
    }

    const token = generateToken(employee._id.toString(), employee.role);

    res.json({
      success: true,
      token,
      employee: employee.toSafeJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged-in employee
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.employee._id).select('-password');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }
    res.json({ success: true, employee: employee.toSafeJSON() });
  } catch (error) {
    next(error);
  }
};

module.exports = { loginEmployee, getMe };
