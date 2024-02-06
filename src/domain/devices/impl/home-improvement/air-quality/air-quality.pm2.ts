import { Subject } from 'rxjs';
import { Optional } from '@govee/common';
import { NumericState } from '../../states/numeric.state';

export const PM2StateName: 'pm2' = 'pm2' as const;
export type PM2StateName = typeof PM2StateName;

export const PM2State = NumericState(
  PM2StateName,
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
);
