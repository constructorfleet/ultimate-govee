import { registerAs } from '@nestjs/config';
import { goveeHeaders } from '../../utils';

const deviceEffectUrl = '/appsku/v2/devices/scenes/attributes';

const GoveeEffectConfigKey = 'Configuration.Govee.Effect';

export const GoveeEffectConfig = registerAs(GoveeEffectConfigKey, () => ({
  deviceEffectUrl,
  headers: goveeHeaders,
}));
