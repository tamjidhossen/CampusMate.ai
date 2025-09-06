const { body, validationResult } = require('express-validator');

// Custom validation middleware for Gemini-processed notices
const validateGeminiNotice = (req, res, next) => {
  // Skip validation if this is a Gemini-processed request
  // The validation will happen after Gemini processing in the controller
  if (req.headers['x-gemini-processing'] === 'true' || req.files || req.body.content) {
    return next();
  }
  
  // Apply standard validation for direct API calls without Gemini processing
  const standardValidation = [
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
    body('targeting')
      .notEmpty()
      .withMessage('Targeting criteria is required - no public notices allowed')
  ];
  
  // Run validation
  Promise.all(standardValidation.map(validation => validation.run(req)))
    .then(() => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }
      next();
    })
    .catch(next);
};

// Post-processing validation for Gemini results
const validateProcessedNotice = (noticeData) => {
  const errors = [];
  
  if (!noticeData.title || noticeData.title.length > 200) {
    errors.push('Title is required and must not exceed 200 characters');
  }
  
  if (!noticeData.content || noticeData.content.length > 5000) {
    errors.push('Content is required and must not exceed 5000 characters');
  }
  
  const validCategories = [
    'Academic', 'Admission', 'Examination', 'Result', 'Events', 
    'Workshop', 'Seminar', 'Conference', 'Cultural', 'Sports',
    'Emergency', 'Holiday', 'Transportation', 'Scholarship',
    'Job', 'Internship', 'Research', 'Administrative', 'General',
    'Health', 'Safety', 'Accommodation', 'Library', 'IT', 'Other'
  ];
  
  if (!validCategories.includes(noticeData.category)) {
    errors.push('Invalid category');
  }
  
  const validPriorities = ['Low', 'Normal', 'High', 'Urgent'];
  if (!validPriorities.includes(noticeData.priority)) {
    errors.push('Invalid priority');
  }
  
  return errors;
};

module.exports = {
  validateGeminiNotice,
  validateProcessedNotice
};
