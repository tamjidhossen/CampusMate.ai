/**
 * Help Request API service for volunteer system
 */
import { makeAuthenticatedRequest, ApiError } from './api';

/**
 * Get all volunteer requests (volunteers only)
 * @param {object} options - Query options
 * @returns {Promise<object>} Volunteer requests with pagination
 */
export async function getVolunteerRequests(options = {}) {
  const { page = 1, limit = 20 } = options;
  const queryParams = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
  
  return makeAuthenticatedRequest(`/api/volunteers/requests?${queryParams}`);
}

/**
 * Browse volunteer requests (minimal info for all users)
 * @param {object} options - Query options
 * @returns {Promise<object>} Volunteer requests with pagination
 */
export async function browseVolunteerRequests(options = {}) {
  const { page = 1, limit = 20 } = options;
  const queryParams = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
  
  return makeAuthenticatedRequest(`/api/volunteers/browse?${queryParams}`);
}

/**
 * Get user's own volunteer requests
 * @param {object} options - Query options
 * @returns {Promise<object>} User's volunteer requests
 */
export async function getMyRequests(options = {}) {
  const { status, page = 1, limit = 20 } = options;
  const queryParams = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
  if (status) queryParams.append('status', status);
  
  return makeAuthenticatedRequest(`/api/volunteers/my-requests?${queryParams}`);
}

/**
 * Get volunteer's activities
 * @param {object} options - Query options
 * @returns {Promise<object>} Volunteer's activities
 */
export async function getMyVolunteerActivities(options = {}) {
  const { status, page = 1, limit = 20 } = options;
  const queryParams = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
  if (status) queryParams.append('status', status);
  
  return makeAuthenticatedRequest(`/api/volunteers/my-volunteer-activities?${queryParams}`);
}

/**
 * Create a new volunteer request
 * @param {object} requestData - Request data
 * @returns {Promise<object>} Created volunteer request
 */
export async function createVolunteerRequest(requestData) {
  if (!requestData.title?.trim() || !requestData.description?.trim()) {
    throw new ApiError('Title and description are required', 400);
  }

  return makeAuthenticatedRequest('/api/volunteers/requests', {
    method: 'POST',
    body: JSON.stringify(requestData),
  });
}

/**
 * Get a specific volunteer request
 * @param {string} requestId - Request ID
 * @returns {Promise<object>} Volunteer request details
 */
export async function getVolunteerRequest(requestId) {
  if (!requestId) {
    throw new ApiError('Request ID is required', 400);
  }

  return makeAuthenticatedRequest(`/api/volunteers/requests/${requestId}`);
}

/**
 * Update a volunteer request (requester only)
 * @param {string} requestId - Request ID
 * @param {object} updateData - Update data
 * @returns {Promise<object>} Updated volunteer request
 */
export async function updateVolunteerRequest(requestId, updateData) {
  if (!requestId) {
    throw new ApiError('Request ID is required', 400);
  }

  return makeAuthenticatedRequest(`/api/volunteers/requests/${requestId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
}

/**
 * Delete a volunteer request (requester only)
 * @param {string} requestId - Request ID
 * @returns {Promise<object>} Success response
 */
export async function deleteVolunteerRequest(requestId) {
  if (!requestId) {
    throw new ApiError('Request ID is required', 400);
  }

  return makeAuthenticatedRequest(`/api/volunteers/requests/${requestId}`, {
    method: 'DELETE',
  });
}

/**
 * Respond to a volunteer request (volunteers only)
 * @param {string} requestId - Request ID
 * @param {string} message - Response message (optional)
 * @returns {Promise<object>} Updated request with response
 */
export async function respondToRequest(requestId, message = '') {
  if (!requestId) {
    throw new ApiError('Request ID is required', 400);
  }

  return makeAuthenticatedRequest(`/api/volunteers/requests/${requestId}/respond`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

/**
 * Accept a volunteer response (requester only)
 * @param {string} requestId - Request ID
 * @param {string} volunteerId - Volunteer ID
 * @returns {Promise<object>} Updated request
 */
export async function acceptVolunteerResponse(requestId, volunteerId) {
  if (!requestId || !volunteerId) {
    throw new ApiError('Request ID and Volunteer ID are required', 400);
  }

  return makeAuthenticatedRequest(`/api/volunteers/requests/${requestId}/accept/${volunteerId}`, {
    method: 'PUT',
  });
}

/**
 * Mark request as fulfilled (requester only)
 * @param {string} requestId - Request ID
 * @param {object} fulfillmentData - Rating and feedback
 * @returns {Promise<object>} Updated request
 */
export async function markRequestFulfilled(requestId, fulfillmentData = {}) {
  if (!requestId) {
    throw new ApiError('Request ID is required', 400);
  }

  return makeAuthenticatedRequest(`/api/volunteers/requests/${requestId}/fulfill`, {
    method: 'PUT',
    body: JSON.stringify(fulfillmentData),
  });
}

/**
 * Cancel a volunteer request (requester only)
 * @param {string} requestId - Request ID
 * @returns {Promise<object>} Updated request
 */
export async function cancelVolunteerRequest(requestId) {
  if (!requestId) {
    throw new ApiError('Request ID is required', 400);
  }

  return makeAuthenticatedRequest(`/api/volunteers/requests/${requestId}/cancel`, {
    method: 'PUT',
  });
}

/**
 * Get volunteer leaderboard
 * @param {object} options - Query options
 * @returns {Promise<object>} Volunteer leaderboard
 */
export async function getVolunteerLeaderboard(options = {}) {
  const { limit = 20 } = options;
  const queryParams = new URLSearchParams({ limit: limit.toString() });
  
  return makeAuthenticatedRequest(`/api/volunteers/leaderboard?${queryParams}`);
}

/**
 * Get volunteer request categories
 * @returns {Promise<object>} Available categories
 */
export async function getRequestCategories() {
  return makeAuthenticatedRequest('/api/volunteers/categories');
}

/**
 * Get volunteer system statistics
 * @returns {Promise<object>} System statistics
 */
export async function getVolunteerStats() {
  return makeAuthenticatedRequest('/api/volunteers/stats');
}