import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity('product')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({name: 'campaign_id', type: 'uuid'})
    campaignId: string;

    @Column({name: 'product_name', type: 'text'})
    productName: string;

    @Column({name: 'description', type: 'text'})
    description: string;

    @Column({name: 'event_date', type: 'date'})
    eventDate: string;

    @CreateDateColumn({name: 'created_at', type: 'timestamp', default: 'now()'})    
    createdAt: Date;

    @UpdateDateColumn({name: 'updated_at', type: 'timestamp',  default: 'now()'})    
    updatedAt: Date;
}