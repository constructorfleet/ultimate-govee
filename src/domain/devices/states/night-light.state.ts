import { DeviceModel } from '../devices.model';
import { DeviceOpState } from './device.state';

export const NightLightStateName: 'nightLight' = 'nightLight' as const;
export type NightLightStateName = typeof NightLightStateName;

export type NightLight = {
  on?: boolean;
  brightness?: number;
};

export class NightLightState extends DeviceOpState<
  NightLightStateName,
  NightLight
> {
  constructor(
    device: DeviceModel,
    opType: number = 0xaa,
    identifier: number = 0x12,
  ) {
    super({ opType, identifier }, device, NightLightStateName, {
      on: undefined,
      brightness: undefined,
    });
  }

  parseOpCommand(opCommand: number[]) {
    const [on, brightness] = opCommand.slice(0, 2);
    this.stateValue.next({
      on: on === 0x01,
      brightness,
    });
  }
}
