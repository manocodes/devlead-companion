# Swagger/OpenAPI Documentation Guide

## What is Swagger?

Swagger (now called OpenAPI) is an **interactive API documentation** tool that:
- 📖 **Documents** your API endpoints automatically
- 🧪 **Tests** APIs directly in the browser (no Postman needed!)
- 📦 **Generates** client SDKs in multiple languages
- ✅ **Validates** request/response schemas
- 🔄 **Stays in sync** with your code (decorators = living documentation)

---

## Accessing Swagger UI

### Local Development
```
http://localhost:3000/api
```

### Staging/Production
Swagger is **disabled in production** for security. Only available in dev/staging.

---

## How It Works

### 1. We Configure Swagger in main.ts

```typescript
const config = new DocumentBuilder()
  .setTitle('DevLead Companion API')
  .setDescription('Backend API for DevLead Companion application')
  .setVersion('1.0')
  .addBearerAuth(...)  // Enables JWT authentication
  .build();
```

### 2. We Add Decorators to Controllers

**Controller Level:**
```typescript
@ApiTags('organizations')  // Groups endpoints in sidebar
@Controller('organizations')
export class OrganizationController { ... }
```

**Endpoint Level:**
```typescript
@ApiOperation({ summary: 'Create a new organization' })
@ApiResponse({ status: 201, description: 'Successfully created' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiBearerAuth('JWT-auth')  // Mark as requiring authentication
@Post()
create(@Body() dto: CreateOrganizationDto) { ... }
```

**DTO Level:**
```typescript
export class CreateOrganizationDto {
    @ApiProperty({
        description: 'Organization name',
        example: 'Acme Corp',
    })
    name: string;
}
```

### 3. Swagger Generates the UI Automatically

All decorators combine to create an interactive UI where you can:
- See all endpoints grouped by tags
- View request/response schemas
- Try API calls with the "Try it out" button
- Authenticate with JWT token

---

## Using Swagger UI

### Step 1: Start the Backend

```bash
cd backend
npm run start:dev
```

### Step 2: Open Swagger UI

Navigate to: `http://localhost:3000/api`

You'll see:
- **Sidebar**: API groups (auth, users, organizations, health)
- **Main area**: Endpoint documentation
- **Schemas**: Request/response models at the bottom

### Step 3: Authenticate (for protected endpoints)

1. Click the **Authorize** button (top right with a lock icon)
2. Get a JWT token:
   - Option A: Log in via the frontend and copy the token from localStorage
   - Option B: Use the `/auth/google/callback` flow
3. Paste the token in the format: `Bearer <your-jwt-token>`
4. Click **Authorize**
5. Now all protected endpoints will include the token!

### Step 4: Test an Endpoint

1. Click on an endpoint (e.g., `GET /organizations`)
2. Click **Try it out**
3. Click **Execute**
4. See the response below with the actual data!

---

## Decorator Reference

### Controller Decorators

| Decorator | Purpose | Example |
|-----------|---------|---------|
| `@ApiTags('name')` | Group endpoints | `@ApiTags('organizations')` |

### Endpoint Decorators

| Decorator | Purpose | Example |
|-----------|---------|---------|
| `@ApiOperation({ summary })` | Describe endpoint | `@ApiOperation({ summary: 'Get all users' })` |
| `@ApiResponse({ status, description })` | Document response codes | `@ApiResponse({ status: 200, description: 'Success' })` |
| `@ApiBearerAuth('JWT-auth')` | Mark as authenticated | `@ApiBearerAuth('JWT-auth')` |
| `@ApiParam({ name, description })` | Document URL params | `@ApiParam({ name: 'id', description: 'User ID' })` |

### DTO Decorators

| Decorator | Purpose | Example |
|-----------|---------|---------|
| `@ApiProperty({ description, example })` | Document DTO field | `@ApiProperty({ example: 'John' })` |

---

## Adding Swagger to Your Controllers

### Example: User Controller

```typescript
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UserController {
    
    @Get()
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    findAll() {
        return this.userService.findAll();
    }
}
```

