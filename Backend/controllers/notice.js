const Notice = require('../models/Notice');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all notices (admin only)
// @route   GET /api/notices
// @access  Private (Admin only)
exports.getNotices = asyncHandler(async (req, res, next) => {
  const {
    category,
    priority,
    status,
    page = 1,
    limit = 20
  } = req.query;

  const query = {};
  
  if (category) query.category = category;
  if (priority) query.priority = priority;
  if (status) query.status = status;

  const notices = await Notice.find(query)
    .populate('author', 'name department role')
    .sort({ priority: -1, createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const totalNotices = await Notice.countDocuments(query);

  res.status(200).json({
    success: true,
    count: notices.length,
    totalPages: Math.ceil(totalNotices / limit),
    currentPage: parseInt(page),
    data: notices
  });
});

// @desc    Get notices for specific user (personalized)
// @route   GET /api/notices/my-notices
// @access  Private
exports.getNoticesForUser = asyncHandler(async (req, res, next) => {
  const {
    category,
    priority,
    includeRead = 'true',
    page = 1,
    limit = 20
  } = req.query;

  const user = await User.findById(req.user.id);
  
  const notices = await Notice.findForUser(user, {
    category,
    priority,
    includeRead: includeRead === 'true',
    limit: parseInt(limit),
    skip: (parseInt(page) - 1) * parseInt(limit)
  });

  res.status(200).json({
    success: true,
    count: notices.length,
    data: notices,
    message: 'Personalized notices retrieved successfully'
  });
});

// @desc    Get single notice (admin only)
// @route   GET /api/notices/:id
// @access  Private (Admin only)
exports.getNotice = asyncHandler(async (req, res, next) => {
  const notice = await Notice.findById(req.params.id)
    .populate('author', 'name department role')
    .populate('readBy.user', 'name department');

  if (!notice) {
    return next(new ErrorResponse('Notice not found', 404));
  }

  res.status(200).json({
    success: true,
    data: notice
  });
});

// @desc    Create new notice (admin only)
// @route   POST /api/notices
// @access  Private (Admin only)
exports.createNotice = asyncHandler(async (req, res, next) => {
  // Add author to request body
  req.body.author = req.user.id;

  // All notices created by admin are auto-approved and published
  req.body.approvalStatus = 'Approved';
  req.body.approvedBy = req.user.id;
  req.body.approvedAt = new Date();
  req.body.status = 'Published';

  // Validate that targeting is specified (no public notices)
  if (!req.body.targeting || 
      (!req.body.targeting.roles || req.body.targeting.roles.length === 0) &&
      (!req.body.targeting.departments || req.body.targeting.departments.length === 0) &&
      (!req.body.targeting.specificUsers || req.body.targeting.specificUsers.length === 0)) {
    return next(new ErrorResponse('Notice must have specific targeting criteria. No public notices allowed.', 400));
  }

  const notice = await Notice.create(req.body);

  await notice.populate('author', 'name department role');

  res.status(201).json({
    success: true,
    data: notice,
    message: 'Notice created and published successfully'
  });
});

// @desc    Update notice (admin only)
// @route   PUT /api/notices/:id
// @access  Private (Admin only)
exports.updateNotice = asyncHandler(async (req, res, next) => {
  let notice = await Notice.findById(req.params.id);

  if (!notice) {
    return next(new ErrorResponse('Notice not found', 404));
  }

  // Validate targeting if being updated
  if (req.body.targeting) {
    const targeting = req.body.targeting;
    if ((!targeting.roles || targeting.roles.length === 0) &&
        (!targeting.departments || targeting.departments.length === 0) &&
        (!targeting.specificUsers || targeting.specificUsers.length === 0)) {
      return next(new ErrorResponse('Notice must have specific targeting criteria. No public notices allowed.', 400));
    }
  }

  notice = await Notice.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('author', 'name department role');

  res.status(200).json({
    success: true,
    data: notice,
    message: 'Notice updated successfully'
  });
});

// @desc    Delete notice (admin only)
// @route   DELETE /api/notices/:id
// @access  Private (Admin only)
exports.deleteNotice = asyncHandler(async (req, res, next) => {
  const notice = await Notice.findById(req.params.id);

  if (!notice) {
    return next(new ErrorResponse('Notice not found', 404));
  }

  await notice.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Notice deleted successfully'
  });
});

// @desc    Mark notice as read
// @route   PUT /api/notices/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const notice = await Notice.findById(req.params.id);

  if (!notice) {
    return next(new ErrorResponse('Notice not found', 404));
  }

  // Check if user should have access to this notice
  const user = await User.findById(req.user.id);
  if (!notice.isTargetedToUser(user)) {
    return next(new ErrorResponse('Notice not accessible', 403));
  }

  await notice.markAsRead(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Notice marked as read'
  });
});

// @desc    Get notice analytics (admin only)
// @route   GET /api/notices/:id/analytics
// @access  Private (Admin only)
exports.getNoticeAnalytics = asyncHandler(async (req, res, next) => {
  const notice = await Notice.findById(req.params.id);

  if (!notice) {
    return next(new ErrorResponse('Notice not found', 404));
  }

  const analytics = {
    totalRecipients: notice.analytics.totalRecipientsCount,
    readCount: notice.analytics.readCount,
    clickCount: notice.analytics.clickCount,
    emailsSent: notice.analytics.emailsSent,
    pushNotificationsSent: notice.analytics.pushNotificationsSent,
    readPercentage: notice.readPercentage,
    engagementRate: notice.engagementRate,
    readByUsers: notice.readBy.length,
    isActive: notice.isActive,
    isExpired: notice.isExpired
  };

  res.status(200).json({
    success: true,
    data: analytics
  });
});
