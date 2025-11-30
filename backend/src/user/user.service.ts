import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@nestjs/common';

/**
 * User Service
 * 
 * LOGGING PHILOSOPHY:
 * - Log business events (user created, user found)
 * - Log errors with context (what operation failed, why)
 * - Don't log sensitive data (passwords, tokens)
 * - Use structured logging (key-value pairs, not just strings)
 * 
 * WHY STRUCTURED LOGGING:
 * - In GCP Logs Explorer, you can filter by jsonPayload.userId="xyz"
 * - Can't do that with string logs like "User xyz logged in"
 * - Structure = searchability = faster debugging
 */
@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    /**
     * Find a user by email
     */
    async findByEmail(email: string): Promise<User | null> {
        try {
            const user = await this.userRepository.findOne({ where: { email } });

            // Log the lookup (helpful for debugging auth issues)
            // LESSON: Don't log every lookup in production (too noisy)
            // Consider sampling or only logging in development
            if (process.env.NODE_ENV !== 'production') {
                this.logger.debug(`User lookup by email`, { email, found: !!user });
            }

            return user;
        } catch (error) {
            // Always log errors, even in production
            this.logger.error(`Failed to find user by email`, {
                email,
                error: error.message,
            });
            throw error; // Re-throw so caller can handle
        }
    }

    /**
     * Find a user by ID
     */
    async findById(id: string): Promise<User | null> {
        try {
            return await this.userRepository.findOne({ where: { id } });
        } catch (error) {
            this.logger.error(`Failed to find user by ID`, {
                userId: id,
                error: error.message,
            });
            throw error;
        }
    }

    /**
     * Create or update a user from OAuth data
     * If user exists, update their info. If not, create a new user.
     */
    async findOrCreate(userData: {
        email: string;
        name?: string;
        avatar_url?: string;
    }): Promise<User> {
        try {
            // Check if user already exists
            let user = await this.findByEmail(userData.email);

            if (user) {
                // Update existing user's info
                const updated = {
                    name: userData.name || user.name,
                    avatar_url: userData.avatar_url || user.avatar_url,
                };

                user.name = updated.name;
                user.avatar_url = updated.avatar_url;

                const savedUser = await this.userRepository.save(user);

                // Log user update (important for audit trail)
                this.logger.log(`User updated`, {
                    userId: user.id,
                    email: user.email,
                    updatedFields: Object.keys(updated),
                });

                return savedUser;
            }

            // Create new user
            user = this.userRepository.create({
                id: uuidv4(),
                email: userData.email,
                name: userData.name,
                avatar_url: userData.avatar_url,
            });

            const savedUser = await this.userRepository.save(user);

            // Log user creation (critical business event!)
            // This helps track user growth, onboarding issues, etc.
            this.logger.log(`New user created`, {
                userId: user.id,
                email: user.email,
            });

            return savedUser;
        } catch (error) {
            // Log the full context of the error
            this.logger.error(`Failed to create or update user`, {
                email: userData.email,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    /**
     * Get all users (for admin purposes)
     */
    async findAll(): Promise<User[]> {
        try {
            const users = await this.userRepository.find();

            // Log admin actions (security audit)
            this.logger.log(`Retrieved all users`, {
                count: users.length,
            });

            return users;
        } catch (error) {
            this.logger.error(`Failed to retrieve all users`, {
                error: error.message,
            });
            throw error;
        }
    }
}
