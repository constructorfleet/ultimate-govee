import { DeviceOpState, DeviceModel } from '../../..';
import {
  CustomMode,
  CustomModeStateName,
  ManualModeStateName,
  PurifierActiveMode,
} from './purifier.modes';

export const FanSpeedStateName: 'fanSpeed' = 'fanSpeed' as const;
export type FanSpeedStateName = typeof FanSpeedStateName;

export class PurifierFanSpeedState extends DeviceOpState<
  FanSpeedStateName,
  number | undefined
> {
  constructor(
    device: DeviceModel,
    private readonly active: PurifierActiveMode | undefined = undefined,
    opType: number = 0xaa,
    identifier: number = 0x05,
  ) {
    super({ opType, identifier }, device, FanSpeedStateName, undefined);
    if (active !== undefined) {
      active.subscribe((event) => {
        switch (event?.name) {
          case CustomModeStateName:
            this.stateValue.next(
              (event.value as CustomMode)?.currentProgram?.fanSpeed,
            );
            break;
          case ManualModeStateName:
            this.stateValue.next(event.value as number | undefined);
            break;
          default:
            this.stateValue.next(undefined);
            break;
        }
      });
    }
  }

  parseOpCommand(opCommand: number[]): void {
    const speed = opCommand[0] !== 16 ? opCommand[0] + 1 : 1;
    this.stateValue.next(speed * 25);
  }
}
