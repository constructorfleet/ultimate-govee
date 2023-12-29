import { v4 as uuidv4 } from 'uuid';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { GoveeAccountService } from './govee-account.service';
import { GoveeAccountConfig } from './govee-account.configuration';

const userCredentials = {
  username: process.env.GOVEE_USERNAME!,
  password: process.env.GOVEE_PASSWORD!,
};

describe('GoveeAccountService', () => {
  describe('when authentication', () => {
    let clientId: string;
    let module: TestingModule;
    beforeAll(async () => {
      clientId = uuidv4().replace(/-/g, '').slice(0, 16);
      module = await Test.createTestingModule({
        imports: [ConfigModule.forFeature(GoveeAccountConfig)],
        providers: [GoveeAccountService],
        exports: [GoveeAccountService],
      }).compile();
    });
    afterAll(async () => {
      await module.close();
    });

    describe('is successful', () => {
      it('should return account data', async () => {
        const goveeAccountService =
          module.get<GoveeAccountService>(GoveeAccountService);
        const result = await goveeAccountService.authenticate({
          ...userCredentials,
          clientId,
        });
        expect(result).toBeDefined();
        expect(result.accountId).toEqual('2692129');
        expect(result.clientId).toEqual(clientId);
        expect(result.iot).toBeDefined();
        expect(result.iot?.accountId).toEqual('2692129');
        expect(result.iot?.certificate).toBeDefined();
        expect(result.iot?.privateKey).toBeDefined();
      });
    });
    describe('is unsuccessful', () => {
      it('should throw "Unable to authenticate"', async () => {
        const goveeAccountService =
          module.get<GoveeAccountService>(GoveeAccountService);
        try {
          await goveeAccountService.authenticate({
            username: 'invalidUser',
            password: 'invalidPassword',
            clientId,
          });
        } catch (err) {
          expect(err).toBeInstanceOf(Error);
          expect((err as Error).message).toEqual(
            'Unable to authenticate with Govee.',
          );
        }
      });
    });
  });
});
