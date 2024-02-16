import { registerAs } from '@nestjs/config';

export const LANConfig = registerAs('Configuration.LAN', () => ({
  discoveryTimeout: +(process.env.GOVEE_DISCOVERY_TIMEOUT ?? 10000),
}));
