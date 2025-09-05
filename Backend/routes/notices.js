const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Notice controller functions
const {
  getNotices,
  getNotice,
  createNotice,
  updateNotice,
  deleteNotice,
  markAsRead,
  getNoticesForUser,
  getNoticeAnalytics
} = require('../controllers/notice');

const router = express.Router();

// Validation rules for notice creation/update
const noticeValidation = [
  body('title')
    .notEmpty()
    .withMessage('Notice title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('content')
    .notEmpty()
    .withMessage('Notice content is required')
    .isLength({ max: 5000 })
    .withMessage('Content cannot exceed 5000 characters'),
  body('category')
    .isIn([
      'Academic', 'Admission', 'Examination', 'Result', 'Events', 
      'Workshop', 'Seminar', 'Conference', 'Cultural', 'Sports',
      'Emergency', 'Holiday', 'Transportation', 'Scholarship',
      'Job', 'Internship', 'Research', 'Administrative', 'General',
      'Health', 'Safety', 'Accommodation', 'Library', 'IT', 'Other'
    ])
    .withMessage('Please select a valid notice category'),
  body('priority')
    .optional()
    .isIn(['Low', 'Normal', 'High', 'Urgent'])
    .withMessage('Please select a valid priority level'),
  body('type')
    .optional()
    .isIn(['Announcement', 'Circular', 'Notice', 'Alert', 'Reminder'])
    .withMessage('Please select a valid notice type'),
  body('targeting')
    .notEmpty()
    .withMessage('Targeting criteria is required - no public notices allowed'),
  body('targeting.roles')
    .optional()
    .isArray()
    .withMessage('Roles must be an array'),
  body('targeting.roles.*')
    .optional()
    .isIn(['student', 'teacher', 'admin', 'all'])
    .withMessage('Invalid role in targeting'),
  body('targeting.departments')
    .optional()
    .isArray()
    .withMessage('Departments must be an array'),
  body('targeting.bloodGroups')
    .optional()
    .isArray()
    .withMessage('Blood groups must be an array'),
  body('targeting.volunteersOnly')
    .optional()
    .isBoolean()
    .withMessage('volunteersOnly must be a boolean'),
  body('deliverySettings.expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid date'),
  body('deliverySettings.publishAt')
    .optional()
    .isISO8601()
    .withMessage('Publish date must be a valid date')
];

// All routes require authentication
router.use(protect);

// User routes
router.get('/my-notices', getNoticesForUser); // Get notices targeted to current user
router.put('/:id/read', markAsRead); // Mark notice as read

// Admin-only routes (only admins can manage notices)
router.use(authorize('admin'));

router.route('/')
  .get(getNotices) // Get all notices (admin view)
  .post(noticeValidation, validate, createNotice); // Create new notice

router.route('/:id')
  .get(getNotice) // Get specific notice
  .put(noticeValidation, validate, updateNotice) // Update notice
  .delete(deleteNotice); // Delete notice

router.get('/:id/analytics', getNoticeAnalytics); // Get notice analytics

module.exports = router;
