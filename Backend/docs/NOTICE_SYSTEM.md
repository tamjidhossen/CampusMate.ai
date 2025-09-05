# CampusMate.ai - Notice Management System

## Overview

The Notice Management System is a comprehensive solution for creating, managing, and delivering **personalized notices** to university users. **Only administrators can create notices**, and **all notices must be targeted** - there are no public notices. The system supports sophisticated targeting mechanisms to ensure the right information reaches the right people at the right time.

## 🎯 Key Features

### **Admin-Only Notice Creation**
- Only users with `admin` role can create, update, or delete notices
- No approval workflow needed - admin notices are published immediately
- Separate from volunteer request system

### **Mandatory Targeting (No Public Notices)**
- **All notices must have specific targeting criteria**
- **No public/general notices allowed**
- Must target by role, department, specific users, or other criteria

### **Personalized Targeting**
- **Role-based Targeting**: Student, Teacher, Admin, or All
- **Department-based Targeting**: Specific departments or all departments
- **Blood Group Targeting**: For blood donation and medical notices
- **Residence-based Targeting**: Location-specific notices using keywords
- **Volunteer Targeting**: Target only registered volunteers
- **Academic Year Targeting**: Target specific year groups
- **Individual Targeting**: Target specific users or exclude certain users

### **Notice Categories**
- Academic, Admission, Examination, Result, Events
- Workshop, Seminar, Conference, Cultural, Sports
- Emergency, Holiday, Transportation, Scholarship
- Job, Internship, Research, Administrative, General
- Health, Safety, Accommodation, Library, IT, Other

### **Priority Levels**
- **Low**: General information notices
- **Normal**: Standard notices (default)
- **High**: Important notices requiring attention
- **Urgent**: Critical notices requiring immediate attention

### **Notice Types**
- **Announcement**: General announcements
- **Circular**: Official circular documents
- **Notice**: Standard notices
- **Alert**: Urgent alerts
- **Reminder**: Reminder notifications

## 📊 Database Schema

### Notice Model Structure

```javascript
{
  // Basic Information
  title: String,           // Notice title (max 200 chars)
  content: String,         // Main content (max 5000 chars)
  summary: String,         // Brief summary (max 500 chars)
  category: String,        // Notice category (enum)
  priority: String,        // Low, Normal, High, Urgent
  type: String,           // Announcement, Circular, Notice, Alert, Reminder
  author: ObjectId,       // Reference to User who created notice
  
  // Targeting System
  targeting: {
    roles: [String],                    // ['student', 'teacher', 'admin', 'all']
    departments: [String],              // Specific departments or 'all'
    bloodGroups: [String],             // Blood groups for medical notices
    residenceKeywords: [String],       // Keywords for location targeting
    volunteersOnly: Boolean,           // Target only volunteers
    academicYears: [String],           // Year/level targeting
    gender: String,                    // Gender targeting if needed
    specificUsers: [ObjectId],         // Individual user targeting
    excludeUsers: [ObjectId]           // Users to exclude
  },
  
  // Delivery Settings
  deliverySettings: {
    publishAt: Date,          // When to publish (default: now)
    expiresAt: Date,          // When notice expires (default: 30 days)
    isImmediate: Boolean,     // Immediate delivery
    sendEmail: Boolean,       // Send email notifications
    sendPushNotification: Boolean  // Send push notifications
  },
  
  // File Attachments
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    uploadedAt: Date
  }],
  
  // Status Management
  status: String,           // Draft, Scheduled, Published, Expired, Archived
  approvalStatus: String,   // Pending, Approved, Rejected
  approvedBy: ObjectId,     // Admin who approved
  approvedAt: Date,
  rejectionReason: String,
  
  // Analytics & Tracking
  readBy: [{
    user: ObjectId,
    readAt: Date,
    readCount: Number
  }],
  
  analytics: {
    totalRecipientsCount: Number,
    readCount: Number,
    clickCount: Number,
    emailsSent: Number,
    pushNotificationsSent: Number
  },
  
  // Organization
  tags: [String],           // Tags for categorization
  keywords: [String],       // Keywords for search
  externalLinks: [{         // External links
    title: String,
    url: String,
    description: String
  }]
}
```

## 🔗 API Endpoints

### User Routes (Authenticated)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/notices/my-notices` | Get personalized notices | User |
| PUT | `/api/notices/:id/read` | Mark notice as read | User |

### Admin Routes (Admin Only)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/notices` | Get all notices (admin view) | Admin |
| POST | `/api/notices` | Create new notice | Admin |
| GET | `/api/notices/:id` | Get specific notice | Admin |
| PUT | `/api/notices/:id` | Update notice | Admin |
| DELETE | `/api/notices/:id` | Delete notice | Admin |
| GET | `/api/notices/:id/analytics` | Get notice analytics | Admin |

## 💡 Usage Examples

### Creating a Targeted Notice

```javascript
// Blood donation notice targeting specific blood groups
const bloodDonationNotice = {
  title: "Urgent Blood Donation Required",
  content: "A student needs O+ blood for emergency surgery. Please contact immediately if you can donate.",
  category: "Emergency",
  priority: "Urgent",
  type: "Alert",
  targeting: {
    bloodGroups: ["O+", "O-"], // Universal donors
    volunteersOnly: true,       // Only volunteers
    roles: ["student", "teacher"] // Students and teachers
  },
  deliverySettings: {
    isImmediate: true,
    sendEmail: true,
    sendPushNotification: true,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
};

// Department-specific academic notice
const academicNotice = {
  title: "CSE Department Workshop on AI",
  content: "Join us for a comprehensive workshop on Artificial Intelligence and Machine Learning...",
  category: "Workshop",
  priority: "High",
  targeting: {
    departments: ["Computer Science and Engineering"],
    roles: ["student"],
    academicYears: ["3rd", "4th"] // Final year students
  },
  deliverySettings: {
    publishAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Publish tomorrow
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expire in a week
  }
};

// Residence-specific notice
const residenceNotice = {
  title: "Campus Wifi Maintenance",
  content: "Wifi services will be temporarily unavailable in campus residence halls...",
  category: "IT",
  priority: "Normal",
  targeting: {
    residenceKeywords: ["campus", "hall", "dormitory"], // Match residence addresses
    roles: ["all"]
  }
};
```

