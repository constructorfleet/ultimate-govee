import { DeviceModel } from '../../../devices.model';
import { DeviceOpState, ParseOption } from '../../../states';
import { OpType } from '~ultimate-govee-common/op-code';

export const BasketFullStateName = 'basketFull' as const;
export type BasketFullStateName = typeof BasketFullStateName;

export class IceMakerBasketFull extends DeviceOpState<
  BasketFullStateName,
  boolean | undefined
> {
  protected parseOption: ParseOption = 'both';
  constructor(device: DeviceModel) {
    super(
      {
        opType: OpType.REPORT,
        identifier: [31, 7],
      },
      device,
      BasketFullStateName,
      undefined,
    );
  }

  parseOpCommand(opCommand: number[]): void {
    this.stateValue.next(opCommand[0] === 0x01);
  }
}
