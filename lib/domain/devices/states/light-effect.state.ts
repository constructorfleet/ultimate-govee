import {
  DeltaMap,
  Optional,
  total,
} from '@constructorfleet/ultimate-govee/common';
import { BehaviorSubject } from 'rxjs';
import { Effect } from '@constructorfleet/ultimate-govee/data';
import { DeviceModel } from '../devices.model';
import { DeviceOpState } from './device.state';

export const LightEffectStateName: 'lightEffect' = 'lightEffect' as const;
export type LightEffectStateName = typeof LightEffectStateName;
export type LightEffect = Partial<Effect>;

export class LightEffectState extends DeviceOpState<
  LightEffectStateName,
  LightEffect
> {
  readonly effects: DeltaMap<number, LightEffect> = new DeltaMap();
  readonly activeEffectCode: BehaviorSubject<number | undefined> =
    new BehaviorSubject<number | undefined>(undefined);
  constructor(
    device: DeviceModel,
    opType: Optional<number> = 0xaa,
    identifier: Optional<number[]> = [0x05],
  ) {
    super({ opType, identifier }, device, LightEffectStateName, {});
    this.activeEffectCode.subscribe((effectCode) =>
      this.stateValue$.next(this.effects.get(effectCode ?? -1) ?? {}),
    );
    this.effects.delta$.subscribe(() => {
      this.stateValue$.next(this.stateValue$.getValue());
    });
  }

  parseOpCommand(opCommand: number[]) {
    const effectCode: number = total(opCommand.slice(0, 2));
    this.activeEffectCode.next(effectCode);
  }
}
