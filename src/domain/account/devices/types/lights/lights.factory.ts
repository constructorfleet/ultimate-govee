import { RGBLightFactory } from './rgb/rgb-light';
import { FactoryType } from '../device-type.factory';
import { DeviceModel } from '../../devices.model';
import { DeviceType } from '../device-type';

export class LightsFactory implements FactoryType {
  constructor(private readonly rgbFactory: RGBLightFactory) {}

  create(device: DeviceModel): DeviceType | undefined {
    return [this.rgbFactory]
      .map((factory) => factory.create(device))
      .find((d) => d !== undefined);
  }
}
