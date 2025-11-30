import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

/**
 * Health Check Controller
 * 
 * PURPOSE: Provides endpoints for Cloud Run to monitor application health.
 * 
 * WHY WE NEED THIS:
 * - Cloud Run needs to know if the container is alive (liveness probe)
 * - Cloud Run needs to know if the app can handle traffic (readiness probe)
 * - Without this, Cloud Run might send traffic to unhealthy instances
 * 
 * ENDPOINTS:
 * - GET /health        -> Simple liveness check (always returns 200 if app is running)
 * - GET /health/ready  -> Readiness check (verifies database connection)
 */
@Controller('health')
export class HealthController {
    constructor(private readonly healthService: HealthService) { }

    /**
     * Liveness Probe
     * 
     * Cloud Run calls this to check if the container is alive.
     * If this fails, Cloud Run will restart the container.
     * 
     * This should be FAST and SIMPLE - don't check external dependencies here.
     */
    @Get()
    checkHealth() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Readiness Probe
     * 
     * Cloud Run calls this to check if the app can handle requests.
     * If this fails, Cloud Run stops sending traffic until it passes.
     * 
     * This SHOULD check critical dependencies (like database).
     * WHY: No point sending traffic if we can't access the database!
     */
    @Get('ready')
    async checkReadiness() {
        const isDbHealthy = await this.healthService.checkDatabase();

        if (!isDbHealthy) {
            // Return 503 Service Unavailable if dependencies are down
            // Cloud Run will stop routing traffic here
            return {
                status: 'unavailable',
                database: 'unhealthy',
                timestamp: new Date().toISOString(),
            };
        }

        return {
            status: 'ready',
            database: 'healthy',
            timestamp: new Date().toISOString(),
        };
    }
}
