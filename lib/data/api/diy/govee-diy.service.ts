import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { instanceToPlain } from 'class-transformer';
import { PersistResult } from '@constructorfleet/ultimate-govee/persist';
import { request } from '../../utils';
// import { EffectListResponse } from './models/effect-list.response';
import { GoveeDiyConfig } from './govee-diy.config';
import { OAuthData } from '../account/models/account-client';

@Injectable()
export class GoveeDiyService {
  private readonly logger: Logger = new Logger(GoveeDiyService.name);

  constructor(
    @Inject(GoveeDiyConfig.KEY)
    private readonly config: ConfigType<typeof GoveeDiyConfig>,
  ) {}

  @PersistResult({
    path: 'persisted',
    filename: 'diys.json',
    transform: (data) => instanceToPlain(data),
  })
  async getDeviceDiys(
    oauth: OAuthData,
    model: string,
    goodsType: number,
    deviceId: string,
  ): Promise<any> {
    try {
      this.logger.log(
        `Retrieving DIY effects for device ${deviceId} from Govee REST API`,
      );
      const response = await request(
        this.config.deviceDiyUrl,
        {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          clientType: '0',
          clientId: oauth.clientId,
          appVersion: '',
          authorization: `Bearer ${oauth.accessToken}`,
          appversion: '3.7.0',
        },
        {
          sku: model,
          goodsType,
          device: deviceId,
        },
      ).get();
      return response.data;
    } catch (error) {
      this.logger.error(`Unable to retrieve device diys`, error);
      return undefined;
    }
  }
}
