const express = require('express');
const { body } = require('express-validator');
const {
  getUserProfile,
  getMyProfile,
  updateMyProfile,
  deleteProfilePicture,
  getPersonalizedNotices,
  markNoticeAsRead,
  getVolunteerStats,
  getUsersByDepartment
} = require('../controllers/user');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { uploadProfilePicture, handleUploadError } = require('../utils/fileUpload');

const router = express.Router();

// Profile validation rules
const updateProfileValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .trim(),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  body('residence')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Residence cannot exceed 200 characters'),
  body('bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Please select a valid blood group'),
  body('isVolunteer')
    .optional()
    .isBoolean()
    .withMessage('isVolunteer must be a boolean value'),
  body('role')
    .optional()
    .isIn(['student', 'teacher', 'admin', 'staff'])
    .withMessage('Role must be student, teacher, admin, or staff')
];

// Public routes (for getting other user's profiles)
// router.get('/:id', protect, getUserProfile);

// User profile routes
router.get('/profile/me', protect, getMyProfile);
router.put('/profile/me', 
  protect, 
  uploadProfilePicture, 
  handleUploadError,
  updateProfileValidation, 
  validate, 
  updateMyProfile
);
router.delete('/profile-picture', protect, deleteProfilePicture);

// Notice routes for users
router.get('/notices', protect, getPersonalizedNotices); // Changed from /notices/personalized for cleaner URL
router.put('/notices/:id/read', protect, markNoticeAsRead);


// Volunteer routes
router.get('/volunteer-stats', protect, getVolunteerStats);
router.get('/volunteers', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get volunteers list endpoint - To be implemented in volunteers controller'
  });
});

// Admin routes
router.get('/department/:department', protect, authorize('admin'), getUsersByDepartment);

module.exports = router;
