import { registerAs } from '@nestjs/config';

const deviceJsonUrl = (model: string) =>
  `https://raw.githubusercontent.com/theengs/decoder/development/src/devices/${model}_json.h`;
const commonPropertiesUrl =
  'https://raw.githubusercontent.com/theengs/decoder/development/src/devices/common_props.h';

export const DecoderConfig = registerAs('Configuration.Decoder', () => ({
  deviceJsonUrl,
  commonPropertiesUrl,
}));
