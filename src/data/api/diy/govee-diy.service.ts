import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { instanceToPlain } from 'class-transformer';
import { PersistResult } from '@govee/persist';
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
    filename: '{3}.diys.json',
    transform: (data) => instanceToPlain(data),
  })
  async getDeviceDiys(
    oauth: OAuthData,
    model: string,
    goodsType: number,
    deviceId: string,
  ): Promise<any> {
    try {
      const response = await request(
        this.config.deviceDiyUrl,
        this.config.headers(oauth),
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
