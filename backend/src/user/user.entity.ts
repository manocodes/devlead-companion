import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryColumn('uuid')
    id: string;

    @Column({ type: 'text', unique: true })
    email: string;

    @Column({ type: 'text', nullable: true })
    name: string;

    @Column({ type: 'text', nullable: true })
    avatar_url: string;

    @Column({ type: 'boolean', default: false })
    is_super_admin: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
}
