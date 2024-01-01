import { Injectable } from '@nestjs/common';
import { AppliancesFactory } from './types/appliances';
import { LightsFactory } from './types/lights/lights.factory';
import { DeviceModel } from './devices.model';
import { DeviceType } from './types/device-type';

@Injectable()
export class DevicesFactory {
  constructor(
    private readonly applianceFactory: AppliancesFactory,
    private readonly lightFactory: LightsFactory,
  ) {}

  create(device: DeviceModel): DeviceType | undefined {
    return [this.applianceFactory, this.lightFactory]
      .map((factory) => factory.create(device))
      .find((d) => d !== undefined);
  }
}
