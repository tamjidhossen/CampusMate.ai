const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { uploadProfilePicture, handleUploadError } = require('../utils/fileUpload');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  body('department')
    .optional()
    .isIn([
       // Faculty of Arts and Humanities
        'Bangla Language and Literature',
        'English Language and Literature',
        'Music',
        'Theatre and Performance Studies',
        'Film and Media Studies',
        'Philosophy',
        'History',
        'Fine Arts',
        
        // Faculty of Science and Engineering
        'Computer Science and Engineering',
        'Electrical and Electronic Engineering',
        'Environmental Science and Engineering',
        'Statistics',
        
        // Faculty of Social Sciences
        'Economics',
        'Public Administration and Governance Studies',
        'Folklore',
        'Anthropology',
        'Population Science',
        'Local Government and Urban Development',
        'Sociology',
        
        // Faculty of Business Studies
        'Accounting and Information Systems',
        'Finance and Banking',
        'Human Resource Management',
        'Management',
        'Marketing',
        
        // Faculty of Law
        'Law and Justice',
        
        // Other
        'Administration',
        'Other'
    ])
    .withMessage('Please select a valid department'),
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
  body('session')
    .optional()
    .custom((value, { req }) => {
      // If role is student, session is required
      if (req.body.role === 'student') {
        if (!value) {
          throw new Error('Session is required for students');
        }
        if (!['2024-25', '2023-24', '2022-23', '2021-22', '2020-21', '2019-20', '2018-19', '2017-18'].includes(value)) {
          throw new Error('Please select a valid session');
        }
      }
      return true;
    }),
  // Profile picture validation (handled by multer middleware, but we can add custom validation here if needed)
  body('profilePicture')
    .optional()
    .custom((value, { req }) => {
      // Additional validation can be added here if needed
      // The file validation is primarily handled by multer
      return true;
    })
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', 
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  validate,
  forgotPassword
);
router.put('/reset-password/:resettoken', 
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  validate,
  resetPassword
);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-profile', 
  protect, 
  uploadProfilePicture, 
  handleUploadError,
  updateProfileValidation, 
  validate, 
  updateProfile
);
router.put('/change-password', protect, changePasswordValidation, validate, changePassword);

// Profile picture routes
router.delete('/profile-picture', protect, async (req, res, next) => {
  try {
    const { deleteFile, getFilePathFromUrl } = require('../utils/fileUpload');
    const User = require('../models/User');
    
    const user = await User.findById(req.user.id);
    
    if (!user.profilePicture) {
      return res.status(400).json({
        success: false,
        message: 'No profile picture to delete'
      });
    }
    
    // Delete the file
    const filePath = getFilePathFromUrl(user.profilePicture);
    deleteFile(filePath);
    
    // Remove from database
    user.profilePicture = null;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Profile picture deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
