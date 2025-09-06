const VolunteerRequest = require('../models/VolunteerRequest');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all volunteer requests (volunteers only)
// @route   GET /api/volunteers/requests
// @access  Private (Volunteers only)
exports.getVolunteerRequests = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user.isVolunteer) {
    return next(new ErrorResponse('You must be a volunteer to view volunteer requests', 403));
  }

  const {
    page = 1,
    limit = 20
  } = req.query;

  // Update expired requests first
  await VolunteerRequest.updateExpiredRequests();

  // Only get active requests
  const query = { status: 'Active' };

  const startIndex = (parseInt(page) - 1) * parseInt(limit);

  // Execute query - minimal data needed
  const requests = await VolunteerRequest.find(query)
    .populate('requester', 'name department profilePicture')
    .select('title description category urgency location requester createdAt expiresAt responses')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(startIndex);

  const total = await VolunteerRequest.countDocuments(query);

  // Calculate pagination
  const pagination = {};
  if (startIndex + parseInt(limit) < total) {
    pagination.next = {
      page: parseInt(page) + 1,
      limit: parseInt(limit)
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: parseInt(page) - 1,
      limit: parseInt(limit)
    };
  }

  res.status(200).json({
    success: true,
    count: requests.length,
    total,
    pagination,
    data: requests
  });
});

// @desc    Browse volunteer requests (general users - minimal info)
// @route   GET /api/volunteers/browse
// @access  Private
exports.browseVolunteerRequests = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 20
  } = req.query;

  // Update expired requests first
  await VolunteerRequest.updateExpiredRequests();

  // Only get active requests
  const query = { status: 'Active' };

  const startIndex = (parseInt(page) - 1) * parseInt(limit);

  // Execute query - minimal data for browsing
  const requests = await VolunteerRequest.find(query)
    .populate('requester', 'name department')
    .populate('responses.volunteer', 'name profilePicture')
    .select('title description category urgency location createdAt responses status contactInfo')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(startIndex);

  const total = await VolunteerRequest.countDocuments(query);

  // Calculate pagination
  const pagination = {};
  if (startIndex + parseInt(limit) < total) {
    pagination.next = {
      page: parseInt(page) + 1,
      limit: parseInt(limit)
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: parseInt(page) - 1,
      limit: parseInt(limit)
    };
  }

  res.status(200).json({
    success: true,
    count: requests.length,
    total,
    pagination,
    data: requests
  });
});

// @desc    Get user's own volunteer requests
// @route   GET /api/volunteers/my-requests
// @access  Private
exports.getMyRequests = asyncHandler(async (req, res, next) => {
  const {
    status,
    page = 1,
    limit = 20
  } = req.query;

  const query = { requester: req.user.id };
  
  if (status) query.status = status;

  const startIndex = (parseInt(page) - 1) * parseInt(limit);

  const requests = await VolunteerRequest.find(query)
    .populate('acceptedVolunteer', 'name department profilePicture phone email')
    .populate('responses.volunteer', 'name department profilePicture phone email')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(startIndex);

  const total = await VolunteerRequest.countDocuments(query);

  res.status(200).json({
    success: true,
    count: requests.length,
    total,
    data: requests
  });
});

// @desc    Get volunteer's responses and accepted requests
// @route   GET /api/volunteers/my-volunteer-activities
// @access  Private (Volunteers only)
exports.getMyVolunteerActivities = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user.isVolunteer) {
    return next(new ErrorResponse('You must be a volunteer to access this resource', 403));
  }

  const {
    status,
    page = 1,
    limit = 20
  } = req.query;

  // Find requests where user has responded or been accepted
  let query = {
    $or: [
      { 'responses.volunteer': req.user.id },
      { acceptedVolunteer: req.user.id }
    ]
  };

  if (status) query.status = status;

  const startIndex = (parseInt(page) - 1) * parseInt(limit);

  const requests = await VolunteerRequest.find(query)
    .populate('requester', 'name department profilePicture phone email')
    .populate('acceptedVolunteer', 'name department profilePicture')
    .populate('responses.volunteer', 'name department profilePicture')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(startIndex);

  const total = await VolunteerRequest.countDocuments(query);

  res.status(200).json({
    success: true,
    count: requests.length,
    total,
    data: requests
  });
});

// @desc    Create volunteer request
// @route   POST /api/volunteers/requests
// @access  Private
exports.createVolunteerRequest = asyncHandler(async (req, res, next) => {
  // Add requester to request body
  req.body.requester = req.user.id;

  // Get user info for contact details
  const user = await User.findById(req.user.id);
  req.body.contactInfo = {
    phone: req.body.contactInfo?.phone || user.phone,
    email: req.body.contactInfo?.email || user.email,
    alternateContact: req.body.contactInfo?.alternateContact
  };

  const request = await VolunteerRequest.create(req.body);
  
  await request.populate('requester', 'name department profilePicture');

  res.status(201).json({
    success: true,
    message: 'Volunteer request created successfully',
    data: request
  });
});

