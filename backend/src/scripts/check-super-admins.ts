import { AppDataSource } from '../../ormconfig';
import { User } from '../user/user.entity';

async function checkSuperAdmins() {
    try {
        await AppDataSource.initialize();
        console.log('Database connection established\n');

        const userRepository = AppDataSource.getRepository(User);

        // Get all users and show their super admin status
        const allUsers = await userRepository.find();

        console.log('All users:');
        console.log('='.repeat(80));
        allUsers.forEach(user => {
            console.log(`Email: ${user.email}`);
            console.log(`ID: ${user.id}`);
            console.log(`Super Admin: ${user.is_super_admin ? 'YES' : 'NO'}`);
            console.log('-'.repeat(80));
        });

        await AppDataSource.destroy();
        process.exit(0);
    } catch (error) {
        console.error('Error checking super admins:', error);
        process.exit(1);
    }
}

checkSuperAdmins();
