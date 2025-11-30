import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './organization.entity';
import { MetricsService } from '../monitoring/metrics.service';

/**
 * Organization Service
 * 
 * LOGGING + METRICS PHILOSOPHY:
 * - Log all CRUD operations (audit trail)
 * - Track business metrics (org creation rate)
 * - Log errors with full context
 * 
 * WHY BOTH LOGGING AND METRICS:
 * - Logs = detailed events for debugging ("What happened to org X?")
 * - Metrics = aggregate trends for monitoring ("How many orgs created today?")
 * - They complement each other!
 */
@Injectable()
export class OrganizationService {
    private readonly logger = new Logger(OrganizationService.name);

    constructor(
        @InjectRepository(Organization)
        private organizationRepository: Repository<Organization>,
        private readonly metricsService: MetricsService,
    ) { }

    async findAll(): Promise<Organization[]> {
        try {
            const organizations = await this.organizationRepository.find();

            this.logger.log(`Retrieved all organizations`, {
                count: organizations.length,
            });

            return organizations;
        } catch (error) {
            this.logger.error(`Failed to retrieve organizations`, {
                error: error.message,
            });
            throw error;
        }
    }

    async create(data: { name: string; description?: string }): Promise<Organization> {
        try {
            const organization = this.organizationRepository.create({
                name: data.name,
                description: data.description,
            });

            const saved = await this.organizationRepository.save(organization);

            // Log the business event
            this.logger.log(`Organization created`, {
                organizationId: saved.id,
                name: saved.name,
            });

            // Track the business metric (fire-and-forget)
            // This lets us build charts showing org creation trends
            this.metricsService.recordOrganizationCreated();

            return saved;
        } catch (error) {
            this.logger.error(`Failed to create organization`, {
                name: data.name,
                error: error.message,
            });
            throw error;
        }
    }

    async update(id: string, data: { name?: string; description?: string }): Promise<Organization> {
        try {
            const organization = await this.organizationRepository.findOne({ where: { id } });

            if (!organization) {
                this.logger.warn(`Organization not found for update`, { organizationId: id });
                throw new NotFoundException(`Organization with ID ${id} not found`);
            }

            if (data.name !== undefined) {
                organization.name = data.name;
            }
            if (data.description !== undefined) {
                organization.description = data.description;
            }

            const saved = await this.organizationRepository.save(organization);

            this.logger.log(`Organization updated`, {
                organizationId: id,
                updatedFields: Object.keys(data),
            });

            return saved;
        } catch (error) {
            this.logger.error(`Failed to update organization`, {
                organizationId: id,
                error: error.message,
            });
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        try {
            const result = await this.organizationRepository.delete(id);

            if (result.affected === 0) {
                this.logger.warn(`Organization not found for deletion`, { organizationId: id });
                throw new NotFoundException(`Organization with ID ${id} not found`);
            }

            // Log deletion (important for audit/security)
            this.logger.log(`Organization deleted`, {
                organizationId: id,
            });
        } catch (error) {
            this.logger.error(`Failed to delete organization`, {
                organizationId: id,
                error: error.message,
            });
            throw error;
        }
    }
}
