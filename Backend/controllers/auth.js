const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const { deleteFile, getFilePathFromUrl } = require('../utils/fileUpload');

// Generate JWT Token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Generate Refresh Token
const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE,
  });
};

// Create token response
const createTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  // Remove password from output
  user.password = undefined;

  res
    .status(statusCode)
    .cookie('token', token, options)
    .cookie('refreshToken', refreshToken, {
      ...options,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    })
    .json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: user.department,
        residence: user.residence,
        bloodGroup: user.bloodGroup,
        role: user.role,
        session: user.session,
        profilePicture: user.profilePicture,
        isVolunteer: user.isVolunteer,
        isVerified: user.isVerified,
        volunteerStats: user.volunteerStats
      }
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const {
    name,
    email,
    password,
    phone,
    department,
    residence,
    bloodGroup,
    role = 'student'
  } = req.body;

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    phone,
    department,
    residence,
    bloodGroup,
    role: role === 'admin' ? 'student' : role, // Prevent admin registration through API
    isVolunteer: false,
    isVerified: false
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please wait for admin verification.',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      department: user.department,
      role: user.role,
      isVerified: user.isVerified
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if user is verified
  if (!user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Your account is not yet verified. Please wait for admin approval.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  }

  createTokenResponse(user, 200, res);
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
      residence: user.residence,
      bloodGroup: user.bloodGroup,
      role: user.role,
      session: user.session,
      profilePicture: user.profilePicture,
      isVolunteer: user.isVolunteer,
      isVerified: user.isVerified,
      volunteerStats: user.volunteerStats,
      lastActive: user.lastActive,
      createdAt: user.createdAt
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    phone: req.body.phone,
    department: req.body.department,
    residence: req.body.residence,
    bloodGroup: req.body.bloodGroup,
    isVolunteer: req.body.isVolunteer,
    session: req.body.session
  };

  // Handle profile picture upload
  if (req.file) {
    // Get the current user to check for existing profile picture
    const currentUser = await User.findById(req.user.id);
    
    // Delete old profile picture if it exists
    if (currentUser.profilePicture) {
      const oldFilePath = getFilePathFromUrl(currentUser.profilePicture);
      deleteFile(oldFilePath);
    }
    
    // Set new profile picture path
    fieldsToUpdate.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
  }

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => 
    fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
      residence: user.residence,
      bloodGroup: user.bloodGroup,
      role: user.role,
      session: user.session,
      profilePicture: user.profilePicture,
      isVolunteer: user.isVolunteer,
      isVerified: user.isVerified,
      volunteerStats: user.volunteerStats,
      createdAt: user.createdAt
    }
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Current password is incorrect', 400));
  }

  user.password = req.body.newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'CampusMate.ai Password Reset Token',
      message,
    });

    res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully' 
    });
  } catch (err) {
    console.error(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid or expired token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  createTokenResponse(user, 200, res);
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new ErrorResponse('Refresh token is required', 400));
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorResponse('Invalid refresh token', 401));
    }

    if (!user.isVerified) {
      return next(new ErrorResponse('Account not verified', 403));
    }

    createTokenResponse(user, 200, res);
  } catch (error) {
    return next(new ErrorResponse('Invalid refresh token', 401));
  }
});
