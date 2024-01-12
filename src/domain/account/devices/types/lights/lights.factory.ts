import { Injectable, Logger } from '@nestjs/common';
import { RGBLightFactory } from './rgb/rgb-light';
import { FactoryType } from '../device.factory';
import { DeviceModel } from '../../devices.model';
import { Device } from '../device';
import { RGBICLightFactory } from './rgbic/rgbic-light';

@Injectable()
export class LightsFactory implements FactoryType {
  private readonly logger: Logger = new Logger(LightsFactory.name);
  constructor(
    private readonly rgbFactory: RGBLightFactory,
    private readonly rgbicFactory: RGBICLightFactory,
  ) {}

  create(device: DeviceModel): Device | undefined {
    return [this.rgbicFactory] // this.rgbFactory, this.rgbicFactory]
      .map((factory) => factory.create(device))
      .find((d) => d !== undefined);
  }
}
