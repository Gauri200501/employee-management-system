const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { loginEmployee, getMe } = require('../controllers/authController');

router.post('/login', loginEmployee);
router.get('/me', protect, getMe);

module.exports = router;
