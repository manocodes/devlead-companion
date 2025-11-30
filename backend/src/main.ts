// Initialize trace agent FIRST (before any other imports except this line)
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_TRACING === 'true') {
  require('@google-cloud/trace-agent').start();
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { Logger } from 'nestjs-pino';
import { TracingInterceptor } from './common/tracing.interceptor';
import { HttpMetricsInterceptor } from './common/http-metrics.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  /**
   * GLOBAL INTERCEPTORS - Order matters!
   * 
   * 1. TracingInterceptor - Adds user context to traces (user_id, user_email)
   * 2. HttpMetricsInterceptor - Records latency, status codes, errors
   * 
   * WHY THIS ORDER:
   * - Tracing runs first to ensure user context is available for metrics
   * - Metrics runs second to measure the full request lifecycle
   * 
   * LESSON: Interceptors execute in registration order (like Express middleware)
   * Think of them as layers wrapping your controller:
   *   Request → Tracing → Metrics → Controller → Metrics → Tracing → Response
   */
  app.useGlobalInterceptors(
    new TracingInterceptor(),
    app.get(HttpMetricsInterceptor), // Use app.get() to inject dependencies
  );

  // Configure CORS for production
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3002',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization, Content-Encoding',
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
