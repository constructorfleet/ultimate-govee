import { registerAs } from '@nestjs/config';
import { goveeHeaders } from '../../utils';

const deviceEffectUrl =
  // 'https://app2.govee.com/appsku/v1/light-effect-libraries';
  'https://app2.govee.com/appsku/v2/devices/scenes/attributes';

const GoveeEffectConfigKey = 'Configuration.Govee.Effect';

export const GoveeEffectConfig = registerAs(GoveeEffectConfigKey, () => ({
  deviceEffectUrl,
  headers: goveeHeaders,
}));
