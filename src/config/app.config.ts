import { registerAs } from '@nestjs/config';

export default registerAs('appConfig', () => ({
  environtment: process.env.NODE_ENV || 'production',
  apiVersion: process.env.API_VERSION,
  throttlerTTL: process.env.THROTTLE_TTL,
  throttlerLIMIT: process.env.THROTTLE_LIMIT,
}));
