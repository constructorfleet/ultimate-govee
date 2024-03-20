import { registerAs } from '@nestjs/config';

const deviceJsonUrl = (model: string) =>
  `https://raw.githubusercontent.com/IoTManagerProject/IoTManager/ver4stable/lib/decoder/src/devices/${model}_json.h`;
const commonPropertiesUrl =
  'https://raw.githubusercontent.com/IoTManagerProject/IoTManager/ver4stable/lib/decoder/src/devices/common_props.h';

export const DecoderConfig = registerAs('Configuration.Decoder', () => ({
  deviceJsonUrl,
  commonPropertiesUrl,
}));
