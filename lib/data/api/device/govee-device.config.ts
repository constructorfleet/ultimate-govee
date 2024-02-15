import { registerAs } from '@nestjs/config';
import { goveeAuthenticatedHeaders } from '../../utils';

const deviceListUrl = 'https://app2.govee.com/device/rest/devices/v1/list';

export const GoveeDeviceConfigKey = 'Configuration.Govee.Device';
export const GoveeDeviceConfig = registerAs(GoveeDeviceConfigKey, () => ({
  deviceListUrl,
  headers: goveeAuthenticatedHeaders,
}));
