import { Injectable } from '@nestjs/common';
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
}
