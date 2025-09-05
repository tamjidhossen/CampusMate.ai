import React, { useState } from "react";
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
} from "lucide-react";

const HelpRequestSection = () => {
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
    urgency: "medium",
    category: "general",
  });

  // Dummy help requests data
  const [helpRequests, setHelpRequests] = useState([
    {
      id: 1,
      title: "Need O+ Blood at Medical Center",
      description:
        "Urgent blood donation needed for emergency surgery. Patient is in critical condition.",
      category: "medical",
      urgency: "high",
      timestamp: new Date("2025-01-05T08:30:00"),
      status: "active",
      requester: {
        name: "Dr. Sarah Johnson",
        department: "Medical Department",
        contact: "+1 (555) 123-4567",
        email: "sarah.johnson@university.edu",
      },
      responses: [
        {
          id: 1,
          volunteer: {
            name: "Alex Chen",
            department: "Computer Science",
            profilePic:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
            contact: "+1 (555) 987-6543",
          },
          timestamp: new Date("2025-01-05T09:15:00"),
        },
      ],
    },
    {
      id: 2,
      title: "Textbook Exchange - Calculus II",
      description:
        "Looking for someone to exchange Calculus II textbook (Stewart, 8th edition) for Linear Algebra textbook.",
      category: "academic",
      urgency: "low",
      timestamp: new Date("2025-01-04T14:20:00"),
      status: "active",
      requester: {
        name: "Michael Zhang",
        department: "Mathematics",
        contact: "+1 (555) 234-5678",
        email: "michael.zhang@student.university.edu",
      },
      responses: [],
    },
    {
      id: 3,
      title: "Lost Keys in Library",
      description:
        "Lost my dorm keys somewhere in the main library. Black keychain with university logo.",
      category: "general",
      urgency: "medium",
      timestamp: new Date("2025-01-03T16:45:00"),
      status: "completed",
      requester: {
        name: "Emma Davis",
        department: "Psychology",
        contact: "+1 (555) 345-6789",
        email: "emma.davis@student.university.edu",
      },
      responses: [
        {
          id: 1,
          volunteer: {
            name: "James Wilson",
            department: "Library Staff",
            profilePic:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
            contact: "+1 (555) 876-5432",
          },
          timestamp: new Date("2025-01-03T17:30:00"),
        },
      ],
    },
    {
      id: 4,
      title: "Study Group for Organic Chemistry",
      description:
        "Looking for 2-3 students to form a study group for CHEM 341. Planning to meet twice a week.",
      category: "academic",
      urgency: "low",
      timestamp: new Date("2025-01-05T12:00:00"),
      status: "active",
      requester: {
        name: "Lisa Rodriguez",
        department: "Chemistry",
        contact: "+1 (555) 456-7890",
        email: "lisa.rodriguez@student.university.edu",
      },
      responses: [
        {
          id: 1,
          volunteer: {
            name: "David Kim",
            department: "Chemistry",
            profilePic:
              "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face",
            contact: "+1 (555) 765-4321",
          },
          timestamp: new Date("2025-01-05T13:30:00"),
        },
        {
          id: 2,
          volunteer: {
            name: "Sophie Taylor",
            department: "Biochemistry",
            profilePic:
              "https://images.unsplash.com/photo-1494790108755-2616b612b212?w=32&h=32&fit=crop&crop=face",
            contact: "+1 (555) 654-3210",
          },
          timestamp: new Date("2025-01-05T14:15:00"),
        },
      ],
    },
  ]);

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    if (!newRequest.title.trim() || !newRequest.description.trim()) return;

    const request = {
      id: Date.now(),
      ...newRequest,
      timestamp: new Date(),
      status: "active",
      requester: {
        name: "Current User", // This would come from authentication
        department: "Computer Science",
        contact: "+1 (555) 000-0000",
        email: "user@student.university.edu",
      },
      responses: [],
    };

    setHelpRequests((prev) => [...prev, request]);
    setNewRequest({
      title: "",
      description: "",
      urgency: "medium",
      category: "general",
    });
    setShowNewRequestForm(false);
  };

  const handleRespondToRequest = (request) => {
    setSelectedRequest(request);
    setShowResponseModal(true);
  };

  const confirmResponse = () => {
    if (!selectedRequest) return;

    const newResponse = {
      id: Date.now(),
      volunteer: {
        name: "Current User", // This would come from authentication
        department: "Computer Science",
        profilePic:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face",
        contact: "+1 (555) 000-0000",
      },
      timestamp: new Date(),
    };

    setHelpRequests((prev) =>
      prev.map((req) =>
        req.id === selectedRequest.id
          ? { ...req, responses: [...req.responses, newResponse] }
          : req
      )
    );

    setShowResponseModal(false);
    setSelectedRequest(null);
  };

  const markAsCompleted = (requestId) => {
    setHelpRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: "completed" } : req
      )
    );
  };

  const deleteRequest = (requestId) => {
    setHelpRequests((prev) => prev.filter((req) => req.id !== requestId));
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
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
    const diffInHours = Math.floor((now - timestamp) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return "Just posted";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  // Sort by timestamp, newest at bottom as specified
  const sortedRequests = [...helpRequests].sort(
    (a, b) => a.timestamp - b.timestamp
  );

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

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-white">
              {helpRequests.filter((r) => r.status === "active").length}
            </div>
            <div className="text-xs text-gray-400">Active Requests</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-orange-400">
              {helpRequests.reduce((sum, r) => sum + r.responses.length, 0)}
            </div>
            <div className="text-xs text-gray-400">Total Responses</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-400">
              {helpRequests.filter((r) => r.status === "completed").length}
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
        {sortedRequests.map((request) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gray-800/80 border rounded-xl p-6 transition-all duration-200 hover:border-gray-600 ${
              request.status === "completed"
                ? "border-green-500/30 bg-green-500/5"
                : request.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
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
                      <span>{request.requester.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(request.timestamp)}</span>
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
                {request.status === "completed" && (
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
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              {request.description}
            </p>

            {/* Responses */}
            {request.responses.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">
                    {request.responses.length} volunteer(s) responded
                  </span>
                </div>
                <div className="flex -space-x-2">
                  {request.responses.map((response) => (
                    <div key={response.id} className="relative group">
                      <img
                        src={response.volunteer.profilePic}
                        alt={response.volunteer.name}
                        className="w-8 h-8 rounded-full border-2 border-gray-800 hover:border-orange-500 transition-colors cursor-pointer"
                      />
                      {/* Tooltip */}
                      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                        <div className="font-medium">
                          {response.volunteer.name}
                        </div>
                        <div className="text-gray-400">
                          {response.volunteer.department}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span>{request.requester.department}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {request.status === "active" && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRespondToRequest(request)}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      Respond to Help Request
                    </motion.button>
                    <button
                      onClick={() => markAsCompleted(request.id)}
                      className="text-green-400 hover:text-green-300 p-1.5 rounded-lg hover:bg-green-400/10 transition-all duration-200"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => deleteRequest(request.id)}
                  className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-400/10 transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {sortedRequests.length === 0 && (
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
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="general">General</option>
                      <option value="academic">Academic</option>
                      <option value="medical">Medical</option>
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
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
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
                  Respond to Help Request
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
                      <span>{selectedRequest.requester.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedRequest.requester.contact}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{selectedRequest.requester.email}</span>
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
                    Confirm Response
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
