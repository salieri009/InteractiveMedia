# ⚡ Quick Start Guide

## Fix the Errors - Step by Step

### Step 1: Install Dependencies

**Run this command in PowerShell:**
```powershell
npm run setup
```

**Or install manually:**
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

### Step 2: Start Development Server

**For Frontend (p5.js projects):**
```powershell
npm run dev:frontend
```

**Or:**
```powershell
cd frontend
npm run dev
```

This will start Vite dev server at http://localhost:5173

### Step 3: Open in Browser

Open http://localhost:5173 in your browser to see your projects!

---

## Common Issues Fixed

### ✅ Error: 'vite' is not recognized
**Solution:** Dependencies not installed. Run `npm run setup` first.

### ✅ Error: Unknown command "workspaces"  
**Solution:** Fixed! Now using individual commands that work on all npm versions.

### ✅ Error: Infinite install loop
**Solution:** Fixed! Removed problematic install script.

---

## What Was Fixed

1. **Removed npm workspaces dependency** - Now uses simple `cd` commands
2. **Fixed infinite install loop** - Removed recursive install script
3. **Created setup script** - Cross-platform dependency installer
4. **PowerShell compatible** - All commands work in PowerShell

---

## Available Commands

```powershell
npm run setup          # Install all dependencies
npm run dev:frontend   # Start frontend dev server
npm run dev:backend    # Start backend dev server
npm run clean          # Remove all node_modules
```

---

## Need More Help?

See `SETUP.md` for detailed instructions.

