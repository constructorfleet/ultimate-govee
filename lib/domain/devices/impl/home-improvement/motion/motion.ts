import { DeviceModel } from '../../../devices.model';
import { EventBus, CommandBus } from '@nestjs/cqrs';
import { Device, StateFactories } from '../../../device';
import {
  BatteryLevelState,
  // ConnectedState,
  // ConnectedStateName,
  PowerState,
  PowerStateName,
  UnknownState,
} from '../../../states';
import { DeviceFactory } from '../../../device.factory';
import { Injectable } from '@nestjs/common';
import { Optional } from '~ultimate-govee-common';
import { OpType } from '../../../../../common/op-code';
// import {
//   BiologicalPresenceState,
//   BiologicalPresenceStateName,
//   EnablePresenceState,
//   EnablePresenceStateName,
//   MMWavePresenceState,
//   MMWavePresenceStateName,
//   DetectionSettingsStateName,
//   DetectionSettingsState,
// } from './presence.states';

export const Motion: 'Motion' = 'Motion' as const;
export type Motion = typeof Motion;

const stateFactories: StateFactories = [
  (device) => new BatteryLevelState(device),
  (device) => new UnknownState(device, OpType.REPORT, 0x01),
  (device) => new UnknownState(device, OpType.REPORT, 0x02),
  (device) => new UnknownState(device, OpType.REPORT, 0x03),
  (device) => new UnknownState(device, OpType.REPORT, 0x04),
  (device) => new UnknownState(device, OpType.REPORT, 0x05),
];

export class MotionDevice extends Device<MotionSensor> implements MotionSensor {
  static readonly deviceType: string = Motion;
  protected isDebug: boolean = true;
  get deviceType(): string {
    return MotionDevice.deviceType;
  }
  constructor(device: DeviceModel, eventBus: EventBus, commandBus: CommandBus) {
    super(device, eventBus, commandBus, stateFactories);
  }

  get [PowerStateName](): Optional<PowerState> {
    return this.state(PowerStateName);
  }
  // Distance
  get ['unknown-1'](): Optional<UnknownState> {
    return this.state<UnknownState>('unknown-1');
  }
  // interval
  get ['unknown-2'](): Optional<UnknownState> {
    return this.state<UnknownState>('unknown-2');
  }
  get ['unknown-3'](): Optional<UnknownState> {
    return this.state<UnknownState>('unknown-3');
  }
  // light sensitivity
  get ['unknown-4'](): Optional<UnknownState> {
    return this.state<UnknownState>('unknown-4');
  }
  get ['unknown-5'](): Optional<UnknownState> {
    return this.state<UnknownState>('unknown-5');
  }
}

@Injectable()
export class MotionFactory extends DeviceFactory<MotionDevice, MotionSensor> {
  constructor() {
    super(MotionDevice, {
      'Home Improvement': {
        Sensors: /motion/i,
      },
    });
  }
}
export type MotionSensor = {
  ['unknown-1']: Optional<UnknownState>;
  ['unknown-2']: Optional<UnknownState>;
  ['unknown-3']: Optional<UnknownState>;
  ['unknown-4']: Optional<UnknownState>;
  ['unknown-5']: Optional<UnknownState>;
};
