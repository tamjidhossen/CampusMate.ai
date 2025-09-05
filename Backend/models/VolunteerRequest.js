const mongoose = require('mongoose');

const volunteerRequestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Request title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Request description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: [
        'Blood Donation', 'Medical Emergency', 'Academic Help', 
        'Transportation', 'Food/Supplies', 'Technical Support',
        'Event Assistance', 'Other'
      ],
      message: 'Please select a valid category'
    }
  },
  urgency: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  requester: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  contactInfo: {
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    alternateContact: String
  },
  requirements: {
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    skills: [String],
    other: String
  },
  status: {
    type: String,
    enum: ['Active', 'In Progress', 'Fulfilled', 'Cancelled', 'Expired'],
    default: 'Active'
  },
  responses: [{
    volunteer: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      maxlength: [500, 'Response message cannot exceed 500 characters']
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected'],
      default: 'Pending'
    },
    respondedAt: {
      type: Date,
      default: Date.now
    }
  }],
  acceptedVolunteer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  acceptedAt: Date,
  fulfilledAt: Date,
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    maxlength: [500, 'Feedback cannot exceed 500 characters']
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Default expiration: 7 days from creation
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
volunteerRequestSchema.index({ requester: 1 });
volunteerRequestSchema.index({ status: 1 });
volunteerRequestSchema.index({ category: 1 });
volunteerRequestSchema.index({ urgency: 1 });
volunteerRequestSchema.index({ createdAt: -1 });
volunteerRequestSchema.index({ expiresAt: 1 });
volunteerRequestSchema.index({ 'responses.volunteer': 1 });

// Compound indexes
volunteerRequestSchema.index({ status: 1, createdAt: -1 });
volunteerRequestSchema.index({ category: 1, status: 1 });

// Virtual for response count
volunteerRequestSchema.virtual('responseCount').get(function() {
  return this.responses ? this.responses.length : 0;
});

// Virtual for time remaining
volunteerRequestSchema.virtual('timeRemaining').get(function() {
  if (this.status !== 'Active') return null;
  const now = new Date();
  const remaining = this.expiresAt - now;
  return remaining > 0 ? remaining : 0;
});

// Method to check if request is expired
volunteerRequestSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt && this.status === 'Active';
};

// Method to add a response
volunteerRequestSchema.methods.addResponse = function(volunteerId, message) {
  // Check if volunteer already responded
  const existingResponse = this.responses.find(
    response => response.volunteer.toString() === volunteerId.toString()
  );
  
  if (existingResponse) {
    throw new Error('You have already responded to this request');
  }
  
  this.responses.push({
    volunteer: volunteerId,
    message: message
  });
  
  return this.save();
};

// Method to accept a volunteer response
volunteerRequestSchema.methods.acceptVolunteer = function(volunteerId) {
  const response = this.responses.find(
    r => r.volunteer.toString() === volunteerId.toString()
  );
  
  if (!response) {
    throw new Error('Volunteer response not found');
  }
  
  // Update response status
  response.status = 'Accepted';
  
  // Set accepted volunteer
  this.acceptedVolunteer = volunteerId;
  this.acceptedAt = new Date();
  this.status = 'In Progress';
  
  // Reject other responses
  this.responses.forEach(r => {
    if (r.volunteer.toString() !== volunteerId.toString()) {
      r.status = 'Rejected';
    }
  });
  
  return this.save();
};

// Method to mark as fulfilled
volunteerRequestSchema.methods.markFulfilled = function(rating, feedback) {
  this.status = 'Fulfilled';
  this.fulfilledAt = new Date();
  if (rating) this.rating = rating;
  if (feedback) this.feedback = feedback;
  
  return this.save();
};

// Static method to update expired requests (call manually when needed)
volunteerRequestSchema.statics.updateExpiredRequests = function() {
  return this.updateMany(
    { 
      status: 'Active', 
      expiresAt: { $lt: new Date() } 
    },
    { 
      status: 'Expired' 
    }
  );
};

// Note: Removed problematic pre middleware to prevent query issues

// Ensure virtual fields are serialized
volunteerRequestSchema.set('toJSON', { virtuals: true });
volunteerRequestSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('VolunteerRequest', volunteerRequestSchema);
