import { DeviceModel } from '../../../devices.model';
import { ParseOption } from '../../../states/states.types';
import { TemperatureState } from '../../../states/temperature.state';
import { OpType, total } from '~ultimate-govee-common/op-code';
export class IceMakerTemperatureState extends TemperatureState {
  constructor(deviceModel: DeviceModel) {
    super(deviceModel, OpType.REPORT, ParseOption.opCode, 16);
  }

  parseOpCommand(opCommand: number[]): void {
    const temp = total(opCommand.slice(1, 4));
    const isNegative = temp >> 23 !== 0;

    this.stateValue.next({
      current: (temp / 10000) * (isNegative ? -1 : 1),
      range: {
        min: -20,
        max: 60,
      },
      unit: 'C',
    });
  }
}
