import { Injectable, Logger } from '@nestjs/common';
import { Optional } from '~ultimate-govee-common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { RGBLight, RGBLightFactory } from './rgb/rgb-light';
import { FactoryType } from '../../device.factory';
import { DeviceModel } from '../../devices.model';
import { Device } from '../../device';
import { RGBICLight, RGBICLightFactory } from './rgbic/rgbic-light';

@Injectable()
export class LightsFactory implements FactoryType<RGBLight | RGBICLight> {
  private readonly logger: Logger = new Logger(LightsFactory.name);
  constructor(
    private readonly rgbFactory: RGBLightFactory,
    private readonly rgbicFactory: RGBICLightFactory,
    private readonly eventBus: EventBus,
    private readonly commandBus: CommandBus,
  ) {}

  create(device: DeviceModel): Optional<Device<RGBICLight | RGBLight>> {
    return [this.rgbFactory, this.rgbicFactory]
      .map(
        (factory) =>
          factory.create(device, this.eventBus, this.commandBus) as Device<
            RGBICLight | RGBLight
          >,
      )
      .find((d) => d !== undefined);
  }
}
