import { DeviceModel } from '../../../devices.model';
import { DeviceOpState } from '../../../states';
import { OpType } from '~ultimate-govee-common/op-code';

export const BasketFullStateName = 'basketFull' as const;
export type BasketFullStateName = typeof BasketFullStateName;

export class IceMakerBasketFull extends DeviceOpState<
  BasketFullStateName,
  boolean | undefined
> {
  constructor(device: DeviceModel) {
    super(
      {
        opType: OpType.REPORT,
        identifier: [23],
      },
      device,
      BasketFullStateName,
      undefined,
    );
  }

  parseOpCommand(opCommand: number[]): void {
    this.stateValue.next(opCommand[1] === 0x01);
  }
}
