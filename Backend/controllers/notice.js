const Notice = require('../models/Notice');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { deleteFiles, getFilePathFromUrl } = require('../utils/fileUpload');
const { processNoticeWithGemini } = require('../utils/geminiProcessor');
// const { validateProcessedNotice } = require('../middleware/geminiValidation');
const { validateProcessedNotice } = require('../middleware/geminiValidation');

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
  try {
    // Process content with Gemini AI
    const geminiProcessedData = await processNoticeWithGemini({
      files: req.files || [],
      textData: req.body
    });

    // Validate processed data
    const validationErrors = validateProcessedNotice(geminiProcessedData);
    if (validationErrors.length > 0) {
      return next(new ErrorResponse(`Validation failed: ${validationErrors.join(', ')}`, 400));
    }

    // Handle file attachments if any
    if (req.files && req.files.length > 0) {
      const attachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/notice-attachments/${file.filename}`,
        uploadedAt: new Date()
      }));
      
      geminiProcessedData.attachments = attachments;
    }

    // Merge Gemini processed data with required system fields
    const noticeData = {
      ...geminiProcessedData,
      author: req.user.id,
      approvalStatus: 'Approved',
      approvedBy: req.user.id,
      approvedAt: new Date(),
      status: 'Published'
    };

    // Validate that targeting is specified (no public notices)
    if (!noticeData.targeting || 
        (!noticeData.targeting.roles || noticeData.targeting.roles.length === 0 || (noticeData.targeting.roles.length === 1 && noticeData.targeting.roles[0] === 'all')) &&
        (!noticeData.targeting.departments || noticeData.targeting.departments.length === 0 || (noticeData.targeting.departments.length === 1 && noticeData.targeting.departments[0] === 'all')) &&
        (!noticeData.targeting.specificUsers || noticeData.targeting.specificUsers.length === 0)) {
      
      // If Gemini didn't provide specific targeting, use the original request body targeting
      if (req.body.targeting) {
        noticeData.targeting = req.body.targeting;
      } else {
        return next(new ErrorResponse('Notice must have specific targeting criteria. No public notices allowed. Please specify roles, departments, or specific users.', 400));
      }
    }

    // Final validation for targeting
    const targeting = noticeData.targeting;
    if ((!targeting.roles || targeting.roles.length === 0 || (targeting.roles.length === 1 && targeting.roles[0] === 'all')) &&
        (!targeting.departments || targeting.departments.length === 0 || (targeting.departments.length === 1 && targeting.departments[0] === 'all')) &&
        (!targeting.specificUsers || targeting.specificUsers.length === 0)) {
      return next(new ErrorResponse('Notice must have specific targeting criteria. No public notices allowed.', 400));
    }

    const notice = await Notice.create(noticeData);

    await notice.populate('author', 'name department role');

    res.status(201).json({
      success: true,
      data: notice,
      message: 'Notice created and published successfully with AI enhancement',
      geminiProcessed: true
    });

  } catch (geminiError) {
    console.error('Gemini AI processing failed:', geminiError);
    
    // Fallback to original logic if Gemini fails
    req.body.author = req.user.id;
    req.body.approvalStatus = 'Approved';
    req.body.approvedBy = req.user.id;
    req.body.approvedAt = new Date();
    req.body.status = 'Published';

    // All fields including targeting are now optional
    // Backend will handle empty notices gracefully

    // Handle file attachments if any
    if (req.files && req.files.length > 0) {
      const attachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/notice-attachments/${file.filename}`,
        uploadedAt: new Date()
      }));
      
      req.body.attachments = attachments;
    }

    const notice = await Notice.create(req.body);
    await notice.populate('author', 'name department role');

    res.status(201).json({
      success: true,
      data: notice,
      message: 'Notice created and published successfully (AI enhancement failed, used original content)',
      geminiProcessed: false,
      fallbackReason: geminiError.message
    });
  }
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

  // Handle new file attachments
  if (req.files && req.files.length > 0) {
    const newAttachments = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/notice-attachments/${file.filename}`,
      uploadedAt: new Date()
    }));
    
    // Add new attachments to existing ones
    const existingAttachments = notice.attachments || [];
    req.body.attachments = [...existingAttachments, ...newAttachments];
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

  // Delete associated attachment files
  if (notice.attachments && notice.attachments.length > 0) {
    const filePaths = notice.attachments.map(attachment => 
      getFilePathFromUrl(attachment.url)
    ).filter(path => path !== null);
    
    deleteFiles(filePaths);
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

// @desc    Remove attachment from notice (admin only)
// @route   DELETE /api/notices/:id/attachments/:attachmentId
// @access  Private (Admin only)
exports.removeAttachment = asyncHandler(async (req, res, next) => {
  const notice = await Notice.findById(req.params.id);

  if (!notice) {
    return next(new ErrorResponse('Notice not found', 404));
  }

  const attachmentIndex = notice.attachments.findIndex(
    attachment => attachment._id.toString() === req.params.attachmentId
  );

  if (attachmentIndex === -1) {
    return next(new ErrorResponse('Attachment not found', 404));
  }

  // Get the attachment to delete
  const attachmentToDelete = notice.attachments[attachmentIndex];
  
  // Delete the file from filesystem
  const filePath = getFilePathFromUrl(attachmentToDelete.url);
  if (filePath) {
    deleteFiles([filePath]);
  }

  // Remove the attachment from the array
  notice.attachments.splice(attachmentIndex, 1);
  
  await notice.save();

  res.status(200).json({
    success: true,
    message: 'Attachment removed successfully',
    data: notice
  });
});

// @desc    Get notice categories (for dropdowns)
// @route   GET /api/notices/categories
// @access  Private
exports.getNoticeCategories = asyncHandler(async (req, res, next) => {
  const categories = [
    'Academic', 'Admission', 'Examination', 'Result', 'Events', 
    'Workshop', 'Seminar', 'Conference', 'Cultural', 'Sports',
    'Emergency', 'Holiday', 'Transportation', 'Scholarship',
    'Job', 'Internship', 'Research', 'Administrative', 'General',
    'Health', 'Safety', 'Accommodation', 'Library', 'IT', 'Other'
  ];

  res.status(200).json({
    success: true,
    data: categories
  });
});

// @desc    Get notice statistics (admin only)
// @route   GET /api/notices/stats
// @access  Private (Admin only)
exports.getNoticeStats = asyncHandler(async (req, res, next) => {
  const totalNotices = await Notice.countDocuments();
  const publishedNotices = await Notice.countDocuments({ status: 'Published' });
  const draftNotices = await Notice.countDocuments({ status: 'Draft' });
  const expiredNotices = await Notice.countDocuments({ status: 'Expired' });
  
  // Get category-wise count
  const categoryStats = await Notice.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Get priority-wise count
  const priorityStats = await Notice.aggregate([
    { $group: { _id: '$priority', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Get recent notices
  const recentNotices = await Notice.find({ status: 'Published' })
    .populate('author', 'name department')
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title category priority createdAt author');

  res.status(200).json({
    success: true,
    data: {
      totalNotices,
      publishedNotices,
      draftNotices,
      expiredNotices,
      categoryStats,
      priorityStats,
      recentNotices
    }
  });
});
