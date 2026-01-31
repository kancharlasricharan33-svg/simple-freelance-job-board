# Deployment Guide

## Prerequisites
- Node.js >= 18.0.0
- MongoDB Atlas account (free tier available)
- Render account (for backend)
- Vercel account (for frontend)

## Local Development Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd simple-freelance-job-board
```

2. **Set up environment variables**
```bash
# Backend
cp .env.example .env
# Update the .env file with your configuration
```

3. **Install dependencies**
```bash
# Backend
npm install

# Frontend
cd frontend
npm install
cd ..
```

4. **Set up MongoDB**
- Create a free MongoDB Atlas cluster
- Get your connection string
- Update MONGODB_URI in .env

5. **Seed the database**
```bash
npm run seed
```

6. **Run development servers**
```bash
# Backend (port 5000)
npm run dev

# Frontend (port 3000) - in another terminal
cd frontend
npm start
```

## Deployment to Render (Backend)

1. **Create Render account** and connect your GitHub repository

2. **Create new Web Service** on Render:
   - Name: `freelance-job-board-api`
   - Runtime: Node
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment variables:
     ```
     NODE_ENV=production
     PORT=10000
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_secure_jwt_secret
     ```

3. **Add to your .env file for local development:**
```
RENDER_EXTERNAL_URL=https://your-app.onrender.com
```

## Deployment to Vercel (Frontend)

1. **Create Vercel account** and connect your GitHub repository

2. **Configure build settings:**
   - Build command: `npm run build`
   - Output directory: `build`
   - Install command: `npm install`

3. **Set environment variables in Vercel:**
   ```
   REACT_APP_API_URL=https://your-render-app.onrender.com/api/v1
   ```

4. **Update package.json in frontend:**
```json
{
  "homepage": "https://your-vercel-app.vercel.app"
}
```

## Environment Variables Required

### Backend (.env)
```
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_very_long_secure_secret_key
JWT_EXPIRE=30d
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Frontend (.env)
```
REACT_APP_API_URL=https://your-render-app.onrender.com/api/v1
```

## Testing Production Deployment

1. **Test API endpoints:**
```bash
curl https://your-render-app.onrender.com/api/health
```

2. **Test frontend:**
- Visit your Vercel deployment URL
- Try registering a new user
- Create a job posting
- Place bids as freelancer

## Monitoring and Maintenance

### Logs
- Render: Dashboard → Your App → Logs
- Vercel: Dashboard → Your App → Functions → Logs

### Database Monitoring
- MongoDB Atlas: Dashboard → Clusters → Metrics

### Performance Optimization
1. Enable MongoDB indexes
2. Monitor API response times
3. Check for memory leaks
4. Review error logs regularly

## Troubleshooting

### Common Issues:

1. **CORS errors**: Ensure FRONTEND_URL matches your Vercel domain
2. **Database connection**: Verify MONGODB_URI is correct
3. **Build failures**: Check Node.js version requirements
4. **Environment variables**: Double-check all required vars are set

### Useful Commands:
```bash
# Check deployed API health
curl https://your-app.onrender.com/api/health

# Test authentication
curl -X POST https://your-app.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Cost Estimates (Free Tier Options)

- **MongoDB Atlas**: Free (512MB storage)
- **Render**: Free tier available (with some limitations)
- **Vercel**: Free tier for hobby projects
- **Total monthly cost**: $0 (with free tiers)

## Scaling Considerations

1. **Traffic growth**: Move to paid Render/Vercel plans
2. **Database**: Upgrade MongoDB Atlas when approaching limits
3. **Features**: Add Redis caching for better performance
4. **Multiple regions**: Configure for global deployment