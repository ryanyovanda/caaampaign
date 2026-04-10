import 'reflect-metadata';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  username: process.env.POSTGRES_USER ?? 'caaampaign',
  password: process.env.POSTGRES_PASSWORD ?? 'caaampaign_secret',
  database: process.env.POSTGRES_DB ?? 'caaampaign_db',
  entities: [__dirname + '/modules/**/*.entity{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
});
