import { DataSource } from 'typeorm';
import { join } from 'path';

export const AppDataSource = new DataSource({
    type: 'sqlite',
    database: '/app/data/dev.db',
    entities: [join(__dirname, '**', '*.entity.{ts,js}')],
    synchronize: true, // only for development; disable in production
    logging: false,
});

export default AppDataSource;
