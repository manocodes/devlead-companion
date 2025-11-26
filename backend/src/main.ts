import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure CORS for production
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3002',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
