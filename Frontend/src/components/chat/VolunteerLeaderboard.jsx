import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy,
  Medal,
  Award,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  X,
  Crown,
} from "lucide-react";

const VolunteerLeaderboard = () => {
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Dummy leaderboard data
  const volunteers = [
    {
      id: 1,
      name: "Sarah Chen",
      department: "Medical Department",
      profilePic:
        "https://images.unsplash.com/photo-1494790108755-2616b612b212?w=64&h=64&fit=crop&crop=face",
      score: 2850,
      responsesCount: 47,
      completedRequests: 42,
      joinDate: new Date("2024-09-15"),
      specialties: [
        "Emergency Response",
        "Medical Assistance",
        "Blood Donation",
      ],
      contact: {
        phone: "+1 (555) 123-4567",
        email: "sarah.chen@university.edu",
      },
      achievements: [
        "Top Volunteer 2024",
        "Emergency Response Expert",
        "Community Hero",
      ],
      lastActive: new Date("2025-01-05T14:30:00"),
    },
    {
      id: 2,
      name: "Michael Rodriguez",
      department: "Computer Science",
      profilePic:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
      score: 2650,
      responsesCount: 38,
      completedRequests: 35,
      joinDate: new Date("2024-08-20"),
      specialties: ["Technical Support", "Academic Help", "Tutoring"],
      contact: {
        phone: "+1 (555) 234-5678",
        email: "michael.rodriguez@student.university.edu",
      },
      achievements: ["Tech Helper", "Academic Mentor", "Rapid Responder"],
      lastActive: new Date("2025-01-05T12:15:00"),
    },
    {
      id: 3,
      name: "Emily Johnson",
      department: "Psychology",
      profilePic:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
      score: 2400,
      responsesCount: 34,
      completedRequests: 31,
      joinDate: new Date("2024-10-05"),
      specialties: ["Mental Health Support", "Counseling", "Peer Support"],
      contact: {
        phone: "+1 (555) 345-6789",
        email: "emily.johnson@student.university.edu",
      },
      achievements: [
        "Compassionate Helper",
        "Mental Health Advocate",
        "Peer Counselor",
      ],
      lastActive: new Date("2025-01-05T16:45:00"),
    },
    {
      id: 4,
      name: "David Kim",
      department: "Engineering",
      profilePic:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face",
      score: 2200,
      responsesCount: 29,
      completedRequests: 26,
      joinDate: new Date("2024-09-30"),
      specialties: ["Technical Repairs", "Equipment Help", "Lab Assistance"],
      contact: {
        phone: "+1 (555) 456-7890",
        email: "david.kim@student.university.edu",
      },
      achievements: ["Fix-It Expert", "Lab Hero", "Technical Wizard"],
      lastActive: new Date("2025-01-05T11:20:00"),
    },
    {
      id: 5,
      name: "Amanda Davis",
      department: "Business Administration",
      profilePic:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face",
      score: 1950,
      responsesCount: 25,
      completedRequests: 22,
      joinDate: new Date("2024-11-10"),
      specialties: [
        "Event Organization",
        "Administrative Help",
        "Student Services",
      ],
      contact: {
        phone: "+1 (555) 567-8901",
        email: "amanda.davis@student.university.edu",
      },
      achievements: ["Event Coordinator", "Admin Helper", "Service Leader"],
      lastActive: new Date("2025-01-05T09:30:00"),
    },
    {
      id: 6,
      name: "James Wilson",
      department: "Library Sciences",
      profilePic:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
      score: 1800,
      responsesCount: 22,
      completedRequests: 20,
      joinDate: new Date("2024-08-15"),
      specialties: ["Research Help", "Library Services", "Academic Resources"],
      contact: {
        phone: "+1 (555) 678-9012",
        email: "james.wilson@university.edu",
      },
      achievements: ["Research Assistant", "Library Guide", "Academic Helper"],
      lastActive: new Date("2025-01-04T18:45:00"),
    },
  ];

  const handleVolunteerClick = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowProfileModal(true);
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <Trophy className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900";
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-amber-900";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const formatJoinDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const getScoreGrade = (score) => {
    if (score >= 2500) return { grade: "S", color: "text-yellow-400" };
    if (score >= 2000) return { grade: "A", color: "text-green-400" };
    if (score >= 1500) return { grade: "B", color: "text-blue-400" };
    if (score >= 1000) return { grade: "C", color: "text-purple-400" };
    return { grade: "D", color: "text-gray-400" };
  };

  return (
    <div className="h-full flex flex-col bg-gray-950 max-w-5xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Volunteer Leaderboard
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Recognizing our most helpful community members
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-orange-500" />
            <span className="text-orange-500 font-medium">Hall of Fame</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-white">
              {volunteers.length}
            </div>
            <div className="text-xs text-gray-400">Active Volunteers</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-orange-400">
              {volunteers.reduce((sum, v) => sum + v.responsesCount, 0)}
            </div>
            <div className="text-xs text-gray-400">Total Responses</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-400">
              {volunteers.reduce((sum, v) => sum + v.completedRequests, 0)}
            </div>
            <div className="text-xs text-gray-400">Requests Completed</div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div 
        className="flex-1 overflow-y-auto p-6"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#374151 transparent",
        }}
      >
        <div className="space-y-3">
          {volunteers.map((volunteer, index) => {
            const rank = index + 1;
            const scoreGrade = getScoreGrade(volunteer.score);

            return (
              <motion.div
                key={volunteer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleVolunteerClick(volunteer)}
                className={`bg-gray-800/80 border rounded-xl p-4 transition-all duration-200 hover:border-gray-600 hover:bg-gray-800 cursor-pointer ${
                  rank <= 3
                    ? "border-orange-500/30 bg-orange-500/5"
                    : "border-gray-700"
                }`}
              >
                <div className="flex items-center space-x-4">
                  {/* Rank & Badge */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankBadgeColor(
                        rank
                      )}`}
                    >
                      {rank <= 3 ? getRankIcon(rank) : rank}
                    </div>
                    <div
                      className={`text-xs mt-1 font-medium ${scoreGrade.color}`}
                    >
                      {scoreGrade.grade}
                    </div>
                  </div>

                  {/* Profile Picture */}
                  <div className="relative">
                    <img
                      src={volunteer.profilePic}
                      alt={volunteer.name}
                      className="w-12 h-12 rounded-full border-2 border-gray-600"
                    />
                    {rank === 1 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Crown className="w-2.5 h-2.5 text-yellow-900" />
                      </div>
                    )}
                  </div>

                  {/* Volunteer Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-white truncate">
                        {volunteer.name}
                      </h3>
                      {rank <= 3 && (
                        <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full font-medium">
                          Top {rank}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{volunteer.department}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Since {formatJoinDate(volunteer.joinDate)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <div className="text-lg font-bold text-white mb-1">
                      {volunteer.score.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">points</div>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <span>{volunteer.responsesCount}</span>
                        <span>responses</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span>
                          {Math.round(
                            (volunteer.completedRequests /
                              volunteer.responsesCount) *
                              100
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfileModal && selectedVolunteer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  Volunteer Profile
                </h2>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Content */}
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="text-center">
                  <img
                    src={selectedVolunteer.profilePic}
                    alt={selectedVolunteer.name}
                    className="w-20 h-20 rounded-full border-4 border-orange-500 mx-auto mb-3"
                  />
                  <h3 className="text-xl font-bold text-white mb-1">
                    {selectedVolunteer.name}
                  </h3>
                  <p className="text-gray-400">
                    {selectedVolunteer.department}
                  </p>

                  {/* Score Grade */}
                  <div
                    className={`inline-flex items-center space-x-2 mt-2 px-3 py-1 rounded-full bg-gray-900 border border-gray-600`}
                  >
                    <Trophy className="w-4 h-4 text-orange-500" />
                    <span className="text-white font-medium">
                      {selectedVolunteer.score.toLocaleString()} points
                    </span>
                    <span
                      className={`font-bold ${
                        getScoreGrade(selectedVolunteer.score).color
                      }`}
                    >
                      (Grade {getScoreGrade(selectedVolunteer.score).grade})
                    </span>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-400 mb-1">
                      {selectedVolunteer.responsesCount}
                    </div>
                    <div className="text-xs text-gray-400">Total Responses</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-400 mb-1">
                      {selectedVolunteer.completedRequests}
                    </div>
                    <div className="text-xs text-gray-400">Completed</div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="font-medium text-white mb-3">
                    Contact Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-gray-300">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedVolunteer.contact.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-300">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="break-all">
                        {selectedVolunteer.contact.email}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-300">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{selectedVolunteer.department}</span>
                    </div>
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <h4 className="font-medium text-white mb-3">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedVolunteer.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Achievements */}
                <div>
                  <h4 className="font-medium text-white mb-3">Achievements</h4>
                  <div className="space-y-2">
                    {selectedVolunteer.achievements.map(
                      (achievement, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <Award className="w-4 h-4 text-yellow-400" />
                          <span className="text-gray-300 text-sm">
                            {achievement}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400 mb-1">Member Since</div>
                      <div className="text-white">
                        {formatJoinDate(selectedVolunteer.joinDate)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">Success Rate</div>
                      <div className="text-white">
                        {Math.round(
                          (selectedVolunteer.completedRequests /
                            selectedVolunteer.responsesCount) *
                            100
                        )}
                        %
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VolunteerLeaderboard;
