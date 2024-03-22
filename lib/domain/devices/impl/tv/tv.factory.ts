import { Injectable } from '@nestjs/common';
import { Optional } from '~ultimate-govee-common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { FactoryType } from '../../device.factory';
import { SyncBox, SyncBoxFactory } from './sync-box';
import { DeviceModel } from '../../devices.model';
import { Device } from '../../device';

@Injectable()
export class TVFactory implements FactoryType<SyncBox> {
  constructor(
    private readonly SyncBoxFactory: SyncBoxFactory,
    private readonly eventBus: EventBus,
    private readonly commandBus: CommandBus,
  ) {}

  create(deviceModel: DeviceModel): Optional<Device<SyncBox>> {
    return [this.SyncBoxFactory]
      .map(
        (factory) =>
          factory.create(
            deviceModel,
            this.eventBus,
            this.commandBus,
          ) as Device<SyncBox>,
      )
      .find((d) => d !== undefined);
  }
}
const x: Buffer;
x.toString();
