# Notice Management System Documentation

## Overview
The Notice Management System provides comprehensive functionality for creating, managing, and delivering personalized notices with file attachments. Only administrators can create, update, and delete notices, while all authenticated users can view notices targeted to them.

## Features

### ✅ Core Functionality
- **CRUD Operations**: Create, Read, Update, Delete notices
- **File Upload**: Multiple file attachments per notice (up to 5 files, 10MB each)
- **Admin-Only Access**: Only administrators can manage notices
- **Personalized Delivery**: Smart targeting system for relevant notices
- **Analytics**: Comprehensive tracking of notice engagement

### ✅ File Upload Support
- **Supported File Types**:
  - Images: JPEG, PNG, GIF, WebP
  - Documents: PDF, Word (.doc/.docx), Excel (.xls/.xlsx), PowerPoint (.ppt/.pptx)
  - Text: Plain text (.txt), CSV (.csv)
- **File Size Limits**: 10MB per file, maximum 5 files per notice
- **Automatic Storage**: Files stored in `uploads/notice-attachments/`
- **File Management**: Add/remove attachments individually

### ✅ Notice Targeting System
- **Role-based**: Target by user role (student, teacher, admin, all)
- **Department-based**: Target specific academic departments
- **Session-based**: Target students by their session/batch
- **Blood Group**: Target by blood group (for donation notices)
- **Volunteer-only**: Target only volunteers
- **Residence Keywords**: Target by residence location
- **Gender-based**: Target by gender if needed
- **Individual Users**: Target specific users or exclude users

## API Endpoints

### Public Routes (All Authenticated Users)
```
GET /api/notices/categories
- Get list of available notice categories
- Access: All authenticated users
```

```
GET /api/notices/my-notices
- Get personalized notices for current user
- Query Parameters:
  - page: Page number (default: 1)
  - limit: Results per page (default: 20)
  - category: Filter by category
  - priority: Filter by priority
  - includeRead: Include already read notices (default: true)
- Access: All authenticated users
```

```
PUT /api/notices/:id/read
- Mark a notice as read
- Access: All authenticated users
```

### Admin Routes (Admin Access Only)

#### Notice CRUD Operations
```
GET /api/notices
- Get all notices (admin view with full details)
- Query Parameters:
  - page: Page number
  - limit: Results per page
  - category: Filter by category
  - priority: Filter by priority
  - status: Filter by status
- Access: Admin only
```

```
POST /api/notices
- Create new notice with optional file attachments
- Content-Type: multipart/form-data
- Files: attachments (max 5 files, 10MB each)
- Required Fields: title, content, category, targeting
- Access: Admin only
```

```
GET /api/notices/:id
- Get specific notice details
- Access: Admin only
```

```
PUT /api/notices/:id
- Update notice with optional new file attachments
- Content-Type: multipart/form-data
- Files: attachments (new files will be added to existing ones)
- Access: Admin only
```

```
DELETE /api/notices/:id
- Delete notice and all associated files
- Access: Admin only
```

#### File Management
```
DELETE /api/notices/:id/attachments/:attachmentId
- Remove specific attachment from notice
- Access: Admin only
```

#### Analytics & Statistics
```
GET /api/notices/:id/analytics
- Get detailed analytics for specific notice
- Returns: read count, engagement rate, recipient count, etc.
- Access: Admin only
```

```
GET /api/notices/stats
- Get overall notice system statistics
- Returns: total notices, category breakdown, priority stats, recent notices
- Access: Admin only
```

## Request/Response Examples

### Creating Notice with Files
```bash
curl -X POST http://localhost:5000/api/notices \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "title=Important Academic Update" \
  -F "content=This is an important update regarding upcoming examinations." \
  -F "category=Academic" \
  -F "priority=High" \
  -F "targeting[roles][]=student" \
  -F "targeting[departments][]=Computer Science and Engineering" \
  -F "targeting[sessions][]=2023-24" \
  -F "attachments=@exam_schedule.pdf" \
  -F "attachments=@guidelines.docx"
```