### Querying Personalized Notices

```javascript
// Get notices for a specific user
const userNotices = await Notice.findForUser(user, {
  category: 'Academic',  // Filter by category
  priority: 'High',      // Filter by priority
  limit: 10,             // Limit results
  includeRead: false     // Exclude already read notices
});

// Check if a notice targets a user
const isTargeted = notice.isTargetedToUser(user);

// Mark notice as read
await notice.markAsRead(user._id);
```

## 🎛️ Targeting System Logic

### Targeting Priority (AND logic)

1. **Exclusion Check**: If user is in `excludeUsers`, immediately return false
2. **Specific Inclusion**: If `specificUsers` is defined and not empty, only those users are targeted
3. **Role Matching**: Check if user's role matches `targeting.roles` (unless 'all')
4. **Department Matching**: Check if user's department matches `targeting.departments` (unless 'all')
5. **Blood Group Matching**: Check if user's blood group matches `targeting.bloodGroups` (unless 'all')
6. **Volunteer Check**: If `volunteersOnly` is true, user must be a volunteer
7. **Residence Matching**: Check if any `residenceKeywords` match user's residence
8. **Academic Year**: Check if user's year matches `targeting.academicYears` (unless 'all')

### Example Targeting Scenarios

```javascript
// Scenario 1: Emergency blood donation
targeting: {
  bloodGroups: ["O+", "O-", "A+"],
  volunteersOnly: true,
  roles: ["student", "teacher"]
}
// Result: Only volunteers with O+, O-, or A+ blood who are students or teachers

// Scenario 2: Department workshop
targeting: {
  departments: ["Computer Science and Engineering"],
  academicYears: ["3rd", "4th"],
  roles: ["student"]
}
// Result: Only 3rd and 4th year CSE students

// Scenario 3: Residence maintenance
targeting: {
  residenceKeywords: ["north hall", "south hall"],
  roles: ["all"]
}
// Result: Anyone living in North Hall or South Hall

// Scenario 4: General announcement
targeting: {
  roles: ["all"]
}
// Result: Everyone (except those in excludeUsers if specified)
```

## 📈 Analytics & Tracking

### Available Metrics

- **Total Recipients**: Number of users who should receive the notice
- **Read Count**: Number of users who actually read the notice
- **Click Count**: Number of clicks on notice links
- **Email Notifications**: Number of emails sent
- **Push Notifications**: Number of push notifications sent
- **Read Percentage**: (Read Count / Total Recipients) × 100
- **Engagement Rate**: ((Read Count + Click Count) / Total Recipients) × 100

### Usage Tracking

```javascript
// Get analytics for a notice
const analytics = {
  totalRecipients: notice.analytics.totalRecipientsCount,
  readCount: notice.analytics.readCount,
  readPercentage: notice.readPercentage,
  engagementRate: notice.engagementRate,
  isActive: notice.isActive,
  isExpired: notice.isExpired
};
```

## 🔄 Approval Workflow

### For Teachers
1. Create notice → Status: "Draft", Approval: "Pending"
2. Admin reviews and approves → Status: "Published", Approval: "Approved"
3. Notice becomes visible to targeted users

### For Admins
1. Create notice → Status: "Published", Approval: "Approved" (Auto-approved)
2. Notice immediately visible to targeted users

## 🚀 Integration with RAG System

The Notice model is designed to integrate seamlessly with the RAG (Retrieval-Augmented Generation) chatbot:

### Searchable Fields
- Full-text search on `title`, `content`, `summary`, `tags`, `keywords`
- Category-based filtering
- Date-based filtering
- Priority-based filtering

### RAG Query Examples
- "Show me recent academic notices"
- "Any emergency alerts for CSE students?"
- "What are the upcoming events?"
- "Blood donation requests this week"

### Integration Points
```javascript
// RAG system can query notices like this:
const relevantNotices = await Notice.find({
  $text: { $search: userQuery },
  status: 'Published',
  'deliverySettings.expiresAt': { $gt: new Date() }
}).limit(5);
```

## 🔒 Security & Permissions

### Create/Update Permissions
- **Students**: No notice creation rights
- **Teachers**: Can create notices (require admin approval)
- **Admins**: Can create and approve notices

### View Permissions
- **Public Routes**: Only published, non-expired notices
- **Authenticated Routes**: Personalized notices based on targeting
- **Admin Routes**: All notices with full details

## 🧪 Testing

Comprehensive test suite covers:
- **Model Validation**: Required fields, enum validation
- **Targeting Logic**: All targeting scenarios
- **Virtual Fields**: Calculated properties
- **Methods**: Read tracking, analytics
- **Static Methods**: User-specific queries

Run tests:
```bash
npm test -- tests/models/Notice.test.js
```

---

This Notice system provides a robust foundation for the CampusMate.ai platform's communication needs, ensuring that important information reaches the right users through intelligent targeting and comprehensive tracking.
