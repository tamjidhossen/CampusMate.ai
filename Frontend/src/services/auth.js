/**
 * Authentication service for CampusMate.ai
 */

const BACKEND_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5000";

export class AuthError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = "AuthError";
    this.status = status;
    this.response = response;
  }
}

// Get stored token
function getStoredToken() {
  return sessionStorage.getItem("token");
}

async function makeAuthRequest(url, options = {}) {
  try {
    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    // Get token from storage for protected requests
    const token = getStoredToken();
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData, but keep Authorization if it exists
    const headers =
      options.body instanceof FormData
        ? token
          ? { Authorization: `Bearer ${token}` }
          : {}
        : { ...defaultHeaders, ...options.headers };

    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers,
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new AuthError(`Server error: ${response.status}`, response.status);
    }

    if (!response.ok) {
      throw new AuthError(
        data.message || data.error || `HTTP error! status: ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError("Unable to connect to the server.", 0, error);
  }
}

// Register user
export async function register(userData) {
  const { email, password } = userData;
  const url = `${BACKEND_API_URL}/api/auth/register`;

  const response = await makeAuthRequest(url, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  return response;
}

// Login user
export async function login(credentials) {
  const { email, password } = credentials;
  const url = `${BACKEND_API_URL}/api/auth/login`;

  const response = await makeAuthRequest(url, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  // Store auth state
  if (response.success && response.user) {
    sessionStorage.setItem("isAuthenticated", "true");
    sessionStorage.setItem("user", JSON.stringify(response.user));

    // Store token for API requests
    if (response.token) {
      sessionStorage.setItem("token", response.token);
    }
  }

  return response;
}

// Logout user
export async function logout() {
  const url = `${BACKEND_API_URL}/api/auth/logout`;

  try {
    const response = await makeAuthRequest(url, { method: "POST" });
    sessionStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    return response;
  } catch (error) {
    // Clear local state even if server call fails
    sessionStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    throw error;
  }
}

// Get current user
export async function getCurrentUser() {
  const url = `${BACKEND_API_URL}/api/auth/me`;
  const response = await makeAuthRequest(url, { method: "GET" });

  if (response.success && response.user) {
    sessionStorage.setItem("user", JSON.stringify(response.user));

    // Store token if provided
    if (response.token) {
      sessionStorage.setItem("token", response.token);
    }
  }

  return response;
}

// Check if authenticated
export function isAuthenticated() {
  return sessionStorage.getItem("isAuthenticated") === "true";
}

// Get stored user
export function getStoredUser() {
  if (!isAuthenticated()) return null;

  try {
    const userStr = sessionStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    sessionStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    return null;
  }
}

// Update user profile
export async function updateProfile(profileData) {
  const url = `${BACKEND_API_URL}/api/users/profile/me`;

  // Create FormData for file upload support
  const formData = new FormData();

  // Add all profile fields to FormData
  Object.keys(profileData).forEach((key) => {
    if (profileData[key] !== null && profileData[key] !== undefined) {
      if (key === "profilePicture" && profileData[key] instanceof File) {
        formData.append("profilePicture", profileData[key]);
      } else if (key !== "profilePicture") {
        formData.append(key, profileData[key]);
      }
    }
  });

  const response = await makeAuthRequest(url, {
    method: "PUT",
    headers: {
      // Don't set Content-Type for FormData, let browser set it with boundary
    },
    body: formData,
  });

  // Update stored user data if successful
  if (response.success && response.user) {
    sessionStorage.setItem("user", JSON.stringify(response.user));
  }

  return response;
}
