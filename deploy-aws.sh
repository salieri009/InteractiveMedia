#!/bin/bash

# ===============================================
# AWS SAM Deployment Script
# Interactive Media Assignment - AWS Serverless
# ===============================================

set -e  # Exit on any error

echo "🚀 Starting AWS SAM deployment..."

# Configuration
STACK_NAME="interactive-media-assignment"
REGION="us-east-1"
STAGE="prod"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check prerequisites
print_status "Checking prerequisites..."

if ! command -v sam &> /dev/null; then
    print_error "AWS SAM CLI is not installed. Please install it first."
    echo "Visit: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html"
    exit 1
fi

if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    echo "Visit: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

print_success "Prerequisites check passed!"

# Install dependencies
print_status "Installing backend dependencies..."
cd backend
npm install
cd ..
print_success "Dependencies installed!"

# Build the application
print_status "Building SAM application..."
sam build --template-file template.yaml

if [ $? -ne 0 ]; then
    print_error "SAM build failed!"
    exit 1
fi

print_success "Build completed!"

# Deploy the application
print_status "Deploying to AWS..."
print_warning "This will create AWS resources that may incur costs."

read -p "Do you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Deployment cancelled."
    exit 0
fi

# Deploy with SAM
sam deploy \
    --template-file .aws-sam/build/template.yaml \
    --stack-name $STACK_NAME \
    --parameter-overrides \
        Stage=$STAGE \
    --capabilities CAPABILITY_IAM \
    --region $REGION \
    --confirm-changeset \
    --resolve-s3

if [ $? -eq 0 ]; then
    print_success "Deployment successful!"
    
    # Get outputs
    print_status "Getting deployment outputs..."
    
    API_URL=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $REGION \
        --query 'Stacks[0].Outputs[?OutputKey==`InteractiveMediaApi`].OutputValue' \
        --output text)
    
    CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $REGION \
        --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDomainName`].OutputValue' \
        --output text)
    
    print_success "Deployment completed! 🎉"
    echo ""
    echo "📊 Deployment Information:"
    echo "  Stack Name: $STACK_NAME"
    echo "  Region: $REGION"
    echo "  Stage: $STAGE"
    echo ""
    echo "🔗 URLs:"
    echo "  API Endpoint: $API_URL"
    echo "  CloudFront URL: https://$CLOUDFRONT_URL"
    echo ""
    echo "🛠️  Next Steps:"
    echo "  1. Update frontend API URLs to use the deployed endpoint"
    echo "  2. Upload static files to S3 bucket"
    echo "  3. Test the deployed application"
    echo ""
    echo "💡 To deploy static files:"
    echo "  aws s3 sync . s3://\$BUCKET_NAME --exclude 'backend/*' --exclude '.git/*'"
    
else
    print_error "Deployment failed!"
    exit 1
fi
