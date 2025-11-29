# Google Cloud Monitoring Guide

This guide walks you through setting up Google Cloud Monitoring to track metrics, visualize performance, and create alerts for your `devlead-companion` application.

## Prerequisites

- Application deployed to Cloud Run (backend and frontend)
- Access to GCP Console with appropriate permissions

---

## 1. Enable Cloud Monitoring

Cloud Monitoring is typically enabled by default, but let's verify:

1. Go to the [GCP Console](https://console.cloud.google.com/)
2. Select your project: `devlead-companion`
3. Navigate to **Monitoring** (search for "Monitoring" in the top search bar)
4. If prompted, click **Enable Monitoring**
5. Wait for the workspace to be created (~1-2 minutes)

---

## 2. View Automatic Metrics

Cloud Run automatically provides several metrics out of the box:

### Step 2.1: Navigate to Cloud Run Metrics

1. Go to **Cloud Run** in the GCP Console
2. Click on your service (e.g., `devlead-backend`)
3. Click the **METRICS** tab

### Step 2.2: Available Metrics

You'll see charts for:
- **Request count**: Total requests over time
- **Request latencies**: P50, P95, P99 response times
- **Container instance count**: Number of running instances
- **Billable container instance time**: Cost-related metric
- **Container CPU utilization**: CPU usage percentage
- **Container memory utilization**: Memory usage percentage

---

## 3. Create Custom Dashboards

Dashboards let you visualize multiple metrics in one place.

### Step 3.1: Create a Dashboard

1. Navigate to **Monitoring** > **Dashboards**
2. Click **+ CREATE DASHBOARD**
3. Name it: `DevLead Companion - Production`
4. Click **Add Widget** or **Add Chart**

### Step 3.2: Add Request Count Chart

1. Click **Line** chart type
2. In the **Metric** selector:
   - **Resource type**: `Cloud Run Revision`
   - **Metric**: `Request count`
   - **Filter**: `service_name = devlead-backend`
3. Click **Apply**
4. Set **Title**: `Backend Request Count`
5. Click **Save**

### Step 3.3: Add Response Latency Chart

1. Click **+ ADD WIDGET** > **Line**
2. In the **Metric** selector:
   - **Resource type**: `Cloud Run Revision`
   - **Metric**: `Request latencies`
   - **Filter**: `service_name = devlead-backend`
3. Under **Aggregation**:
   - **Aligner**: `50th percentile` (for P50)
4. Click **Apply**
5. Set **Title**: `Backend Response Latency (P50)`
6. Click **Save**

### Step 3.4: Add Error Rate Chart

1. Click **+ ADD WIDGET** > **Scorecard**
2. In the **Metric** selector:
   - **Resource type**: `Cloud Run Revision`
   - **Metric**: `Request count`
   - **Filter**: `service_name = devlead-backend AND response_code_class = "5xx"`
3. Click **Apply**
4. Set **Title**: `5xx Errors (Last Hour)`
5. Click **Save**

### Step 3.5: Add CPU Utilization Chart

1. Click **+ ADD WIDGET** > **Line**
2. In the **Metric** selector:
   - **Resource type**: `Cloud Run Revision`
   - **Metric**: `Container CPU utilization`
   - **Filter**: `service_name = devlead-backend`
3. Click **Apply**
4. Set **Title**: `Backend CPU Usage`
5. Click **Save**

### Step 3.6: Repeat for Frontend

Repeat steps 3.2-3.5 for the frontend service (`devlead-frontend`).

---

## 4. Create Custom Metrics (Optional)

If you want to track application-specific metrics (e.g., user login count, organization creation rate), you can use the **Cloud Monitoring API**.

### Step 4.1: Install the Monitoring Library

```bash
cd backend
npm install @google-cloud/monitoring
```

### Step 4.2: Create a Metrics Service (Example)

Create `backend/src/monitoring/metrics.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { MetricServiceClient } from '@google-cloud/monitoring';

@Injectable()
export class MetricsService {
  private readonly metricsClient = new MetricServiceClient();
  private readonly projectId = process.env.GCP_PROJECT_ID || 'devlead-companion';

  async recordCustomMetric(metricType: string, value: number) {
    const projectPath = this.metricsClient.projectPath(this.projectId);
    const timeSeriesData = {
      metric: {
        type: `custom.googleapis.com/${metricType}`,
      },
      resource: {
        type: 'cloud_run_revision',
        labels: {
          service_name: 'devlead-backend',
          location: 'us-central1',
        },
      },
      points: [
        {
          interval: {
            endTime: {
              seconds: Date.now() / 1000,
            },
          },
          value: {
            int64Value: value,
          },
        },
      ],
    };

    await this.metricsClient.createTimeSeries({
      name: projectPath,
      timeSeries: [timeSeriesData],
    });
  }
}
```

### Step 4.3: Use the Metrics Service

In your controller (e.g., `auth.controller.ts`):

```typescript
constructor(private metricsService: MetricsService) {}

async login() {
  // ... login logic
  await this.metricsService.recordCustomMetric('user_logins', 1);
}
```

---

## 5. Set Up Alerts

Alerts notify you when metrics exceed thresholds.

### Step 5.1: Create an Alert Policy

1. Navigate to **Monitoring** > **Alerting**
2. Click **+ CREATE POLICY**

### Step 5.2: Configure the Alert Condition

1. Click **ADD CONDITION**
2. **Target**:
   - **Resource type**: `Cloud Run Revision`
   - **Metric**: `Request count`
   - **Filter**: `response_code_class = "5xx"`
3. **Configuration**:
   - **Condition**: `Any time series violates`
   - **Condition type**: `Threshold`
   - **Threshold value**: `10` (alerts if 10+ errors)
   - **For**: `1 minute`
4. Click **ADD**

### Step 5.3: Configure Notifications

1. Click **NOTIFICATIONS**
2. Click **+ ADD NOTIFICATION CHANNEL**
3. Select **Email** and enter your email
4. Click **ADD**

### Step 5.4: Name and Save

1. **Alert policy name**: `Backend 5xx Error Rate`
2. Click **CREATE POLICY**

---

## 6. View Logs from Monitoring

You can jump directly to logs from the Monitoring dashboard:

1. In **Monitoring** > **Dashboards**, open your dashboard
2. Click on any chart
3. Click **View logs** in the context menu

This opens **Logs Explorer** filtered to the relevant resource.

---

## 7. Best Practices

1. **Create separate dashboards** for different environments (dev, staging, prod)
2. **Set meaningful alert thresholds** based on your SLOs
3. **Use log-based metrics** to track custom events without instrumenting code
4. **Monitor cost** using the billable instance time metric
5. **Review metrics weekly** to identify trends and optimize performance

---

## Next Steps

1. Set up **Uptime Checks** to monitor availability
2. Configure **SLOs (Service Level Objectives)** in Cloud Monitoring
3. Integrate with **PagerDuty** or **Slack** for alert notifications
4. Use **Cloud Trace** to analyze distributed traces