### Sample Notice Data Structure
```json
{
  "success": true,
  "data": {
    "_id": "648a5c4e8f5b2d1a3c4e5f60",
    "title": "Important Academic Update",
    "content": "This is an important update regarding upcoming examinations.",
    "summary": "Examination update for CSE students",
    "category": "Academic",
    "priority": "High",
    "type": "Notice",
    "author": {
      "_id": "648a5c4e8f5b2d1a3c4e5f61",
      "name": "Admin User",
      "department": "Administration",
      "role": "admin"
    },
    "targeting": {
      "roles": ["student"],
      "departments": ["Computer Science and Engineering"],
      "sessions": ["2023-24"],
      "bloodGroups": [],
      "volunteersOnly": false,
      "gender": "all",
      "specificUsers": [],
      "excludeUsers": []
    },
    "attachments": [
      {
        "_id": "648a5c4e8f5b2d1a3c4e5f62",
        "filename": "notice-admin-1704123456789-123456789.pdf",
        "originalName": "exam_schedule.pdf",
        "mimetype": "application/pdf",
        "size": 245760,
        "url": "/uploads/notice-attachments/notice-admin-1704123456789-123456789.pdf",
        "uploadedAt": "2024-01-01T12:30:56.789Z"
      }
    ],
    "deliverySettings": {
      "publishAt": "2024-01-01T12:30:56.789Z",
      "expiresAt": "2024-01-31T12:30:56.789Z",
      "isImmediate": true,
      "sendEmail": false,
      "sendPushNotification": false
    },
    "status": "Published",
    "analytics": {
      "totalRecipientsCount": 150,
      "readCount": 75,
      "clickCount": 25,
      "emailsSent": 0,
      "pushNotificationsSent": 0
    },
    "tags": ["academic", "examination"],
    "createdAt": "2024-01-01T12:30:56.789Z",
    "updatedAt": "2024-01-01T12:30:56.789Z"
  },
  "message": "Notice created and published successfully"
}
```

## Notice Categories
- Academic
- Admission
- Examination  
- Result
- Events
- Workshop
- Seminar
- Conference
- Cultural
- Sports
- Emergency
- Holiday
- Transportation
- Scholarship
- Job
- Internship
- Research
- Administrative
- General
- Health
- Safety
- Accommodation
- Library
- IT
- Other

## Priority Levels
- Low
- Normal
- High  
- Urgent

## Notice Types
- Announcement
- Circular
- Notice
- Alert
- Reminder

## Notice Status
- Draft: Notice is being prepared
- Scheduled: Notice is scheduled for future publication
- Published: Notice is active and visible to targeted users
- Expired: Notice has passed its expiry date
- Archived: Notice has been archived

## File Upload Security
- File type validation on server-side
- File size limits enforced
- Unique filename generation to prevent conflicts
- Automatic file cleanup when notices are deleted
- Secure file path handling

## Targeting Logic
The system uses intelligent targeting to deliver notices to relevant users:

1. **Specific User Targeting**: If specific users are listed, only they receive the notice
2. **Exclusion List**: Users in the exclude list never receive the notice
3. **Role Matching**: Notice is delivered if user's role matches targeting criteria
4. **Department Matching**: Notice is delivered if user's department is targeted
5. **Session Matching**: For students, notice is delivered if their session is targeted
6. **Blood Group Matching**: For blood donation notices
7. **Volunteer Targeting**: Only volunteers receive the notice if this flag is set
8. **Residence Keywords**: Notice is delivered if user's residence contains keywords

## Error Handling
- Comprehensive validation for all inputs
- File upload error handling with clear messages
- Database transaction safety for file operations  
- Automatic cleanup of orphaned files

## Performance Optimization
- Database indexing for quick notice queries
- Efficient file storage and retrieval
- Pagination support for large notice lists
- Query optimization for personalized notice delivery

## Security Features
- Admin-only access for notice management
- File type and size validation
- SQL injection prevention
- XSS protection for notice content
- Rate limiting for API endpoints

This comprehensive notice management system provides everything needed for effective campus communication with robust file handling capabilities.
