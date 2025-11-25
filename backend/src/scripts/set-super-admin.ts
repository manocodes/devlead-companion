import { AppDataSource } from '../../ormconfig';
import { User } from '../user/user.entity';

async function setSuperAdmin() {
    try {
        // Initialize the data source
        await AppDataSource.initialize();
        console.log('Database connection established');

        // Get the user repository
        const userRepository = AppDataSource.getRepository(User);

        // Find the user with the specified ID
        const userId = '7b1f6407-4829-4b17-87db-d067dceb0be0';
        const user = await userRepository.findOne({ where: { id: userId } });

        if (!user) {
            console.error(`User with ID ${userId} not found`);
            process.exit(1);
        }

        // Update the user to be a super admin
        user.is_super_admin = true;
        await userRepository.save(user);

        console.log(`Successfully set user ${user.email} (${userId}) as super admin`);

        // Close the connection
        await AppDataSource.destroy();
        process.exit(0);
    } catch (error) {
        console.error('Error setting super admin:', error);
        process.exit(1);
    }
}

setSuperAdmin();
