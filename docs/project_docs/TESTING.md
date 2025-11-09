# 🧪 Testing Guide

## 📋 Test Overview

This guide explains how to test frontend and backend independently before deployment.

## 🎨 Frontend Testing

### 1. Development Environment Setup

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start development server (Method 1 - Live Server)
npm run dev

# Or start development server (Method 2 - HTTP Server)
npm start
```

### 2. Frontend Functionality Test Checklist

#### ✅ Basic Functionality Tests
- [ ] Can access http://localhost:3000 in browser
- [ ] Project selection buttons are displayed
- [ ] Can switch between A1A, A1B, A1C projects
- [ ] p5.js canvas renders normally

#### ✅ A1A Project Test
```javascript
// Run in browser console to test
console.log('A1A Project Test:');
uiController.switchProject('a1a');
```
- [ ] Basic shapes (lines, rectangles, circles) are displayed
- [ ] Mouse clicks output coordinates to console
- [ ] Key inputs output keys to console

#### ✅ A1B Project Test  
```javascript
// Run in browser console
console.log('A1B Project Test:');
uiController.switchProject('a1b');
```
- [ ] Moving circles bounce around the screen
- [ ] Trail effect follows mouse
- [ ] Spacebar can pause/resume

#### ✅ A1C Project Test
```javascript
// Run in browser console  
console.log('A1C Project Test:');
uiController.switchProject('a1c');
```
- [ ] Pattern displays with animation
- [ ] Keys 1-4 can change patterns
- [ ] Keys Q,W,E,T can change color modes
- [ ] +/- keys can adjust size
- [ ] Mouse click cycles through patterns

### 3. Browser Developer Tools Check

```javascript
// Debugging commands that can be run in console

// 1. Check registered projects list
console.log('Registered projects:', projectManager.getAllProjects());

// 2. Check current project
console.log('Current project:', projectManager.getCurrentProject());

// 3. Check UI controller status
console.log('UI Controller:', uiController);

// 4. Check p5.js global variables
console.log('p5.js variables:', {
  mouseX: typeof mouseX !== 'undefined' ? mouseX : 'undefined',
  mouseY: typeof mouseY !== 'undefined' ? mouseY : 'undefined',
  width: typeof width !== 'undefined' ? width : 'undefined',
  height: typeof height !== 'undefined' ? height : 'undefined'
});
```

## 🖥️ Backend Testing

### 1. Development Environment Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. API Endpoint Testing

#### ✅ Health Check
```bash
# In PowerShell
Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method GET

# Or access http://localhost:3001/api/health in browser
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-08-11T...",
  "uptime": 123.456,
  "environment": "development"
}
```

#### ✅ Project List Query
```bash
# In PowerShell
Invoke-RestMethod -Uri "http://localhost:3001/api/projects" -Method GET
```

Expected response:
```json
{
  "success": true,
  "data": [
    {
      "id": "a1a",
      "name": "A1A - Basic Shapes",
      "description": "...",
      "views": 0,
      "likes": 0
    }
  ],
  "total": 3
}
```

#### ✅ Specific Project Query
```bash
# In PowerShell
Invoke-RestMethod -Uri "http://localhost:3001/api/projects/a1a" -Method GET
```

#### ✅ Project Like
```bash
# In PowerShell
Invoke-RestMethod -Uri "http://localhost:3001/api/projects/a1a/like" -Method POST
```

#### ✅ Analytics Data Query
```bash
# In PowerShell
Invoke-RestMethod -Uri "http://localhost:3001/api/analytics" -Method GET
```

### 3. Backend Log Check

When running the development server, you should see logs like this in the console:

```
🚀 Server running on http://localhost:3001
📊 API endpoints available at http://localhost:3001/api
✅ Database connected (in-memory)
```

## 🔗 Integration Testing (Frontend + Backend)

### 1. Run Both Servers

```bash
# Terminal 1: Run Backend
cd backend
npm run dev

# Terminal 2: Run Frontend  
cd frontend
npm run dev
```

### 2. API Integration Test

Open browser console in Frontend:

```javascript
// API client test
if (typeof EnhancedUIController !== 'undefined') {
  console.log('Starting API integration test...');
  
  // Test loading project list
  uiController.loadProjectsFromAPI()
    .then(() => console.log('✅ API integration successful'))
    .catch(err => console.error('❌ API integration failed:', err));
}
```

### 3. Confirm API Calls in Network Tab

In browser developer tools Network tab, confirm these requests succeed:

- `GET /api/projects` - Status code 200
- `GET /api/analytics` - Status code 200  
- `GET /api/projects/a1a` (when clicking project) - Status code 200

## 🧪 AWS Lambda Local Testing

### 1. Confirm SAM CLI Installation

```bash
sam --version
```

### 2. Run Lambda Function Locally

```bash
# SAM build
sam build

# Start local API server
sam local start-api --port 3001
```

### 3. Invoke Function with Test Event

```bash
# Health check test
sam local invoke InteractiveMediaAPI --event events/test-health.json

# Projects API test  
sam local invoke InteractiveMediaAPI --event events/test-projects.json
```

## 🚨 General Troubleshooting

### Frontend Issues

1. **Project not loading**
   ```javascript
   // Check in console
   console.log('ProjectManager status:', projectManager);
   console.log('Number of registered projects:', projectManager.getAllProjects().length);
   ```

2. **p5.js errors**
   ```javascript
   // Check p5.js loading
   console.log('p5.js loaded:', typeof p5 !== 'undefined');
   console.log('createCanvas available:', typeof createCanvas !== 'undefined');
   ```

3. **API connection errors**
   - Confirm backend server is running
   - Check CORS settings
   - Check network errors in browser console

### Backend Issues

1. **Port conflicts**
   ```bash
   # Check processes using port (Windows)
   netstat -ano | findstr :3001
   
   # Kill process
   taskkill /PID <PID_NUMBER> /F
   ```

2. **Module errors**
   ```bash
   # Delete node_modules and reinstall
   Remove-Item node_modules -Recurse -Force
   npm install
   ```

## ✅ Test Completion Checklist

Confirm all items are checked before deployment:

### Frontend
- [ ] All projects (A1A, A1B, A1C) work normally
- [ ] Mouse/keyboard interactions work
- [ ] No errors in browser console
- [ ] Tested in multiple browsers

### Backend  
- [ ] All API endpoints respond normally
- [ ] No errors in server logs
- [ ] CORS settings work properly
- [ ] Database connection normal

### Integration
- [ ] Frontend successfully calls Backend APIs
- [ ] Project view counts increase correctly
- [ ] Analytics data displays normally
- [ ] Like functionality works

Once all tests pass, you can proceed with deployment! 🚀
