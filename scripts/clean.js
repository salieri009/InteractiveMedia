/**
 * Clean script to remove node_modules and build artifacts
 * Works on both Windows and Unix systems
 */

const fs = require('fs');
const path = require('path');

const rootDir = __dirname.replace(/[\\/]scripts$/, '');

function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Removed: ${dirPath}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to remove ${dirPath}:`, error.message);
      return false;
    }
  }
  return true;
}

console.log('🧹 Cleaning project...\n');

// Remove root node_modules
removeDir(path.join(rootDir, 'node_modules'));

// Remove frontend node_modules and dist
removeDir(path.join(rootDir, 'frontend', 'node_modules'));
removeDir(path.join(rootDir, 'frontend', 'dist'));

// Remove backend node_modules
removeDir(path.join(rootDir, 'backend', 'node_modules'));

console.log('\n✅ Clean complete!');
console.log('📝 Run "npm run setup" to reinstall dependencies\n');

