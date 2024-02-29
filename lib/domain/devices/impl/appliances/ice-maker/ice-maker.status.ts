import { DeviceModel } from '../../../devices.model';
import { DeviceOpState } from '../../../states';
import { IceMakerStatus, statusMap } from './types';
import { OpType } from '~ultimate-govee-common/op-code';

export const IceMakerStatusStateName: 'iceMakerStatus' =
  'iceMakerStatus' as const;
export type IceMakerStatusStateName = typeof IceMakerStatusStateName;

export class IceMakerStatusState extends DeviceOpState<
  IceMakerStatusStateName,
  IceMakerStatus | undefined
> {
  constructor(device: DeviceModel) {
    super(
      { opType: OpType.REPORT, identifier: [0x19] },
      device,
      IceMakerStatusStateName,
      undefined,
      'opCode',
    );
  }

  parseOpCommand(opCommand: number[]): void {
    this.stateValue.next(
      IceMakerStatus[
        Object.entries(statusMap).find(
          ([_, num]) => num === opCommand[0],
        )?.[0] ?? 'STANDBY'
      ],
    );
  }
}
