---
description: Deploy frontend, backend, and database to GCP Cloud Run
---

# Deploy to Google Cloud Platform (Cloud Run + Cloud SQL)

This workflow guides you through deploying your application to GCP using:
- **Cloud Run** for frontend and backend (serverless containers)
- **Cloud SQL** for PostgreSQL database (managed database service)

## Prerequisites

1. **GCP Account**: You'll use `mano.net@gmail.com`
2. **gcloud CLI**: Install Google Cloud SDK
3. **Docker**: Already installed (using Rancher Desktop)
4. **Project Billing**: Ensure billing is enabled on your GCP project

---

## Part 1: Initial GCP Setup

### Step 1.1: Install Google Cloud SDK

```bash
# Install gcloud CLI (if not already installed)
brew install --cask google-cloud-sdk
```

### Step 1.2: Initialize gcloud and Login

```bash
# Login to your GCP account
gcloud auth login

# This will open a browser window - login with mano.net@gmail.com
```

### Step 1.3: Create a New GCP Project

```bash
# Create a new project (choose a unique project ID)
gcloud projects create devlead-companion --name="DevLead Companion"

# Set as active project
gcloud config set project devlead-companion

# Enable billing (you'll need to link a billing account via console)
# Visit: https://console.cloud.google.com/billing/linkedaccount?project=devlead-companion
```

### Step 1.4: Enable Required APIs

```bash
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Cloud SQL Admin API
gcloud services enable sqladmin.googleapis.com

# Enable Container Registry API
gcloud services enable containerregistry.googleapis.com

# Enable Artifact Registry API (recommended over Container Registry)
gcloud services enable artifactregistry.googleapis.com

# Enable Cloud Build API
gcloud services enable cloudbuild.googleapis.com
```

### Step 1.5: Set Default Region

```bash
# Set your preferred region (e.g., us-central1, us-west1, asia-southeast1)
gcloud config set run/region us-central1
```

---

## Part 2: Create Cloud SQL PostgreSQL Instance

### Step 2.1: Create Cloud SQL Instance

```bash
# Create PostgreSQL instance (this takes 5-10 minutes)
gcloud sql instances create devlead-db-instance \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=YOUR_SECURE_PASSWORD_HERE

# Note: db-f1-micro is the smallest/cheapest tier for testing
# For production, consider db-g1-small or higher
```

### Step 2.2: Create Database

```bash
# Create the database
gcloud sql databases create devlead-db \
  --instance=devlead-db-instance
```

### Step 2.3: Create Database User

```bash
# Create a user for your application
gcloud sql users create devlead-user \
  --instance=devlead-db-instance \
  --password=YOUR_APP_DB_PASSWORD_HERE
```

### Step 2.4: Get Connection Name

```bash
# Get the connection name (you'll need this later)
gcloud sql instances describe devlead-db-instance --format="value(connectionName)"

# Save this output - it looks like: PROJECT_ID:REGION:INSTANCE_NAME
# Example: devlead-companion:us-central1:devlead-db-instance
```

---

## Part 3: Setup Artifact Registry

### Step 3.1: Create Artifact Registry Repository

```bash
# Create a Docker repository in Artifact Registry
gcloud artifacts repositories create devlead-repo \
  --repository-format=docker \
  --location=us-central1 \
  --description="DevLead Companion Docker images"
```

### Step 3.2: Configure Docker Authentication

```bash
# Configure Docker to authenticate with Artifact Registry
gcloud auth configure-docker us-central1-docker.pkg.dev
```

---

## Part 4: Build and Push Docker Images

### Step 4.1: Set Environment Variables

```bash
# Set variables for easier commands
export PROJECT_ID=devlead-companion
export REGION=us-central1
export REPO=devlead-repo
```

### Step 4.2: Build and Push Backend Image

```bash
# Navigate to project root
cd /Users/JN9THQT/Development/devlead-companion

# Build backend image
docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/backend:latest ./backend

# Push to Artifact Registry
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/backend:latest
```

### Step 4.3: Build and Push Frontend Image

```bash
# Build frontend image
docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/frontend:latest ./frontend

# Push to Artifact Registry
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/frontend:latest
```

---

## Part 5: Deploy Backend to Cloud Run

### Step 5.1: Deploy Backend Service

```bash
# Deploy backend with Cloud SQL connection
gcloud run deploy devlead-backend \
  --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/backend:latest \
  --platform=managed \
  --region=${REGION} \
  --allow-unauthenticated \
  --add-cloudsql-instances=devlead-companion:us-central1:devlead-db-instance \
  --set-env-vars="DB_HOST=/cloudsql/devlead-companion:us-central1:devlead-db-instance" \
  --set-env-vars="DB_PORT=5432" \
  --set-env-vars="DB_USERNAME=devlead-user" \
  --set-env-vars="DB_PASSWORD=YOUR_APP_DB_PASSWORD_HERE" \
  --set-env-vars="DB_NAME=devlead-db" \
  --set-env-vars="NODE_ENV=production" \
  --port=3000 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10

# Save the backend URL from the output (e.g., https://devlead-backend-xxx-uc.a.run.app)
```

### Step 5.2: Get Backend URL

```bash
# Get the backend service URL
gcloud run services describe devlead-backend \
  --region=${REGION} \
  --format="value(status.url)"

# Save this URL - you'll need it for the frontend
```

---

## Part 6: Deploy Frontend to Cloud Run

### Step 6.1: Update Frontend Environment Variables

Before deploying the frontend, you need to update it to point to your backend URL.

**Option A: Rebuild with Backend URL**

Update your frontend build to include the backend URL, then rebuild and push:

