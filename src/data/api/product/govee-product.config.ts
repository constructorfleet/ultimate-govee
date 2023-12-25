import { registerAs } from '@nestjs/config';

const skuListUrl = 'https://app2.govee.com/bi/rest/devices/v3/skus';

export const GoveeProductConfigKey = 'Configuration.Govee.Product';

export const GoveeProductConfig = registerAs(GoveeProductConfigKey, () => ({
  skuListUrl,
}));
