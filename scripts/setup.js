/**
 * Setup script to install all dependencies
 * Works on both Windows and Unix systems
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting setup...\n');

// Check if Node.js is available
try {
  execSync('node --version', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Node.js is not installed or not in PATH');
  process.exit(1);
}

// Check if npm is available
try {
  execSync('npm --version', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ npm is not installed or not in PATH');
  process.exit(1);
}

const rootDir = __dirname.replace(/[\\/]scripts$/, '');
const frontendDir = path.join(rootDir, 'frontend');
const backendDir = path.join(rootDir, 'backend');

// Install root dependencies
console.log('\n📦 Installing root dependencies...');
try {
  execSync('npm install', { 
    cwd: rootDir, 
    stdio: 'inherit' 
  });
  console.log('✅ Root dependencies installed\n');
} catch (error) {
  console.error('❌ Failed to install root dependencies');
  process.exit(1);
}

// Install frontend dependencies
if (fs.existsSync(frontendDir)) {
  console.log('📦 Installing frontend dependencies...');
  try {
    execSync('npm install', { 
      cwd: frontendDir, 
      stdio: 'inherit' 
    });
    console.log('✅ Frontend dependencies installed\n');
  } catch (error) {
    console.error('❌ Failed to install frontend dependencies');
    process.exit(1);
  }
} else {
  console.warn('⚠️ Frontend directory not found');
}

// Install backend dependencies
if (fs.existsSync(backendDir)) {
  console.log('📦 Installing backend dependencies...');
  try {
    execSync('npm install', { 
      cwd: backendDir, 
      stdio: 'inherit' 
    });
    console.log('✅ Backend dependencies installed\n');
  } catch (error) {
    console.error('❌ Failed to install backend dependencies');
    process.exit(1);
  }
} else {
  console.warn('⚠️ Backend directory not found');
}

console.log('✅ Setup complete!\n');
console.log('📝 Next steps:');
console.log('   Frontend: npm run dev:frontend');
console.log('   Backend:  npm run dev:backend');
console.log('   Both:     npm run dev:frontend (in one terminal)');
console.log('            npm run dev:backend (in another terminal)\n');

