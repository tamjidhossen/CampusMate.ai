# CampusMate.ai Backend - Complete System

## Project Structure

```
Backend/
├── controllers/           # Request handlers
│   ├── auth.js           # Authentication controller
│   └── notice.js         # Notice management controller
├── middleware/           # Express middleware
│   ├── auth.js          # JWT authentication & role-based access
│   ├── validation.js    # Input validation middleware
│   └── errorHandler.js  # Error handling middleware
├── models/              # Database models (MongoDB/Mongoose)
│   ├── User.js         # User model with JKKNIU departments
│   ├── Notice.js       # Advanced notice system with targeting
│   └── VolunteerRequest.js # Volunteer request model
├── routes/              # API routes
│   ├── auth.js         # Authentication routes
│   ├── notices.js      # Notice management routes
│   ├── volunteers.js   # Volunteer routes
│   ├── admin.js        # Admin management routes
│   └── users.js        # User management routes
├── tests/               # Comprehensive unit test suite
│   ├── controllers/     # Controller tests (auth.test.js)
│   ├── middleware/      # Middleware tests (auth.test.js)
│   ├── models/         # Model tests (User, Notice, VolunteerRequest)
│   └── setup.js        # Test configuration
├── utils/               # Utility functions
│   ├── asyncHandler.js  # Async error handler
│   ├── errorResponse.js # Custom error response
│   ├── sendEmail.js     # Email notification utility
│   ├── initializeAdmin.js # Admin account initialization
│   └── runInitializeAdmin.js # Admin setup script
├── docs/                # Documentation
│   └── NOTICE_SYSTEM.md # Complete notice system documentation
├── .env.example         # Environment variables template
├── package.json         # Dependencies and scripts
└── server.js           # Main Express server
```

## Features Implemented

### 🔐 Complete Authentication System
- **User Registration** - Secure registration with comprehensive validation
- **User Login** - JWT-based authentication with refresh tokens
- **Admin Verification** - All users require admin approval before access
- **Role-based Access Control** - Student, teacher, admin permissions
- **Password Security** - BCrypt hashing with strong password policies
- **Profile Management** - Complete user profile with JKKNIU integration
- **Session Management** - Access and refresh token workflow

### 📢 Advanced Notice System (Admin-Only)
- **Admin-Only Creation** - Only administrators can create notices
- **Mandatory Targeting** - All notices must have specific targeting criteria
- **No Public Notices** - All notices are personalized and targeted
- **Multi-Criteria Targeting** - Department, year, role, blood group, volunteer status
- **Real-time Delivery** - Immediate and scheduled notice delivery
- **Analytics & Tracking** - Comprehensive notice performance metrics
- **Read Status Management** - Track who has read each notice

### 👤 User Management (JKKNIU Integration)
- **JKKNIU Departments** - 25 real departments from university website
- **Comprehensive Profiles** - Name, email, phone, department, residence, blood group
- **Volunteer System** - Opt-in volunteer registration and status
- **Academic Information** - Year, semester, academic status tracking
- **Account Verification** - Admin approval workflow for all accounts
- **Role Management** - Granular permission system

### 🎯 Advanced Targeting System
- **Department-Based** - Target specific academic departments
- **Year/Semester-Based** - Target by academic year and semester
- **Role-Based** - Target students, teachers, or both
- **Blood Group Targeting** - For medical emergencies and donations
- **Volunteer-Only** - Target only registered volunteers
- **Individual Users** - Direct personal notices
- **Residence-Based** - Location-specific announcements
- **Exclusion Lists** - Exclude specific users from notices

### 🆘 Volunteer System Foundation
- **Complete Request Model** - Blood donation, medical, academic help categories
- **Response System** - Volunteer response and acceptance workflow
- **Status Tracking** - Active, in progress, fulfilled, cancelled states
- **Rating System** - Feedback and performance tracking
- **Leaderboard** - Volunteer recognition and statistics

