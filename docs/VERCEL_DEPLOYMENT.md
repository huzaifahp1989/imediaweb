# Vercel Auto-Deployment Setup

This repository is configured to automatically deploy to Vercel after every push to the `main` branch.

## Required GitHub Secrets

To enable automatic deployment, you need to configure the following secrets in your GitHub repository:

### 1. VERCEL_TOKEN
Your Vercel authentication token.

**How to get it:**
1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Click "Create" to create a new token
3. Give it a name (e.g., "GitHub Actions")
4. Copy the generated token

### 2. VERCEL_ORG_ID
Your Vercel organization/team ID.

**How to get it:**
1. Run `npm i -g vercel` (if not already installed)
2. Run `vercel login` and authenticate
3. Navigate to your project directory
4. Run `vercel link` to link the project
5. Check the `.vercel/project.json` file for the `orgId`

Alternatively, you can find it in your Vercel team settings URL: `https://vercel.com/teams/[YOUR_ORG_ID]` (Note: This applies to team/organization accounts. For personal accounts, use the CLI method above or check your dashboard settings.)

### 3. VERCEL_PROJECT_ID
Your Vercel project ID.

**How to get it:**
1. After running `vercel link` (from step 2 above)
2. Check the `.vercel/project.json` file for the `projectId`

Alternatively:
1. Go to your project settings in Vercel dashboard
2. The project ID is in the URL: `https://vercel.com/[org]/[project]/settings`
3. Or find it in Project Settings → General

## Setting up the secrets in GitHub

1. Go to your GitHub repository
2. Click on "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add each of the three secrets mentioned above

## How the deployment works

The deployment workflow (`.github/workflows/vercel-deploy.yml`) automatically:
1. Triggers on every push to the `main` branch
2. Checks out the code
3. Sets up Node.js environment
4. Installs dependencies
5. Builds the project
6. Deploys to Vercel production

You can also manually trigger the deployment from the "Actions" tab in GitHub by clicking "Run workflow" on the "Deploy to Vercel" workflow.

## Verifying deployment

After a successful deployment, you can:
1. Check the Actions tab in GitHub to see the deployment status
2. Visit your Vercel dashboard to see the deployment
3. Access your production URL provided by Vercel
