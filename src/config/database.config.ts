import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  synchronize: process.env.DATABASE_SYNC === 'true' ? true : false,
  autoLoadEntities: process.env.DATABASE_AUTOLOAD === 'true' ? true : false,
  dbUrl: process.env.DATABASE_URL,
}));
