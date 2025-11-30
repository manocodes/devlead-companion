import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { User } from './user/user.entity';
import { OrganizationModule } from './organization/organization.module';
import { Organization } from './organization/organization.entity';
import { LoggerModule } from 'nestjs-pino';
import { LogsModule } from './logs/logs.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' }
            : undefined,
        autoLogging: true,
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      // Cloud SQL uses Unix socket when DB_HOST starts with /cloudsql/
      ...(process.env.DB_HOST?.startsWith('/cloudsql/')
        ? { host: process.env.DB_HOST }
        : {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
        }),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'devlead-db',
      entities: [User, Organization],
      synchronize: true, // only for development; disable in production
      logging: true,
    }),
    AuthModule,
    UserModule,
    OrganizationModule,
    LogsModule,
    MonitoringModule,
    HealthModule, // Health check endpoints for Cloud Run probes
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
