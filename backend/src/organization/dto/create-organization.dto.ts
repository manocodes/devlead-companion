import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating an organization
 * 
 * SWAGGER @ApiProperty decorators:
 * - description: What the field is for
 * - example: Sample value shown in Swagger UI
 * - required: Whether field is mandatory
 */
export class CreateOrganizationDto {
    @ApiProperty({
        description: 'Organization name',
        example: 'Acme Corporation',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Organization description',
        example: 'A leading provider of innovative solutions',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;
}
