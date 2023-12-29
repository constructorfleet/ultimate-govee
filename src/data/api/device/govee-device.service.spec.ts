import { v4 as uuidv4 } from 'uuid';
import { ConfigModule } from '@nestjs/config';
import { TestingModule, Test } from '@nestjs/testing';
import { GoveeAccountModule, GoveeAccountService } from '../account';
import { GoveeDeviceConfig } from './govee-device.config';
import { GoveeDeviceService } from './govee-device.service';
import { OAuthData } from '../../../domain/models/account-client';

const userCredentials = {
  username: process.env.GOVEE_USERNAME!,
  password: process.env.GOVEE_PASSWORD!,
};

describe('GoveeDeviceService', () => {
  let module: TestingModule;
  let clientId: string;
  let oauth: OAuthData;

  beforeAll(async () => {
    clientId = uuidv4().replace(/-/g, '').slice(0, 16);
    module = await Test.createTestingModule({
      imports: [GoveeAccountModule, ConfigModule.forFeature(GoveeDeviceConfig)],
      providers: [GoveeDeviceService],
      exports: [GoveeDeviceService, GoveeAccountModule],
    }).compile();
    const account = await module
      .get<GoveeAccountService>(GoveeAccountService)
      .authenticate({ ...userCredentials, clientId });

    oauth = account.oauth;
  });

  describe('getDeviceList', () => {
    it('should return a list of devices', async () => {
      const goveeDeviceService =
        module.get<GoveeDeviceService>(GoveeDeviceService);

      const devices = await goveeDeviceService.getDeviceList(oauth);
      expect(devices).toBeDefined();
      expect(devices.length).toBeGreaterThan(0);
    });
  });
});
