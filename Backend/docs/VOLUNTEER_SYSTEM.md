# Volunteer System Documentation

## Overview
The Volunteer System enables users to request help from volunteers within the campus community. It provides a complete workflow from request creation to fulfillment, with proper access controls and tracking mechanisms.

## Features

### ✅ Core Functionality
- **Request Management**: Users can create, update, and delete help requests
- **Volunteer Response**: Volunteers can respond to requests with messages
- **Acceptance Process**: Request owners can choose which volunteer to accept
- **Progress Tracking**: Full lifecycle tracking from active to fulfilled
- **Rating System**: Rate and provide feedback for completed requests
- **Statistics**: Comprehensive analytics and leaderboard

### ✅ Request Categories
- **Blood Donation**: Emergency blood requirements
- **Medical Emergency**: Medical assistance needed
- **Academic Help**: Study groups, tutoring, project assistance
- **Transportation**: Ride sharing, vehicle assistance
- **Food/Supplies**: Food delivery, essential supplies
- **Technical Support**: IT help, device troubleshooting
- **Event Assistance**: Help organizing or participating in events
- **Other**: Miscellaneous help requests

### ✅ Access Control
- **Request Ownership**: Users can only modify their own requests
- **Volunteer Verification**: Only verified volunteers can respond
- **Status Protection**: Prevents invalid state transitions
- **Authorization Checks**: Role-based access for different operations

## API Endpoints

### Public Endpoints
```
GET /api/volunteers/leaderboard
- Get volunteer leaderboard (top performing volunteers)
- Query Parameters:
  - limit: Number of volunteers to return (default: 20)
- Access: Public
```

### General User Endpoints
```
GET /api/volunteers/categories
- Get list of available request categories
- Access: Authenticated users
```

```
GET /api/volunteers/stats
- Get overall system statistics
- Returns: total requests, active requests, fulfillment rate, category breakdown
- Access: Authenticated users
```

### Request Management Endpoints
```
GET /api/volunteers/requests
- Get all active volunteer requests (public view)
- Query Parameters:
  - category: Filter by category
  - urgency: Filter by urgency level
  - status: Filter by status (default: Active)
  - page: Page number (default: 1)
  - limit: Results per page (default: 20)
  - search: Search in title, description, location
- Access: Authenticated users
```

```
POST /api/volunteers/requests
- Create new volunteer request
- Required Fields: title, description, category, location
- Optional Fields: urgency, contactInfo, requirements
- Access: Authenticated users
```

```
GET /api/volunteers/my-requests
- Get current user's own requests
- Query Parameters:
  - status: Filter by status
  - page: Page number
  - limit: Results per page
- Access: Authenticated users
```

```
GET /api/volunteers/my-volunteer-activities
- Get volunteer's own responses and accepted requests
- Query Parameters: status, page, limit
- Access: Volunteers only
```

### Individual Request Operations
```
GET /api/volunteers/requests/:id
- Get specific request details with all responses
- Access: Authenticated users
```

```
PUT /api/volunteers/requests/:id
- Update volunteer request
- Restrictions: Only request owner, not in progress/fulfilled
- Access: Request owner only
```

```
DELETE /api/volunteers/requests/:id
- Delete volunteer request
- Restrictions: Only request owner, not in progress
- Access: Request owner only
```

### Volunteer Actions
```
POST /api/volunteers/requests/:id/respond
- Respond to a volunteer request
- Body: { message: "Optional response message" }
- Restrictions: Only volunteers, not own request, request must be active
- Access: Volunteers only
```

```
PUT /api/volunteers/requests/:id/accept/:volunteerId
- Accept a volunteer's response
- Updates request status to "In Progress"
- Rejects other responses automatically
- Access: Request owner only
```

```
PUT /api/volunteers/requests/:id/fulfill
- Mark request as fulfilled
- Body: { rating: 1-5, feedback: "Optional feedback" }
- Updates volunteer statistics
- Access: Request owner only
```

```
PUT /api/volunteers/requests/:id/cancel
- Cancel volunteer request
- Cannot cancel if already fulfilled
- Access: Request owner only
```

## Request Lifecycle

