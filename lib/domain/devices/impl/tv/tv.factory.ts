import { Injectable } from '@nestjs/common';
import { Optional } from '~ultimate-govee-common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { FactoryType } from '../../device.factory';
import { SyncBox, SyncBoxFactory } from './sync-box';
import { DeviceModel } from '../../devices.model';
import { Device } from '../../device';
import { DreamView } from './dreamview';
import { DreamViewFactory } from './dreamview/dreamview';

@Injectable()
export class TVFactory implements FactoryType<SyncBox | DreamView> {
  constructor(
    private readonly SyncBoxFactory: SyncBoxFactory,
    private readonly dreamviewFactory: DreamViewFactory,
    private readonly eventBus: EventBus,
    private readonly commandBus: CommandBus,
  ) {}

  create(deviceModel: DeviceModel): Optional<Device<SyncBox | DreamView>> {
    return [this.SyncBoxFactory, this.dreamviewFactory]
      .map(
        (factory) =>
          factory.create(deviceModel, this.eventBus, this.commandBus) as Device<
            SyncBox | DreamView
          >,
      )
      .find((d) => d !== undefined);
  }
}
