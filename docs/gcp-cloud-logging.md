# GCP Cloud Logging Guide

This guide explains how to use Google Cloud Logging with the `devlead-companion` application. We have configured the backend to output structured JSON logs, which Cloud Logging automatically parses and indexes.

## 1. Viewing Logs

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Navigate to **Logging** > **Logs Explorer**.
3.  In the **Query results** pane, you will see logs from your services.

## 2. Filtering Logs

The Logs Explorer allows you to filter logs using a powerful query language.

### Basic Filtering
-   **By Resource:** Click on the **Resource** dropdown to filter by specific Cloud Run services (e.g., `Cloud Run Revision` > `devlead-backend`).
-   **By Severity:** Click on the **Severity** dropdown to see only `ERROR`, `WARNING`, or `INFO` logs.
-   **By Text:** Simply type a keyword in the query bar (e.g., "user login") and hit **Run query**.

### Advanced Filtering (JSON Fields)
Since our logs are structured JSON, you can filter by specific fields in the log payload.

**Example 1: Filter by a specific request ID**
```
jsonPayload.req.id="<request-id>"
```

**Example 2: Find all requests that took longer than 500ms**
```
jsonPayload.responseTime > 500
```

**Example 3: Find logs from a specific controller context**
```
jsonPayload.context="LogsController"
```

**Example 4: Find all errors**
```
severity="ERROR"
```

## 3. Creating Metrics (Optional)

You can create custom metrics based on your logs to visualize trends in Cloud Monitoring.

1.  Create a query in Logs Explorer (e.g., `severity="ERROR"`).
2.  Click **Create Metric**.
3.  Give it a name (e.g., `backend_error_count`).
4.  Use this metric in **Monitoring** > **Dashboards** to create charts.

## 4. Frontend Logging

Frontend errors are automatically sent to the backend and logged with the severity `ERROR`. You can find them by searching for:
```
jsonPayload.context="LogsController" severity="ERROR"
```
This allows you to see client-side errors alongside your server-side logs.
