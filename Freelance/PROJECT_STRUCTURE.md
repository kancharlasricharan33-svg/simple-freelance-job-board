# Project Structure

## Backend Structure
```
backend/
├── config/
│   └── database.js          # Database connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── jobController.js     # Job CRUD operations
│   ├── bidController.js     # Bid management
│   ├── ratingController.js  # Rating system
│   └── notificationController.js # Notifications
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── validation.js        # Input validation
│   └── error.js             # Error handling
├── models/
│   ├── User.js              # User schema
│   ├── Job.js               # Job schema
│   ├── Bid.js               # Bid schema
│   ├── Rating.js            # Rating schema
│   └── Notification.js      # Notification schema
├── routes/
│   ├── auth.js              # Auth routes
│   ├── jobs.js              # Job routes
│   ├── bids.js              # Bid routes
│   ├── ratings.js           # Rating routes
│   └── notifications.js     # Notification routes
├── utils/
│   ├── sendEmail.js         # Email utility
│   └── generateToken.js     # JWT token generation
├── validators/
│   ├── authValidator.js     # Auth validation rules
│   ├── jobValidator.js      # Job validation rules
│   └── bidValidator.js      # Bid validation rules
├── .env                     # Environment variables
├── .gitignore               # Git ignore file
├── server.js                # Main server file
└── package.json             # Dependencies
```

## Frontend Structure
```
frontend/
├── public/
│   ├── index.html           # Main HTML file
│   └── favicon.ico          # Favicon
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.js    # Navigation header
│   │   │   ├── Footer.js    # Footer component
│   │   │   └── Sidebar.js   # Dashboard sidebar
│   │   ├── jobs/
│   │   │   ├── JobList.js   # Job listing component
│   │   │   ├── JobCard.js   # Individual job card
│   │   │   ├── JobDetail.js # Job detail view
│   │   │   └── JobForm.js   # Job creation form
│   │   ├── bids/
│   │   │   ├── BidForm.js   # Bid placement form
│   │   │   └── BidList.js   # List of bids
│   │   ├── auth/
│   │   │   ├── LoginForm.js # Login form
│   │   │   ├── RegisterForm.js # Registration form
│   │   │   └── Profile.js   # User profile
│   │   ├── ratings/
│   │   │   └── RatingForm.js # Rating submission
│   │   └── ui/
│   │       ├── Button.js    # Reusable button
│   │       ├── Input.js     # Reusable input
│   │       └── Modal.js     # Modal component
│   ├── pages/
│   │   ├── Home.js          # Homepage
│   │   ├── Dashboard.js     # User dashboard
│   │   ├── JobBoard.js      # Job listing page
│   │   ├── JobDetailPage.js # Job detail page
│   │   ├── ProfilePage.js   # Profile page
│   │   └── AuthPage.js      # Login/Register page
│   ├── context/
│   │   └── AuthContext.js   # Authentication context
│   ├── hooks/
│   │   ├── useAuth.js       # Auth custom hook
│   │   └── useApi.js        # API custom hook
│   ├── services/
│   │   └── api.js           # API service functions
│   ├── utils/
│   │   └── helpers.js       # Utility functions
│   ├── styles/
│   │   └── tailwind.css     # Tailwind CSS
│   ├── App.js               # Main App component
│   ├── index.js             # Entry point
│   └── routes.js            # Route definitions
├── .env                     # Environment variables
├── .gitignore               # Git ignore file
├── package.json             # Dependencies
└── tailwind.config.js       # Tailwind configuration
```

## Root Structure
```
simple-freelance-board/
├── backend/                 # Backend application
├── frontend/                # Frontend application
├── README.md                # Project documentation
├── .gitignore               # Git ignore
└── package.json             # Root package.json for scripts
```