### 🧪 Comprehensive Testing Suite
- **Complete Coverage** - Models, controllers, middleware, routes
- **Unit Tests** - Individual component testing
- **Integration Tests** - Full API endpoint testing
- **In-Memory Database** - MongoDB memory server for isolated testing
- **Automated Testing** - CI/CD ready test configuration

### 🔒 Enterprise-Grade Security
- **Input Validation** - Comprehensive validation using express-validator
- **Rate Limiting** - Request throttling to prevent abuse
- **Helmet.js** - Security headers and vulnerability protection
- **CORS** - Cross-origin resource sharing configuration
- **JWT Security** - Token-based authentication with refresh mechanism
- **Password Policies** - Enforced strong password requirements
- **Role-Based Authorization** - Granular permission controls

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/register` | User registration | Public |
| POST | `/login` | User login | Public |
| POST | `/logout` | User logout | Public |
| GET | `/me` | Get current user | Private |
| PUT | `/update-profile` | Update user profile | Private |
| DELETE | `/profile-picture` | Delete profile picture | Private |
| PUT | `/change-password` | Change password | Private |
| POST | `/forgot-password` | Request password reset | Public |
| PUT | `/reset-password/:token` | Reset password | Public |
| POST | `/refresh-token` | Refresh access token | Public |

### Notice Routes (`/api/notices`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/my-notices` | Get personalized notices | Private |
| PUT | `/:id/read` | Mark notice as read | Private |
| GET | `/` | Get all notices (admin view) | Admin |
| POST | `/` | Create new notice | Admin |
| GET | `/:id` | Get specific notice | Admin |
| PUT | `/:id` | Update notice | Admin |
| DELETE | `/:id` | Delete notice | Admin |
| GET | `/:id/analytics` | Get notice analytics | Admin |

### Admin Routes (`/api/admin`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/users/unverified` | Get unverified users | Admin |
| PUT | `/users/:id/verify` | Verify user account | Admin |
| GET | `/dashboard` | Admin dashboard | Admin |

### Volunteer Routes (`/api/volunteers`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/requests` | Get volunteer requests | Private |
| POST | `/requests` | Create new request | Private |
| GET | `/leaderboard` | Get volunteer leaderboard | Public |
| PUT | `/requests/:id/respond` | Respond to request | Volunteer |
| PUT | `/requests/:id/fulfill` | Mark request fulfilled | Private |

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/campusmate
MONGODB_TEST_URI=mongodb://localhost:27017/campusmate_test

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_REFRESH_EXPIRE=30d

# Admin Credentials
ADMIN_EMAIL=admin@campusmate.ai
ADMIN_PASSWORD=admin123456

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB
- npm or yarn

### Installation

1. Install dependencies:
```bash
cd Backend
npm install
```

2. Set up environment:
```bash
cp .env.example .env
# Configure your environment variables
```

3. Start development server:
```bash
npm run dev
```

4. Run tests:
```bash
npm test
```

### Default Admin Account

The system automatically creates a default admin account:
- **Email**: `admin@campusmate.ai` (or from env var)
- **Password**: `admin123456` (or from env var)

**⚠️ Important**: Change these credentials in production!

## User Flow

### 1. User Registration
1. User submits registration form
2. System validates input data
3. User account created with `isVerified: false`
4. User receives confirmation message
5. Admin must verify account before user can access services

### 2. Admin Verification
1. Admin logs in to admin panel
2. Views list of unverified users
3. Reviews user details
4. Approves or rejects user accounts
5. Verified users can now access the system

### 3. User Login
1. User submits login credentials
2. System validates credentials
3. Checks if user is verified
4. Issues JWT access and refresh tokens
5. User gains access to protected routes

### 4. Volunteer Registration
1. Verified user updates profile
2. Sets `isVolunteer: true`
3. Can now respond to volunteer requests
4. Appears in volunteer leaderboard

## Database Models

