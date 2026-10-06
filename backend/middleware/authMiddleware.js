const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

// Protect routes – verify JWT
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const employee = await Employee.findById(decoded.id).select('-password');

    if (!employee) {
      return res.status(401).json({ message: 'Not authorized, employee not found.' });
    }

    req.employee = employee;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, invalid token.' });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.employee.role)) {
      return res.status(403).json({
        message: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.employee.role}.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
