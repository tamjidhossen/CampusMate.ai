import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  CheckCircle,
  X,
  MessageCircle,
  Trash2,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import * as helpRequestService from "../../services/helpRequest";
import AvatarCircles from "../ui/avatar-circles";

const HelpRequestSection = () => {
  const { user, isAuthenticated } = useAuth();
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
    urgency: "Medium",
    category: "Other",
    location: "",
  });
  const [helpRequests, setHelpRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);

  // Define functions first
  const loadHelpRequests = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      setError(null);
      // Try to get all requests for volunteers, fallback to browse for regular users
      const response = await helpRequestService.browseVolunteerRequests();
      setHelpRequests(response.data || []);
    } catch (err) {
      console.error('Error loading help requests:', err);
      setError('Failed to load help requests');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await helpRequestService.getRequestCategories();
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
      // Use default categories if API fails
      setCategories([
        'Blood Donation', 'Medical Emergency', 'Academic Help', 
        'Transportation', 'Food/Supplies', 'Technical Support',
        'Event Assistance', 'Other'
      ]);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const response = await helpRequestService.getVolunteerStats();
      setStats(response.data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    if (isAuthenticated) {
      loadHelpRequests();
      loadCategories();
      loadStats();
    }
  }, [isAuthenticated, loadHelpRequests, loadCategories, loadStats]);

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!newRequest.title.trim() || !newRequest.description.trim() || !newRequest.location.trim()) {
      setError('Title, description, and location are required');
      return;
    }

    try {
      setError(null);
      const requestData = {
        ...newRequest,
        title: newRequest.title.trim(),
        description: newRequest.description.trim(),
        location: newRequest.location.trim(),
      };

      const response = await helpRequestService.createVolunteerRequest(requestData);
      
      if (response.success) {
        setHelpRequests((prev) => [response.data, ...prev]);
        setNewRequest({
          title: "",
          description: "",
          urgency: "Medium",
          category: "Other",
          location: "",
        });
        setShowNewRequestForm(false);
        await loadStats(); // Refresh stats
      }
    } catch (err) {
      console.error('Error creating request:', err);
      setError(err.message || 'Failed to create request');
    }
  };

  const handleRespondToRequest = (request) => {
    setSelectedRequest(request);
    setShowResponseModal(true);
  };

  const confirmResponse = async () => {
    if (!selectedRequest || !user) return;

    try {
      setError(null);
      const response = await helpRequestService.respondToRequest(selectedRequest._id || selectedRequest.id);
      
      if (response.success) {
        // Update local state with the new response
        setHelpRequests((prev) =>
          prev.map((req) =>
            (req._id || req.id) === (selectedRequest._id || selectedRequest.id) ? response.data : req
          )
        );
        setShowResponseModal(false);
        setSelectedRequest(null);
      }
    } catch (err) {
      console.error('Error responding to request:', err);
      setError(err.message || 'Failed to respond to request');
    }
  };

  const markAsCompleted = async (requestId) => {
    try {
      setError(null);
      const response = await helpRequestService.markRequestFulfilled(requestId);
      
      if (response.success) {
        setHelpRequests((prev) =>
          prev.map((req) =>
            (req._id || req.id) === requestId ? { ...req, status: "Fulfilled" } : req
          )
        );
        await loadStats(); // Refresh stats
      }
    } catch (err) {
      console.error('Error marking request as completed:', err);
      setError(err.message || 'Failed to mark request as completed');
    }
  };

  const deleteRequest = async (requestId) => {
    try {
      setError(null);
      const response = await helpRequestService.deleteVolunteerRequest(requestId);
      
      if (response.success) {
        setHelpRequests((prev) => prev.filter((req) => (req._id || req.id) !== requestId));
        await loadStats(); // Refresh stats
      }
    } catch (err) {
      console.error('Error deleting request:', err);
      setError(err.message || 'Failed to delete request');
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "Critical":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      case "High":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      case "Medium":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "Low":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      // Legacy urgency levels for compatibility
      case "high":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      case "medium":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "low":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Blood Donation":
        return "🩸";
      case "Medical Emergency":
        return "🏥";
      case "Academic Help":
        return "📚";
      case "Transportation":
        return "🚗";
      case "Food/Supplies":
        return "🍽️";
      case "Technical Support":
        return "💻";
      case "Event Assistance":
        return "🎉";
      case "Other":
        return "💬";
      // Legacy categories for compatibility
      case "medical":
        return "🏥";
      case "academic":
        return "📚";
      case "general":
        return "💬";
      default:
        return "💬";
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      // Show actual date for older posts
      return time.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: time.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Sort by timestamp, newest first
  const sortedRequests = [...helpRequests].sort(
    (a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp)
  );

  if (!isAuthenticated) {
    return (
      <div className="h-full flex flex-col bg-gray-950 max-w-5xl mx-auto">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-white mb-2">Authentication Required</h3>
            <p className="text-gray-400 text-sm">Please log in to access help requests.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-950 max-w-5xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Help Requests</h1>
            <p className="text-gray-400 text-sm mt-1">
              Connect with volunteers for assistance and support
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowNewRequestForm(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Post Help Request</span>
          </motion.button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-white">
              {stats?.activeRequests || helpRequests.filter((r) => r.status === "Active").length}
            </div>
            <div className="text-xs text-gray-400">Active Requests</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-orange-400">
              {stats?.totalVolunteers || helpRequests.reduce((sum, r) => sum + (r.responses?.length || 0), 0)}
            </div>
            <div className="text-xs text-gray-400">Total Volunteers</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-400">
              {stats?.fulfilledRequests || helpRequests.filter((r) => r.status === "Fulfilled").length}
            </div>
            <div className="text-xs text-gray-400">Completed</div>
          </div>
        </div>
      </div>

      {/* Help Requests List */}
      <div 
        className="flex-1 overflow-y-auto p-6 space-y-4"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#374151 transparent",
        }}
      >


        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Loading Help Requests</h3>
            <p className="text-gray-400 text-sm">Please wait while we fetch the latest requests...</p>
          </div>
        ) : sortedRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              No Help Requests
            </h3>
            <p className="text-gray-400 text-sm">
              Be the first to post a help request!
            </p>
          </div>
        ) : (
          sortedRequests.map((request) => (
            <motion.div
              key={request._id || request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-gray-800/80 border rounded-xl p-6 transition-all duration-200 hover:border-gray-600 ${
                request.status === "Fulfilled"
                  ? "border-green-500/30 bg-green-500/5"
                  : new Date(request.createdAt || request.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                  ? "border-orange-500/30 bg-orange-500/5"
                  : "border-gray-700"
              }`}
            >
              {/* Request Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">
                    {getCategoryIcon(request.category)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {request.title}
                    </h3>
                    <div className="flex items-center space-x-3 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{request.requester?.name || 'Unknown User'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(new Date(request.createdAt || request.timestamp))}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Urgency Badge */}
                  <div
                    className={`px-2 py-1 rounded-full border text-xs font-medium ${getUrgencyColor(
                      request.urgency
                    )}`}
                  >
                    {request.urgency} priority
                  </div>

                  {/* Status Badge */}
                  {request.status === "Fulfilled" && (
                    <div className="flex items-center space-x-1 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="text-xs font-medium text-green-400">
                        Completed
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Request Description */}
              <p className="text-gray-300 text-sm mb-3 leading-relaxed whitespace-pre-wrap">
                {request.description}
              </p>

              {/* Location */}
              {request.location && (
                <div className="flex items-center space-x-2 mb-4 text-sm text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>{request.location}</span>
                </div>
              )}

              {/* Responses */}
              {request.responses && request.responses.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">
                        {request.responses.length} volunteer(s) responded
                      </span>
                    </div>
                    <AvatarCircles
                      avatarUrls={request.responses.map(r => ({
                        url: r.volunteer?.profilePicture || r.volunteer?.profilePic,
                        name: r.volunteer?.name
                      }))}
                      numPeople={request.responses.length}
                      className="flex-shrink-0"
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span>{request.requester?.department || 'Unknown Dept'}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {request.status === "Active" && (
                    <>
                      {/* Show respond button for all users except the requester */}
                      {!(user && request.requester && (request.requester._id === user._id || request.requester.id === user.id)) && (
                        <>
                          {/* Check if current user has already responded */}
                          {!request.responses?.some(r => r.volunteer?._id === user?._id || r.volunteer?.id === user?.id) ? (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleRespondToRequest(request)}
                              className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>Respond as Volunteer</span>
                            </motion.button>
                          ) : (
                            <div className="flex items-center space-x-1 text-green-400 text-sm">
                              <CheckCircle className="w-3 h-3" />
                              <span>You responded</span>
                            </div>
                          )}
                        </>
                      )}
                      
                      {/* Request owner actions for active requests */}
                      {user && request.requester && (request.requester._id === user._id || request.requester.id === user.id) && (
                        <>
                          <div className="flex items-center space-x-1 text-blue-400 text-sm">
                            <User className="w-3 h-3" />
                            <span>Your request</span>
                          </div>
                          <button
                            onClick={() => markAsCompleted(request._id || request.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                            title="Mark as completed"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Mark Complete</span>
                          </button>
                        </>
                      )}
                    </>
                  )}
                  
                  {/* Show completed status for fulfilled requests */}
                  {request.status === "Fulfilled" && (
                    <>
                      {/* Show thank you message for non-requesters */}
                      {!(user && request.requester && (request.requester._id === user._id || request.requester.id === user.id)) && (
                        <div className="flex items-center space-x-1 text-green-400 text-sm">
                          <CheckCircle className="w-3 h-3" />
                          <span>Request completed</span>
                        </div>
                      )}
                      
                      {/* Show completion status for request owner */}
                      {user && request.requester && (request.requester._id === user._id || request.requester.id === user.id) && (
                        <div className="flex items-center space-x-1 text-green-400 text-sm bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
                          <CheckCircle className="w-3 h-3" />
                          <span>You marked this as completed</span>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Show other status for debugging */}
                  {request.status !== "Active" && request.status !== "Fulfilled" && (
                    <div className="text-gray-500 text-sm">
                      Status: {request.status}
                    </div>
                  )}
                  
                  {/* Delete button - only for request owner */}
                  {user && request.requester && (request.requester._id === user._id || request.requester.id === user.id) && (
                    <button
                      onClick={() => deleteRequest(request._id || request.id)}
                      className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-400/10 transition-all duration-200"
                      title="Delete request"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* New Request Modal */}
      <AnimatePresence>
        {showNewRequestForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewRequestForm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  Post Help Request
                </h2>
                <button
                  onClick={() => setShowNewRequestForm(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newRequest.title}
                    onChange={(e) =>
                      setNewRequest((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Brief description of what you need help with"
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newRequest.description}
                    onChange={(e) =>
                      setNewRequest((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Provide more details about your request"
                    rows={4}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newRequest.location}
                    onChange={(e) =>
                      setNewRequest((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    placeholder="Where do you need help? (e.g., Main Library, CSE Building)"
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={newRequest.category}
                      onChange={(e) =>
                        setNewRequest((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem'
                      }}
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={newRequest.urgency}
                      onChange={(e) =>
                        setNewRequest((prev) => ({
                          ...prev,
                          urgency: e.target.value,
                        }))
                      }
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem'
                      }}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewRequestForm(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-medium transition-colors"
                  >
                    Post Request
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Response Modal */}
      <AnimatePresence>
        {showResponseModal && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResponseModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  Volunteer to Help
                </h2>
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-white mb-2">
                    {selectedRequest.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {selectedRequest.description}
                  </p>
                </div>

                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-3">
                    Contact Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2 text-gray-300">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{selectedRequest.requester?.name || 'Unknown User'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedRequest.requester?.phone || selectedRequest.contactInfo?.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{selectedRequest.requester?.email || selectedRequest.contactInfo?.email || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    onClick={() => setShowResponseModal(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmResponse}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-medium transition-colors"
                  >
                    Volunteer to Help
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HelpRequestSection;
