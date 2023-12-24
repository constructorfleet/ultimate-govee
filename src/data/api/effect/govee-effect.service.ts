import { Inject, Injectable, Logger } from '@nestjs/common';
import { EffectListResponse } from './models/effect-list.response';
import axios from 'axios';
import { GoveeEffectConfig } from './govee-effect.config';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class GoveeEffectService {
  private readonly logger: Logger = new Logger(GoveeEffectService.name);
  constructor(
    @Inject(GoveeEffectConfig) private readonly config: GoveeEffectConfig,
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
      const deviceStorageDirectory = join(
        this.config.storageDirectory,
        deviceId.replaceAll(':', ''),
      );
      if (!existsSync(deviceStorageDirectory)) {
        await mkdir(deviceStorageDirectory, { recursive: true });
      }
      await writeFile(
        join(deviceStorageDirectory, 'effects.json'),
        JSON.stringify(response.data, null, 2),
        {
          encoding: 'utf-8',
        },
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Unable to retrieve device effects`, error);
      throw new Error(`Unable to retrieve device effects`);
    }
  }
}
