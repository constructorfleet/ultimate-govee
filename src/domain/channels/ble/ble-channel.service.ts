import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { BleClient } from '@govee/data';
import { ChannelService } from '../channel.service';
import { BleChannelConfig, BleChannelState } from './ble-channel.state';

@Injectable()
export class BleChannelService extends ChannelService<
  BleChannelConfig,
  BleChannelState
> {
  constructor(
    private readonly bleClient: BleClient,
    eventBus: EventBus,
  ) {
    super(eventBus);
    bleClient.peripheralDecoded.subscribe((peripheral) => {
      this.state.devices[peripheral.id] = peripheral;
    });
  }

  onConfigChange(config: BleChannelConfig) {
    throw new Error('Method not implemented.');
  }
}
