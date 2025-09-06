/**
 * Authentication service for CampusMate.ai
 */

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5000";

export class AuthError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = "AuthError";
    this.status = status;
    this.response = response;
  }
}

async function makeAuthRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
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
    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('user', JSON.stringify(response.user));
  }

  return response;
}

// Logout user
export async function logout() {
  const url = `${BACKEND_API_URL}/api/auth/logout`;

  try {
    const response = await makeAuthRequest(url, { method: "POST" });
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('user');
    return response;
  } catch (error) {
    // Clear local state even if server call fails
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('user');
    throw error;
  }
}

// Get current user
export async function getCurrentUser() {
  const url = `${BACKEND_API_URL}/api/auth/me`;
  const response = await makeAuthRequest(url, { method: "GET" });

  if (response.success && response.user) {
    sessionStorage.setItem('user', JSON.stringify(response.user));
  }

  return response;
}

// Check if authenticated
export function isAuthenticated() {
  return sessionStorage.getItem('isAuthenticated') === 'true';
}

// Get stored user
export function getStoredUser() {
  if (!isAuthenticated()) return null;
  
  try {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('user');
    return null;
  }
}
