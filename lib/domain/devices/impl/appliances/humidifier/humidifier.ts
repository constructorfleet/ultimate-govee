import { Injectable } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import {
  ActiveState,
  ActiveStateName,
  ConnectedState,
  ConnectedStateName,
  ControlLockState,
  ControlLockStateName,
  DisplayScheduleState,
  HumidityState,
  HumidityStateName,
  ModeStateName,
  NightLightState,
  NightLightStateName,
  PowerState,
  PowerStateName,
  TimerState,
  TimerStateName,
  WaterShortageState,
  WaterShortageStateName,
} from '../../../states';
import { DeviceModel } from '../../../devices.model';
import { Device, StateFactories } from '../../../device';
import {
  TargetHumidityState,
  TargetHumidityStateName,
} from './humidifier.target-humidity';
import { MistLevelState, MistLevelStateName } from './humidifier.mist';
import {
  AutoModeState,
  AutoModeStateName,
  CustomModeState,
  CustomModeStateName,
  HumidifierActiveState,
  ManualModeState,
  ManualModeStateName,
} from './humidifier.modes';
import { DeviceFactory } from '../../../device.factory';
import { HumidiferUVCState, UVCStateName } from './humidifier.uvc';
import { Optional } from '../../../../../common/types';

const StateFactories: StateFactories = [
  (device: DeviceModel) => new PowerState(device),
  (device: DeviceModel) => new ConnectedState(device),
  (device: DeviceModel) => new ActiveState(device),
  (device: DeviceModel) => new WaterShortageState(device),
  (device: DeviceModel) => new TimerState(device, 0x0a, 0x0b),
  (device: DeviceModel) => new ManualModeState(device),
  (device: DeviceModel) => new CustomModeState(device),
  {
    H7141: [
      (device: DeviceModel) => new NightLightState(device, 0xaa, 0x18),
      (device: DeviceModel) => new ControlLockState(device, 0xaa, 0x0a),
    ],
    H7142: [
      (device: DeviceModel) => new NightLightState(device, 0xaa, 0x1b),
      (device: DeviceModel) => new DisplayScheduleState(device, 0xaa, 0x18),
      (device: DeviceModel) => new HumidiferUVCState(device),
      (device: DeviceModel) => new HumidityState(device),
    ],
  },
];

export const HumidifierType: 'humidifer' = 'humidifer' as const;
export type HumidifierType = typeof HumidifierType;

export class HumidifierDevice extends Device<Humidifier> implements Humidifier {
  static readonly deviceType: HumidifierType = HumidifierType;
  get deviceType(): string {
    return HumidifierDevice.deviceType;
  }

  constructor(device: DeviceModel, eventBus: EventBus, commandBus: CommandBus) {
    super(device, eventBus, commandBus, StateFactories);
    const autoModeState = this.addState(
      new AutoModeState(device, this.state<HumidityState>(HumidityStateName)),
    );
    const activeState = new HumidifierActiveState(device, [
      this.state(ManualModeStateName),
      this.state(CustomModeStateName),
      autoModeState,
    ]);
    this.addState(activeState);
    this.addState(new MistLevelState(device, activeState));
    this.addState(new TargetHumidityState(device, activeState));
  }
  get [MistLevelStateName](): Optional<MistLevelState> {
    return this.state(MistLevelStateName);
  }
  get [ManualModeStateName](): Optional<ManualModeState> {
    return this.state(ManualModeStateName);
  }
  get [CustomModeStateName](): Optional<CustomModeState> {
    return this.state(CustomModeStateName);
  }
  get [AutoModeStateName](): Optional<AutoModeState> {
    return this.state(AutoModeStateName);
  }
  get [TargetHumidityStateName](): Optional<TargetHumidityState> {
    return this.state(TargetHumidityStateName);
  }
  get [ModeStateName](): Optional<HumidifierActiveState> {
    return this.state(ModeStateName);
  }
  get [UVCStateName](): Optional<HumidiferUVCState> {
    return this.state(UVCStateName);
  }
  get [HumidityStateName](): Optional<HumidityState> {
    return this.state(HumidityStateName);
  }
  get [PowerStateName](): Optional<PowerState> {
    return this.state(PowerStateName);
  }
  get [ConnectedStateName](): Optional<ConnectedState> {
    return this.state(ConnectedStateName);
  }
  get [WaterShortageStateName](): Optional<WaterShortageState> {
    return this.state(WaterShortageStateName);
  }
  get [TimerStateName](): Optional<TimerState> {
    return this.state(TimerStateName);
  }
  get [NightLightStateName](): Optional<NightLightState> {
    return this.state(NightLightStateName);
  }
  get [ControlLockStateName](): Optional<ControlLockState> {
    return this.state(ControlLockStateName);
  }
  get [ActiveStateName](): Optional<ActiveState> {
    return this.state(ActiveStateName);
  }
}

@Injectable()
export class HumidifierFactory extends DeviceFactory<
  HumidifierDevice,
  Humidifier
> {
  constructor() {
    super(HumidifierDevice, {
      'Home Appliances': {
        'Air Treatment': /humidifier/i,
      },
    });
  }
}
export type Humidifier = {
  [MistLevelStateName]: Optional<MistLevelState>;
  [ManualModeStateName]: Optional<ManualModeState>;
  [CustomModeStateName]: Optional<CustomModeState>;
  [AutoModeStateName]: Optional<AutoModeState>;
  [TargetHumidityStateName]: Optional<TargetHumidityState>;
  [ModeStateName]: Optional<HumidifierActiveState>;
  [UVCStateName]: Optional<HumidiferUVCState>;
  [HumidityStateName]: Optional<HumidityState>;
  [PowerStateName]: Optional<PowerState>;
  [ConnectedStateName]: Optional<ConnectedState>;
  [WaterShortageStateName]: Optional<WaterShortageState>;
  [TimerStateName]: Optional<TimerState>;
  [NightLightStateName]: Optional<NightLightState>;
  [ControlLockStateName]: Optional<ControlLockState>;
  [TimerStateName]: Optional<TimerState>;
  [ActiveStateName]: Optional<ActiveState>;
};
