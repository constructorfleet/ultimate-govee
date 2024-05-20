import { registerAs } from '@nestjs/config';
import { goveeAuthenticatedHeaders } from '../../utils';

const deviceDiyUrl = 'https://app2.govee.com/appsku/v1/diys/groups-diys';
//https://app2.govee.com/appsku/v1/diys/diy-modes'; //

const GoveeDiyConfigKey = 'Configuration.Govee.DIY';

export const GoveeDiyConfig = registerAs(GoveeDiyConfigKey, () => ({
  deviceDiyUrl,
  headers: goveeAuthenticatedHeaders,
}));
