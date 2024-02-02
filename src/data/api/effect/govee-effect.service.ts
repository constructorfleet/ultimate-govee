import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { instanceToPlain } from 'class-transformer';
import { PersistResult } from '@govee/persist';
import { request } from '../../utils';
import { EffectListResponse } from './models/effect-list.response';
import { GoveeEffectConfig } from './govee-effect.config';
import { OAuthData } from '../account/models/account-client';

@Injectable()
export class GoveeEffectService {
  private readonly logger: Logger = new Logger(GoveeEffectService.name);

  constructor(
    @Inject(GoveeEffectConfig.KEY)
    private readonly config: ConfigType<typeof GoveeEffectConfig>,
  ) {}

  @PersistResult({
    path: 'persisted',
    filename: '{3}.effects.json',
    transform: (data) => instanceToPlain(data),
  })
  async getDeviceEffects(
    oauth: OAuthData,
    model: string,
    goodsType: number,
    deviceId: string,
  ): Promise<any> {
    try {
      this.logger.log(
        `Retrieving light effects for device ${deviceId} from Govee REST API`,
      );
      const response = await request(
        this.config.deviceEffectUrl,
        this.config.headers(oauth),
        {
          sku: model,
          goodsType,
          device: deviceId,
        },
      ).get(EffectListResponse, `persisted/${deviceId}.raw.json`);
      return response.data as EffectListResponse;
    } catch (error) {
      this.logger.error(`Unable to retrieve device light effects`, error);
      return undefined;
    }
  }
}