### User Model (JKKNIU Integration)
```javascript
{
  name: String,           // User's full name
  email: String,          // Unique email (university domain preferred)
  password: String,       // BCrypt hashed password
  phone: String,          // Contact phone number
  department: String,     // One of 25 JKKNIU departments
  year: Number,           // Academic year (1-4)
  semester: Number,       // Current semester (1-8)
  residence: String,      // Residential address
  bloodGroup: String,     // Blood type (A+, A-, B+, B-, AB+, AB-, O+, O-)
  role: String,          // student, teacher, admin
  session: String,       // Academic session (required for students only)
  profilePicture: String, // Profile picture URL (optional)
  isVolunteer: Boolean,  // Volunteer opt-in status
  isVerified: Boolean,   // Admin verification status
  volunteerStats: {      // Volunteer performance metrics
    totalRequests: Number,
    fulfilledRequests: Number,
    rating: Number,
    totalPoints: Number
  },
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Session Management
- **Required for Students**: Academic session is mandatory for student registration
- **Valid Sessions**: 2024-25, 2023-24, 2022-23, 2021-22, 2020-21, 2019-20, 2018-19, 2017-18
- **Optional for Teachers**: Teachers don't need session information
- **Validation**: Automatic validation ensures only valid sessions are accepted

### Profile Picture Management
- **Optional Field**: Profile pictures are optional for all users
- **File Upload**: Supports image uploads via multipart/form-data
- **File Validation**: Only image files allowed (JPEG, PNG, GIF, WebP)
- **Size Limit**: Maximum file size of 5MB
- **Storage**: Files stored in `/uploads/profile-pictures/` directory
- **URL Format**: Stored as `/uploads/profile-pictures/filename.ext`
- **Deletion**: Automatic cleanup of old files when updated or deleted

### Notice Model (Advanced Targeting)
```javascript
{
  title: String,         // Notice title
  content: String,       // Rich text content
  category: String,      // Academic, Emergency, Event, etc.
  priority: String,      // Low, Normal, High, Urgent, Critical
  type: String,          // Announcement, Alert, Reminder, News
  author: ObjectId,      // Admin who created the notice
  
  // Mandatory Targeting System
  targeting: {
    departments: [String],     // Target departments
    years: [Number],          // Target academic years
    semesters: [Number],      // Target semesters
    roles: [String],          // Target roles
    bloodGroups: [String],    // Blood group targeting
    volunteersOnly: Boolean,  // Target only volunteers
    residenceKeywords: [String], // Location-based targeting
    specificUsers: [ObjectId], // Individual user targeting
    excludeUsers: [ObjectId]   // Users to exclude
  },
  
  // Delivery & Scheduling
  deliverySettings: {
    isImmediate: Boolean,
    publishAt: Date,
    expiresAt: Date,
    sendEmail: Boolean,
    sendPushNotification: Boolean
  },
  
  // Analytics & Tracking
  analytics: {
    totalRecipientsCount: Number,
    readCount: Number,
    clickCount: Number,
    emailsSent: Number,
    pushNotificationsSent: Number
  },
  
  readBy: [{
    user: ObjectId,
    readAt: Date,
    readCount: Number
  }],
  
  // Metadata
  tags: [String],
  keywords: [String],
  attachments: [{
    name: String,
    size: Number,
    url: String,
    uploadedAt: Date
  }],
  
  status: String,        // Draft, Scheduled, Published, Expired, Archived
  createdAt: Date,
  updatedAt: Date
}
```

### VolunteerRequest Model (Community Support)
```javascript
{
  title: String,         // Request title
  description: String,   // Detailed description of help needed
  category: String,      // Blood Donation, Medical Emergency, Academic Help, etc.
  urgency: String,       // Low, Medium, High, Critical
  requester: ObjectId,   // User who made the request
  location: String,      // Where help is needed
  
  // Response System
  responses: [{
    volunteer: ObjectId,   // Volunteer who responded
    message: String,       // Response message
    status: String,        // Pending, Accepted, Declined
    respondedAt: Date
  }],
  
  acceptedVolunteer: ObjectId, // Chosen volunteer
  status: String,        // Active, In Progress, Fulfilled, Cancelled, Expired
  
  // Feedback System
  rating: {
    score: Number,       // 1-5 rating
    feedback: String,    // Written feedback
    ratedBy: ObjectId,   // User who rated
    ratedAt: Date
  },
  
  // Metadata
  tags: [String],
  isUrgent: Boolean,
  contactInfo: String,   // Emergency contact if needed
  expiresAt: Date,      // Auto-expiration
  
  createdAt: Date,
  updatedAt: Date
}
```

## JKKNIU Integration

### Departments (25 Official Departments)
```javascript
[
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
]
```

### 📂 File Upload Examples

#### Profile Picture Upload
```javascript
// Frontend - HTML Form
<form enctype="multipart/form-data">
  <input type="file" name="profilePicture" accept="image/*" />
  <input type="text" name="name" value="John Doe" />
  <input type="submit" value="Update Profile" />
