import { registerAs } from '@nestjs/config';

const COMMAND_PORT = 4003;
const BROADCAST_ADDRESS = '239.255.255.250';
const SCAN_PORT = 4001;
const SCAN_COMMAND = {
  msg: {
    cmd: 'scan',
    data: {
      account_topic: 'reserve',
    },
  },
};

export const SenderConfig = registerAs('Configuration.LAN.Command', () => ({
  commandPort: COMMAND_PORT,
  scanPort: SCAN_PORT,
  scanCommand: SCAN_COMMAND,
  broadcastAddress: BROADCAST_ADDRESS,
}));
