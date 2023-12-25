import { Inject, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigType } from '@nestjs/config';
import { EffectListResponse } from './models/effect-list.response';
import { GoveeEffectConfig } from './govee-effect.config';

@Injectable()
export class GoveeEffectService {
  private readonly logger: Logger = new Logger(GoveeEffectService.name);

  constructor(
    @Inject(GoveeEffectConfig.KEY)
    private readonly config: ConfigType<typeof GoveeEffectConfig>,
  ) {}

  async getDeviceEffects(
    sku: string,
    goodsType: number,
    deviceId: string,
  ): Promise<EffectListResponse> {
    try {
      const response = await axios.get<EffectListResponse>(
        this.config.deviceEffectUrl,
        {
          params: {
            sku,
            goodsType,
            device: deviceId,
          },
        },
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Unable to retrieve device effects`, error);
      throw new Error(`Unable to retrieve device effects`);
    }
  }
}