</form>

// Frontend - JavaScript Fetch
const formData = new FormData();
formData.append('profilePicture', fileInput.files[0]);
formData.append('name', 'John Doe');

fetch('/api/auth/update-profile', {
  method: 'PUT',
  body: formData,
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

#### Profile Picture Deletion
```javascript
// Delete profile picture
fetch('/api/auth/profile-picture', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Notice System Features

### 🎯 Advanced Targeting System
- **Multi-Criteria Targeting** - Combine multiple targeting options
- **Exclusion Lists** - Exclude specific users from notices
- **Smart Filtering** - Automatic recipient calculation
- **Personalized Delivery** - Each user sees only relevant notices
- **Analytics Tracking** - Detailed engagement metrics

### 📊 Notice Analytics
- **Recipient Metrics** - Total targeted users count
- **Engagement Rates** - Read rates, click-through rates
- **Delivery Status** - Email and push notification statistics
- **Performance Tracking** - Notice effectiveness analysis

### 🔔 Delivery Options
- **Immediate Delivery** - Instant notice publication
- **Scheduled Publishing** - Future-dated notice release
- **Email Notifications** - Automatic email alerts
- **Push Notifications** - Real-time mobile alerts
- **Auto-Expiration** - Notices expire automatically

### 📁 Content Management
- **Rich Text Support** - Formatted notice content
- **File Attachments** - Documents, images, PDFs
- **Tagging System** - Categorization and organization
- **Search Keywords** - Enhanced discoverability
- **Status Management** - Draft, published, archived states

## Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run in CI mode
npm run test:ci

# Run specific test files
npm test -- --grep "User Model"
npm test -- --grep "Authentication"
npm test -- --grep "Notice System"
```

### Test Coverage Areas
- **Model Validation** - User, Notice, VolunteerRequest schemas
- **Authentication Flow** - Login, registration, token refresh
- **Authorization** - Role-based access control
- **Notice Targeting** - Targeting logic and recipient calculation
- **API Endpoints** - Complete endpoint testing
- **Error Handling** - Error response validation

## Security Implementation

### Authentication & Authorization
- ✅ JWT access and refresh token system
- ✅ BCrypt password hashing (12 rounds)
- ✅ Role-based access control (RBAC)
- ✅ Admin verification requirement
- ✅ Session management and token expiration
- ✅ Password strength validation
- ✅ Account lockout protection

### API Security
- ✅ Input validation and sanitization
- ✅ Rate limiting and request throttling
- ✅ CORS configuration
- ✅ Security headers (Helmet.js)
- ✅ Request timeout handling
- ✅ Error message sanitization
- ✅ NoSQL injection prevention

### Data Protection
- ✅ Sensitive data encryption
- ✅ Database connection security
- ✅ Environment variable protection
- ✅ Audit logging capabilities
- ✅ Data validation at model level

## Performance Optimization

### Database Performance
- **Indexing Strategy** - Optimized indexes for frequent queries
- **Compound Indexes** - Multi-field query optimization
- **Virtual Fields** - Calculated fields for performance
- **Aggregation Pipelines** - Efficient data processing
- **Connection Pooling** - Database connection optimization

### API Performance
- **Response Compression** - Gzip compression enabled
- **Pagination** - Efficient large dataset handling
- **Caching Strategy** - Redis-ready architecture
- **Async Processing** - Non-blocking operations
- **Query Optimization** - Efficient database queries

## Getting Started

### Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** (v6.0+ recommended)
- **npm** or **yarn** package manager

### Quick Start

1. **Clone and Install:**
```bash
cd Backend
npm install
```

2. **Environment Setup:**
```bash
cp .env.example .env
# Configure your environment variables
```

3. **Database Setup:**
```bash
# Start MongoDB service
sudo systemctl start mongod

# Initialize admin account
npm run init-admin
```

4. **Development Server:**
```bash
npm run dev
```

5. **Run Tests:**
```bash
npm test
```

### Production Deployment

1. **Build for Production:**
```bash
npm run build
```

2. **Start Production Server:**
```bash
npm start
```

3. **Environment Variables:**
```bash
NODE_ENV=production
MONGODB_URI=your_production_database_url
JWT_SECRET=your_super_secure_jwt_secret
```

## Architecture & Integration

### System Architecture
- **MVC Pattern** - Model-View-Controller architecture
- **RESTful API** - Standard REST endpoints
- **Middleware Stack** - Express.js middleware chain
- **Database Layer** - MongoDB with Mongoose ODM
- **Authentication Layer** - JWT-based security
- **Validation Layer** - Input sanitization and validation

### RAG System Integration Points
- **Notice Content** - Rich text notices ready for semantic search
- **User Context** - Department, role, academic info for personalization
- **Search Endpoints** - Notice search and filtering capabilities
- **Analytics Data** - User engagement and interaction metrics
- **Targeting Logic** - User matching algorithms for content relevance

### Microservices Ready
- **Modular Controllers** - Easy service separation
- **Database Abstraction** - Clean data layer
- **API Versioning** - Future-proof endpoint structure
- **Environment Configuration** - Multi-environment support

## Development Guidelines

### Code Standards
- **ES6+ JavaScript** - Modern JavaScript features
- **Async/Await** - Promise-based asynchronous code
- **Error Handling** - Comprehensive error management
- **Code Documentation** - JSDoc comments for functions
- **Consistent Naming** - camelCase for variables, PascalCase for models

### API Design Principles
- **RESTful Conventions** - Standard HTTP methods and status codes
- **Consistent Response Format** - Unified JSON response structure
- **Error Messages** - User-friendly error responses
- **Validation** - Server-side input validation
- **Documentation** - API endpoint documentation

## Next Steps & Roadmap

### Immediate Tasks (Priority 1)
1. **Complete Volunteer System** - Implement full CRUD controllers
2. **RAG Integration** - Add semantic search capabilities
3. **Real-time Notifications** - WebSocket/Socket.io implementation
4. **File Upload System** - Image and document handling

### Feature Enhancements (Priority 2)
1. **Advanced Analytics** - Notice engagement dashboards
2. **Email Templates** - Rich HTML email notifications
3. **Admin Dashboard** - Complete admin management interface
4. **Mobile App API** - Mobile-optimized endpoints

### Future Enhancements (Priority 3)
1. **Push Notifications** - Mobile push notification service
2. **Social Features** - Comments, reactions, sharing
3. **Event Management** - Campus event creation and management
4. **Integration APIs** - Third-party service integrations

## Support & Documentation

### Additional Resources
- **Notice System Documentation** - See `docs/NOTICE_SYSTEM.md`
- **API Testing** - Postman collection available
- **Database Schema** - Complete ERD documentation
- **Deployment Guide** - Production deployment instructions

### Contributing Guidelines
1. Follow the established project structure
2. Write comprehensive tests for new features
3. Use consistent error handling patterns
4. Document all API changes
5. Follow security best practices
6. Update README for major changes

---

**CampusMate.ai Backend v1.0**  
*Complete authentication, notice management, and volunteer system*  
*Built with ❤️ for the JKKNIU campus community*
