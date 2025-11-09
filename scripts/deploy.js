#!/usr/bin/env node

/**
 * Automated Deployment Script for Interactive Media Assignment
 * 
 * This script:
 * 1. Builds the frontend with Vite
 * 2. Deploys backend infrastructure using AWS SAM
 * 3. Syncs frontend assets to S3
 * 4. Invalidates CloudFront cache
 * 
 * Usage: npm run deploy:prod
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, 'red');
  process.exit(1);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function warn(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Step 1: Build Frontend
log('\n--- Step 1: Building Frontend ---', 'bright');
try {
  info('Building frontend with Vite...');
  execSync('npm -w frontend run build', { stdio: 'inherit' });
  success('Frontend build completed');
} catch (err) {
  error('Frontend build failed');
}

// Step 2: Deploy Infrastructure with SAM
log('\n--- Step 2: Deploying Infrastructure (SAM) ---', 'bright');
let stackName = 'interactive-media-prod';
let samOutputFile = path.join(__dirname, '..', 'sam-output.json');

try {
  info(`Deploying AWS CloudFormation stack: ${stackName}`);
  
  // Run SAM deploy and capture output
  const samCommand = `sam deploy --stack-name ${stackName} --resolve-s3 --capabilities CAPABILITY_IAM --parameter-overrides Stage=prod --output-file "${samOutputFile}"`;
  
  execSync(samCommand, { stdio: 'inherit' });
  success('Infrastructure deployment completed');
} catch (err) {
  error('SAM deployment failed');
}

// Step 3: Parse SAM outputs
log('\n--- Step 3: Retrieving Stack Outputs ---', 'bright');
let s3BucketName = '';
let cloudFrontDistributionId = '';

try {
  info('Fetching CloudFormation stack outputs...');
  
  // Use AWS CLI to get stack outputs
  const describeStackCommand = `aws cloudformation describe-stacks --stack-name ${stackName} --query "Stacks[0].Outputs" --output json`;
  const stackOutputsJson = execSync(describeStackCommand, { encoding: 'utf-8' });
  
  const outputs = JSON.parse(stackOutputsJson);
  
  // Extract specific outputs
  const bucketOutput = outputs.find(o => o.OutputKey === 'StaticAssetsBucketName');
  const distributionOutput = outputs.find(o => o.OutputKey === 'CloudFrontDistributionId');
  
  if (bucketOutput) {
    s3BucketName = bucketOutput.OutputValue;
    success(`S3 Bucket: ${s3BucketName}`);
  } else {
    error('Could not find StaticAssetsBucketName in stack outputs');
  }
  
  if (distributionOutput) {
    cloudFrontDistributionId = distributionOutput.OutputValue;
    success(`CloudFront Distribution ID: ${cloudFrontDistributionId}`);
  } else {
    error('Could not find CloudFrontDistributionId in stack outputs');
  }
} catch (err) {
  error(`Failed to retrieve stack outputs: ${err.message}`);
}

// Step 4: Sync Frontend to S3
log('\n--- Step 4: Syncing Frontend to S3 ---', 'bright');
try {
  const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
  
  if (!fs.existsSync(frontendDistPath)) {
    error(`Frontend dist directory not found: ${frontendDistPath}`);
  }
  
  info(`Syncing ${frontendDistPath} to s3://${s3BucketName}/`);
  execSync(`aws s3 sync "${frontendDistPath}" s3://${s3BucketName}/ --delete --cache-control "public, max-age=31536000, immutable"`, { stdio: 'inherit' });
  success('Frontend assets synced to S3');
} catch (err) {
  error(`S3 sync failed: ${err.message}`);
}

// Step 5: Invalidate CloudFront Cache
log('\n--- Step 5: Invalidating CloudFront Cache ---', 'bright');
try {
  info(`Invalidating CloudFront distribution: ${cloudFrontDistributionId}`);
  const invalidationResult = execSync(`aws cloudfront create-invalidation --distribution-id ${cloudFrontDistributionId} --paths "/*" --output json`, { encoding: 'utf-8' });
  
  const invalidation = JSON.parse(invalidationResult);
  const invalidationId = invalidation.Invalidation.Id;
  
  success(`CloudFront cache invalidation created: ${invalidationId}`);
  info('Cache will be cleared in 1-5 minutes');
} catch (err) {
  error(`CloudFront invalidation failed: ${err.message}`);
}

// Final Summary
log('\n--- Deployment Complete ---', 'bright');
console.log(`
${colors.green}✅ Deployment successful!${colors.reset}

📊 Deployment Summary:
  • Stack Name: ${stackName}
  • S3 Bucket: ${s3BucketName}
  • CloudFront Distribution: ${cloudFrontDistributionId}
  • Frontend Location: s3://${s3BucketName}/

🔗 Access your application:
  • CloudFront URL: https://${cloudFrontDistributionId}.cloudfront.net

📝 Next steps:
  1. Test your application at the CloudFront URL
  2. Monitor CloudFormation events
  3. Check CloudWatch logs for any issues

💡 Tips:
  • To rollback: aws cloudformation cancel-update-stack --stack-name ${stackName}
  • To delete stack: aws cloudformation delete-stack --stack-name ${stackName}
  • To view logs: sam logs -n InteractiveMediaAPI --stack-name ${stackName} -t
`);
