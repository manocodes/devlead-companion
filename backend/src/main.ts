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

  /**
   * SWAGGER/OPENAPI DOCUMENTATION
   * 
   * Automatically generates interactive API documentation at /api
   * 
   * HOW IT WORKS:
   * - Swagger reads decorators from controllers (@ApiTags, @ApiOperation, etc.)
   * - Generates OpenAPI JSON spec automatically
   * - Serves interactive UI at /api
   * 
   * DISABLE IN PRODUCTION:
   * - Only serve Swagger in development/staging
   * - Production should use exported spec file only
   * 
   * ACCESS:
   * - Local: http://localhost:3000/api
   * - Staging: https://devlead-backend-staging.run.app/api
   */
  if (process.env.NODE_ENV !== 'production') {
    const { DocumentBuilder, SwaggerModule } = await import('@nestjs/swagger');

    const config = new DocumentBuilder()
      .setTitle('DevLead Companion API')
      .setDescription('Backend API for DevLead Companion application')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token from /auth/google/callback',
          in: 'header',
        },
        'JWT-auth', // This name is referenced in controller decorators
      )
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management')
      .addTag('organizations', 'Organization management')
      .addTag('health', 'Health check endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
      customSiteTitle: 'DevLead API Docs',
      customfavIcon: 'https://nestjs.com/img/logo-small.svg',
      customCss: '.swagger-ui .topbar { display: none }', // Hide default Swagger topbar
    });

    console.log('📚 Swagger UI available at: http://localhost:3000/api');
  }

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
