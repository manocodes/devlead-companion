# GitHub Actions Cloud Run Deployment Setup Guide

This guide walks you through setting up automated deployments to Google Cloud Run using GitHub Actions for your frontend and backend applications.

## Overview

You'll set up:
- ✅ **Automated deployments** triggered on push to `main` branch
- ✅ **Workload Identity Federation** for secure authentication (no service account keys!)
- ✅ **Separate workflows** for frontend and backend
- ✅ **Reuse existing Cloud SQL PostgreSQL database**

---

## Prerequisites

Before starting, ensure you have:
- [x] GCP project created (e.g., `devlead-companion`)
- [x] Cloud SQL PostgreSQL instance running
- [x] GitHub repository for your code
- [x] `gcloud` CLI installed locally

---

## Part 1: Enable Required GCP APIs

```bash
# Set your project ID
export PROJECT_ID=devlead-companion

# Set the project
gcloud config set project ${PROJECT_ID}

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable iamcredentials.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

---

## Part 2: Create Artifact Registry Repository

```bash
# Create repository for Docker images
gcloud artifacts repositories create devlead-repo \
  --repository-format=docker \
  --location=us-central1 \
  --description="DevLead Companion Docker images"
```

---

## Part 3: Set Up Workload Identity Federation

This allows GitHub Actions to authenticate with GCP securely without storing service account keys.

### Step 3.1: Create Workload Identity Pool

```bash
# Create the pool
gcloud iam workload-identity-pools create "github-pool" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --display-name="GitHub Actions Pool"
```

### Step 3.2: Create Workload Identity Provider

```bash
# Replace YOUR_GITHUB_USERNAME with your actual GitHub username
export GITHUB_REPO="YOUR_GITHUB_USERNAME/devlead-companion"

gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"
```

### Step 3.3: Create Service Account

```bash
# Create service account for GitHub Actions
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Service Account"

# Get your project number
export PROJECT_NUMBER=$(gcloud projects describe ${PROJECT_ID} --format='value(projectNumber)')

# Grant necessary permissions to the service account
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

### Step 3.4: Allow GitHub Actions to Impersonate Service Account

```bash
# Allow the workload identity pool to impersonate the service account
gcloud iam service-accounts add-iam-policy-binding \
  "github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --project="${PROJECT_ID}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-pool/attribute.repository/${GITHUB_REPO}"
```

### Step 3.5: Get Workload Identity Provider Name

```bash
# Get the full workload identity provider name
gcloud iam workload-identity-pools providers describe "github-provider" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --format="value(name)"

# Save this output! It looks like:
# projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/providers/github-provider
```

---

## Part 4: Configure GitHub Repository Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add the following secrets:

| Secret Name | Value | Example |
|------------|-------|---------|
| `GCP_PROJECT_ID` | Your GCP project ID | `devlead-companion` |
| `GCP_REGION` | Your deployment region | `us-central1` |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Full provider name from Step 3.5 | `projects/123.../github-provider` |
| `GCP_SERVICE_ACCOUNT` | Service account email | `github-actions@devlead-companion.iam.gserviceaccount.com` |
| `DB_PASSWORD` | Your database password | `your-secure-password` |
| `CLOUD_SQL_CONNECTION_NAME` | Cloud SQL connection name | `devlead-companion:us-central1:devlead-db-instance` |

> [!TIP]
> Get your Cloud SQL connection name with:
> ```bash
> gcloud sql instances describe devlead-db-instance --format="value(connectionName)"
> ```

---

## Part 5: Add GitHub Actions Workflows

The workflows have been created in `.github/workflows/`:
- `deploy-backend.yml` - Deploys backend to Cloud Run
- `deploy-frontend.yml` - Deploys frontend to Cloud Run

### Workflow Features

Both workflows:
- ✅ Trigger on push to `main` branch
- ✅ Use Workload Identity Federation for authentication
- ✅ Build Docker images
- ✅ Push to Artifact Registry
- ✅ Deploy to Cloud Run
- ✅ Output deployment URLs

---

## Part 6: First Deployment

### Step 6.1: Push to GitHub

```bash
# Commit the workflow files
git add .github/workflows/
git commit -m "Add GitHub Actions deployment workflows"
git push origin main
```

### Step 6.2: Monitor Deployment

1. Go to your GitHub repository
2. Click **Actions** tab
3. Watch the workflows run
4. Check for any errors

### Step 6.3: Get Deployment URLs

After successful deployment, get your service URLs:

```bash
# Backend URL
gcloud run services describe devlead-backend \
  --region=us-central1 \
  --format="value(status.url)"

# Frontend URL
gcloud run services describe devlead-frontend \
  --region=us-central1 \
  --format="value(status.url)"
```

---

## Part 7: Update Frontend to Use Backend URL

After the backend is deployed, you need to update the frontend to point to the correct backend URL.

### Option A: Update and Redeploy

1. Get backend URL from Step 6.3
2. Update frontend environment configuration
3. Push changes to trigger redeployment

### Option B: Use GitHub Secrets

Add `VITE_API_URL` as a GitHub secret and reference it in the workflow build args.

---

## Troubleshooting

### Authentication Errors

If you see authentication errors:

```bash
# Verify workload identity pool exists
gcloud iam workload-identity-pools list --location=global

# Verify provider exists
gcloud iam workload-identity-pools providers list \
  --workload-identity-pool=github-pool \
  --location=global

# Check service account permissions
gcloud projects get-iam-policy ${PROJECT_ID} \
  --flatten="bindings[].members" \
  --filter="bindings.members:github-actions@*"
```

### Build Failures

Check the GitHub Actions logs for specific errors. Common issues:
- Missing Dockerfile
- Build context issues
- Dependency installation failures

### Deployment Failures

```bash
# Check Cloud Run logs
gcloud run logs read devlead-backend --region=us-central1 --limit=50
gcloud run logs read devlead-frontend --region=us-central1 --limit=50
```

### Database Connection Issues

Verify:
- Cloud SQL instance is running
- Connection name is correct in secrets
- Database credentials are correct
- Service account has Cloud SQL Client role

---

## Next Steps

1. ✅ Set up custom domain names
2. ✅ Configure environment-specific deployments (staging/production)
3. ✅ Add automated tests to workflows
4. ✅ Set up monitoring and alerting
5. ✅ Implement database migration automation

---

## Cost Optimization

- **Cloud Run**: Scales to zero when not in use (only pay for requests)
- **Artifact Registry**: First 0.5 GB storage is free
- **Cloud SQL**: Consider `db-f1-micro` tier for development

Set up budget alerts in GCP Console to monitor costs!

---

## Security Best Practices

> [!IMPORTANT]
> - Never commit service account keys to GitHub
> - Use Secret Manager for sensitive data
> - Regularly rotate database passwords
> - Review IAM permissions periodically

> [!WARNING]
> The workflows use `--allow-unauthenticated` for public access. Remove this flag if you need authentication.
