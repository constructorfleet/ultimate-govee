import { Subscription } from 'rxjs';
import { DeviceOpState } from '../../../states';
import { DeviceModel } from '../../../devices.model';
import {
  CustomModeStateName,
  CustomProgram,
  ManualModeStateName,
  PurifierActiveMode,
} from './purifier.modes';

export const FanSpeedStateName: 'fanSpeed' = 'fanSpeed' as const;
export type FanSpeedStateName = typeof FanSpeedStateName;

export class PurifierFanSpeedState extends DeviceOpState<
  FanSpeedStateName,
  number | undefined
> {
  private subscription: Subscription | undefined;
  constructor(
    device: DeviceModel,
    private readonly active: PurifierActiveMode | undefined = undefined,
    opType: number = 0xaa,
    identifier: number = 0x05,
  ) {
    super({ opType, identifier }, device, FanSpeedStateName, undefined);
    if (active !== undefined) {
      active.subscribe((event) => {
        if (this.subscription !== undefined) {
          this.subscription.unsubscribe();
        }
        switch (event?.name) {
          case CustomModeStateName:
            this.subscription = event.subscribe((event) => {
              const speed = (event as CustomProgram)?.fanSpeed;
              this.stateValue.next(speed ? speed * 25 : speed);
            });
            break;
          case ManualModeStateName:
            this.subscription = event.subscribe((event) => {
              const speed = event as number;
              this.stateValue.next(speed ? speed * 25 : speed);
            });
            break;
          default:
            this.stateValue.next(undefined);
            break;
        }
      });
    }
  }

  parseOpCommand(opCommand: number[]): void {
    if (this.active !== undefined) {
      return;
    }
    const speed = opCommand[0] !== 16 ? opCommand[0] + 1 : 1;
    this.stateValue.next(speed * 25);
  }
}
