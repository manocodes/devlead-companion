# GitHub Actions Cloud Run - Quick Reference

## Essential Setup Commands

### 1. Set Variables
```bash
export PROJECT_ID=devlead-companion
export GITHUB_REPO="YOUR_GITHUB_USERNAME/devlead-companion"
export PROJECT_NUMBER=$(gcloud projects describe ${PROJECT_ID} --format='value(projectNumber)')
```

### 2. Create Workload Identity Pool & Provider
```bash
# Create pool
gcloud iam workload-identity-pools create "github-pool" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --display-name="GitHub Actions Pool"

# Create provider
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"
```

### 3. Create Service Account & Grant Permissions
```bash
# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Service Account"

# Grant permissions
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

### 4. Link Workload Identity to Service Account
```bash
gcloud iam service-accounts add-iam-policy-binding \
  "github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --project="${PROJECT_ID}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-pool/attribute.repository/${GITHUB_REPO}"
```

### 5. Get Values for GitHub Secrets
```bash
# Workload Identity Provider
gcloud iam workload-identity-pools providers describe "github-provider" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --format="value(name)"

# Service Account Email
echo "github-actions@${PROJECT_ID}.iam.gserviceaccount.com"

# Cloud SQL Connection Name
gcloud sql instances describe devlead-db-instance --format="value(connectionName)"
```

## GitHub Secrets to Add

| Secret Name | Command to Get Value |
|------------|---------------------|
| `GCP_PROJECT_ID` | `echo ${PROJECT_ID}` |
| `GCP_REGION` | `echo "us-central1"` |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | See command in step 5 above |
| `GCP_SERVICE_ACCOUNT` | `echo "github-actions@${PROJECT_ID}.iam.gserviceaccount.com"` |
| `DB_PASSWORD` | Your database password |
| `CLOUD_SQL_CONNECTION_NAME` | See command in step 5 above |

## Deployment URLs

```bash
# Get backend URL
gcloud run services describe devlead-backend \
  --region=us-central1 \
  --format="value(status.url)"

# Get frontend URL
gcloud run services describe devlead-frontend \
  --region=us-central1 \
  --format="value(status.url)"
```

## Troubleshooting

```bash
# View Cloud Run logs
gcloud run logs read devlead-backend --region=us-central1 --limit=50
gcloud run logs read devlead-frontend --region=us-central1 --limit=50

# List workload identity pools
gcloud iam workload-identity-pools list --location=global

# Check service account permissions
gcloud projects get-iam-policy ${PROJECT_ID} \
  --flatten="bindings[].members" \
  --filter="bindings.members:github-actions@*"
```
