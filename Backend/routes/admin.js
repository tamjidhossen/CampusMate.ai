const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require admin role
router.use(protect);
router.use(authorize('admin'));

// Placeholder routes for admin functionality
router.get('/users/unverified', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get unverified users endpoint - To be implemented'
  });
});

router.put('/users/:id/verify', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Verify user endpoint - To be implemented'
  });
});

router.get('/dashboard', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin dashboard endpoint - To be implemented'
  });
});

module.exports = router;
