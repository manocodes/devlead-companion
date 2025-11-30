import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';

/**
 * Health Service
 * 
 * PURPOSE: Encapsulates health check logic for dependencies.
 * 
 * WHY A SEPARATE SERVICE:
 * - Keeps controller clean (single responsibility)
 * - Makes testing easier (can mock this service)
 * - Allows reusing health checks if needed elsewhere
 * 
 * WHAT WE CHECK:
 * - Database connectivity (critical dependency)
 * 
 * WHAT WE DON'T CHECK (yet):
 * - External APIs (Google OAuth) - we check this lazily when needed
 * - File system - not critical for our app
 */
@Injectable()
export class HealthService {
    constructor(
        // Inject any repository to test database connection
        // We use User since it's a core table that always exists
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    /**
     * Check Database Health
     * 
     * WHY THIS APPROACH:
     * - TypeORM's query() executes raw SQL directly to the database
     * - SELECT 1 is the simplest query that proves connectivity
     * - If this succeeds, we know: connection pool works, DB is responding
     * 
     * PERFORMANCE NOTE:
     * - This is called on every readiness check (could be every few seconds)
     * - SELECT 1 is extremely fast (~1ms)
     * - No table scan, no index lookup, just a connection test
     * 
     * ERROR HANDLING:
     * - Any error (network, auth, timeout) returns false
     * - We don't throw - health checks should never crash the app!
     */
    async checkDatabase(): Promise<boolean> {
        try {
            // Execute a simple query to verify database connectivity
            await this.userRepository.query('SELECT 1');
            return true;
        } catch (error) {
            // Log error but don't throw - health checks should be resilient
            console.error('Database health check failed:', error.message);
            return false;
        }
    }
}
