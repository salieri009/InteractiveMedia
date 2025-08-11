# ===============================================
# AWS SAM Deployment Script for Windows
# Interactive Media Assignment - AWS Serverless
# ===============================================

param(
    [string]$StackName = "interactive-media-assignment",
    [string]$Region = "us-east-1",
    [string]$Stage = "prod"
)

# Colors for output
$ErrorColor = "Red"
$SuccessColor = "Green"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $InfoColor
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $SuccessColor
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $WarningColor
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $ErrorColor
}

Write-Host "🚀 Starting AWS SAM deployment..." -ForegroundColor $InfoColor

# Check prerequisites
Write-Status "Checking prerequisites..."

# Check if SAM CLI is installed
try {
    $samVersion = sam --version
    Write-Success "SAM CLI found: $samVersion"
} catch {
    Write-ErrorMsg "AWS SAM CLI is not installed or not in PATH."
    Write-Host "Please install it from: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html"
    exit 1
}

# Check if AWS CLI is installed
try {
    $awsVersion = aws --version
    Write-Success "AWS CLI found: $awsVersion"
} catch {
    Write-ErrorMsg "AWS CLI is not installed or not in PATH."
    Write-Host "Please install it from: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html"
    exit 1
}

# Check AWS credentials
try {
    $awsIdentity = aws sts get-caller-identity 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "AWS credentials configured"
    } else {
        throw "AWS credentials not configured"
    }
} catch {
    Write-ErrorMsg "AWS credentials not configured. Please run 'aws configure' first."
    exit 1
}

# Install dependencies
Write-Status "Installing backend dependencies..."
Push-Location backend
try {
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "npm install failed"
    }
    Write-Success "Dependencies installed!"
} catch {
    Write-ErrorMsg "Failed to install dependencies: $_"
    Pop-Location
    exit 1
} finally {
    Pop-Location
}

# Build the application
Write-Status "Building SAM application..."
try {
    sam build --template-file template.yaml
    if ($LASTEXITCODE -ne 0) {
        throw "SAM build failed"
    }
    Write-Success "Build completed!"
} catch {
    Write-ErrorMsg "SAM build failed: $_"
    exit 1
}

# Deploy the application
Write-Status "Preparing to deploy to AWS..."
Write-Warning "This will create AWS resources that may incur costs."

$confirmation = Read-Host "Do you want to continue? (y/N)"
if ($confirmation -notmatch '^[Yy]$') {
    Write-Warning "Deployment cancelled."
    exit 0
}

# Deploy with SAM
Write-Status "Deploying to AWS..."
try {
    sam deploy `
        --template-file .aws-sam/build/template.yaml `
        --stack-name $StackName `
        --parameter-overrides Stage=$Stage `
        --capabilities CAPABILITY_IAM `
        --region $Region `
        --confirm-changeset `
        --resolve-s3

    if ($LASTEXITCODE -ne 0) {
        throw "SAM deployment failed"
    }

    Write-Success "Deployment successful!"
    
    # Get outputs
    Write-Status "Getting deployment outputs..."
    
    $apiUrl = aws cloudformation describe-stacks `
        --stack-name $StackName `
        --region $Region `
        --query 'Stacks[0].Outputs[?OutputKey==`InteractiveMediaApi`].OutputValue' `
        --output text

    $cloudFrontUrl = aws cloudformation describe-stacks `
        --stack-name $StackName `
        --region $Region `
        --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDomainName`].OutputValue' `
        --output text

    $s3Bucket = aws cloudformation describe-stacks `
        --stack-name $StackName `
        --region $Region `
        --query 'Stacks[0].Outputs[?OutputKey==`StaticAssetsBucketName`].OutputValue' `
        --output text

    Write-Success "Deployment completed! 🎉"
    Write-Host ""
    Write-Host "📊 Deployment Information:" -ForegroundColor $SuccessColor
    Write-Host "  Stack Name: $StackName"
    Write-Host "  Region: $Region"
    Write-Host "  Stage: $Stage"
    Write-Host ""
    Write-Host "🔗 URLs:" -ForegroundColor $SuccessColor
    Write-Host "  API Endpoint: $apiUrl"
    Write-Host "  CloudFront URL: https://$cloudFrontUrl"
    Write-Host ""
    Write-Host "🛠️  Next Steps:" -ForegroundColor $InfoColor
    Write-Host "  1. Update frontend API URLs to use the deployed endpoint"
    Write-Host "  2. Upload static files to S3 bucket: $s3Bucket"
    Write-Host "  3. Test the deployed application"
    Write-Host ""
    Write-Host "💡 To deploy static files:" -ForegroundColor $InfoColor
    Write-Host "  aws s3 sync . s3://$s3Bucket --exclude 'backend/*' --exclude '.git/*' --exclude '*.sh' --exclude '*.ps1'"
    
    # Save deployment info to file
    $deploymentInfo = @{
        StackName = $StackName
        Region = $Region
        Stage = $Stage
        ApiUrl = $apiUrl
        CloudFrontUrl = "https://$cloudFrontUrl"
        S3Bucket = $s3Bucket
        DeployedAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss UTC"
    }
    
    $deploymentInfo | ConvertTo-Json | Out-File -FilePath "deployment-info.json" -Encoding UTF8
    Write-Success "Deployment information saved to deployment-info.json"
    
} catch {
    Write-ErrorMsg "Deployment failed: $_"
    exit 1
}
