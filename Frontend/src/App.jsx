import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bot,
  MessageSquare,
  Users,
  Bell,
  ArrowRight,
  Menu,
  X,
  Check,
  Star,
} from "lucide-react";
import AuthModal from "./components/AuthModal";
import DarkVeil from "./components/DarkVeil";
import "./App.css";

const App = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const features = [
    {
      icon: Bot,
      title: "AI Assistant",
      description:
        "Get instant answers to university questions with our intelligent chatbot.",
    },
    {
      icon: Bell,
      title: "Smart Notices",
      description:
        "Receive personalized notifications based on your role and preferences.",
    },
    {
      icon: Users,
      title: "Volunteer Network",
      description:
        "Connect with volunteers for emergency assistance and support.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Dark Veil Animated Background */}
      <div className="absolute inset-0">
        <DarkVeil
          hueShift={30}
          noiseIntensity={0}
          scanlineIntensity={0}
          speed={1.5}
          scanlineFrequency={0}
          warpAmount={0}
        />
      </div>

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gray-900/20"></div>

      {/* Navigation */}
      <nav className="relative z-50 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card-subtle rounded-2xl px-6 py-4">
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">
                  CampusMate
                  <span className="font-light text-orange-400">.ai</span>
                </span>
              </motion.div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <a
                  href="#features"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Features
                </a>
                <a
                  href="#about"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  About
                </a>
                <button
                  onClick={() => openAuthModal("login")}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openAuthModal("register")}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Get Started
                </motion.button>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-white p-2"
                >
                  {isMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="md:hidden mt-4 pt-4 border-t border-gray-700"
                >
                  <div className="flex flex-col space-y-4">
                    <a
                      href="#features"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Features
                    </a>
                    <a
                      href="#about"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      About
                    </a>
                    <button
                      onClick={() => openAuthModal("login")}
                      className="text-left text-gray-300 hover:text-white transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => openAuthModal("register")}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium text-left transition-colors"
                    >
                      Get Started
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
              Your <span className="font-light text-gray-300">Smart</span>
              <span className="text-orange-500 block font-black">
                Campus Companion
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed font-light opacity-90">
              Streamline university communication with{" "}
              <span className="font-medium text-white">
                AI-powered assistance
              </span>
              , personalized notifications, and instant volunteer connections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openAuthModal("register")}
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-xl text-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="glass-card-subtle text-white px-8 py-4 rounded-xl text-lg font-medium border border-gray-700 hover:border-gray-600 transition-colors"
              >
                Learn More
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Everything{" "}
              <span className="font-light text-gray-300">you need</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light opacity-80">
              Powerful features designed to{" "}
              <span className="font-medium text-gray-200">
                enhance your campus experience
              </span>
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass-card-subtle rounded-2xl p-8 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed font-light opacity-90">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass-card-subtle rounded-3xl p-12 border border-gray-800"
          >
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
                Built for{" "}
                <span className="font-light text-gray-300">Students</span>, by{" "}
                <span className="text-orange-500 font-bold">Students</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed font-light opacity-90">
                CampusMate.ai addresses the{" "}
                <span className="font-medium text-white">
                  communication challenges
                </span>{" "}
                in universities by providing a centralized platform for
                information access, emergency coordination, and community
                building.
              </p>
              <div className="flex flex-wrap justify-center gap-6 mb-8">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Check className="w-5 h-5 text-orange-500" />
                  <span className="font-medium">RAG-Powered AI Assistant</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Check className="w-5 h-5 text-orange-500" />
                  <span className="font-medium">Real-time Notifications</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Check className="w-5 h-5 text-orange-500" />
                  <span className="font-medium">Emergency Network</span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openAuthModal("register")}
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-medium transition-colors"
              >
                Join the Community
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="relative z-10 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">
                  CampusMate
                  <span className="font-light text-orange-400">.ai</span>
                </span>
              </div>
              <div className="flex items-center space-x-6 text-gray-400 text-sm">
                <a href="#" className="hover:text-white transition-colors">
                  Privacy
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Terms
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Contact
                </a>
              </div>
            </div>
            <div className="mt-6 text-center text-gray-500 text-sm">
              <p>&copy; 2025 CampusMate.ai. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </div>
  );
};

export default App;
