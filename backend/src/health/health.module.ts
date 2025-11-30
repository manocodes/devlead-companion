import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { User } from '../user/user.entity';

/**
 * Health Module
 * 
 * WHY A DEDICATED MODULE:
 * - Encapsulates all health check functionality
 * - Makes it easy to import where needed
 * - Follows NestJS best practices (feature-based modules)
 * 
 * IMPORTS:
 * - TypeOrmModule.forFeature([User]) - gives us access to User repository
 *   We need this to check database connectivity in HealthService
 * 
 * LESSON: In NestJS, if a service needs a repository, the module must
 * import TypeOrmModule.forFeature() with that entity!
 */
@Module({
    imports: [
        // Import User repository for database health checks
        TypeOrmModule.forFeature([User]),
    ],
    controllers: [HealthController],
    providers: [HealthService],
    // We don't export anything - health checks are only accessed via HTTP
})
export class HealthModule { }