### Example: DTO with Swagger

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({
        description: 'User email address',
        example: 'user@example.com',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'User full name',
        example: 'John Doe',
    })
    @IsString()
    name: string;
}
```

---

## Best Practices

### 1. Always Document Response Codes

```typescript
@ApiResponse({ status: 200, description: 'Success' })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 404, description: 'Not found' })
@ApiResponse({ status: 500, description: 'Internal server error' })
```

### 2. Provide Examples in DTOs

```typescript
@ApiProperty({
    description: 'Organization name',
    example: 'Acme Corporation',  // Shows up in Swagger UI!
})
name: string;
```

### 3. Use Descriptive Summaries

❌ Bad: `@ApiOperation({ summary: 'Get data' })`
✅ Good: `@ApiOperation({ summary: 'Get all organizations for authenticated user' })`

### 4. Group Related Endpoints

Use consistent tags across controllers:
```typescript
@ApiTags('auth')   // /auth/google, /auth/google/callback
@ApiTags('users')  // /users, /users/:id
@ApiTags('organizations')
```

---

## Exporting OpenAPI Spec

For CI/CD, client SDK generation, or external docs:

### Option 1: Manual Export (while server is running)

```bash
curl http://localhost:3000/api-json > openapi.json
```

### Option 2: Programmatic Export (recommended)

Add to `package.json`:
```json
{
  "scripts": {
    "swagger:export": "ts-node src/swagger-export.ts"
  }
}
```

Create `src/swagger-export.ts`:
```typescript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';

async function generateSwagger() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('DevLead Companion API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  fs.writeFileSync('./openapi.json', JSON.stringify(document, null, 2));
  await app.close();
}

generateSwagger();
```

Then run:
```bash
npm run swagger:export
```

---

## Advanced Features

### Custom Response Schemas

```typescript
import { Organization } from './organization.entity';

@ApiResponse({ 
    status: 200, 
    description: 'Organization found',
    type: Organization,  // Uses entity as schema
})
findOne(@Param('id') id: string) {
    return this.organizationService.findOne(id);
}
```

### Paginated Responses

```typescript
class PaginatedOrganizations {
    @ApiProperty({ type: [Organization] })
    data: Organization[];
    
    @ApiProperty({ example: 100 })
    total: number;
}

@ApiResponse({ 
    status: 200, 
    type: PaginatedOrganizations,
})
findAll() { ... }
```

### File Uploads

```typescript
@ApiConsumes('multipart/form-data')
@ApiBody({
    schema: {
        type: 'object',
        properties: {
            file: {
                type: 'string',
                format: 'binary',
            },
        },
    },
})
@Post('upload')
upload(@UploadedFile() file: Express.Multer.File) { ... }
```

---

## Troubleshooting

### "Swagger UI not loading"

**Check:**
1. Is `NODE_ENV` set to production? Swagger is disabled in prod.
2. Navigate to the exact URL: `http://localhost:3000/api` (not `/api/`)
3. Check console for errors: `npm run start:dev`

### "Endpoints not showing up"

**Check:**
1. Did you add `@ApiTags()` to the controller?
2. Did you import decorators from `@nestjs/swagger`?
3. Restart the dev server

### "JWT authentication not working"

**Check:**
1. Did you add `@ApiBearerAuth('JWT-auth')` to the endpoint?
2. Did you click **Authorize** and paste the token?
3. Token format must be: `Bearer <token>` (not just the token)

---

## File Structure for Swagger

```
backend/src/
├── main.ts                          # Swagger configuration
├── organization/
│   ├── organization.controller.ts   # @ApiTags, @ApiOperation
│   └── dto/
│       ├── create-organization.dto.ts  # @ApiProperty
│       └── update-organization.dto.ts  # @ApiProperty
├── user/
│   ├── user.controller.ts           # Add decorators here
│   └── dto/
│       └── create-user.dto.ts       # Add @ApiProperty
└── auth/
    └── auth.controller.ts           # Add decorators here
```

---

## Next Steps

1. ✅ **Done**: Swagger configured in main.ts
2. ✅ **Done**: OrganizationController fully documented
3. 📝 **TODO**: Add decorators to UserController
4. 📝 **TODO**: Add decorators to AuthController
5. 📝 **TODO**: Add decorators to HealthController
6. 📝 **TODO**: Export OpenAPI spec for frontend/mobile teams

---

## Resources

- [NestJS Swagger Documentation](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger Editor](https://editor.swagger.io/) - Test your exported spec
