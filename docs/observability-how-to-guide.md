# Observability How-To Guide

This guide shows you exactly how to find and analyze the metrics, logs, and traces we implemented in the DevLead Companion application.

---

## 📊 Part 1: Viewing Custom Metrics in GCP Monitoring

### Accessing Metrics Explorer

1. Go to [GCP Console](https://console.cloud.google.com/)
2. Select project: **devlead-companion**
3. Navigate to **Monitoring** → **Metrics Explorer**

### Metric 1: API Latency by Endpoint

**What it shows:** Response time for each API endpoint (to identify slow endpoints)

**Query:**
```
Metric: custom.googleapis.com/api_latency_ms
Resource Type: Global
```

**Visualization Options:**
- **Line Chart**: Show latency over time
  - Aggregation: `50th percentile` (P50), `95th percentile` (P95), `99th percentile` (P99)
  - Group by: `metric.label.endpoint`
  
- **Heatmap**: Show distribution of latencies
  - Alignment period: 1 minute
  - Aggregation: `distribution`

**Example Filter (show only one endpoint):**
```
metric.label.endpoint = "GET /organizations"
```

**What to Look For:**
- ✅ P95 < 500ms = Good performance
- ⚠️ P95 500-1000ms = Acceptable  
- 🚨 P95 > 1000ms = Investigate!

---

### Metric 2: HTTP Status Codes Distribution

**What it shows:** Breakdown of 2xx (success), 4xx (client errors), 5xx (server errors)

**Query:**
```
Metric: custom.googleapis.com/http_status_codes
Resource Type: Global
```

**Visualization Options:**
- **Stacked Area Chart**: Show error trends over time
  - Group by: `metric.label.status_class`
  - Aggregation: `sum`
  
- **Pie Chart**: Current distribution
  - Group by: `metric.label.status_code`

**Example Filter (5xx errors only):**
```
metric.label.status_class = "5xx"
```

**What to Look For:**
- ✅ 2xx > 95% of requests = Healthy
- ⚠️ 4xx rate increasing = Possible API misuse
- 🚨 5xx > 1% = Critical issue!

---

### Metric 3: API Errors by Type and Endpoint

**What it shows:** Which endpoints are failing and why

**Query:**
```
Metric: custom.googleapis.com/api_errors
Resource Type: Global
```

**Visualization Options:**
- **Table**: See top errors
  - Group by: `metric.label.error_type`, `metric.label.endpoint`
  - Aggregation: `sum`
  - Sort by: Value (descending)

- **Line Chart**: Error rate over time
  - Group by: `metric.label.error_type`

**Example Queries:**

Show only NotFoundExceptions:
```
metric.label.error_type = "NotFoundException"
```

Show errors from organization endpoint:
```
metric.label.endpoint = "DELETE /organizations/:id"
```

**What to Look For:**
- Repeated NotFoundException → Maybe a bug in the frontend
- DatabaseError → Infrastructure issue
- Sudden spike → Recent deployment issue?

---

### Metric 4: Business Metrics

**Organization Creation Rate:**
```
Metric: custom.googleapis.com/organization_created
Resource Type: Global
Aggregation: rate (1 minute)
```

**User Login Rate:**
```
Metric: custom.googleapis.com/user_logins
Resource Type: Global
Aggregation: rate (1 minute)
```

**What to Look For:**
- Declining org creation → UX issues?
- Login spikes → Marketing campaign success
- Unusual patterns → Investigate user behavior

---

## 📝 Part 2: Viewing Structured Logs in GCP Logging

### Accessing Logs Explorer

1. Go to [GCP Console](https://console.cloud.google.com/)
2. Navigate to **Logging** → **Logs Explorer**

### Finding Your Application Logs

**Base Filter (show only backend logs):**
```
resource.type="cloud_run_revision"
resource.labels.service_name="devlead-backend"
```

---

### Log Query 1: User Service Operations

**Show all user-related operations:**
```
resource.type="cloud_run_revision"
resource.labels.service_name="devlead-backend"
jsonPayload.context="UserService"
```

**Show only user creation events:**
```
resource.type="cloud_run_revision"
resource.labels.service_name="devlead-backend"
jsonPayload.context="UserService"
jsonPayload.msg="New user created"
```

**Show all operations for a specific user:**
```
resource.type="cloud_run_revision"
resource.labels.service_name="devlead-backend"
jsonPayload.context="UserService"
jsonPayload.userId="7b1f6407-4829-4b17-87db-d067dceb0be0"
```

**What the logs show:**
- userId, email for audit trail
- Updated fields when users are modified
- Error context when operations fail

---

### Log Query 2: Organization Service Operations

**Show all organization CRUD operations:**
```
resource.type="cloud_run_revision"
resource.labels.service_name="devlead-backend"
jsonPayload.context="OrganizationService"
```

**Show only organization creation:**
```
resource.type="cloud_run_revision"
resource.labels.service_name="devlead-backend"
jsonPayload.context="OrganizationService"
jsonPayload.msg="Organization created"
```

**Show organization deletions (security audit):**
```
resource.type="cloud_run_revision"
resource.labels.service_name="devlead-backend"
jsonPayload.context="OrganizationService"
jsonPayload.msg="Organization deleted"
```

**Track a specific organization:**
```
resource.type="cloud_run_revision"
resource.labels.service_name="devlead-backend"
jsonPayload.organizationId="<org-uuid>"
```

---

### Log Query 3: Health Check Logs

**View health check activity:**
```
resource.type="cloud_run_revision"
resource.labels.service_name="devlead-backend"
jsonPayload.context="HealthService"
```

**Show database health failures:**
```
resource.type="cloud_run_revision"
resource.labels.service_name="devlead-backend"
jsonPayload.context="HealthService"
severity="ERROR"
```

**What to Look For:**
- Repeated health check failures → Database connectivity issue
- "Database health check failed" → Investigate database

---

### Log Query 4: Error Hunting

**Show all errors across the application:**
```
resource.type="cloud_run_revision"
resource.labels.service_name="devlead-backend"
severity="ERROR"
```

**Show errors with stack traces:**
```
resource.type="cloud_run_revision"
resource.labels.service_name="devlead-backend"
severity="ERROR"
jsonPayload.stack=~".*"
```

**Show errors from a specific time range:**
1. Click the **time range** dropdown at the top
2. Select custom range (e.g., "Last hour" or specific timestamps)
3. Apply your error filter

---

### Understanding Log Structure

Each structured log entry contains:

```json
{
  "timestamp": "2025-11-29T21:00:00.000Z",
  "severity": "INFO",
  "jsonPayload": {
    "context": "OrganizationService",     // Which service logged this
    "msg": "Organization created",         // What happened
    "organizationId": "uuid-here",        // Related entity
    "name": "Acme Corp",                  // Additional context
    "level": 30,                          // Pino log level
    "time": 1732838400000,                // Unix timestamp
    "pid": 1,                             // Process ID
    "hostname": "instance-xyz"            // Container instance
  }
}
```

**Key Fields for Filtering:**
- `jsonPayload.context` - Which service/controller
- `jsonPayload.msg` - The log message
- `jsonPayload.userId` - User who triggered the action
- `jsonPayload.organizationId` - Organization involved
- `jsonPayload.error` - Error message
- `jsonPayload.stack` - Stack trace for errors

---

## 🔍 Part 3: Viewing Traces with Custom Labels

### Accessing Cloud Trace

1. Go to [GCP Console](https://console.cloud.google.com/)
2. Navigate to **Trace** → **Trace Explorer**

### Trace Query 1: Filter by User

**Show all requests from a specific user:**
```
user_id:"7b1f6407-4829-4b17-87db-d067dceb0be0"
```

**Show all requests from a user by email:**
```
user_email:"mano.net@gmail.com"
```

**What you'll see:**
- Complete session history for that user
- Request latencies for each endpoint they hit
- Any errors they encountered
- Database queries triggered by their actions

**Use Case:**
User reports: "The app is slow for me"
→ Filter traces by their user_id
→ See which endpoints are slow for them specifically

---

### Trace Query 2: Find Slow Requests

**Show requests slower than 1 second:**
```
latency > 1000ms
```

**Show slow requests for a specific endpoint:**
```
latency > 500ms AND url:/organizations
```

**Show slow requests from a specific user:**
```
user_id:"uuid-here" AND latency > 500ms
```

**What to Look For:**
- Which endpoint is the bottleneck?
- Are database queries slow?
- Is it slow for everyone or just one user?

---

### Trace Query 3: Find Errors

**Show all requests that resulted in errors:**
```
error:true
```

**Show errors from a specific user:**
```
user_email:"user@example.com" AND error:true
```

**Combine with time range:**
```
error:true AND timestamp >= "2025-11-29T00:00:00Z"
```

---

### Understanding Trace Structure

When you click on a trace, you'll see:

**1. Trace Timeline:**
- Shows the request flow through the application
- Each bar represents a span (e.g., controller → service → database)

**2. Custom Labels (from TracingInterceptor):**
```
user_id: "7b1f6407-4829-4b17-87db-d067dceb0be0"
user_email: "mano.net@gmail.com"
```

**3. Automatic Labels (from Cloud Run):**
```
http.method: "POST"
http.status_code: "200"
http.url: "/organizations"
```

**4. Spans:**
- HTTP request span (overall)
- Database query spans (sub-operations)
- External API calls (if any)

---

## 🔗 Part 4: Correlating Logs, Traces, and Metrics

### Scenario 1: User Reports Slow Performance

**Step 1: Check Traces**
```
user_email:"user@example.com"
```
→ Identify slow requests (> 500ms)

**Step 2: Check Logs for that timestamp**
```
resource.type="cloud_run_revision"
timestamp >= "2025-11-29T21:00:00Z"
timestamp <= "2025-11-29T21:05:00Z"
jsonPayload.userId="user-id-from-trace"
```
→ See what the backend was doing

**Step 3: Check Metrics for that endpoint**
```
Metric: custom.googleapis.com/api_latency_ms
Filter: metric.label.endpoint = "GET /organizations"
Time range: Match the slow request time
```
→ Was it slow for everyone or just this user?

---

### Scenario 2: Spike in 5xx Errors

**Step 1: Check Error Metric**
```
Metric: custom.googleapis.com/api_errors
Group by: error_type, endpoint
```
→ Which endpoint and error type?

**Step 2: Check Logs for Error Details**
```
resource.type="cloud_run_revision"
severity="ERROR"
jsonPayload.error_type="<from-metric>"
```
→ Get full error message and stack trace

**Step 3: Check Trace for a Sample Error**
```
error:true
timestamp >= "<error-spike-start>"
```
→ See the full request flow

---

### Scenario 3: Monitoring Deployment Success

**After deploying:**

**1. Check Health Endpoint Logs:**
```
jsonPayload.context="HealthService"
```
→ Ensure readiness checks are passing

**2. Check Error Rate:**
```
Metric: custom.googleapis.com/http_status_codes
Filter: status_class = "5xx"
```
→ Any spike after deployment?

**3. Check Latency:**
```
Metric: custom.googleapis.com/api_latency_ms
Aggregation: 95th percentile
```
→ Did latency increase?

**4. Sample User Request:**
```
# Pick a real user ID from your JWT
user_id:"<real-user-id>"
timestamp >= "<deployment-time>"
```
→ Verify their experience is smooth

---

## 🎯 Quick Reference Commands

### Most Useful Log Queries

```bash
# All user service logs
jsonPayload.context="UserService"

# All org service logs
jsonPayload.context="OrganizationService"

# All errors
severity="ERROR"

# Specific user operations
jsonPayload.userId="<uuid>"

# Specific organization operations
jsonPayload.organizationId="<uuid>"

# Health check failures
jsonPayload.context="HealthService" severity="ERROR"
```

### Most Useful Trace Queries

```bash
# Requests by user
user_id:"<uuid>"
user_email:"user@example.com"

# Slow requests
latency > 500ms

# Errors
error:true

# Specific endpoint
url:/organizations

# Combine filters
user_id:"<uuid>" AND latency > 500ms AND error:true
```

### Most Useful Metrics

```bash
# Latency by endpoint
custom.googleapis.com/api_latency_ms
Group by: endpoint

# Error count
custom.googleapis.com/api_errors
Group by: error_type, endpoint

# Status code distribution
custom.googleapis.com/http_status_codes
Group by: status_class

# Business metrics
custom.googleapis.com/organization_created
custom.googleapis.com/user_logins
```

---

## 💡 Pro Tips

### Tip 1: Create Saved Queries

In Logs Explorer, click **Save Query** to bookmark frequently used filters:
- "User Service Errors"
- "Organization Deletions"
- "Health Check Failures"
- "All User Operations for User X"

### Tip 2: Link Logs to Traces

In Logs Explorer:
1. Find a log entry
2. Click on it to expand
3. Look for `trace` field
4. Click **View in Trace Explorer**

This jumps directly to the trace for that request!

### Tip 3: Set Up Log-Based Metrics

For high-cardinality data (many unique values), use log-based metrics instead of custom metrics:
1. Create a log filter (e.g., `jsonPayload.msg="Organization created"`)
2. Click **Create Metric**
3. Name it and configure
4. Use in dashboards

**Advantage:** No additional API calls, cheaper for high-volume data

### Tip 4: Export Logs for Analysis

For deep analysis:
1. Create a log sink to BigQuery
2. Query with SQL:
   ```sql
   SELECT 
     jsonPayload.userId,
     COUNT(*) as request_count,
     AVG(CAST(jsonPayload.duration AS INT64)) as avg_latency
   FROM `project.dataset.logs`
   WHERE jsonPayload.context = 'OrganizationService'
   GROUP BY jsonPayload.userId
   ```

### Tip 5: Alert on Log Patterns

Create alerts based on log queries:
1. **Alerting** → **Create Policy**
2. Choose **Log-based metric** or **Log query**
3. Example: Alert when 5xx error count > 10 in 5 minutes

---

## 🚨 Troubleshooting

### "I don't see any custom metrics"

**Possible causes:**
1. **Not enough time passed** - Metrics take 1-2 minutes to appear
2. **No traffic** - Generate some requests first
3. **Wrong project** - Verify you're in `devlead-companion`
4. **Deployment pending** - Check if latest code is deployed

**Verify:**
```bash
# Make a request to trigger metrics
curl https://devlead-backend-<hash>.run.app/health

# Wait 2 minutes, then check Metrics Explorer
```

### "I don't see structured logs"

**Possible causes:**
1. **Looking at frontend logs** - Make sure `service_name="devlead-backend"`
2. **No operations yet** - Trigger some user/org operations
3. **Wrong severity filter** - Check if you filtered to ERROR only

**Verify:**
```bash
# Remove all filters except:
resource.type="cloud_run_revision"
resource.labels.service_name="devlead-backend"

# You should see logs from all services
```

### "Traces don't have user_id labels"

**Possible causes:**
1. **Unauthenticated request** - Labels only added for authenticated requests
2. **Tracing disabled** - Verify `NODE_ENV=production` in Cloud Run
3. **Code not deployed** - TracingInterceptor needs to be deployed

**Verify:**
```bash
# Make an authenticated request
curl -H "Authorization: Bearer <jwt-token>" \
  https://devlead-backend-<hash>.run.app/organizations

# Check trace for that request
```

---

## 📚 Next Steps

1. **Create a Dashboard** - Combine your most important metrics
2. **Set Up Alerts** - Get notified of issues before users complain
3. **Export to BigQuery** - Deep dive analysis with SQL
4. **Integration** - Send alerts to Slack/PagerDuty

Happy monitoring! 🎉
