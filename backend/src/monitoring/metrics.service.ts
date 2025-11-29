import { Injectable } from '@nestjs/common';
import { MetricServiceClient } from '@google-cloud/monitoring';

@Injectable()
export class MetricsService {
    private readonly metricsClient = new MetricServiceClient();
    private readonly projectId = process.env.GCP_PROJECT_ID || 'devlead-companion';

    async recordCustomMetric(metricType: string, value: number) {
        try {
            const projectPath = this.metricsClient.projectPath(this.projectId);
            const timeSeriesData = {
                metric: {
                    type: `custom.googleapis.com/${metricType}`,
                },
                resource: {
                    type: 'cloud_run_revision',
                    labels: {
                        service_name: process.env.K_SERVICE || 'devlead-backend',
                        location: process.env.REGION || 'us-central1',
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
            // Log error but don't fail the request
            console.error('Failed to record custom metric:', error.message);
        }
    }
}