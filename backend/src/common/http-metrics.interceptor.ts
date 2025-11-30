import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { MetricsService } from '../monitoring/metrics.service';

/**
 * HTTP Metrics Interceptor
 * 
 * PURPOSE: Automatically track metrics for EVERY HTTP request without manual instrumentation.
 * 
 * WHY AN INTERCEPTOR:
 * - Runs on every request automatically (no need to add code to each controller)
 * - Can measure request duration using RxJS operators
 * - Catches errors without breaking the error flow
 * 
 * WHAT WE TRACK:
 * 1. Request duration (latency)
 * 2. HTTP status codes (success vs errors)
 * 3. Error rates and types
 * 
 * PERFORMANCE IMPACT:
 * - Minimal: We use Date.now() which is extremely fast (~nanoseconds)
 * - Asynchronous: Metrics are recorded without blocking the response
 * - Fire-and-forget: Even if metrics fail, the request succeeds
 * 
 * LESSON: Interceptors are executed in order. This one should run AFTER
 * TracingInterceptor so user context is already added to traces.
 */
@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
    constructor(private readonly metricsService: MetricsService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const startTime = Date.now();

        // Extract request info for logging
        const { method, url } = request;
        const endpoint = `${method} ${url}`;

        return next.handle().pipe(
            // tap() runs when the request succeeds
            tap(() => {
                const duration = Date.now() - startTime;
                const response = context.switchToHttp().getResponse();
                const statusCode = response.statusCode;

                // Record success metrics
                // Fire-and-forget: we don't await, don't block the response
                this.metricsService.recordApiLatency(endpoint, duration);
                this.metricsService.recordStatusCode(statusCode);
            }),

            // catchError() runs when the request throws an error
            catchError((error) => {
                const duration = Date.now() - startTime;

                // Determine status code from error
                const statusCode = error instanceof HttpException
                    ? error.getStatus()
                    : 500;

                // Record error metrics
                this.metricsService.recordApiLatency(endpoint, duration);
                this.metricsService.recordStatusCode(statusCode);
                this.metricsService.recordApiError(endpoint, error.name || 'UnknownError');

                // Re-throw the error so normal error handling continues
                // IMPORTANT: We don't swallow errors, just observe them!
                return throwError(() => error);
            }),
        );
    }
}
