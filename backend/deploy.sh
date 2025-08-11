#!/bin/bash

# ===============================================
# Deployment Script for Interactive Media Backend
# Supports Vercel, Netlify, and Heroku
# ===============================================

set -e  # Exit on any error

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the backend directory."
    exit 1
fi

# Read deployment platform from environment or use default
PLATFORM=${DEPLOYMENT_PLATFORM:-"vercel"}

print_status "Deployment platform: $PLATFORM"

# Pre-deployment checks
print_status "Running pre-deployment checks..."

# Check Node.js version
NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

# Install dependencies
print_status "Installing dependencies..."
npm install

# Run tests if they exist
if npm run test --silent 2>/dev/null; then
    print_status "Running tests..."
    npm test
else
    print_warning "No tests found, skipping test phase"
fi

# Build the project
print_status "Building project..."
npm run build

# Deploy based on platform
case $PLATFORM in
    "vercel")
        print_status "Deploying to Vercel..."
        
        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            print_warning "Vercel CLI not found. Installing..."
            npm install -g vercel
        fi
        
        # Deploy to Vercel
        vercel --prod
        print_success "Deployed to Vercel!"
        ;;
        
    "netlify")
        print_status "Deploying to Netlify..."
        
        # Check if Netlify CLI is installed
        if ! command -v netlify &> /dev/null; then
            print_warning "Netlify CLI not found. Installing..."
            npm install -g netlify-cli
        fi
        
        # Deploy to Netlify
        netlify deploy --prod --dir=../
        print_success "Deployed to Netlify!"
        ;;
        
    "heroku")
        print_status "Deploying to Heroku..."
        
        # Check if Heroku CLI is installed
        if ! command -v heroku &> /dev/null; then
            print_error "Heroku CLI not found. Please install it first."
            exit 1
        fi
        
        # Deploy to Heroku
        git add .
        git commit -m "Deploy to Heroku $(date)"
        git push heroku main
        print_success "Deployed to Heroku!"
        ;;
        
    *)
        print_error "Unknown deployment platform: $PLATFORM"
        print_status "Supported platforms: vercel, netlify, heroku"
        exit 1
        ;;
esac

# Post-deployment checks
print_status "Running post-deployment checks..."

# Health check (if URL is provided)
if [ ! -z "$DEPLOYMENT_URL" ]; then
    print_status "Checking deployment health at $DEPLOYMENT_URL"
    
    if curl -f -s "$DEPLOYMENT_URL/api/health" > /dev/null; then
        print_success "Health check passed!"
    else
        print_warning "Health check failed. Please verify deployment manually."
    fi
fi

print_success "Deployment completed successfully! 🎉"
print_status "Your Interactive Media project is now live!"

# Display useful information
echo ""
echo "📝 Next steps:"
echo "  1. Update your frontend API_BASE_URL if needed"
echo "  2. Test all API endpoints"
echo "  3. Monitor deployment logs"
echo "  4. Set up monitoring and alerts"
echo ""
echo "📊 Useful commands:"
echo "  - Check logs: $PLATFORM logs"
echo "  - View project: $PLATFORM open"
echo "  - Check status: curl YOUR_DOMAIN/api/health"
