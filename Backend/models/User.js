const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  phone: {
    type: String,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  department: {
    type: String,
    enum: {
      values: [
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
        'Other'
      ],
      message: 'Please select a valid department from JKKNIU'
    }
  },
  residence: {
    type: String,
    maxlength: [200, 'Residence cannot exceed 200 characters']
  },
  bloodGroup: {
    type: String,
    enum: {
      values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      message: 'Please select a valid blood group'
    }
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin','staff'],
    default: 'student'
  },
  session: {
    type: String,
  },
  profilePicture: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        // If provided, should be a valid URL or file path
        if (v === null || v === '') return true;
        return /^(https?:\/\/)|(\/uploads\/)/.test(v);
      },
      message: 'Profile picture must be a valid URL or file path'
    }
  },
  isVolunteer: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  volunteerStats: {
    totalRequests: {
      type: Number,
      default: 0
    },
    fulfilledRequests: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ isVerified: 1 });
userSchema.index({ isVolunteer: 1 });
userSchema.index({ department: 1 });
userSchema.index({ role: 1 });
userSchema.index({ session: 1 });

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Get user's full name and department for display
userSchema.virtual('displayName').get(function() {
  return `${this.name} (${this.department})`;
});

// Calculate volunteer success rate
userSchema.virtual('successRate').get(function() {
  if (this.volunteerStats.totalRequests === 0) return 0;
  return Math.round((this.volunteerStats.fulfilledRequests / this.volunteerStats.totalRequests) * 100);
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
