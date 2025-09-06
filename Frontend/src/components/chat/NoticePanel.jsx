import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Calendar,
  Clock,
  AlertCircle,
  Info,
  CheckCircle,
  FileText,
  Image,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "../ui/button";
import { getPersonalizedNotices } from "../../services/notices";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5000";

const NoticePanel = ({ isOpen, onClose }) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notices when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchNotices();
    }
  }, [isOpen]);

  const fetchNotices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPersonalizedNotices();
      setNotices(response.notices || []);
    } catch (err) {
      console.error("Failed to fetch notices:", err);
      setError("Failed to load notices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case "academic":
        return <Calendar className="w-4 h-4" />;
      case "maintenance":
        return <AlertCircle className="w-4 h-4" />;
      case "safety":
        return <AlertCircle className="w-4 h-4" />;
      case "health":
        return <Info className="w-4 h-4" />;
      case "general":
        return <Info className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      case "medium":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "normal":
      case "low":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  const formatNoticeTime = (timestamp) => {
    const now = new Date();
    const noticeDate = new Date(timestamp);
    const diffInHours = Math.floor((now - noticeDate) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) {
        return "1d ago";
      } else if (diffInDays < 7) {
        return `${diffInDays}d ago`;
      } else {
        return noticeDate.toLocaleDateString();
      }
    }
  };

  const getAttachmentIcon = (fileName) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(extension)) {
      return <FileText className="w-4 h-4" />;
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return <Image className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const handleViewAttachment = (attachmentPath) => {
    const fullUrl = `${BACKEND_API_URL}${attachmentPath}`;
    window.open(fullUrl, '_blank');
  };

  // Sort notices by timestamp (newest first)
  const sortedNotices = [...notices].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          
          {/* Notice Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-80 sm:w-96 bg-gray-900/80 backdrop-blur-xl border-l border-gray-700/50 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700/50 bg-gray-900/50">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-orange-600 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-white">
                  University Notices
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notices List - Fixed Height with Scroll */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#374151 transparent",
              }}
            >
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Loading notices...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <p className="text-red-400 text-sm mb-2">{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchNotices}
                    className="text-xs"
                  >
                    Try Again
                  </Button>
                </div>
              ) : sortedNotices.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-400 text-sm">No new notices</p>
                </div>
              ) : (
                sortedNotices.map((notice) => (
                  <motion.div
                    key={notice._id || notice.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`relative bg-gray-800/80 backdrop-blur-sm border rounded-xl p-4 transition-all duration-200 hover:border-gray-600 hover:bg-gray-800/90 ${
                      notice.isRead ? "border-gray-700/50" : "border-orange-500/30 bg-orange-500/5"
                    }`}
                  >
                    {/* Unread indicator */}
                    {!notice.isRead && (
                      <div className="absolute top-3 right-3 w-2 h-2 bg-orange-500 rounded-full"></div>
                    )}

                    {/* Notice Header */}
                    <div className="flex items-start space-x-3 mb-2">
                      <div
                        className={`flex-shrink-0 p-1.5 rounded-lg border ${getPriorityColor(
                          notice.priority
                        )}`}
                      >
                        {getCategoryIcon(notice.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-medium text-sm ${
                            notice.isRead ? "text-gray-300" : "text-white"
                          }`}
                        >
                          {notice.title}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-500">
                            {formatNoticeTime(notice.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Notice Content */}
                    <p
                      className={`text-xs leading-relaxed mb-3 ${
                        notice.isRead ? "text-gray-400" : "text-gray-300"
                      }`}
                    >
                      {notice.content || notice.description}
                    </p>

                    {/* Attachments */}
                    {notice.attachments && notice.attachments.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {notice.attachments.map((attachment, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewAttachment(attachment.path)}
                            className="w-full justify-start text-xs h-8"
                          >
                            {getAttachmentIcon(attachment.filename)}
                            <span className="ml-2 truncate">{attachment.filename}</span>
                            <ExternalLink className="w-3 h-3 ml-auto" />
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Priority Badge */}
                    {notice.priority === "high" && (
                      <div className="inline-flex items-center mt-2 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                        <span className="text-xs font-medium text-red-400">
                          High Priority
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700/50 bg-gray-900/50">
              <Button 
                variant="ghost" 
                className="w-full text-center text-sm text-gray-400 hover:text-white"
                onClick={fetchNotices}
              >
                Refresh Notices
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NoticePanel;
