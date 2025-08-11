// ===============================================
// Interactive Media Backend Server
// Serverless Express.js API
// ===============================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

// Import database utilities
const DatabaseUtils = process.env.NODE_ENV === 'production' 
  ? require('../utils/database-aws')
  : require('../utils/database').DatabaseUtils;

const app = express();
const PORT = process.env.PORT || 3001;

// ===============================================
// Middleware Configuration
// ===============================================

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.vercel.app', 'https://your-domain.netlify.app']
    : ['http://localhost:3000', 'http://127.0.0.1:5500'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api', limiter);

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===============================================
// Database Initialization
// ===============================================

// Initialize database on startup (only in development)
if (process.env.NODE_ENV !== 'production') {
  DatabaseUtils.initializeDatabase().catch(console.error);
}

// ===============================================
// API Routes
// ===============================================

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const dbHealth = await DatabaseUtils.healthCheck();
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: dbHealth
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const { tag, search } = req.query;
    const result = await DatabaseUtils.getAllProjects({ tag, search });

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        total: result.total,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch projects',
      message: error.message
    });
  }
});

// Get specific project
app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await DatabaseUtils.getProject(id);

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } else {
      const statusCode = result.error === 'Project not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project',
      message: error.message
    });
  }
});

// Create new project
app.post('/api/projects', async (req, res) => {
  try {
    const { id, name, description, author, tags = [] } = req.body;

    // Validation
    if (!id || !name || !description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: id, name, description'
      });
    }

    const projectData = {
      id,
      name,
      description,
      author: author || 'Anonymous',
      tags: Array.isArray(tags) ? tags : []
    };

    const result = await DatabaseUtils.createProject(projectData);

    if (result.success) {
      res.status(201).json({
        success: true,
        data: result.data,
        message: 'Project created successfully'
      });
    } else {
      const statusCode = result.error.includes('already exists') ? 409 : 500;
      res.status(statusCode).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create project',
      message: error.message
    });
  }
});

// Like a project
app.post('/api/projects/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await DatabaseUtils.incrementLikes(id);

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: 'Project liked successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to like project',
      message: error.message
    });
  }
});

// Get analytics
app.get('/api/analytics', async (req, res) => {
  try {
    const result = await DatabaseUtils.getAnalytics();

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
      message: error.message
    });
  }
});

// ===============================================
// Error Handling
// ===============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// ===============================================
// Server Start
// ===============================================

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  });
}

// Export for serverless deployment
module.exports = app;

// Lambda handler for AWS deployment
const serverless = require('serverless-http');
module.exports.handler = serverless(app);
