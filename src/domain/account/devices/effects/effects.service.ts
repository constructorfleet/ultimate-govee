import { Injectable } from '@nestjs/common';
import { GoveeEffectService, GoveeDiyService, OAuthData } from '@govee/data';
import { Device } from '../types/device';
import { RGBICLightDevice, RGBLightDevice } from '../types/lights';

const shouldRetrieveEffects = (device: Device): boolean =>
  [RGBLightDevice, RGBICLightDevice].some((type) => device instanceof type);

@Injectable()
export class EffectsService {
  constructor(
    private readonly effectsService: GoveeEffectService,
    private readonly diyService: GoveeDiyService,
  ) {}

  async refresh(oauth: OAuthData, device: Device) {
    if (!shouldRetrieveEffects(device)) {
      return;
    }

    await this.effectsService.getDeviceEffects(
      oauth,
      device.model,
      device.goodsType,
      device.id,
    );
    await this.diyService.getDeviceDiys(
      oauth,
      device.model,
      device.goodsType,
      device.id,
    );
  }
}
