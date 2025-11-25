import { AppDataSource } from './ormconfig';

async function checkDatabase() {
    try {
        await AppDataSource.initialize();
        console.log('✅ Database connection successful!');

        const queryRunner = AppDataSource.createQueryRunner();
        const tables = await queryRunner.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

        console.log('\n📊 Tables in database:');
        tables.forEach((table: any) => {
            console.log(`  - ${table.table_name}`);
        });

        // Check users table structure
        const usersColumns = await queryRunner.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

        if (usersColumns.length > 0) {
            console.log('\n👤 Users table structure:');
            usersColumns.forEach((col: any) => {
                console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
            });
        } else {
            console.log('\n⚠️  Users table not found!');
        }

        await queryRunner.release();
        await AppDataSource.destroy();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkDatabase();
