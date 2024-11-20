const dotenv = require('dotenv');
const { DataSource } = require('typeorm');

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'tron',
  database: process.env.DB_NAME || 'tron_wallet',
  synchronize: false, // Never use synchronize in production
  logging: true,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
});

module.exports = AppDataSource;
