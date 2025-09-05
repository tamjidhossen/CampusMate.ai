const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'No user found with this token'
        });
      }

      // Check if user is verified
      if (!req.user.isVerified) {
        return res.status(403).json({
          success: false,
          message: 'Account not verified. Please wait for admin approval.'
        });
      }

      // Update last active timestamp
      req.user.lastActive = new Date();
      await req.user.save({ validateBeforeSave: false });

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user is verified (additional middleware for sensitive operations)
exports.requireVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Account verification required to perform this action'
    });
  }
  next();
};

// Check if user is a volunteer (for volunteer-specific routes)
exports.requireVolunteer = (req, res, next) => {
  if (!req.user.isVolunteer) {
    return res.status(403).json({
      success: false,
      message: 'You must be registered as a volunteer to access this feature'
    });
  }
  next();
};

// Optional authentication (for routes that work with or without auth)
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
      } catch (error) {
        // Invalid token, but continue without user
        req.user = null;
      }
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during optional authentication'
    });
  }
};