// @desc    Get single volunteer request
// @route   GET /api/volunteers/requests/:id
// @access  Private
exports.getVolunteerRequest = asyncHandler(async (req, res, next) => {
  const request = await VolunteerRequest.findById(req.params.id)
    .populate('requester', 'name department profilePicture phone email')
    .populate('acceptedVolunteer', 'name department profilePicture phone email')
    .populate('responses.volunteer', 'name department profilePicture phone email');

  if (!request) {
    return next(new ErrorResponse('Volunteer request not found', 404));
  }

  res.status(200).json({
    success: true,
    data: request
  });
});

// @desc    Update volunteer request (by requester only)
// @route   PUT /api/volunteers/requests/:id
// @access  Private
exports.updateVolunteerRequest = asyncHandler(async (req, res, next) => {
  let request = await VolunteerRequest.findById(req.params.id);

  if (!request) {
    return next(new ErrorResponse('Volunteer request not found', 404));
  }

  // Make sure user is the requester
  if (request.requester.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this request', 403));
  }

  // Don't allow updates if request is in progress or fulfilled
  if (['In Progress', 'Fulfilled'].includes(request.status)) {
    return next(new ErrorResponse('Cannot update request that is in progress or fulfilled', 400));
  }

  request = await VolunteerRequest.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('requester', 'name department profilePicture');

  res.status(200).json({
    success: true,
    message: 'Request updated successfully',
    data: request
  });
});

// @desc    Delete volunteer request (by requester only)
// @route   DELETE /api/volunteers/requests/:id
// @access  Private
exports.deleteVolunteerRequest = asyncHandler(async (req, res, next) => {
  const request = await VolunteerRequest.findById(req.params.id);

  if (!request) {
    return next(new ErrorResponse('Volunteer request not found', 404));
  }

  // Make sure user is the requester
  if (request.requester.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to delete this request', 403));
  }

  // Don't allow deletion if request is in progress
  if (request.status === 'In Progress') {
    return next(new ErrorResponse('Cannot delete request that is in progress', 400));
  }

  await request.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Request deleted successfully'
  });
});