### 1. Request Creation
```json
{
  "title": "Need help with moving furniture",
  "description": "Moving to new dorm room, need help carrying heavy items",
  "category": "Other",
  "urgency": "Medium",
  "location": "Dorm Building A, Room 205",
  "contactInfo": {
    "phone": "+8801234567890",
    "email": "user@example.com",
    "alternateContact": "Roommate: +8801234567891"
  },
  "requirements": {
    "other": "Need 2-3 people with available time"
  }
}
```

### 2. Volunteer Response
```json
{
  "message": "I can help you move! I have experience and am available this afternoon."
}
```

### 3. Accept Volunteer
```
PUT /api/volunteers/requests/[requestId]/accept/[volunteerId]
```

### 4. Mark as Fulfilled
```json
{
  "rating": 5,
  "feedback": "Excellent help! Very professional and efficient."
}
```

## Status Flow

### Request Statuses
- **Active**: Newly created, accepting volunteer responses
- **In Progress**: Volunteer accepted, work in progress
- **Fulfilled**: Successfully completed with rating/feedback
- **Cancelled**: Cancelled by request owner
- **Expired**: Automatically expired after 7 days

### Valid Transitions
- Active → In Progress (when volunteer accepted)
- Active → Cancelled (by request owner)
- Active → Expired (automatic after 7 days)
- In Progress → Fulfilled (when marked complete)
- In Progress → Cancelled (by request owner)

## Volunteer Statistics

### Individual Volunteer Stats
- **requestsAccepted**: Number of requests accepted
- **requestsFulfilled**: Number of requests completed
- **averageRating**: Average rating from fulfilled requests
- **totalRatings**: Total number of ratings received

### System Statistics
- Total requests created
- Active requests count
- Fulfilled requests count
- Total verified volunteers
- Fulfillment rate percentage
- Category breakdown
- Urgency level distribution

## Sample API Responses

### Get Volunteer Requests Response
```json
{
  "success": true,
  "count": 15,
  "total": 45,
  "pagination": {
    "next": {
      "page": 2,
      "limit": 20
    }
  },
  "data": [
    {
      "_id": "648a5c4e8f5b2d1a3c4e5f60",
      "title": "Need blood donation urgently",
      "description": "Patient needs A+ blood for emergency surgery",
      "category": "Blood Donation",
      "urgency": "Critical",
      "location": "Dhaka Medical College Hospital",
      "requester": {
        "_id": "648a5c4e8f5b2d1a3c4e5f61",
        "name": "John Doe",
        "department": "Computer Science and Engineering",
        "profilePicture": "/uploads/profile-pictures/profile.jpg"
      },
      "contactInfo": {
        "phone": "+8801234567890",
        "email": "john@example.com"
      },
      "requirements": {
        "bloodGroup": "A+"
      },
      "status": "Active",
      "responses": [],
      "responseCount": 0,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "expiresAt": "2024-01-22T10:30:00.000Z"
    }
  ]
}
```

### Volunteer Leaderboard Response
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "648a5c4e8f5b2d1a3c4e5f62",
      "name": "Alice Smith",
      "department": "Medicine",
      "profilePicture": "/uploads/profile-pictures/alice.jpg",
      "volunteerStats": {
        "requestsAccepted": 25,
        "requestsFulfilled": 23,
        "averageRating": 4.8,
        "totalRatings": 23
      }
    }
  ]
}
```

## Error Handling

### Common Error Responses
```json
{
  "success": false,
  "message": "Not authorized to update this request"
}
```

### Validation Errors
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Request title is required"
    }
  ]
}
```

## Security Considerations

### Authorization Rules
1. Users can only create, update, delete their own requests
2. Only volunteers can respond to requests
3. Cannot respond to own requests
4. Only request owners can accept volunteers
5. Status-based operation restrictions

### Input Validation
- All fields properly validated for type, length, and format
- Sanitization of user input to prevent XSS
- Blood group validation for medical requests
- Phone number and email format validation

### Data Protection
- Contact information only visible to relevant parties
- User profiles protected with appropriate access levels
- Request history maintained for accountability

This comprehensive volunteer system provides everything needed for effective campus community assistance with robust security and user experience features.
