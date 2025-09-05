const User = require('../models/User');
const Notice = require('../models/Notice');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { deleteFile, getFilePathFromUrl } = require('../utils/fileUpload');

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

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
      createdAt: user.createdAt,
      displayName: user.displayName,
      successRate: user.successRate
    }
  });
});

// @desc    Get current user's profile
// @route   GET /api/users/profile
// @access  Private
exports.getMyProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('-password');

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
      createdAt: user.createdAt,
      displayName: user.displayName,
      successRate: user.successRate
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateMyProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    phone: req.body.phone,
    session: req.body.session?req.body.session:null,
    residence: req.body.residence,
    bloodGroup: req.body.bloodGroup,
    isVolunteer: req.body.isVolunteer
  };

  // Only allow certain role changes
  if (req.body.role && req.user.role === 'admin') {
    fieldsToUpdate.role = req.body.role;
  }

  // Handle session updates for students
  if (req.body.session && (req.user.role === 'student' || req.body.role === 'student')) {
    fieldsToUpdate.session = req.body.session;
  }

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

  // Update last active time
  fieldsToUpdate.lastActive = new Date();

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  }).select('-password');

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
      lastActive: user.lastActive,
      createdAt: user.createdAt
    }
  });
});

// @desc    Delete profile picture
// @route   DELETE /api/users/profile-picture
// @access  Private
exports.deleteProfilePicture = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user.profilePicture) {
    return next(new ErrorResponse('No profile picture to delete', 400));
  }
  
  // Delete the file
  const filePath = getFilePathFromUrl(user.profilePicture);
  deleteFile(filePath);
  
  // Remove from database
  user.profilePicture = null;
  user.lastActive = new Date();
  await user.save();
  
  res.status(200).json({
    success: true,
    message: 'Profile picture deleted successfully'
  });
});

// @desc    Get personalized notices for user
// @route   GET /api/users/notices
// @access  Private
exports.getPersonalizedNotices = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Build query to find notices targeted to this user
  const query = {
    status: 'Published',
    $or: [
      // Notices targeting this specific user
      { 'targeting.specificUsers': user._id },
      // Notices targeting user's department (if not excluded)
      {
        'targeting.departments': user.department,
        'targeting.excludeUsers': { $ne: user._id }
      },
      // Notices targeting user's role (if not excluded)
      {
        'targeting.roles': user.role,
        'targeting.excludeUsers': { $ne: user._id }
      },
      // Notices targeting user's blood group (if not excluded)
      {
        'targeting.bloodGroups': user.bloodGroup,
        'targeting.excludeUsers': { $ne: user._id }
      },
      // Notices targeting volunteers only (if user is volunteer and not excluded)
      {
        'targeting.volunteersOnly': true,
        isVolunteer: true,
        'targeting.excludeUsers': { $ne: user._id }
      },
      // Notices targeting user's session (for students)
      ...(user.session ? [{
        'targeting.sessions': user.session,
        'targeting.excludeUsers': { $ne: user._id }
      }] : []),
      // Notices targeting user's residence (keyword matching)
      ...(user.residence ? [{
        'targeting.residenceKeywords': { 
          $elemMatch: { 
            $regex: new RegExp(user.residence, 'i') 
          } 
        },
        'targeting.excludeUsers': { $ne: user._id }
      }] : [])
    ],
    // Only show notices that haven't expired
    $or: [
      { 'deliverySettings.expiresAt': { $exists: false } },
      { 'deliverySettings.expiresAt': null },
      { 'deliverySettings.expiresAt': { $gt: new Date() } }
    ]
  };

  // Parse query parameters
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const category = req.query.category;
  const priority = req.query.priority;
  const includeRead = req.query.includeRead === 'true';

  // Add category filter
  if (category) {
    query.category = category;
  }

  // Add priority filter
  if (priority) {
    query.priority = priority;
  }

  // Exclude already read notices unless specifically requested
  if (!includeRead) {
    query['readBy.user'] = { $ne: user._id };
  }

  const startIndex = (page - 1) * limit;

  // Execute query
  const notices = await Notice.find(query)
    .populate('author', 'name email department role')
    .populate('readBy.user', 'name')
    .sort({ 'deliverySettings.publishAt': -1, createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

  // Get total count
  const total = await Notice.countDocuments(query);

  // Calculate pagination
  const pagination = {};
  if (startIndex + limit < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: notices.length,
    total,
    pagination,
    notices: notices.map(notice => ({
      id: notice._id,
      title: notice.title,
      content: notice.content,
      category: notice.category,
      priority: notice.priority,
      type: notice.type,
      author: notice.author,
      tags: notice.tags,
      attachments: notice.attachments,
      deliverySettings: notice.deliverySettings,
      isRead: notice.readBy.some(read => read.user._id.toString() === user._id.toString()),
      createdAt: notice.createdAt,
      updatedAt: notice.updatedAt
    }))
  });
});

// @desc    Mark notice as read
// @route   PUT /api/users/notices/:id/read
// @access  Private
exports.markNoticeAsRead = asyncHandler(async (req, res, next) => {
  const notice = await Notice.findById(req.params.id);
  
  if (!notice) {
    return next(new ErrorResponse('Notice not found', 404));
  }

  // Check if already read by this user
  const existingRead = notice.readBy.find(
    read => read.user.toString() === req.user.id
  );

  if (existingRead) {
    // Increment read count
    existingRead.readCount += 1;
    existingRead.readAt = new Date();
  } else {
    // Add new read entry
    notice.readBy.push({
      user: req.user.id,
      readAt: new Date(),
      readCount: 1
    });
    
    // Update analytics
    notice.analytics.readCount += 1;
  }

  await notice.save();

  res.status(200).json({
    success: true,
    message: 'Notice marked as read'
  });
});

// @desc    Get user's volunteer statistics
// @route   GET /api/users/volunteer-stats
// @access  Private
exports.getVolunteerStats = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('volunteerStats isVolunteer');
  
  if (!user.isVolunteer) {
    return next(new ErrorResponse('User is not a volunteer', 400));
  }

  res.status(200).json({
    success: true,
    stats: user.volunteerStats,
    successRate: user.successRate
  });
});

// @desc    Get users by department (for admins)
// @route   GET /api/users/department/:department
// @access  Private (Admin only)
exports.getUsersByDepartment = asyncHandler(async (req, res, next) => {
  const { department } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  const users = await User.find({ 
    department, 
    isVerified: true 
  })
  .select('-password')
  .sort({ name: 1 })
  .limit(limit)
  .skip(startIndex);

  const total = await User.countDocuments({ 
    department, 
    isVerified: true 
  });

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    department,
    users: users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      session: user.session,
      isVolunteer: user.isVolunteer,
      profilePicture: user.profilePicture,
      lastActive: user.lastActive,
      createdAt: user.createdAt
    }))
  });
});
