import { CommandBus, EventBus } from '@nestjs/cqrs';
import { Device, StateFactories } from '../../../device';
import { DeviceFactory } from '../../../device.factory';
import { DeviceModel } from '../../../devices.model';
import { IceMakerNuggetSizeState } from './ice-maker.nugget-size';
import { Injectable } from '@nestjs/common';
import { IceMakerBasketFull } from './ice-maker.basket-full';
import { IceMakerWaterEmpty } from './ice-maker.water-empty';
import {
  IceMakerStatusState,
  IceMakerStatusStateName,
} from './ice-maker.status';
import { IceMakerScheduledStart } from './ice-maker.scheduled-start';

const stateFactories: StateFactories = [
  (device) => new IceMakerNuggetSizeState(device),
  (device) => new IceMakerBasketFull(device),
  (device) => new IceMakerWaterEmpty(device),
  (device) => new IceMakerStatusState(device),
  (device) => new IceMakerScheduledStart(device),
];

export const IceMakerType: 'ice-maker' = 'ice-maker' as const;
export type IceMakerType = typeof IceMakerType;

export class IceMakerDevice extends Device {
  static readonly deviceType: IceMakerType = IceMakerType;
  constructor(device: DeviceModel, eventBus: EventBus, commandBus: CommandBus) {
    super(device, eventBus, commandBus, stateFactories);
    this.addState(this.state<IceMakerStatusState>(IceMakerStatusStateName)!);
  }
}

@Injectable()
export class IceMakerFactory extends DeviceFactory<IceMakerDevice> {
  constructor() {
    super(IceMakerDevice, {
      'Home Appliances': {
        Kitchen: /Ice Maker/,
      },
    });
  }
}
