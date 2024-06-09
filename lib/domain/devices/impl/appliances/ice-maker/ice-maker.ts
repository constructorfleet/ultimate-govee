import { CommandBus, EventBus } from '@nestjs/cqrs';
import { Device, StateFactories } from '../../../device';
import { DeviceFactory } from '../../../device.factory';
import { DeviceModel } from '../../../devices.model';
import {
  IceMakerNuggetSizeState,
  NuggetSizeStateName,
} from './ice-maker.nugget-size';
import { Injectable } from '@nestjs/common';
import {
  BasketFullStateName,
  IceMakerBasketFull,
} from './ice-maker.basket-full';
import { IceMakerWaterEmpty } from './ice-maker.water-empty';
import {
  IceMakerStatusState,
  IceMakerStatusStateName,
} from './ice-maker.status';
import {
  IceMakerScheduledStart,
  ScheduledStartStateName,
} from './ice-maker.scheduled-start';
import {
  ActiveState,
  ActiveStateName,
  ConnectedState,
  ConnectedStateName,
  PowerState,
  PowerStateName,
  TemperatureState,
  TemperatureStateName,
} from '../../../states';
import {
  IceMakerMakingIceState,
  MakingIceStateName,
} from './ice-maker.make-ice';
import { Optional } from '../../../../../common/types';
import { NuggetSize } from './types';
import { IceMakerTemperatureState } from './ice-maker.temperature';

const stateFactories: StateFactories = [
  (device) => new PowerState(device),
  (device) => new ConnectedState(device),
  (device) => new ActiveState(device),
  (device) => new IceMakerNuggetSizeState(device),
  (device) => new IceMakerBasketFull(device),
  (device) => new IceMakerWaterEmpty(device),
  (device) => new IceMakerStatusState(device),
  (device) => new IceMakerScheduledStart(device),
  (device) => new IceMakerTemperatureState(device),
];

export const IceMakerType: 'ice-maker' = 'ice-maker' as const;
export type IceMakerType = typeof IceMakerType;

export class IceMakerDevice extends Device<IceMakerStates> implements IceMaker {
  static readonly deviceType: IceMakerType = IceMakerType;
  get deviceType(): string {
    return IceMakerDevice.deviceType;
  }
  get NuggetSize(): typeof NuggetSize {
    return NuggetSize;
  }
  constructor(device: DeviceModel, eventBus: EventBus, commandBus: CommandBus) {
    super(device, eventBus, commandBus, stateFactories);
    this.addState(
      new IceMakerMakingIceState(
        device,
        this.state<IceMakerStatusState>(IceMakerStatusStateName)!,
      ),
    );
  }
  get [BasketFullStateName](): Optional<IceMakerBasketFull> {
    return this.state(BasketFullStateName);
  }
  get [MakingIceStateName](): Optional<IceMakerMakingIceState> {
    return this.state(MakingIceStateName);
  }
  get [NuggetSizeStateName](): Optional<IceMakerNuggetSizeState> {
    return this.state(NuggetSizeStateName);
  }
  get [ScheduledStartStateName](): Optional<IceMakerScheduledStart> {
    return this.state(ScheduledStartStateName);
  }
  get [IceMakerStatusStateName](): Optional<IceMakerStatusState> {
    return this.state(IceMakerStatusStateName);
  }
  get [PowerStateName](): Optional<PowerState> {
    return this.state(PowerStateName);
  }
  get [ConnectedStateName](): Optional<ConnectedState> {
    return this.state(ConnectedStateName);
  }
  get [ActiveStateName](): Optional<ActiveState> {
    return this.state(ActiveStateName);
  }
  get [TemperatureStateName](): Optional<TemperatureState> {
    return this.state(TemperatureStateName);
  }
}

@Injectable()
export class IceMakerFactory extends DeviceFactory<
  IceMakerDevice,
  Omit<IceMaker, 'NuggetSize'>
> {
  constructor() {
    super(IceMakerDevice, {
      'Home Appliances': {
        Kitchen: /ice maker/i,
      },
    });
  }
}

export type IceMakerStates = {
  [BasketFullStateName]: Optional<IceMakerBasketFull>;
  [MakingIceStateName]: Optional<IceMakerMakingIceState>;
  [NuggetSizeStateName]: Optional<IceMakerNuggetSizeState>;
  [ScheduledStartStateName]: Optional<IceMakerScheduledStart>;
  [IceMakerStatusStateName]: Optional<IceMakerStatusState>;
  [PowerStateName]: Optional<PowerState>;
  [ConnectedStateName]: Optional<ConnectedState>;
  [ActiveStateName]: Optional<ActiveState>;
  [TemperatureStateName]: Optional<TemperatureState>;
};

export type IceMaker = {
  NuggetSize: typeof NuggetSize;
} & IceMakerStates;
