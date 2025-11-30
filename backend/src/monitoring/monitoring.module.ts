import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { HttpMetricsInterceptor } from '../common/http-metrics.interceptor';

/**
 * Monitoring Module
 * 
 * WHY HttpMetricsInterceptor IS HERE:
 * - It depends on MetricsService
 * - By providing it in this module, NestJS can inject MetricsService automatically
 * - We export both so they can be used in main.ts and other modules
 */
@Module({
    providers: [MetricsService, HttpMetricsInterceptor],
    exports: [MetricsService, HttpMetricsInterceptor],
})
export class MonitoringModule { }