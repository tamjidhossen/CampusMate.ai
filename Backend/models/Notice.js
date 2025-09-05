const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Notice title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Notice content is required'],
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  summary: {
    type: String,
    maxlength: [500, 'Summary cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Notice category is required'],
    enum: {
      values: [
        'Academic', 'Admission', 'Examination', 'Result', 'Events', 
        'Workshop', 'Seminar', 'Conference', 'Cultural', 'Sports',
        'Emergency', 'Holiday', 'Transportation', 'Scholarship',
        'Job', 'Internship', 'Research', 'Administrative', 'General',
        'Health', 'Safety', 'Accommodation', 'Library', 'IT', 'Other'
      ],
      message: 'Please select a valid notice category'
    }
  },
  priority: {
    type: String,
    enum: ['Low', 'Normal', 'High', 'Urgent'],
    default: 'Normal'
  },
  type: {
    type: String,
    enum: ['Announcement', 'Circular', 'Notice', 'Alert', 'Reminder'],
    default: 'Notice'
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Notice author is required']
  },
  // Targeting criteria for personalized delivery
  targeting: {
    // Role-based targeting
    roles: [{
      type: String,
      enum: ['student', 'teacher', 'admin', 'all'],
      default: 'all'
    }],
    
    // Department-based targeting
    departments: [{
      type: String,
      enum: [
        // Faculty of Arts and Humanities
        'Bangla Language and Literature',
        'English Language and Literature',
        'Music',
        'Theatre and Performance Studies',
        'Film and Media Studies',
        'Philosophy',
        'History',
        'Fine Arts',
        
        // Faculty of Science and Engineering
        'Computer Science and Engineering',
        'Electrical and Electronic Engineering',
        'Environmental Science and Engineering',
        'Statistics',
        
        // Faculty of Social Sciences
        'Economics',
        'Public Administration and Governance Studies',
        'Folklore',
        'Anthropology',
        'Population Science',
        'Local Government and Urban Development',
        'Sociology',
        
        // Faculty of Business Studies
        'Accounting and Information Systems',
        'Finance and Banking',
        'Human Resource Management',
        'Management',
        'Marketing',
        
        // Faculty of Law
        'Law and Justice',
        
        // Other
        'Administration',
        'Other',
        'all'
      ]
    }],
    
    // Blood group targeting (for blood donation notices)
    bloodGroups: [{
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'all']
    }],
    
    // Residence-based targeting (for location-specific notices)
    residenceKeywords: [String], // Keywords to match in residence field
    
    // Volunteer targeting
    volunteersOnly: {
      type: Boolean,
      default: false
    },
    
    // Session targeting (for students)
    sessions: [{
      type: String,
    }],
    
    // Gender targeting (if needed for specific notices)
    gender: {
      type: String,
      enum: ['male', 'female', 'all'],
      default: 'all'
    },
    
    // Specific user targeting
    specificUsers: [{
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }],
    
    // Exclude specific users
    excludeUsers: [{
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }]
  },
  
  // Delivery settings
  deliverySettings: {
    publishAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      default: function() {
        // Default expiry: 30 days from creation
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }
    },
    isImmediate: {
      type: Boolean,
      default: true
    },
    sendEmail: {
      type: Boolean,
      default: false
    },
    sendPushNotification: {
      type: Boolean,
      default: false
    }
  },
  
  // Attachments
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Status and analytics
  status: {
    type: String,
    enum: ['Draft', 'Scheduled', 'Published', 'Expired', 'Archived'],
    default: 'Published' // Admin-created notices are published by default
  },
  
  // Read tracking
  readBy: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    },
    readCount: {
      type: Number,
      default: 1
    }
  }],
  
  // Analytics
  analytics: {
    totalRecipientsCount: {
      type: Number,
      default: 0
    },
    readCount: {
      type: Number,
      default: 0
    },
    clickCount: {
      type: Number,
      default: 0
    },
    emailsSent: {
      type: Number,
      default: 0
    },
    pushNotificationsSent: {
      type: Number,
      default: 0
    }
  },
  
  // Tags for better organization
  tags: [String],
  
  // SEO and search
  keywords: [String],
  
  // External links
  externalLinks: [{
    title: String,
    url: String,
    description: String
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
noticeSchema.index({ status: 1 });
noticeSchema.index({ category: 1 });
noticeSchema.index({ priority: 1 });
noticeSchema.index({ 'deliverySettings.publishAt': 1 });
noticeSchema.index({ 'deliverySettings.expiresAt': 1 });
noticeSchema.index({ 'targeting.roles': 1 });
noticeSchema.index({ 'targeting.departments': 1 });
noticeSchema.index({ 'targeting.bloodGroups': 1 });
noticeSchema.index({ 'targeting.volunteersOnly': 1 });
noticeSchema.index({ tags: 1 });
noticeSchema.index({ keywords: 1 });
noticeSchema.index({ createdAt: -1 });

// Compound indexes
noticeSchema.index({ status: 1, 'deliverySettings.publishAt': 1 });
noticeSchema.index({ category: 1, status: 1 });
noticeSchema.index({ priority: 1, status: 1 });

// Text search index
noticeSchema.index({
  title: 'text',
  content: 'text',
  summary: 'text',
  tags: 'text',
  keywords: 'text'
});

// Virtual for read percentage
noticeSchema.virtual('readPercentage').get(function() {
  if (this.analytics.totalRecipientsCount === 0) return 0;
  return Math.round((this.analytics.readCount / this.analytics.totalRecipientsCount) * 100);
});

// Virtual for engagement rate
noticeSchema.virtual('engagementRate').get(function() {
  if (this.analytics.totalRecipientsCount === 0) return 0;
  const totalEngagements = this.analytics.readCount + this.analytics.clickCount;
  return Math.round((totalEngagements / this.analytics.totalRecipientsCount) * 100);
});

// Virtual to check if notice is active
noticeSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'Published' && 
         this.deliverySettings.publishAt <= now && 
         this.deliverySettings.expiresAt > now;
});

