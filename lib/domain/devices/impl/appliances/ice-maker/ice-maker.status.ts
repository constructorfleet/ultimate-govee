import { Optional, asOpCode } from '@constructorfleet/ultimate-govee/common';
import { DeviceModel } from '@constructorfleet/ultimate-govee/domain/devices';
import { DeviceOpState } from '@constructorfleet/ultimate-govee/domain/devices/states';
import { IceMakerStatus, statusMap } from './types';

export const IceMakerStatusStateName: 'iceMakerStatus' =
  'iceMakerStatus' as const;
export type IceMakerStatusStatename = typeof IceMakerStatusStateName;

export class IceMakerStatusState extends DeviceOpState<
  IceMakerStatusStatename,
  IceMakerStatus | undefined
> {
  constructor(device: DeviceModel) {
    super(
      { opType: 0xaa, identifier: [0x19] },
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
          ([size, num]) => num === opCommand[0],
        )?.[0] ?? 'STANDBY'
      ],
    );
  }
}
