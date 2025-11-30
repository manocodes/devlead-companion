import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for updating an organization
 * All fields are optional - only provide fields you want to update
 */
export class UpdateOrganizationDto {
    @ApiProperty({
        description: 'Organization name',
        example: 'Acme Corporation (Updated)',
        required: false,
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({
        description: 'Organization description',
        example: 'An industry leader in sustainable technology',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;
}