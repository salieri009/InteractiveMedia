# Interactive Media Backend

A serverless backend API for the UTS Interactive Media Assignment project, designed for easy deployment to cloud platforms.

## 🏗️ Architecture

- **Express.js** API server with serverless deployment support
- **In-memory data store** (easily replaceable with database)
- **Rate limiting** and security middleware
- **CORS** configuration for frontend integration
- **Analytics tracking** system
- **Health monitoring** endpoints

## 🚀 Quick Start

### Development Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Test the API:**
   ```bash
   curl http://localhost:3001/api/health
   ```

## 📡 API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/projects` | Get all projects |
| GET | `/api/projects/:id` | Get specific project |
| POST | `/api/projects` | Create new project |
| POST | `/api/projects/:id/like` | Like a project |
| GET | `/api/analytics` | Get analytics data |

### Example Usage

```javascript
// Get all projects
const response = await fetch('/api/projects');
const data = await response.json();

// Create a new project
const newProject = await fetch('/api/projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'a1c',
    name: 'A1C - Particle System',
    description: 'Interactive particle system with physics',
    author: 'UTS Student',
    tags: ['particles', 'physics', 'advanced']
  })
});
```

## 🌐 Deployment Options

### Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   npm run deploy
   ```

3. **Configure environment variables in Vercel dashboard**

### Netlify

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy:**
   ```bash
   npm run deploy:netlify
   ```

3. **Configure environment variables in Netlify dashboard**

### Automated Deployment

Use the deployment script:
```bash
chmod +x deploy.sh
./deploy.sh
```

## 🔧 Configuration

### Environment Variables

```env
NODE_ENV=production
PORT=3001
CORS_ORIGINS=https://your-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Integration

Update your frontend to use the API:

```javascript
// Add to your frontend code
const API_BASE_URL = 'https://your-backend-domain.vercel.app';

// Update APIClient initialization
const apiClient = new APIClient(API_BASE_URL);
```

## 📊 Features

### Analytics Tracking
- Project view counts
- Like tracking
- User session analytics
- Tag-based filtering

### Security Features
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation

### Performance
- Compression middleware
- Request timeout handling
- Error handling
- Health monitoring

## 🗄️ Data Models

### Project Model
```javascript
{
  id: 'string',
  name: 'string',
  description: 'string',
  author: 'string',
  created: 'ISO string',
  views: 'number',
  likes: 'number',
  tags: ['array of strings']
}
```

### Analytics Model
```javascript
{
  totalViews: 'number',
  totalProjects: 'number',
  dailyStats: 'object',
  topProjects: 'array',
  tagStats: 'object'
}
```

## 🔄 Frontend Integration

The backend seamlessly integrates with your p5.js frontend:

1. **Enhanced UI Controller** automatically connects to the API
2. **Offline support** with graceful fallback
3. **Real-time analytics** updates
4. **Project statistics** display

### Usage in Frontend

```javascript
// Projects are automatically enhanced with backend data
// View counts, likes, and tags are synchronized
// Analytics are displayed in the UI
```

## 🧪 Testing

Run tests:
```bash
npm test
```

Health check:
```bash
curl https://your-domain.vercel.app/api/health
```

## 📈 Monitoring

### Health Endpoint
- Server status
- Uptime tracking
- Environment info

### Analytics Dashboard
- Project popularity
- User engagement
- Tag statistics

## 🔮 Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] User authentication
- [ ] File upload support
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Caching layer
- [ ] API versioning

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Ready to deploy your Interactive Media projects to the cloud! 🚀**
