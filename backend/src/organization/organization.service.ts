import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './organization.entity';

@Injectable()
export class OrganizationService {
    constructor(
        @InjectRepository(Organization)
        private organizationRepository: Repository<Organization>,
    ) { }

    async findAll(): Promise<Organization[]> {
        return this.organizationRepository.find();
    }

    async create(data: { name: string; description?: string }): Promise<Organization> {
        const organization = this.organizationRepository.create({
            name: data.name,
            description: data.description,
        });
        return this.organizationRepository.save(organization);
    }

    async update(id: string, data: { name?: string; description?: string }): Promise<Organization> {
        const organization = await this.organizationRepository.findOne({ where: { id } });
        if (!organization) {
            throw new NotFoundException(`Organization with ID ${id} not found`);
        }

        if (data.name !== undefined) {
            organization.name = data.name;
        }
        if (data.description !== undefined) {
            organization.description = data.description;
        }

        return this.organizationRepository.save(organization);
    }

    async delete(id: string): Promise<void> {
        const result = await this.organizationRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Organization with ID ${id} not found`);
        }
    }


}
