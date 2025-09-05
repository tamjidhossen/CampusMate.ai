const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Volunteer controller functions
const {
  getVolunteerRequests,
  browseVolunteerRequests,
  getMyRequests,
  getMyVolunteerActivities,
  createVolunteerRequest,
  getVolunteerRequest,
  updateVolunteerRequest,
  deleteVolunteerRequest,
  respondToRequest,
  acceptVolunteerResponse,
  markRequestFulfilled,
  cancelVolunteerRequest,
  getVolunteerLeaderboard,
  getRequestCategories,
  getVolunteerStats
} = require('../controllers/volunteer');

const router = express.Router();

// Validation rules for volunteer request creation/update
const requestValidation = [
  body('title')
    .notEmpty()
    .withMessage('Request title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters')
    .trim(),
  body('description')
    .notEmpty()
    .withMessage('Request description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('category')
    .isIn([
      'Blood Donation', 'Medical Emergency', 'Academic Help', 
      'Transportation', 'Food/Supplies', 'Technical Support',
      'Event Assistance', 'Other'
    ])
    .withMessage('Please select a valid category'),
  body('urgency')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Please select a valid urgency level'),
  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters'),
  body('contactInfo.phone')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  body('contactInfo.email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('requirements.bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Please select a valid blood group')
];

// Response validation
const responseValidation = [
  body('message')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Response message cannot exceed 500 characters')
];

// Fulfillment validation
const fulfillmentValidation = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('feedback')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Feedback cannot exceed 500 characters')
];

// Public routes
router.get('/leaderboard', getVolunteerLeaderboard);

// All other routes require authentication
router.use(protect);

// General routes (accessible to all authenticated users)
router.get('/categories', getRequestCategories);
router.get('/stats', getVolunteerStats);
router.get('/browse', browseVolunteerRequests); // Browse requests (minimal info for all users)

// Request management routes
router.route('/requests')
  .get(getVolunteerRequests) // Get all active volunteer requests (volunteers only)
  .post(requestValidation, validate, createVolunteerRequest); // Create new request

router.get('/my-requests', getMyRequests); // Get user's own requests
router.get('/my-volunteer-activities', getMyVolunteerActivities); // Get volunteer's activities

router.route('/requests/:id')
  .get(getVolunteerRequest) // Get specific request
  .put(requestValidation, validate, updateVolunteerRequest) // Update request (requester only)
  .delete(deleteVolunteerRequest); // Delete request (requester only)

// Request action routes
router.post('/requests/:id/respond', responseValidation, validate, respondToRequest); // Respond to request (volunteers)
router.put('/requests/:id/accept/:volunteerId', acceptVolunteerResponse); // Accept volunteer response (requester)
router.put('/requests/:id/fulfill', fulfillmentValidation, validate, markRequestFulfilled); // Mark as fulfilled (requester)
router.put('/requests/:id/cancel', cancelVolunteerRequest); // Cancel request (requester)

module.exports = router;
