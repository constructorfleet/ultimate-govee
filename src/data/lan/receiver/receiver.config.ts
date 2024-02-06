import { registerAs } from '@nestjs/config';

const RECEIVER_PORT = 4002;
const BROADCAST_ADDRESS = '239.255.255.250';
const BIND_ADDRESS = '0.0.0.0';

export const ReceiverConfig = registerAs('Configuration.LAN.Receiver', () => ({
  receiverPort: RECEIVER_PORT,
  broadcastAddress: BROADCAST_ADDRESS,
  bindAddress: BIND_ADDRESS,
}));
