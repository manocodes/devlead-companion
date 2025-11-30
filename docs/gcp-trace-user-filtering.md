# User-Based Trace Filtering Guide

With the tracing interceptor now enabled, you can filter traces by user to see all requests from a specific user session.

## How It Works

The `TracingInterceptor` automatically adds these labels to every trace:
- `user_id`: The user's unique ID (from JWT token)
- `user_email`: The user's email address

This happens for all authenticated requests (any endpoint using `@UseGuards(AuthGuard('jwt'))`).

---

## How to Filter Traces by User

### Step 1: Get a User ID

1. Log in to your app
2. Open browser DevTools > Application > Local Storage
3. Find your JWT token
4. Copy the `user_id` or `sub` field

**Or** check the logs:
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=devlead-backend" --limit=10 --format="table(timestamp, jsonPayload.user_id)"
```

### Step 2: Filter in Trace Explorer

1. Go to [Trace Explorer](https://console.cloud.google.com/traces/list?project=devlead-companion)
2. In the filter bar, add:
   ```
   user_id:"c134de81-cdc2-451f-adff-4f996f29182a"
   ```
   (Replace with your actual user ID)

3. **Result:** You'll see ALL requests from that user:
   - Login request
   - API calls
   - Data fetches
   - Logout (if implemented)

### Step 3: Filter by Email (Alternative)

You can also filter by email:
```
user_email:"mano.net@gmail.com"
```

---

## Example Use Cases

**Track a user's complete session:**
```
user_id:"abc123" AND timestamp >= "2025-11-28T00:00:00Z"
```

**Find slow requests from a specific user:**
```
user_id:"abc123" AND latency > 500ms
```

**Find errors for a specific user:**
```
user_email:"user@example.com" AND error:true
```

---

## Testing Locally

To test tracing locally, set the environment variable:
```bash
export ENABLE_TRACING=true
npm run start:dev
```

---

## Next Steps

After deploying:
1. Log in to your app
2. Make some requests (navigate around)
3. Wait 1-2 minutes
4. Go to Trace Explorer and filter by your `user_id`
5. You should see all your requests grouped together!
