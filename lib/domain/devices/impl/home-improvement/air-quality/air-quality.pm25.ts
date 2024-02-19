import { Subject } from 'rxjs';
import { Optional } from '@constructorfleet/ultimate-govee/common';
import { NumericState } from '../../../states/numeric.state';
import { Measurement } from '@constructorfleet/ultimate-govee/data';

export const PM25StateName: 'pm25' = 'pm25' as const;
export type PM25StateName = typeof PM25StateName;

export const PM25State = NumericState(
  PM25StateName,
  (opCommand: number[], stateValue: Subject<Optional<number>>) => {
    if (opCommand.every((code) => code === 0x00)) {
      return;
    }
    if (opCommand[0] === 0x01) {
      return;
    }

    const rawPM2 = (opCommand[18] << 8) | opCommand[19];

    stateValue.next(rawPM2);
  },
  (
    status: { state: { pm25?: Measurement } },
    stateValue: Subject<Optional<number>>,
  ) => {
    if (status.state.pm25 !== undefined) {
      stateValue.next(status.state.pm25.current);
    }
  },
);