```bash
# Set backend URL
export BACKEND_URL=https://devlead-backend-xxx-uc.a.run.app

# Rebuild frontend with backend URL
docker build \
  --build-arg VITE_API_URL=${BACKEND_URL} \
  -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/frontend:latest \
  ./frontend

# Push updated image
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/frontend:latest
```

**Option B: Use Runtime Environment Variables**

If your frontend uses runtime environment variables, you can set them during deployment.

### Step 6.2: Deploy Frontend Service

```bash
# Deploy frontend
gcloud run deploy devlead-frontend \
  --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/frontend:latest \
  --platform=managed \
  --region=${REGION} \
  --allow-unauthenticated \
  --port=80 \
  --memory=256Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10

# Save the frontend URL from the output
```

### Step 6.3: Get Frontend URL

```bash
# Get the frontend service URL
gcloud run services describe devlead-frontend \
  --region=${REGION} \
  --format="value(status.url)"

# This is your application URL!
```

---

## Part 7: Configure CORS (if needed)

If your frontend and backend are on different domains, you may need to configure CORS in your NestJS backend.

The backend code should already handle CORS, but verify the allowed origins include your frontend URL.

---

## Part 8: Run Database Migrations

### Step 8.1: Connect to Cloud SQL via Cloud SQL Proxy

```bash
# Download Cloud SQL Proxy
curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.darwin.amd64
chmod +x cloud-sql-proxy

# Start proxy (in a separate terminal)
./cloud-sql-proxy devlead-companion:us-central1:devlead-db-instance
```

### Step 8.2: Run Migrations from Local Machine

```bash
# In another terminal, navigate to backend
cd /Users/JN9THQT/Development/devlead-companion/backend

# Set environment variables for local connection
export DB_HOST=127.0.0.1
export DB_PORT=5432
export DB_USERNAME=devlead-user
export DB_PASSWORD=YOUR_APP_DB_PASSWORD_HERE
export DB_NAME=devlead-db

# Run migrations
npm run typeorm migration:run
```

**Alternative: Run migrations from Cloud Run**

You can also create a one-off Cloud Run job to run migrations:

```bash
# Deploy migration job
gcloud run jobs create devlead-migrations \
  --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/backend:latest \
  --region=${REGION} \
  --add-cloudsql-instances=devlead-companion:us-central1:devlead-db-instance \
  --set-env-vars="DB_HOST=/cloudsql/devlead-companion:us-central1:devlead-db-instance" \
  --set-env-vars="DB_PORT=5432" \
  --set-env-vars="DB_USERNAME=devlead-user" \
  --set-env-vars="DB_PASSWORD=YOUR_APP_DB_PASSWORD_HERE" \
  --set-env-vars="DB_NAME=devlead-db" \
  --command="npm" \
  --args="run,typeorm,migration:run"

# Execute the job
gcloud run jobs execute devlead-migrations --region=${REGION}
```

---

## Part 9: Verify Deployment

### Step 9.1: Test Backend

```bash
# Test backend health endpoint
curl https://devlead-backend-xxx-uc.a.run.app/health

# Or test a specific endpoint
curl https://devlead-backend-xxx-uc.a.run.app/api/organizations
```

### Step 9.2: Test Frontend

Open your frontend URL in a browser:
```
https://devlead-frontend-xxx-uc.a.run.app
```

---

## Part 10: Update and Redeploy

When you make changes to your code:

```bash
# 1. Rebuild the image
docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/backend:latest ./backend

# 2. Push to registry
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/backend:latest

# 3. Deploy new revision (Cloud Run will automatically pull the latest image)
gcloud run deploy devlead-backend \
  --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/backend:latest \
  --region=${REGION}

# Same process for frontend
```

---

## Cost Optimization Tips

1. **Cloud Run**: Only charged when requests are being processed (scales to zero)
2. **Cloud SQL**: 
   - Use `db-f1-micro` for development/testing
   - Consider stopping the instance when not in use: `gcloud sql instances patch devlead-db-instance --activation-policy=NEVER`
   - Start it again: `gcloud sql instances patch devlead-db-instance --activation-policy=ALWAYS`
3. **Set up budget alerts** in GCP Console to monitor costs

---

## Troubleshooting

### Backend can't connect to database

- Verify Cloud SQL instance is running: `gcloud sql instances list`
- Check connection name is correct in `--add-cloudsql-instances`
- Verify DB credentials are correct

### Frontend can't reach backend

- Check CORS configuration in backend
- Verify backend URL is correctly set in frontend build
- Check backend logs: `gcloud run logs read devlead-backend --region=${REGION}`

### View Logs

```bash
# Backend logs
gcloud run logs read devlead-backend --region=${REGION} --limit=50

# Frontend logs
gcloud run logs read devlead-frontend --region=${REGION} --limit=50
```

---

## Security Best Practices

1. **Use Secret Manager** for sensitive data instead of environment variables:
   ```bash
   # Create secret
   echo -n "YOUR_DB_PASSWORD" | gcloud secrets create db-password --data-file=-
   
   # Grant Cloud Run access
   gcloud secrets add-iam-policy-binding db-password \
     --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   
   # Use in Cloud Run
   gcloud run deploy devlead-backend \
     --set-secrets="DB_PASSWORD=db-password:latest"
   ```

2. **Restrict Cloud Run access** (remove `--allow-unauthenticated` for internal services)

3. **Use Cloud Armor** for DDoS protection

4. **Enable Cloud SQL SSL** for encrypted connections

---

## Next Steps

1. Set up CI/CD with Cloud Build or GitHub Actions
2. Configure custom domain names
3. Set up monitoring and alerting
4. Implement backup strategy for Cloud SQL
5. Consider using Cloud CDN for frontend static assets
