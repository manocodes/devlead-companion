import { DataSource } from 'typeorm';
import { join } from 'path';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'devlead-db',
    entities: [join(__dirname, '**', '*.entity.{ts,js}')],
    synchronize: true, // only for development; disable in production
    logging: false,
});

export default AppDataSource;
