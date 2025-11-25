import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    /**
     * Find a user by email
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    /**
     * Find a user by ID
     */
    async findById(id: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
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
        // Check if user already exists
        let user = await this.findByEmail(userData.email);

        if (user) {
            // Update existing user's info
            user.name = userData.name || user.name;
            user.avatar_url = userData.avatar_url || user.avatar_url;
            return this.userRepository.save(user);
        }

        // Create new user
        user = this.userRepository.create({
            id: uuidv4(),
            email: userData.email,
            name: userData.name,
            avatar_url: userData.avatar_url,
        });

        return this.userRepository.save(user);
    }

    /**
     * Get all users (for admin purposes)
     */
    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }
}