// @desc    Respond to volunteer request (volunteers only)
// @route   POST /api/volunteers/requests/:id/respond
// @access  Private (Volunteers only)
exports.respondToRequest = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user.isVolunteer) {
    return next(new ErrorResponse('You must be a volunteer to respond to requests', 403));
  }

  const request = await VolunteerRequest.findById(req.params.id);

  if (!request) {
    return next(new ErrorResponse('Volunteer request not found', 404));
  }

  // Can't respond to own request
  if (request.requester.toString() === req.user.id) {
    return next(new ErrorResponse('You cannot respond to your own request', 400));
  }

  // Can't respond to inactive requests
  if (request.status !== 'Active') {
    return next(new ErrorResponse('This request is no longer active', 400));
  }

  try {
    await request.addResponse(req.user.id, req.body.message);
    
    await request.populate('responses.volunteer', 'name department profilePicture');
    
    res.status(200).json({
      success: true,
      message: 'Response submitted successfully',
      data: request
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Accept volunteer response (by requester only)
// @route   PUT /api/volunteers/requests/:id/accept/:volunteerId
// @access  Private
exports.acceptVolunteerResponse = asyncHandler(async (req, res, next) => {
  const request = await VolunteerRequest.findById(req.params.id);

  if (!request) {
    return next(new ErrorResponse('Volunteer request not found', 404));
  }

  // Make sure user is the requester
  if (request.requester.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to accept responses for this request', 403));
  }

  // Can only accept if request is active
  if (request.status !== 'Active') {
    return next(new ErrorResponse('Can only accept responses for active requests', 400));
  }

  try {
    await request.acceptVolunteer(req.params.volunteerId);
    
    // Update volunteer stats
    const volunteer = await User.findById(req.params.volunteerId);
    volunteer.volunteerStats.requestsAccepted += 1;
    await volunteer.save();
    
    await request.populate([
      { path: 'requester', select: 'name department profilePicture' },
      { path: 'acceptedVolunteer', select: 'name department profilePicture phone email' },
      { path: 'responses.volunteer', select: 'name department profilePicture' }
    ]);
    
    res.status(200).json({
      success: true,
      message: 'Volunteer response accepted successfully',
      data: request
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Mark request as fulfilled (by requester only)
// @route   PUT /api/volunteers/requests/:id/fulfill
// @access  Private
exports.markRequestFulfilled = asyncHandler(async (req, res, next) => {
  const request = await VolunteerRequest.findById(req.params.id);

  if (!request) {
    return next(new ErrorResponse('Volunteer request not found', 404));
  }

  // Make sure user is the requester
  if (request.requester.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to mark this request as fulfilled', 403));
  }

  // Can only fulfill if request is in progress
  if (request.status !== 'In Progress') {
    return next(new ErrorResponse('Can only fulfill requests that are in progress', 400));
  }

  const { rating, feedback } = req.body;

  await request.markFulfilled(rating, feedback);

  // Update volunteer stats
  if (request.acceptedVolunteer) {
    const volunteer = await User.findById(request.acceptedVolunteer);
    volunteer.volunteerStats.requestsFulfilled += 1;
    if (rating) {
      const currentRating = volunteer.volunteerStats.averageRating || 0;
      const ratingCount = volunteer.volunteerStats.totalRatings || 0;
      
      volunteer.volunteerStats.totalRatings = ratingCount + 1;
      volunteer.volunteerStats.averageRating = 
        ((currentRating * ratingCount) + rating) / (ratingCount + 1);
    }
    await volunteer.save();
  }

  await request.populate([
    { path: 'requester', select: 'name department profilePicture' },
    { path: 'acceptedVolunteer', select: 'name department profilePicture' }
  ]);

  res.status(200).json({
    success: true,
    message: 'Request marked as fulfilled successfully',
    data: request
  });
});

// @desc    Cancel volunteer request (by requester only)
// @route   PUT /api/volunteers/requests/:id/cancel
// @access  Private
exports.cancelVolunteerRequest = asyncHandler(async (req, res, next) => {
  const request = await VolunteerRequest.findById(req.params.id);

  if (!request) {
    return next(new ErrorResponse('Volunteer request not found', 404));
  }

  // Make sure user is the requester
  if (request.requester.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to cancel this request', 403));
  }

  // Can't cancel if already fulfilled
  if (request.status === 'Fulfilled') {
    return next(new ErrorResponse('Cannot cancel a fulfilled request', 400));
  }

  request.status = 'Cancelled';
  await request.save();

  res.status(200).json({
    success: true,
    message: 'Request cancelled successfully',
    data: request
  });
});

// @desc    Get volunteer leaderboard
// @route   GET /api/volunteers/leaderboard
// @access  Public
exports.getVolunteerLeaderboard = asyncHandler(async (req, res, next) => {
  const { limit = 20 } = req.query;

  const volunteers = await User.find({ 
    isVolunteer: true,
    isVerified: true 
  })
  .select('name department profilePicture volunteerStats')
  .sort({ 
    'volunteerStats.requestsFulfilled': -1,
    'volunteerStats.averageRating': -1 
  })
  .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: volunteers.length,
    data: volunteers
  });
});

// @desc    Get volunteer request categories
// @route   GET /api/volunteers/categories
// @access  Private
exports.getRequestCategories = asyncHandler(async (req, res, next) => {
  const categories = [
    'Blood Donation', 'Medical Emergency', 'Academic Help', 
    'Transportation', 'Food/Supplies', 'Technical Support',
    'Event Assistance', 'Other'
  ];

  res.status(200).json({
    success: true,
    data: categories
  });
});

// @desc    Get volunteer system statistics
// @route   GET /api/volunteers/stats
// @access  Private
exports.getVolunteerStats = asyncHandler(async (req, res, next) => {
  const totalRequests = await VolunteerRequest.countDocuments();
  const activeRequests = await VolunteerRequest.countDocuments({ status: 'Active' });
  const fulfilledRequests = await VolunteerRequest.countDocuments({ status: 'Fulfilled' });
  const totalVolunteers = await User.countDocuments({ isVolunteer: true, isVerified: true });

  // Get category breakdown
  const categoryStats = await VolunteerRequest.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Get urgency breakdown
  const urgencyStats = await VolunteerRequest.aggregate([
    { $group: { _id: '$urgency', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Get recent requests
  const recentRequests = await VolunteerRequest.find({ status: 'Active' })
    .populate('requester', 'name department')
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title category urgency location createdAt requester');

  const fulfillmentRate = totalRequests > 0 
    ? Math.round((fulfilledRequests / totalRequests) * 100) 
    : 0;

  res.status(200).json({
    success: true,
    data: {
      totalRequests,
      activeRequests,
      fulfilledRequests,
      totalVolunteers,
      fulfillmentRate,
      categoryStats,
      urgencyStats,
      recentRequests
    }
  });
});
