# 🚀 Setup Instructions

## Quick Start

### 1. Install Dependencies

**Option A: Install all at once (Recommended)**
```powershell
npm run install:all
```

**Option B: Install manually**
```powershell
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Start Development Server

**Frontend only (for p5.js projects):**
```powershell
npm run dev:frontend
```
or
```powershell
cd frontend
npm run dev
```

**Backend only:**
```powershell
npm run dev:backend
```
or
```powershell
cd backend
npm run dev
```

**Both frontend and backend (requires `concurrently` package):**
```powershell
npm install -g concurrently
npm run dev:all
```

### 3. Open in Browser

- Frontend: http://localhost:5173 (Vite default port)
- Backend API: http://localhost:3001

---

## Troubleshooting

### Error: 'vite' is not recognized

**Solution:** Dependencies are not installed. Run:
```powershell
cd frontend
npm install
```

### Error: Unknown command "workspaces"

**Solution:** Your npm version might not support workspaces. Use the individual commands instead:
```powershell
cd frontend
npm install
npm run dev
```

### Error: Port already in use

**Solution:** Change the port in `vite.config.js` or kill the process using the port:
```powershell
# Find process using port 5173
netstat -ano | findstr :5173

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Error: nodemon not found

**Solution:** Install backend dependencies:
```powershell
cd backend
npm install
```

---

## Development Workflow

### For Frontend Development (p5.js projects)

1. Start the frontend server:
   ```powershell
   npm run dev:frontend
   ```

2. Open http://localhost:5173 in your browser

3. The frontend works standalone - no backend required for basic p5.js projects

### For Full-Stack Development

1. Start backend (in one terminal):
   ```powershell
   npm run dev:backend
   ```

2. Start frontend (in another terminal):
   ```powershell
   npm run dev:frontend
   ```

3. Frontend will connect to backend API at http://localhost:3001

---

## Project Structure

```
Interactive Media Assignment/
├── frontend/          # p5.js projects and UI
│   ├── js/           # JavaScript files
│   ├── css/          # Styles
│   └── index.html    # Main HTML file
├── backend/          # Express.js API server
│   ├── api/          # API routes
│   └── utils/        # Database utilities
└── package.json      # Root package.json
```

---

## Available Scripts

### Root Level
- `npm run install:all` - Install all dependencies
- `npm run dev:frontend` - Start frontend dev server
- `npm run dev:backend` - Start backend dev server
- `npm run build` - Build both frontend and backend
- `npm run test` - Run all tests
- `npm run clean` - Remove all node_modules (Unix/Mac)
- `npm run clean:win` - Remove all node_modules (Windows)

### Frontend
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start with nodemon (auto-reload)
- `npm start` - Start production server
- `npm test` - Run backend tests

---

## Requirements

- **Node.js:** >= 18.0.0
- **npm:** >= 8.0.0 (or use individual install commands)

---

## Need Help?

1. Check that all dependencies are installed
2. Verify Node.js version: `node --version`
3. Check npm version: `npm --version`
4. Try cleaning and reinstalling:
   ```powershell
   npm run clean:win
   npm run install:all
   ```

