import { registerAs } from '@nestjs/config';

export const ENV_AUTH_REFRESH_MARGIN = 'AUTH_REFRESH_MARGIN';
export const DEFAULT_AUTH_REFRESH_MARGIN = 60 * 1000; // 1 minute

export const AuthConfig = registerAs('Configuration.Auth', () => ({
  refreshMargin: +(
    process.env[ENV_AUTH_REFRESH_MARGIN] ?? DEFAULT_AUTH_REFRESH_MARGIN
  ),
}));