// Virtual to check if notice is expired
noticeSchema.virtual('isExpired').get(function() {
  return new Date() > this.deliverySettings.expiresAt;
});

// Method to check if user should receive this notice
noticeSchema.methods.isTargetedToUser = function(user) {
  const targeting = this.targeting;
  
  // Check if user is specifically excluded
  if (targeting.excludeUsers && targeting.excludeUsers.includes(user._id)) {
    return false;
  }
  
  // Check if user is specifically included
  if (targeting.specificUsers && targeting.specificUsers.length > 0) {
    return targeting.specificUsers.includes(user._id);
  }
  
  // Check role targeting
  if (targeting.roles && targeting.roles.length > 0 && !targeting.roles.includes('all')) {
    if (!targeting.roles.includes(user.role)) {
      return false;
    }
  }
  
  // Check department targeting
  if (targeting.departments && targeting.departments.length > 0 && !targeting.departments.includes('all')) {
    if (!targeting.departments.includes(user.department)) {
      return false;
    }
  }
  
  // Check blood group targeting
  if (targeting.bloodGroups && targeting.bloodGroups.length > 0 && !targeting.bloodGroups.includes('all')) {
    if (!targeting.bloodGroups.includes(user.bloodGroup)) {
      return false;
    }
  }
  
  // Check volunteer targeting
  if (targeting.volunteersOnly && !user.isVolunteer) {
    return false;
  }
  
  // Check residence keywords
  if (targeting.residenceKeywords && targeting.residenceKeywords.length > 0) {
    const userResidence = user.residence.toLowerCase();
    const hasMatchingKeyword = targeting.residenceKeywords.some(keyword => 
      userResidence.includes(keyword.toLowerCase())
    );
    if (!hasMatchingKeyword) {
      return false;
    }
  }
  
  return true;
};

// Method to mark as read by user
noticeSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(read => read.user.toString() === userId.toString());
  
  if (existingRead) {
    existingRead.readCount += 1;
    existingRead.readAt = new Date();
  } else {
    this.readBy.push({ user: userId });
    this.analytics.readCount += 1;
  }
  
  return this.save();
};

// Method to increment click count
noticeSchema.methods.incrementClickCount = function() {
  this.analytics.clickCount += 1;
  return this.save();
};

// Static method to find notices for specific user
noticeSchema.statics.findForUser = function(user, options = {}) {
  const {
    category,
    priority,
    limit = 20,
    skip = 0,
    includeRead = true
  } = options;
  
  const query = {
    status: 'Published',
    'deliverySettings.publishAt': { $lte: new Date() },
    'deliverySettings.expiresAt': { $gt: new Date() }
  };
  
  if (category) query.category = category;
  if (priority) query.priority = priority;
  
  return this.find(query)
    .populate('author', 'name department role')
    .sort({ priority: -1, createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .then(notices => {
      return notices.filter(notice => notice.isTargetedToUser(user));
    });
};

// // Middleware to auto-expire notices
// noticeSchema.pre('find', function() {
//   this.updateMany(
//     { 
//       status: 'Published',
//       'deliverySettings.expiresAt': { $lt: new Date() }
//     },
//     { 
//       status: 'Expired'
//     }
//   );
// });

noticeSchema.pre('findOne', function() {
  this.updateOne(
    { 
      status: 'Published',
      'deliverySettings.expiresAt': { $lt: new Date() }
    },
    { 
      status: 'Expired'
    }
  );
});

// Ensure virtual fields are serialized
noticeSchema.set('toJSON', { virtuals: true });
noticeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Notice', noticeSchema);
