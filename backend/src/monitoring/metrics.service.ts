import { Injectable } from '@nestjs/common';
import { MetricServiceClient } from '@google-cloud/monitoring';

/**
 * Metrics Service
 * 
 * PURPOSE: Central service for recording custom metrics to Google Cloud Monitoring.
 * 
 * WHY CUSTOM METRICS:
 * - Cloud Run gives us infrastructure metrics (CPU, memory, request count)
 * - But we need APPLICATION metrics (user logins, errors, business KPIs)
 * - Custom metrics let us track what matters to our business
 * 
 * DESIGN PATTERN:
 * - One generic method (recordCustomMetric) for all metrics
 * - Specific helper methods for common metrics (better developer experience)
 * - All methods are fire-and-forget (don't block the main request)
 * 
 * COST CONSIDERATION:
 * - GCP charges for custom metrics writes ($0.15 per 150k writes)
 * - We batch where possible and use fire-and-forget to minimize latency
 * - For high-volume apps, consider sampling (e.g., only 10% of requests)
 */
@Injectable()
export class MetricsService {
    private readonly metricsClient = new MetricServiceClient();
    private readonly projectId = process.env.GCP_PROJECT_ID || 'devlead-companion';

    /**
     * Generic metric recording method
     * 
     * WHY PRIVATE: This is the low-level implementation.
     * External code should use the specific methods below for better type safety.
     * 
     * PARAMETERS:
     * - metricType: Name like 'user_logins', becomes 'custom.googleapis.com/user_logins'
     * - value: Integer value to record
     * - labels: Optional key-value pairs for filtering (e.g., {endpoint: '/users', status: '200'})
     */
    private async recordCustomMetric(
        metricType: string,
        value: number,
        labels?: Record<string, string>
    ) {
        try {
            const projectPath = this.metricsClient.projectPath(this.projectId);
            const timeSeriesData = {
                metric: {
                    type: `custom.googleapis.com/${metricType}`,
                    // Labels allow filtering metrics in GCP Monitoring
                    // Example: Show only errors from the /users endpoint
                    labels: labels || {},
                },
                resource: {
                    // 'global' resource type works everywhere
                    // Alternative: 'cloud_run_revision' for Cloud Run-specific metrics
                    type: 'global',
                    labels: {
                        project_id: this.projectId,
                    },
                },
                points: [
                    {
                        interval: {
                            endTime: {
                                seconds: Math.floor(Date.now() / 1000),
                            },
                        },
                        value: {
                            // IMPORTANT: GCP only supports int64 and double
                            // For counts, use int64Value
                            // For decimals (like response time), use doubleValue
                            int64Value: value,
                        },
                    },
                ],
            };

            await this.metricsClient.createTimeSeries({
                name: projectPath,
                timeSeries: [timeSeriesData],
            });
        } catch (error) {
            // CRITICAL: Never throw errors from metrics
            // Metrics are observability, not core business logic
            // If metrics fail, the app should continue working
            console.error('Failed to record custom metric:', error.message);
        }
    }

    /**
     * Record API endpoint latency
     * 
     * USE CASE: Track how long each API endpoint takes
     * IN GCP: Create a line chart showing latency trends over time
     * ALERT: Trigger if P95 latency > 1000ms
     */
    async recordApiLatency(endpoint: string, durationMs: number) {
        // We use labels to distinguish between endpoints
        // This way we can filter: "Show me latency for GET /users"
        await this.recordCustomMetric('api_latency_ms', durationMs, {
            endpoint: endpoint.substring(0, 50), // Limit length to avoid quota issues
        });
    }

    /**
     * Record HTTP status codes
     * 
     * USE CASE: Track the distribution of 2xx, 4xx, 5xx responses
     * IN GCP: Create a pie chart showing status code breakdown
     * ALERT: Trigger if 5xx rate > 5% of total requests
     */
    async recordStatusCode(statusCode: number) {
        // Group status codes by class (2xx, 4xx, 5xx)
        const statusClass = `${Math.floor(statusCode / 100)}xx`;

        await this.recordCustomMetric('http_status_codes', 1, {
            status_code: statusCode.toString(),
            status_class: statusClass,
        });
    }

    /**
     * Record API errors
     * 
     * USE CASE: Track which endpoints/errors are most common
     * IN GCP: Create a table showing top errors by type and endpoint
     * ALERT: Trigger if error rate > 100 errors/minute
     */
    async recordApiError(endpoint: string, errorType: string) {
        await this.recordCustomMetric('api_errors', 1, {
            endpoint: endpoint.substring(0, 50),
            error_type: errorType,
        });
    }

    /**
     * Record organization created
     * 
     * USE CASE: Track business KPI - how many orgs are being created?
     * IN GCP: Create a line chart showing org creation rate
     * INSIGHT: Drop in org creation might indicate UX issues
     */
    async recordOrganizationCreated() {
        await this.recordCustomMetric('organization_created', 1);
    }

    /**
     * Record user login (existing method - keeping for backward compatibility)
     */
    async recordUserLogin() {
        await this.recordCustomMetric('user_logins', 1);
    }
}