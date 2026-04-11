import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity('submission')
export class Submission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({name: 'product_id', type: 'uuid'})
    productId: string;

    @Column({name: 'name', type: 'text'})
    name: string;

    @Column({name: 'email', type: 'text'})
    email: string;

    @Column({name: 'phone', type: 'text'})
    phone: string;

    @CreateDateColumn({name: 'created_at', type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({name: 'updated_at', type: 'timestamp'})
    updatedAt: Date;
}
