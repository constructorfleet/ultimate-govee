import { Injectable, Logger } from '@nestjs/common';
import { RGBLightFactory } from './rgb/rgb-light';
import { FactoryType } from '../device-type.factory';
import { DeviceModel } from '../../devices.model';
import { DeviceType } from '../device-type';
import { RGBICLightFactory } from './rgbic/rgbic-light';

@Injectable()
export class LightsFactory implements FactoryType {
  private readonly logger: Logger = new Logger(LightsFactory.name);
  constructor(
    private readonly rgbFactory: RGBLightFactory,
    private readonly rgbicFactory: RGBICLightFactory,
  ) {}

  create(device: DeviceModel): DeviceType | undefined {
    return [this.rgbFactory, this.rgbicFactory]
      .map((factory) => factory.create(device))
      .find((d) => d !== undefined);
  }
}
