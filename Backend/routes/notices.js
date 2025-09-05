const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { uploadNoticeAttachments, handleUploadError } = require('../utils/fileUpload');

// Notice controller functions
const {
  getNotices,
  getNotice,
  createNotice,
  updateNotice,
  deleteNotice,
  markAsRead,
  getNoticesForUser,
  getNoticeAnalytics,
  removeAttachment,
  getNoticeCategories,
  getNoticeStats
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
router.get('/categories', getNoticeCategories); // Get notice categories (accessible to all authenticated users)

// Admin-only routes (only admins can manage notices)
router.use(authorize('admin'));

router.get('/stats', getNoticeStats); // Get notice statistics

router.route('/')
  .get(getNotices) // Get all notices (admin view)
  .post(uploadNoticeAttachments, handleUploadError, noticeValidation, validate, createNotice); // Create new notice with file upload

router.route('/:id')
  .get(getNotice) // Get specific notice
  .put(uploadNoticeAttachments, handleUploadError, noticeValidation, validate, updateNotice) // Update notice with optional new files
  .delete(deleteNotice); // Delete notice

router.get('/:id/analytics', getNoticeAnalytics); // Get notice analytics
router.delete('/:id/attachments/:attachmentId', removeAttachment); // Remove specific attachment

module.exports = router;
