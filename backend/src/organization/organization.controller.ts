import { Controller, Get, Post, Delete, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

/**
 * Organization Controller
 * 
 * SWAGGER DECORATORS:
 * - @ApiTags: Groups endpoints in Swagger UI (sidebar section)
 * - @ApiOperation: Describes what the endpoint does
 * - @ApiResponse: Documents possible response codes
 * - @ApiBearerAuth: Marks endpoint as requiring JWT token
 * - @ApiParam: Documents URL parameters
 * 
 * WHY SWAGGER:
 * - Interactive API testing (no Postman needed!)
 * - Auto-generates client SDKs
 * - Living documentation (always in sync with code)
 */
@ApiTags('organizations')
@Controller('organizations')
export class OrganizationController {
    constructor(private readonly organizationService: OrganizationService) { }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Get all organizations',
        description: 'Returns a list of all organizations. Requires authentication.',
    })
    @ApiResponse({
        status: 200,
        description: 'Successfully retrieved organizations',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    })
    findAll() {
        return this.organizationService.findAll();
    }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Create a new organization',
        description: 'Creates a new organization with the provided name and description.',
    })
    @ApiResponse({
        status: 201,
        description: 'Organization successfully created',
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - Invalid input data',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    })
    create(@Body() createOrganizationDto: CreateOrganizationDto) {
        return this.organizationService.create(createOrganizationDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Delete an organization',
        description: 'Permanently deletes an organization by ID.',
    })
    @ApiParam({
        name: 'id',
        description: 'Organization UUID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @ApiResponse({
        status: 200,
        description: 'Organization successfully deleted',
    })
    @ApiResponse({
        status: 404,
        description: 'Organization not found',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    })
    delete(@Param('id') id: string) {
        return this.organizationService.delete(id);
    }

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Update an organization',
        description: 'Updates the name and/or description of an existing organization.',
    })
    @ApiParam({
        name: 'id',
        description: 'Organization UUID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @ApiResponse({
        status: 200,
        description: 'Organization successfully updated',
    })
    @ApiResponse({
        status: 404,
        description: 'Organization not found',
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - Invalid input data',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    })
    update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) {
        return this.organizationService.update(id, updateOrganizationDto);
    }
}
