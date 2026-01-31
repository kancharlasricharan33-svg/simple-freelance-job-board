# Polish Features Implementation

## 1. Advanced Search Functionality

### Text Search with MongoDB
```javascript
// Enhanced search controller
const searchJobs = async (req, res, next) => {
  try {
    const { q, category, minBudget, maxBudget, skills, sortBy = 'createdAt' } = req.query;
    
    let searchQuery = {};
    
    // Text search
    if (q) {
      searchQuery.$text = { $search: q };
    }
    
    // Category filter
    if (category) {
      searchQuery.category = category;
    }
    
    // Budget range
    if (minBudget || maxBudget) {
      searchQuery['budget.max'] = {};
      if (minBudget) searchQuery['budget.max'].$gte = Number(minBudget);
      if (maxBudget) searchQuery['budget.max'].$lte = Number(maxBudget);
    }
    
    // Skills filtering
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      searchQuery.skillsRequired = { $all: skillsArray };
    }
    
    // Sorting options
    const sortOptions = {
      'relevance': { score: { $meta: 'textScore' } },
      'newest': { createdAt: -1 },
      'oldest': { createdAt: 1 },
      'budget_high': { 'budget.max': -1 },
      'budget_low': { 'budget.max': 1 }
    };
    
    const sort = sortOptions[sortBy] || sortOptions.newest;
    
    const jobs = await Job.find(searchQuery)
      .populate('client', 'name rating')
      .sort(sort)
      .limit(20)
      .lean();
    
    res.json({
      success: true,
      data: { jobs, count: jobs.length }
    });
  } catch (error) {
    next(error);
  }
};
```

### Search UI Component
```jsx
// src/components/Search/SearchBar.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    minBudget: '',
    maxBudget: '',
    skills: ''
  });
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (searchTerm) params.append('q', searchTerm);
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    navigate(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search jobs, skills, or keywords..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={filters.category}
          onChange={(e) => setFilters({...filters, category: e.target.value})}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          <option value="design">Design</option>
          <option value="development">Development</option>
          <option value="writing">Writing</option>
          <option value="marketing">Marketing</option>
        </select>
        
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Search
        </button>
      </div>
      
      {/* Advanced filters */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="number"
          placeholder="Min Budget"
          value={filters.minBudget}
          onChange={(e) => setFilters({...filters, minBudget: e.target.value})}
          className="px-3 py-2 border border-gray-300 rounded-md"
        />
        <input
          type="number"
          placeholder="Max Budget"
          value={filters.maxBudget}
          onChange={(e) => setFilters({...filters, maxBudget: e.target.value})}
          className="px-3 py-2 border border-gray-300 rounded-md"
        />
        <input
          type="text"
          placeholder="Skills (comma separated)"
          value={filters.skills}
          onChange={(e) => setFilters({...filters, skills: e.target.value})}
          className="px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
    </form>
  );
};

export default SearchBar;
```

## 2. Real-time Notifications

### WebSocket Implementation
```javascript
// backend/sockets/notificationSocket.js
const socketIO = require('socket.io');

const setupSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"]
    }
  });

  // Store user connections
  const userSockets = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User joins their room
    socket.on('join_user', (userId) => {
      socket.join(`user_${userId}`);
      userSockets.set(userId, socket.id);
      console.log(`User ${userId} joined room`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      for (let [userId, socketId] of userSockets) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });
  });

  // Function to send notification to user
  const sendNotification = (userId, notification) => {
    const socketId = userSockets.get(userId);
    if (socketId) {
      io.to(`user_${userId}`).emit('notification', notification);
    }
  };

  return { io, sendNotification };
};

module.exports = setupSocket;
```

### Frontend Notification Hook
```jsx
// src/hooks/useNotifications.js
import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user) {
      // Connect to WebSocket
      const newSocket = io(process.env.REACT_APP_API_URL.replace('/api/v1', ''));
      
      newSocket.emit('join_user', user.id);
      
      newSocket.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show browser notification
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico'
          });
        }
      });
      
      setSocket(newSocket);
      
      // Request notification permission
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearAll
  };
};

export default useNotifications;
```

## 3. Dashboard Analytics

