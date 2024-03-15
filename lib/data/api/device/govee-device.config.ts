import { registerAs } from '@nestjs/config';
import { goveeAuthenticatedHeaders } from '../../utils';

const deviceListUrl = 'https://app2.govee.com/device/rest/devices/v1/list';
const appDeviceTopicUrl =
  'https://app2.govee.com/device/rest/devices/v1/appDeviceTopic';

export const GoveeDeviceConfigKey = 'Configuration.Govee.Device';
export const GoveeDeviceConfig = registerAs(GoveeDeviceConfigKey, () => ({
  deviceListUrl,
  appDeviceTopicUrl,
  headers: goveeAuthenticatedHeaders,
}));
