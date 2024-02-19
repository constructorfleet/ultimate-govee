import { Injectable } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { DeviceModel } from '../../../devices.model';
import {
  ActiveState,
  ActiveStateName,
  ConnectedState,
  ConnectedStateName,
  ControlLockState,
  ControlLockStateName,
  DisplayScheduleState,
  DisplayScheduleStateName,
  ModeStateName,
  NightLightState,
  NightLightStateName,
  PowerState,
  PowerStateName,
  TimerState,
  TimerStateName,
} from '../../../states';
import { DefaultFactory, Device, StateFactories } from '../../../device';
import { DeviceFactory } from '../../../device.factory';
import { FanSpeedStateName, PurifierFanSpeedState } from './purifier.fan-speed';
import {
  CustomModeState,
  CustomModeStateName,
  ManualModeState,
  ManualModeStateName,
  PurifierActiveMode,
} from './purifier.modes';
import { Optional } from '~ultimate-govee/common';

const StateFactories: StateFactories = [
  (device: DeviceModel) => new PowerState(device),
  (device: DeviceModel) => new ConnectedState(device),
  (device: DeviceModel) => new ActiveState(device),
  (device: DeviceModel) => new DisplayScheduleState(device, 0xaa, 0x16),
  {
    H7126: [
      (device: DeviceModel) => new ManualModeState(device),
      (device: DeviceModel) => new CustomModeState(device),
      (device: DeviceModel) => new TimerState(device, 0xaa, 0x26),
    ],
    [DefaultFactory]: [
      (device: DeviceModel) => new PurifierFanSpeedState(device),
      (device: DeviceModel) => new NightLightState(device, 0xaa, 0x18),
      (device: DeviceModel) => new TimerState(device, 0xaa, 0x11),
      (device: DeviceModel) => new ControlLockState(device, 0xaa, 0x10),
    ],
  },
];

export const PurifierType: 'purifier' = 'purifier' as const;
export type PurifierType = typeof PurifierType;

export class PurifierDevice extends Device implements Purifier {
  static readonly deviceType: PurifierType = PurifierType;

  constructor(device: DeviceModel, eventBus: EventBus, commandBus: CommandBus) {
    super(device, eventBus, commandBus, StateFactories);
    const fanSpeedState = this.state<PurifierFanSpeedState>(FanSpeedStateName);
    if (!fanSpeedState) {
      const active = new PurifierActiveMode(device, [
        this.state(ManualModeStateName),
        this.state(CustomModeStateName),
      ]);
      this.addState(active);
      this.addState(new PurifierFanSpeedState(device, active));
    }
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
  get [DisplayScheduleStateName](): Optional<DisplayScheduleState> {
    return this.state(DisplayScheduleStateName);
  }
  get [ManualModeStateName](): Optional<ManualModeState> {
    return this.state(ManualModeStateName);
  }
  get [CustomModeStateName](): Optional<CustomModeState> {
    return this.state(CustomModeStateName);
  }
  get [TimerStateName](): Optional<TimerState> {
    return this.state(TimerStateName);
  }
  get [FanSpeedStateName](): Optional<PurifierFanSpeedState> {
    return this.state(FanSpeedStateName);
  }
  get [NightLightStateName](): Optional<NightLightState> {
    return this.state(NightLightStateName);
  }
  get [ControlLockStateName](): Optional<ControlLockState> {
    return this.state(ControlLockStateName);
  }
  get [ModeStateName](): Optional<PurifierActiveMode> {
    return this.state(ModeStateName);
  }
}

@Injectable()
export class PurifierFactory extends DeviceFactory<PurifierDevice> {
  constructor() {
    super(PurifierDevice, {
      'Home Appliances': {
        'Air Treatment': /Purifier/,
      },
    });
  }
}
export type Purifier = {
  [PowerStateName]: Optional<PowerState>;
  [ConnectedStateName]: Optional<ConnectedState>;
  [ActiveStateName]: Optional<ActiveState>;
  [DisplayScheduleStateName]: Optional<DisplayScheduleState>;
  [ManualModeStateName]: Optional<ManualModeState>;
  [CustomModeStateName]: Optional<CustomModeState>;
  [TimerStateName]: Optional<TimerState>;
  [FanSpeedStateName]: Optional<PurifierFanSpeedState>;
  [NightLightStateName]: Optional<NightLightState>;
  [ControlLockStateName]: Optional<ControlLockState>;
  [ModeStateName]: Optional<PurifierActiveMode>;
};
