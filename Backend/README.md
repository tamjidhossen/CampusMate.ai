# CampusMate.ai Backend - Authentication System

## Project Structure

```
Backend/
├── controllers/           # Request handlers
│   └── auth.js           # Authentication controller
├── middleware/           # Express middleware
│   ├── auth.js          # Authentication middleware
│   ├── validation.js    # Validation middleware
│   └── errorHandler.js  # Error handling middleware
├── models/              # Database models
│   ├── User.js         # User model
│   └── VolunteerRequest.js # Volunteer request model
├── routes/              # API routes
│   ├── auth.js         # Authentication routes
│   ├── volunteers.js   # Volunteer routes (placeholder)
│   ├── admin.js        # Admin routes (placeholder)
│   └── users.js        # User routes (placeholder)
├── tests/               # Unit tests
│   ├── controllers/     # Controller tests
│   ├── middleware/      # Middleware tests
│   ├── models/         # Model tests
│   └── setup.js        # Test setup
├── utils/               # Utility functions
│   ├── asyncHandler.js  # Async error handler
│   ├── errorResponse.js # Custom error response
│   ├── sendEmail.js     # Email utility
│   └── initializeAdmin.js # Admin initialization
├── .env.example         # Environment variables template
├── package.json         # Dependencies and scripts
└── server.js           # Main server file
```

## Features Implemented

### 🔐 Authentication System
- **User Registration** - Secure user registration with validation
- **User Login** - JWT-based authentication
- **Admin Verification** - All users must be verified by admin before access
- **Role-based Access Control** - Different permissions for student/teacher/admin
- **Password Security** - BCrypt hashing with strong password requirements
- **JWT Tokens** - Access and refresh token implementation
- **Profile Management** - Update user profiles and volunteer status

### 👤 User Management
- **User Model** - Comprehensive user schema with validation
- **Profile Fields** - Name, email, phone, department, residence, blood group
- **Volunteer System** - Opt-in volunteer registration
- **Account Verification** - Admin approval required for all accounts
- **Role Management** - Student, teacher, admin roles

### 🆘 Volunteer System Foundation
- **Volunteer Request Model** - Complete schema for help requests
- **Request Categories** - Blood donation, medical emergency, academic help, etc.
- **Response System** - Volunteer response and acceptance workflow
- **Status Tracking** - Active, in progress, fulfilled, cancelled states
- **Rating System** - Feedback and rating for completed requests

### 🔒 Security Features
- **Input Validation** - Comprehensive validation using express-validator
- **Rate Limiting** - Request rate limiting to prevent abuse
- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing configuration
- **Error Handling** - Centralized error handling middleware
- **Password Policies** - Strong password requirements

### 🧪 Testing Suite
- **Unit Tests** - Comprehensive test coverage
- **Model Tests** - Database model testing
- **Controller Tests** - API endpoint testing
- **Middleware Tests** - Authentication middleware testing
- **In-Memory Database** - MongoDB memory server for testing

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/register` | User registration | Public |
| POST | `/login` | User login | Public |
| POST | `/logout` | User logout | Public |
| GET | `/me` | Get current user | Private |
| PUT | `/update-profile` | Update user profile | Private |
| PUT | `/change-password` | Change password | Private |
| POST | `/forgot-password` | Request password reset | Public |
| PUT | `/reset-password/:token` | Reset password | Public |
| POST | `/refresh-token` | Refresh access token | Public |

### Admin Routes (`/api/admin`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/users/unverified` | Get unverified users | Admin |
| PUT | `/users/:id/verify` | Verify user account | Admin |
| GET | `/dashboard` | Admin dashboard | Admin |

### Volunteer Routes (`/api/volunteers`) - Placeholder

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/requests` | Get volunteer requests | Private |
| POST | `/requests` | Create new request | Private |
| GET | `/leaderboard` | Get volunteer leaderboard | Public |

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

### User Model
```javascript
{
  name: String,           // User's full name
  email: String,          // Unique email address
  password: String,       // Hashed password
  phone: String,          // Contact phone number
  department: String,     // Academic department
  residence: String,      // Residential address
  bloodGroup: String,     // Blood type
  role: String,          // student, teacher, admin
  isVolunteer: Boolean,  // Volunteer opt-in status
  isVerified: Boolean,   // Admin verification status
  volunteerStats: {      // Volunteer statistics
    totalRequests: Number,
    fulfilledRequests: Number,
    rating: Number
  }
}
```

### VolunteerRequest Model
```javascript
{
  title: String,         // Request title
  description: String,   // Detailed description
  category: String,      // Request category
  urgency: String,       // Low, Medium, High, Critical
  requester: ObjectId,   // User who made request
  location: String,      // Where help is needed
  status: String,        // Active, In Progress, Fulfilled, etc.
  responses: [{          // Volunteer responses
    volunteer: ObjectId,
    message: String,
    status: String
  }],
  expiresAt: Date       // Auto-expiration
}
```

## Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in CI mode
npm run test:ci
```

### Test Coverage
- **Models**: User and VolunteerRequest model validation
- **Controllers**: Authentication endpoints
- **Middleware**: Authentication and authorization
- **Integration**: Full API endpoint testing

## Security Considerations

### Implemented
- ✅ Password hashing with BCrypt
- ✅ JWT token authentication
- ✅ Input validation and sanitization
- ✅ Rate limiting
- ✅ Admin verification requirement
- ✅ Role-based access control
- ✅ Security headers (Helmet.js)
- ✅ CORS configuration

### To Implement
- [ ] Account lockout after failed attempts
- [ ] Email verification
- [ ] Two-factor authentication
- [ ] API key authentication for external services
- [ ] Audit logging

## Performance Considerations

### Database Optimization
- Indexes on frequently queried fields
- Compound indexes for complex queries
- Virtual fields for calculated values
- Efficient pagination strategies

### API Optimization
- Response compression
- Request timeout handling
- Async/await error handling
- Memory-efficient file uploads

## Next Steps

### Immediate Tasks
1. Implement full volunteer request system
2. Add admin verification endpoints
3. Create email notification system
4. Add real-time notifications (Socket.io)

### Future Enhancements
1. RAG system integration
2. Notice management system
3. File upload capabilities
4. Advanced search and filtering
5. Analytics and reporting

## Contributing

1. Follow the established project structure
2. Write tests for new features
3. Use consistent error handling
4. Follow security best practices
5. Document API changes

---

*Built with ❤️ for the campus community*
