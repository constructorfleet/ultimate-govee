import { Subscription } from 'rxjs';
import { Optional, asOpCode } from '@constructorfleet/ultimate-govee/common';
import { DeviceOpState, StateCommandAndStatus } from '../../../states';
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
  Optional<number>
> {
  private subscription: Subscription | undefined;
  constructor(
    device: DeviceModel,
    private readonly active: PurifierActiveMode | undefined = undefined,
    opType: number = 0xaa,
    identifier: number[] = [0x05],
  ) {
    super({ opType, identifier }, device, FanSpeedStateName, undefined);
    if (active !== undefined) {
      active?.subscribe((event) => {
        if (this.subscription !== undefined) {
          this.subscription.unsubscribe();
        }
        switch (event?.name) {
          case CustomModeStateName:
            this.subscription = event?.subscribe((event) => {
              const speed = (event as CustomProgram)?.fanSpeed;
              this.stateValue.next(speed ? speed * 25 : speed);
            });
            break;
          case ManualModeStateName:
            this.subscription = event?.subscribe((event) => {
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

  protected stateToCommand(
    nextState: Optional<number>,
  ): Optional<StateCommandAndStatus> {
    if (this.active === undefined) {
      return {
        command: {
          data: {
            command: [
              asOpCode(
                0x33,
                this.identifier!,
                nextState === 0 || nextState === undefined ? 16 : nextState - 1,
              ),
            ],
          },
        },
        status: {
          op: {
            command: [
              [nextState === 0 || nextState === undefined ? 16 : nextState - 1],
            ],
          },
        },
      };
    }
    if (this.active.value === undefined) {
      this.logger.log('Unable to determine current mode, ignoring command');
      return undefined;
    }
    switch (this.active.value.name) {
      case ManualModeStateName:
        return this.active.value.setState(nextState);
      case CustomModeStateName:
        return this.active.value.setState({
          fanSpeed: nextState,
        });
      default:
        return undefined;
    }
  }
}