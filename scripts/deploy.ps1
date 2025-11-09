#Requires -Version 5.0
<#
.SYNOPSIS
    Automated Deployment Script for Interactive Media Assignment (Windows PowerShell)
    
.DESCRIPTION
    This script:
    1. Builds the frontend with Vite
    2. Deploys backend infrastructure using AWS SAM
    3. Syncs frontend assets to S3
    4. Invalidates CloudFront cache
    
.EXAMPLE
    .\scripts\deploy.ps1
    .\scripts\deploy.ps1 -Stage dev
#>

param(
    [string]$Stage = "prod",
    [switch]$SkipBuild = $false
)

$ErrorActionPreference = "Stop"
$WarningPreference = "Continue"

# Color codes
function Write-Success { Write-Host "✅ $args" -ForegroundColor Green }
function Write-Error-Custom { Write-Host "❌ $args" -ForegroundColor Red; exit 1 }
function Write-Info { Write-Host "ℹ️  $args" -ForegroundColor Cyan }
function Write-Warn { Write-Host "⚠️  $args" -ForegroundColor Yellow }
function Write-Header { Write-Host "`n--- $args ---" -ForegroundColor Magenta }

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir

# Step 1: Build Frontend
Write-Header "Step 1: Building Frontend"
if (-not $SkipBuild) {
    try {
        Write-Info "Building frontend with Vite..."
        & npm -w frontend run build
        if ($LASTEXITCODE -ne 0) {
            Write-Error-Custom "Frontend build failed"
        }
        Write-Success "Frontend build completed"
    } catch {
        Write-Error-Custom "Frontend build error: $_"
    }
} else {
    Write-Warn "Skipping frontend build"
}

# Step 2: Deploy Infrastructure with SAM
Write-Header "Step 2: Deploying Infrastructure (SAM)"
$StackName = "interactive-media-$Stage"
$SamOutputFile = Join-Path $RootDir "sam-output.json"

try {
    Write-Info "Deploying AWS CloudFormation stack: $StackName"
    
    $SamCommand = @(
        "sam", "deploy",
        "--stack-name", $StackName,
        "--resolve-s3",
        "--capabilities", "CAPABILITY_IAM",
        "--parameter-overrides", "Stage=$Stage",
        "--output-file", $SamOutputFile
    )
    
    & $SamCommand[0] $SamCommand[1..($SamCommand.Length - 1)]
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "SAM deployment failed"
    }
    Write-Success "Infrastructure deployment completed"
} catch {
    Write-Error-Custom "SAM deployment error: $_"
}

# Step 3: Parse SAM outputs
Write-Header "Step 3: Retrieving Stack Outputs"
$S3BucketName = ""
$CloudFrontDistributionId = ""

try {
    Write-Info "Fetching CloudFormation stack outputs..."
    
    $StackOutputsJson = & aws cloudformation describe-stacks `
        --stack-name $StackName `
        --query "Stacks[0].Outputs" `
        --output json
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Failed to describe stack"
    }
    
    $Outputs = $StackOutputsJson | ConvertFrom-Json
    
    # Extract specific outputs
    $BucketOutput = $Outputs | Where-Object { $_.OutputKey -eq "StaticAssetsBucketName" } | Select-Object -First 1
    $DistributionOutput = $Outputs | Where-Object { $_.OutputKey -eq "CloudFrontDistributionId" } | Select-Object -First 1
    
    if ($BucketOutput) {
        $S3BucketName = $BucketOutput.OutputValue
        Write-Success "S3 Bucket: $S3BucketName"
    } else {
        Write-Error-Custom "Could not find StaticAssetsBucketName in stack outputs"
    }
    
    if ($DistributionOutput) {
        $CloudFrontDistributionId = $DistributionOutput.OutputValue
        Write-Success "CloudFront Distribution ID: $CloudFrontDistributionId"
    } else {
        Write-Error-Custom "Could not find CloudFrontDistributionId in stack outputs"
    }
} catch {
    Write-Error-Custom "Failed to retrieve stack outputs: $_"
}

# Step 4: Sync Frontend to S3
Write-Header "Step 4: Syncing Frontend to S3"
try {
    $FrontendDistPath = Join-Path $RootDir "frontend" "dist"
    
    if (-not (Test-Path $FrontendDistPath)) {
        Write-Error-Custom "Frontend dist directory not found: $FrontendDistPath"
    }
    
    Write-Info "Syncing $FrontendDistPath to s3://$S3BucketName/"
    & aws s3 sync $FrontendDistPath "s3://$S3BucketName/" `
        --delete `
        --cache-control "public, max-age=31536000, immutable"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "S3 sync failed"
    }
    Write-Success "Frontend assets synced to S3"
} catch {
    Write-Error-Custom "S3 sync error: $_"
}

# Step 5: Invalidate CloudFront Cache
Write-Header "Step 5: Invalidating CloudFront Cache"
try {
    Write-Info "Invalidating CloudFront distribution: $CloudFrontDistributionId"
    $InvalidationResult = & aws cloudfront create-invalidation `
        --distribution-id $CloudFrontDistributionId `
        --paths "/*" `
        --output json
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "CloudFront invalidation failed"
    }
    
    $Invalidation = $InvalidationResult | ConvertFrom-Json
    $InvalidationId = $Invalidation.Invalidation.Id
    
    Write-Success "CloudFront cache invalidation created: $InvalidationId"
    Write-Info "Cache will be cleared in 1-5 minutes"
} catch {
    Write-Error-Custom "CloudFront invalidation error: $_"
}

# Final Summary
Write-Header "Deployment Complete"
Write-Host @"
`n✅ Deployment successful!

📊 Deployment Summary:
  • Stage: $Stage
  • Stack Name: $StackName
  • S3 Bucket: $S3BucketName
  • CloudFront Distribution: $CloudFrontDistributionId
  • Frontend Location: s3://$S3BucketName/

🔗 Access your application:
  • CloudFront URL: https://$CloudFrontDistributionId.cloudfront.net

📝 Next steps:
  1. Test your application at the CloudFront URL
  2. Monitor CloudFormation events in AWS Console
  3. Check CloudWatch logs for any issues

💡 Tips:
  • To rollback: aws cloudformation cancel-update-stack --stack-name $StackName
  • To delete stack: aws cloudformation delete-stack --stack-name $StackName
  • To view logs: sam logs -n InteractiveMediaAPI --stack-name $StackName -t

"@ -ForegroundColor Green
