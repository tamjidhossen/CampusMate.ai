import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy,
  Medal,
  Award,
  MapPin,
  Calendar,
  Star,
  X,
  Crown,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { getVolunteerLeaderboard } from "../../services/helpRequest";

const VolunteerLeaderboard = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getVolunteerLeaderboard({ limit: 50 });
      
      // Transform backend data to include calculated points and enhanced info
      const transformedVolunteers = response.data.map((volunteer, index) => ({
        ...volunteer,
        rank: index + 1,
        points: calculatePoints(volunteer.volunteerStats),
        profilePicture: volunteer.profilePicture || getDefaultAvatar(volunteer.name),
        achievements: generateAchievements(volunteer.volunteerStats),
        joinDate: new Date(volunteer.createdAt || '2024-01-01'),
        lastActive: new Date(),
      }));

      // Sort by points (highest first)
      transformedVolunteers.sort((a, b) => b.points - a.points);
      
      setVolunteers(transformedVolunteers);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const calculatePoints = (stats) => {
    if (!stats) return 0;
    
    // Base points for completed requests
    const completedRequests = stats.requestsFulfilled || 0;
    const basePoints = completedRequests * 100;
    
    // Bonus points based on average rating
    const ratingBonus = (stats.averageRating || 0) * 50;
    
    // Bonus for consistency (total responses vs completed)
    const totalAccepted = stats.requestsAccepted || 0;
    const consistencyRate = totalAccepted > 0 ? (completedRequests / totalAccepted) : 0;
    const consistencyBonus = consistencyRate * 100;
    
    // Bonus for experience (more total requests handled)
    const experienceBonus = totalAccepted * 25;
    
    // Critical request bonus (estimated - could be enhanced with real data later)
    // For now, we'll assume 20% of fulfilled requests are critical and give bonus
    const estimatedCriticalRequests = Math.ceil(completedRequests * 0.2);
    const criticalBonus = estimatedCriticalRequests * 150; // 150 extra points per critical request
    
    return Math.round(basePoints + ratingBonus + consistencyBonus + experienceBonus + criticalBonus);
  };

  const generateAchievements = (stats) => {
    const achievements = [];
    
    if (!stats) return ["New Volunteer"];
    
    const completed = stats.requestsFulfilled || 0;
    const accepted = stats.requestsAccepted || 0;
    const rating = stats.averageRating || 0;
    
    // Achievement based on completed requests
    if (completed >= 100) achievements.push("Legendary Volunteer");
    else if (completed >= 50) achievements.push("Super Volunteer");
    else if (completed >= 25) achievements.push("Active Helper");
    else if (completed >= 10) achievements.push("Community Helper");
    else if (completed >= 5) achievements.push("Helpful Neighbor");
    
    // Achievement based on rating
    if (rating >= 4.9) achievements.push("Perfect Rating");
    else if (rating >= 4.8) achievements.push("5-Star Hero");
    else if (rating >= 4.5) achievements.push("Excellent Service");
    else if (rating >= 4.0) achievements.push("Trusted Volunteer");
    
    // Achievement based on consistency
    if (accepted > 0) {
      const successRate = (completed / accepted) * 100;
      if (successRate >= 95) achievements.push("Reliable Champion");
      else if (successRate >= 85) achievements.push("Dependable Helper");
    }
    
    // Achievement based on activity level
    if (accepted >= 200) achievements.push("Super Active");
    else if (accepted >= 100) achievements.push("Quick Responder");
    else if (accepted >= 50) achievements.push("Active Responder");
    
    // Special achievements for categories (can be enhanced later with real data)
    if (completed >= 20) {
      if (Math.random() > 0.7) achievements.push("Emergency Hero"); // Simulated critical request helper
    }
    
    return achievements.length ? achievements : ["New Volunteer"];
  };

  const getDefaultAvatar = (name) => {
    // Generate a consistent avatar based on name
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=f97316&color=fff&size=64`;
  };

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
    return new Date(date).toLocaleDateString("en-US", {
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

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-gray-950 max-w-5xl mx-auto">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
            <p className="text-gray-400">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col bg-gray-950 max-w-5xl mx-auto">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchLeaderboard}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Try Again
            </button>
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
              {volunteers.reduce((sum, v) => sum + (v.volunteerStats?.requestsAccepted || 0), 0)}
            </div>
            <div className="text-xs text-gray-400">Total Responses</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-400">
              {volunteers.reduce((sum, v) => sum + (v.volunteerStats?.requestsFulfilled || 0), 0)}
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
            const scoreGrade = getScoreGrade(volunteer.points);

            return (
              <motion.div
                key={volunteer._id}
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
                      src={volunteer.profilePicture}
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
                        <span className="truncate">{volunteer.department || "Unknown Department"}</span>
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
                      {volunteer.points.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">points</div>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <span>{volunteer.volunteerStats?.requestsAccepted || 0}</span>
                        <span>responses</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span>
                          {volunteer.volunteerStats?.averageRating 
                            ? volunteer.volunteerStats.averageRating.toFixed(1) 
                            : "N/A"}
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
                    src={selectedVolunteer.profilePicture}
                    alt={selectedVolunteer.name}
                    className="w-20 h-20 rounded-full border-4 border-orange-500 mx-auto mb-3"
                  />
                  <h3 className="text-xl font-bold text-white mb-1">
                    {selectedVolunteer.name}
                  </h3>
                  <p className="text-gray-400">
                    {selectedVolunteer.department || "Unknown Department"}
                  </p>

                  {/* Score Grade */}
                  <div
                    className={`inline-flex items-center space-x-2 mt-2 px-3 py-1 rounded-full bg-gray-900 border border-gray-600`}
                  >
                    <Trophy className="w-4 h-4 text-orange-500" />
                    <span className="text-white font-medium">
                      {selectedVolunteer.points.toLocaleString()} points
                    </span>
                    <span
                      className={`font-bold ${
                        getScoreGrade(selectedVolunteer.points).color
                      }`}
                    >
                      (Grade {getScoreGrade(selectedVolunteer.points).grade})
                    </span>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-400 mb-1">
                      {selectedVolunteer.volunteerStats?.requestsAccepted || 0}
                    </div>
                    <div className="text-xs text-gray-400">Total Responses</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-400 mb-1">
                      {selectedVolunteer.volunteerStats?.requestsFulfilled || 0}
                    </div>
                    <div className="text-xs text-gray-400">Completed</div>
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
                      <div className="text-gray-400 mb-1">Average Rating</div>
                      <div className="text-white flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span>
                          {selectedVolunteer.volunteerStats?.averageRating 
                            ? selectedVolunteer.volunteerStats.averageRating.toFixed(1) 
                            : "N/A"}
                        </span>
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
