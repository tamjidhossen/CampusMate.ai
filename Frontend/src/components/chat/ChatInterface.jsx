import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  Send,
  Bot,
  User,
  Bell,
  MessageSquare,
  HelpCircle,
  Trophy,
  Menu,
  X,
  LogOut,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import TextShimmerWave from "../ui/TextShimmerWave";
import NoticePanel from "./NoticePanel";
import HelpRequestSection from "./HelpRequestSection";
import VolunteerLeaderboard from "./VolunteerLeaderboard";
import ProfileModal from "../ProfileModal";
import { sendChatMessage, ApiError } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

const ChatInterface = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Helper function to get profile picture URL
  const getUserProfilePicture = () => {
    if (!user?.profilePicture) return null;
    return user.profilePicture.startsWith("http")
      ? user.profilePicture
      : user.profilePicture; // Use the path as-is, Vite will proxy it
  };
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "Hello! I'm your CampusMate AI assistant. How can I help you today?",
      timestamp: new Date(Date.now() - 5 * 60000),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [isNoticePanelOpen, setIsNoticePanelOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Dummy loading message for shimmer effect
  const loadingMessage = {
    id: "loading",
    type: "bot",
    content: "I'm thinking about your question...",
    timestamp: new Date(),
    isLoading: true,
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Add loading message
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const response = await sendChatMessage(inputMessage);

      const botResponse = {
        id: Date.now() + 1,
        type: "bot",
        content: response.message,
        timestamp: response.timestamp,
        responseTime: response.responseTime,
      };

      setMessages((prev) =>
        prev.filter((msg) => msg.id !== "loading").concat(botResponse)
      );
    } catch (error) {
      console.error("Chat API error:", error);

      let errorMessage = "I'm sorry, I encountered an error. Please try again.";
      let toastMessage = "Failed to send message";

      if (error instanceof ApiError) {
        if (error.status === 0) {
          console.error(
            "Backend connection failed: Unable to connect to the server. Please check if the backend is running."
          );
          errorMessage =
            "I'm currently unable to respond. Please try again in a moment or contact support if this continues.";
          toastMessage = "Connection issue";
        } else if (error.status === 408) {
          console.error(
            "Request timeout: The request took too long to complete."
          );
          errorMessage =
            "I'm taking longer than usual to respond. Please try again.";
          toastMessage = "Response timeout";
        } else {
          console.error("API error:", error.message, "Status:", error.status);
          errorMessage =
            "I'm experiencing some technical difficulties. Please try again.";
          toastMessage = "Service temporarily unavailable";
        }
      }

      // Show toast notification for the error
      toast.error(toastMessage);

      const errorResponse = {
        id: Date.now() + 1,
        type: "bot",
        content: errorMessage,
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) =>
        prev.filter((msg) => msg.id !== "loading").concat(errorResponse)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error logging out");
    }
  };

  const tabs = [
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "help", label: "Help", icon: HelpCircle },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col relative">
      {/* Header with Navigation */}
      <header className="bg-gray-950/95 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo */}
            <div
              className="flex items-center cursor-pointer group"
              onClick={() => navigate("/")}
            >
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-orange-500/25 transition-all duration-300">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-white tracking-tight hidden sm:block">
                CampusMate
                <span className="font-light text-orange-400">.ai</span>
              </span>
            </div>

            {/* Desktop Navigation Tabs - Centered */}
            <div className="hidden md:flex items-center bg-gray-900/60 backdrop-blur-md rounded-xl p-1 border border-gray-700/50 gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 min-w-[100px] justify-center ${
                      activeTab === tab.id
                        ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30"
                        : "text-gray-300 hover:text-white hover:bg-gray-700/60"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center space-x-2">
              {/* University Notices Button */}
              <button
                onClick={() => setIsNoticePanelOpen(!isNoticePanelOpen)}
                className={`hidden sm:flex items-center space-x-2 px-3 py-2 h-10 rounded-xl transition-all duration-300 ${
                  isNoticePanelOpen
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30"
                    : "text-gray-300 hover:text-white hover:bg-gray-800/60 border border-gray-700/50"
                }`}
              >
                <Bell className="w-4 h-4" />
                <span className="text-sm font-medium">Notices</span>
              </button>

              {/* Mobile Notices Button */}
              <button
                onClick={() => setIsNoticePanelOpen(!isNoticePanelOpen)}
                className={`sm:hidden p-2 h-10 w-10 rounded-xl transition-all duration-300 flex items-center justify-center ${
                  isNoticePanelOpen
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30"
                    : "text-gray-300 hover:text-white hover:bg-gray-800/60 border border-gray-700/50"
                }`}
              >
                <Bell className="w-4 h-4" />
              </button>

              {/* User Profile */}
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center space-x-2 cursor-pointer px-3 py-2 h-10 rounded-xl hover:bg-gray-800/60 transition-all duration-300 border border-gray-700/50 hover:border-gray-600/50"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg overflow-hidden">
                  {getUserProfilePicture() ? (
                    <img
                      src={getUserProfilePicture()}
                      alt="Profile"
                      className="w-full h-full rounded-lg object-cover"
                    />
                  ) : (
                    <User className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="hidden sm:block text-sm text-gray-300 font-medium">
                  Profile
                </span>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 cursor-pointer px-3 py-2 h-10 rounded-xl hover:bg-red-800/60 transition-all duration-300 border border-gray-700/50 hover:border-red-600/50 text-gray-300 hover:text-red-400"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                {/* <span className="hidden sm:block text-sm font-medium">
                  Logout
                </span> */}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 h-10 w-10 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800/60 transition-all duration-300 border border-gray-700/50 flex items-center justify-center"
              >
                {isMobileMenuOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden py-3 border-t border-gray-800/50"
              >
                <div className="flex flex-col space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                          activeTab === tab.id
                            ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30"
                            : "text-gray-300 hover:text-white hover:bg-gray-800/60 border border-gray-700/50"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}

                  {/* Mobile Logout Button */}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 text-gray-300 hover:text-red-400 hover:bg-red-800/60 border border-gray-700/50 hover:border-red-600/50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden pb-24">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Tab Content */}
          <div className="flex-1 overflow-hidden max-w-4xl mx-auto w-full">
            {activeTab === "chat" && (
              <div className="h-full flex flex-col">
                {/* Messages Area */}
                <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-950"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "#374151 transparent",
                    paddingBottom: "2rem",
                  }}
                >
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${
                        message.type === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex max-w-[85%] sm:max-w-[80%] ${
                          message.type === "user"
                            ? "flex-row-reverse"
                            : "flex-row"
                        }`}
                      >
                        {/* Avatar */}
                        <div
                          className={`flex-shrink-0 ${
                            message.type === "user" ? "ml-3" : "mr-3"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden ${
                              message.type === "user"
                                ? "bg-blue-600"
                                : "bg-orange-600"
                            }`}
                          >
                            {message.type === "user" ? (
                              getUserProfilePicture() ? (
                                <img
                                  src={getUserProfilePicture()}
                                  alt="User"
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <User className="w-4 h-4 text-white" />
                              )
                            ) : (
                              <Bot className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>

                        {/* Message Content */}
                        <div
                          className={`rounded-2xl px-4 py-3 max-w-full break-words ${
                            message.type === "user"
                              ? "bg-orange-600 text-white"
                              : message.isError
                              ? "bg-red-900/50 text-red-100 border border-red-700/50"
                              : "bg-gray-800 text-gray-100"
                          }`}
                        >
                          {message.isLoading ? (
                            <TextShimmerWave className="text-gray-300">
                              {message.content}
                            </TextShimmerWave>
                          ) : (
                            <div className="flex items-start space-x-2">
                              {message.isError && (
                                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                              )}
                              <p className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere flex-1">
                                {message.content}
                              </p>
                            </div>
                          )}
                          <div
                            className={`text-xs mt-1 opacity-70 flex items-center justify-between ${
                              message.type === "user"
                                ? "text-orange-100"
                                : message.isError
                                ? "text-red-300"
                                : "text-gray-400"
                            }`}
                          >
                            <span>{formatTime(message.timestamp)}</span>
                            {message.responseTime && !message.isError && (
                              <span className="ml-2">
                                ({message.responseTime}s)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Fixed Floating Input Area */}
                <div className="fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-gray-950 via-gray-950/95 to-transparent p-4 md:p-6 pt-8">
                  <div className="max-w-4xl mx-auto">
                    <form
                      onSubmit={handleSendMessage}
                      className="max-w-3xl mx-auto"
                    >
                      <div className="relative bg-gray-900/90 backdrop-blur-xl border border-gray-700/70 rounded-2xl shadow-2xl hover:shadow-orange-500/5 transition-all duration-300">
                        <input
                          type="text"
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          placeholder="Ask me anything about the university..."
                          disabled={isLoading}
                          className="w-full bg-transparent px-6 py-4 pr-14 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all duration-200 disabled:opacity-50 rounded-2xl"
                        />
                        <button
                          type="submit"
                          disabled={!inputMessage.trim() || isLoading}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "help" && <HelpRequestSection />}
            {activeTab === "leaderboard" && <VolunteerLeaderboard />}
          </div>
        </div>

        {/* Notice Panel */}
        <NoticePanel
          isOpen={isNoticePanelOpen}
          onClose={() => setIsNoticePanelOpen(false)}
        />
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};

export default ChatInterface;
