# Simple Freelance Job Board API Documentation

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Error message"
    }
  ]
}
```

## Success Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

## User Endpoints

### POST /api/v1/auth/register
**Register a new user**

Request:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "freelancer",
  "profile": {
    "bio": "Experienced developer",
    "skills": ["JavaScript", "React", "Node.js"]
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "freelancer",
      "profile": {
        "bio": "Experienced developer",
        "skills": ["JavaScript", "React", "Node.js"]
      },
      "rating": {
        "average": 0,
        "count": 0
      }
    },
    "token": "jwt_token_here"
  }
}
```

### POST /api/v1/auth/login
**Login user**

Request:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "freelancer"
    },
    "token": "jwt_token_here"
  }
}
```

### GET /api/v1/auth/me
**Get current user profile**

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "freelancer",
      "profile": {
        "bio": "Experienced developer",
        "skills": ["JavaScript", "React", "Node.js"],
        "portfolio": "https://portfolio.com",
        "avatar": "avatar_url"
      },
      "rating": {
        "average": 4.5,
        "count": 12
      }
    }
  }
}
```

### PUT /api/v1/auth/me
**Update current user profile**

Request:
```json
{
  "name": "John Smith",
  "profile": {
    "bio": "Senior developer with 5 years experience",
    "skills": ["JavaScript", "React", "Node.js", "Python"],
    "portfolio": "https://newportfolio.com"
  }
}
```

## Job Endpoints

### GET /api/v1/jobs
**Get all jobs with filtering and pagination**

Query Parameters:
- `page` (default: 1)
- `limit` (default: 10, max: 50)
- `category` (design, writing, development, marketing, data, other)
- `status` (open, in_progress, completed, cancelled)
- `minBudget`
- `maxBudget`
- `search` (text search in title, description, skills)

Response:
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "job_id",
        "title": "Logo Design for Startup",
        "description": "Need a modern logo for tech startup",
        "category": "design",
        "budget": {
          "min": 100,
          "max": 300
        },
        "duration": "1-2 weeks",
        "client": {
          "id": "client_id",
          "name": "Company Name",
          "rating": 4.8
        },
        "status": "open",
        "bidCount": 5,
        "skillsRequired": ["logo design", "illustration"],
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalJobs": 45,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### GET /api/v1/jobs/:id
**Get job details**

Response:
```json
{
  "success": true,
  "data": {
    "job": {
      "id": "job_id",
      "title": "Logo Design for Startup",
      "description": "Detailed description here...",
      "category": "design",
      "budget": {
        "min": 100,
        "max": 300
      },
      "duration": "1-2 weeks",
      "client": {
        "id": "client_id",
        "name": "Company Name",
        "email": "company@example.com",
        "rating": {
          "average": 4.8,
          "count": 15
        }
      },
      "freelancer": null,
      "status": "open",
      "skillsRequired": ["logo design", "illustration"],
      "attachments": [],
      "bids": [
        {
          "id": "bid_id",
          "freelancer": {
            "id": "freelancer_id",
            "name": "Jane Designer",
            "rating": 4.9
          },
          "amount": 250,
          "duration": "1-2 weeks",
          "message": "I can create a stunning logo...",
          "status": "pending",
          "createdAt": "2024-01-15T11:00:00Z"
        }
      ],
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### POST /api/v1/jobs
**Create new job (Client only)**

Request:
```json
{
  "title": "Logo Design for Startup",
  "description": "Need a modern logo for tech startup",
  "category": "design",
  "budget": {
    "min": 100,
    "max": 300
  },
  "duration": "1-2 weeks",
  "skillsRequired": ["logo design", "illustration"]
}
```

### PUT /api/v1/jobs/:id
**Update job (Client only)**

### DELETE /api/v1/jobs/:id
**Delete job (Client only)**

### POST /api/v1/jobs/:id/claim
**Claim job directly (Freelancer only)**

Request:
```json
{
  "message": "I'm interested in this job"
}
```

## Bid Endpoints

### POST /api/v1/jobs/:id/bids
**Place bid on job (Freelancer only)**

Request:
```json
{
  "amount": 250,
  "duration": "1-2 weeks",
  "message": "I have 5 years experience in logo design"
}
```

### GET /api/v1/jobs/:id/bids
**Get all bids for a job (Client only)**

### PUT /api/v1/bids/:id
**Accept/reject bid (Client only)**

Request:
```json
{
  "status": "accepted"
}
```

### DELETE /api/v1/bids/:id
**Delete bid (Bid owner only)**

## Rating Endpoints

### POST /api/v1/jobs/:id/rating
**Submit rating for completed job**

Request:
```json
{
  "rating": 5,
  "feedback": "Excellent work! Highly recommended",
  "quality": 5,
  "communication": 5,
  "professionalism": 5
}
```

### GET /api/v1/users/:id/ratings
**Get user ratings**

Response:
```json
{
  "success": true,
  "data": {
    "ratings": [
      {
        "id": "rating_id",
        "rating": 5,
        "feedback": "Great work!",
        "quality": 5,
        "communication": 5,
        "professionalism": 5,
        "job": {
          "id": "job_id",
          "title": "Logo Design"
        },
        "client": {
          "id": "client_id",
          "name": "Company Name"
        },
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "average": 4.8,
    "count": 12
  }
}
```

## Notification Endpoints

### GET /api/v1/notifications
**Get user notifications**

### PUT /api/v1/notifications/:id/read
**Mark notification as read**

### DELETE /api/v1/notifications/:id
**Delete notification**