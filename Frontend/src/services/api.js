/**
 * API service for communicating with the CampusMate.ai backend
 */

// Get configuration from environment variables
const RAG_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const BACKEND_API_URL = 
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5000";
const CHAT_ENDPOINT = import.meta.env.VITE_API_CHAT_ENDPOINT || "/chat";

/**
 * Custom error class for API-related errors
 */
export class ApiError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.response = response;
  }
}

/**
 * Makes an HTTP request with proper error handling
 * @param {string} url - The URL to make the request to
 * @param {object} options - Fetch options
 * @param {boolean} includeAuth - Whether to include authentication credentials
 * @returns {Promise<any>} The response data
 */
async function makeRequest(url, options = {}, includeAuth = false) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const requestOptions = {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    // Include credentials for authentication if requested
    if (includeAuth) {
      requestOptions.credentials = 'include';
    }

    const response = await fetch(url, requestOptions);

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.detail || data.message || `HTTP error! status: ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new ApiError("Request timeout - please try again", 408);
    }

    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    throw new ApiError(
      "Unable to connect to the server. Please check your internet connection.",
      0,
      error
    );
  }
}

/**
 * Sends a chat message to the backend and returns the response
 * @param {string} question - The user's question
 * @returns {Promise<object>} The chat response with message and metadata
 */
export async function sendChatMessage(question) {
  if (
    !question ||
    typeof question !== "string" ||
    question.trim().length === 0
  ) {
    throw new ApiError("Question cannot be empty", 400);
  }

  const url = `${RAG_API_BASE_URL}${CHAT_ENDPOINT}`;

  const response = await makeRequest(url, {
    method: "POST",
    body: JSON.stringify({ question: question.trim() }),
  });

  // Validate response structure
  if (!response.response) {
    throw new ApiError("Invalid response format from server", 500, response);
  }

  return {
    message: response.response,
    responseTime: response.response_time || "0.00",
    status: response.status || "success",
    timestamp: new Date(),
  };
}

/**
 * Checks if the backend API is available
 * @returns {Promise<boolean>} True if the API is available
 */
export async function checkApiHealth() {
  try {
    const url = `${RAG_API_BASE_URL}/`;
    await makeRequest(url, { method: "GET" });
    return true;
  } catch (error) {
    console.warn("API health check failed:", error.message);
    return false;
  }
}

/**
 * Gets the API configuration for debugging
 * @returns {object} The current API configuration
 */
export function getApiConfig() {
  return {
    ragBaseUrl: RAG_API_BASE_URL,
    backendBaseUrl: BACKEND_API_URL,
    chatEndpoint: CHAT_ENDPOINT,
    fullChatUrl: `${RAG_API_BASE_URL}${CHAT_ENDPOINT}`,
  };
}

/**
 * Makes an authenticated request to the backend API
 * @param {string} endpoint - The API endpoint (e.g., '/api/users')
 * @param {object} options - Fetch options
 * @returns {Promise<any>} The response data
 */
export async function makeAuthenticatedRequest(endpoint, options = {}) {
  const url = `${BACKEND_API_URL}${endpoint}`;
  return makeRequest(url, options, true);
}
