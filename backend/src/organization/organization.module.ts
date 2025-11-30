import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './organization.entity';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { MonitoringModule } from '../monitoring/monitoring.module';

/**
 * Organization Module
 * 
 * DEPENDENCY NOTE:
 * - We import MonitoringModule to get access to MetricsService
 * - OrganizationService needs MetricsService to track org creation metrics
 * 
 * LESSON: When a service needs something from another module,
 * you must import that module here!
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([Organization]),
        MonitoringModule, // For MetricsService
    ],
    controllers: [OrganizationController],
    providers: [OrganizationService],
    exports: [TypeOrmModule, OrganizationService],
})
export class OrganizationModule { }