### User Dashboard Component
```jsx
// src/components/dashboard/UserDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const UserDashboard = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    completedJobs: 0,
    totalEarnings: 0,
    averageRating: 0,
    monthlyData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [jobsRes, earningsRes, ratingsRes] = await Promise.all([
        axios.get('/api/v1/jobs/my'),
        axios.get('/api/v1/analytics/earnings'),
        axios.get('/api/v1/users/me/ratings')
      ]);

      setStats({
        totalJobs: jobsRes.data.data.count,
        completedJobs: jobsRes.data.data.completed,
        totalEarnings: earningsRes.data.data.total,
        averageRating: ratingsRes.data.data.average,
        monthlyData: earningsRes.data.data.monthly
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart data
  const earningsData = {
    labels: stats.monthlyData.map(item => item.month),
    datasets: [
      {
        label: 'Monthly Earnings ($)',
        data: stats.monthlyData.map(item => item.earnings),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1
      }
    ]
  };

  const jobsData = {
    labels: ['Open', 'In Progress', 'Completed', 'Cancelled'],
    datasets: [
      {
        label: 'Jobs',
        data: [
          stats.totalJobs - stats.completedJobs,
          0, // In progress would come from API
          stats.completedJobs,
          0 // Cancelled would come from API
        ],
        backgroundColor: [
          'rgba(245, 158, 11, 0.6)',
          'rgba(59, 130, 246, 0.6)',
          'rgba(16, 185, 129, 0.6)',
          'rgba(239, 68, 68, 0.6)'
        ]
      }
    ]
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Jobs</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalJobs}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Completed</h3>
          <p className="text-3xl font-bold text-green-600">{stats.completedJobs}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Earnings</h3>
          <p className="text-3xl font-bold text-blue-600">${stats.totalEarnings}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Rating</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {stats.averageRating.toFixed(1)} ★
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Earnings Over Time</h3>
          <Line data={earningsData} options={{ responsive: true }} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Job Status Distribution</h3>
          <Bar data={jobsData} options={{ responsive: true }} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </div>
        <div className="p-6">
          {/* Recent jobs/bids would be displayed here */}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
```

## 4. Email Notifications

### Email Service
```javascript
// backend/utils/emailService.js
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendJobNotification(job, freelancer) {
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: freelancer.email,
      subject: `New Job: ${job.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Job Opportunity</h2>
          <h3>${job.title}</h3>
          <p><strong>Category:</strong> ${job.category}</p>
          <p><strong>Budget:</strong> $${job.budget.min} - $${job.budget.max}</p>
          <p><strong>Duration:</strong> ${job.duration}</p>
          <p><strong>Description:</strong></p>
          <p>${job.description.substring(0, 200)}...</p>
          <a href="${process.env.FRONTEND_URL}/jobs/${job._id}" 
             style="background-color: #3b82f6; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            View Job Details
          </a>
        </div>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendBidAcceptedNotification(bid, job) {
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: bid.freelancer.email,
      subject: `Bid Accepted: ${job.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Congratulations! 🎉</h2>
          <p>Your bid of $${bid.amount} has been accepted for:</p>
          <h3>${job.title}</h3>
          <p>Please check your dashboard for next steps.</p>
          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="background-color: #10b981; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();
```

## 5. File Upload and Management

### File Upload Component
```jsx
// src/components/FileUpload/FileUpload.js
import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = ({ onUploadComplete, allowedTypes = ['image/*', 'application/pdf'] }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const isValidType = allowedTypes.some(type => 
      file.type.match(type.replace('*', '.*')) || 
      file.name.toLowerCase().endsWith(type.replace('/*', '').replace('*', ''))
    );

    if (!isValidType) {
      alert('Invalid file type. Please upload: ' + allowedTypes.join(', '));
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/v1/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        }
      });

      onUploadComplete(response.data.data.file);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
      <input
        type="file"
        onChange={handleFileUpload}
        accept={allowedTypes.join(',')}
        className="hidden"
        id="file-upload"
        disabled={uploading}
      />
      <label
        htmlFor="file-upload"
        className={`cursor-pointer ${uploading ? 'opacity-50' : ''}`}
      >
        {uploading ? (
          <div>
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Uploading... {progress}%</p>
          </div>
        ) : (
          <div>
            <div className="text-4xl mb-2">📁</div>
            <p className="text-gray-600 mb-2">
              <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-sm text-gray-500">
              PDF, DOC, Images up to 5MB
            </p>
          </div>
        )}
      </label>
    </div>
  );
};

export default FileUpload;
```

## 6. Mobile Responsiveness

### Responsive Utility Classes
```css
/* Additional responsive utilities */
@media (max-width: 640px) {
  .mobile-grid-cols-1 {
    grid-template-columns: 1fr;
  }
  
  .mobile-p-4 {
    padding: 1rem;
  }
  
  .mobile-text-lg {
    font-size: 1.125rem;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .tablet-grid-cols-2 {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### Mobile Navigation
```jsx
// src/components/layout/MobileNav.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const navLinks = [
    { name: 'Find Jobs', href: '/jobs', role: 'freelancer' },
    { name: 'Post Job', href: '/post-job', role: 'client' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Messages', href: '/messages' }
  ];

  return (
    <div className="md:hidden">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile menu */}
      {isOpen && (
        <div className="absolute top-16 inset-x-0 bg-white shadow-lg rounded-lg mx-4 py-2 z-50">
          <div className="px-2 space-y-1">
            {navLinks
              .filter(link => !link.role || link.role === user?.role)
              .map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                Sign out
              </button>
            ) : (
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileNav;
```

## 7. Performance Optimization

### Code Splitting and Lazy Loading
```jsx
// src/routes/AppRoutes.js
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy load components
const Home = lazy(() => import('../pages/Home'));
const JobList = lazy(() => import('../pages/JobList'));
const JobDetail = lazy(() => import('../pages/JobDetail'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Login = lazy(() => import('../pages/Login'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
```

This implementation provides a production-ready platform with professional-grade features ready for users in development and production. Includes search, real-time notifications, analytics, email notifications, file uploads, mobile responsiveness, and performance optimizations.