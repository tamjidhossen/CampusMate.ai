/**
 * Notice service for CampusMate.ai admin functionality
 */

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5000";

// Get stored token
function getStoredToken() {
  return sessionStorage.getItem("token");
}

async function makeNoticeRequest(url, options = {}) {
  const token = getStoredToken();
  
  const defaultHeaders = token ? { Authorization: `Bearer ${token}` } : {};
  
  // Don't set Content-Type for FormData, let browser set it with boundary
  const headers = options.body instanceof FormData 
    ? defaultHeaders 
    : { "Content-Type": "application/json", ...defaultHeaders, ...options.headers };

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid response from server");
  }

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }

  return data;
}

/**
 * Create a new notice
 * @param {Object} noticeData - Notice data including files
 * @returns {Promise<Object>} Created notice
 */
export async function createNotice(noticeData) {
  const formData = new FormData();
  
  // Append text fields
  Object.keys(noticeData).forEach(key => {
    if (key === 'attachments') {
      // Handle file attachments separately
      if (noticeData.attachments && noticeData.attachments.length > 0) {
        noticeData.attachments.forEach(file => {
          formData.append('attachments', file);
        });
      }
    } else if (typeof noticeData[key] === 'object') {
      // Handle nested objects (like targeting, deliverySettings)
      formData.append(key, JSON.stringify(noticeData[key]));
    } else {
      formData.append(key, noticeData[key]);
    }
  });

  const response = await makeNoticeRequest(`${BACKEND_API_URL}/api/notices`, {
    method: "POST",
    body: formData,
  });

  return response;
}

/**
 * Get all notices (admin view)
 * @returns {Promise<Object>} Notices list
 */
export async function getNotices() {
  const response = await makeNoticeRequest(`${BACKEND_API_URL}/api/notices`);
  return response;
}

/**
 * Get notice categories
 * @returns {Promise<Array>} Available notice categories
 */
export async function getNoticeCategories() {
  const response = await makeNoticeRequest(`${BACKEND_API_URL}/api/notices/categories`);
  return response;
}

/**
 * Get notice statistics
 * @returns {Promise<Object>} Notice statistics
 */
export async function getNoticeStats() {
  const response = await makeNoticeRequest(`${BACKEND_API_URL}/api/notices/stats`);
  return response;
}

/**
 * Delete a notice
 * @param {string} noticeId - Notice ID to delete
 * @returns {Promise<Object>} Deletion response
 */
export async function deleteNotice(noticeId) {
  const response = await makeNoticeRequest(`${BACKEND_API_URL}/api/notices/${noticeId}`, {
    method: "DELETE",
  });
  return response;
}

/**
 * Update a notice
 * @param {string} noticeId - Notice ID to update
 * @param {Object} noticeData - Updated notice data
 * @returns {Promise<Object>} Updated notice
 */
export async function updateNotice(noticeId, noticeData) {
  const formData = new FormData();
  
  Object.keys(noticeData).forEach(key => {
    if (key === 'attachments' && noticeData.attachments) {
      noticeData.attachments.forEach(file => {
        formData.append('attachments', file);
      });
    } else if (typeof noticeData[key] === 'object') {
      formData.append(key, JSON.stringify(noticeData[key]));
    } else {
      formData.append(key, noticeData[key]);
    }
  });

  const response = await makeNoticeRequest(`${BACKEND_API_URL}/api/notices/${noticeId}`, {
    method: "PUT",
    body: formData,
  });

  return response;
}
