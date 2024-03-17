import { HumidityState as BaseState } from '../../../states/humidity.state';
import { DeviceModel } from '../../../devices.model';
import { ParseOption } from '~ultimate-govee-domain/devices/states';

export class HumidityState extends BaseState {
  protected parseOption: ParseOption = 'both';
  constructor(device: DeviceModel) {
    super(device);
  }

  parseOpCommand(opCommand: number[]): void {
    if (opCommand.every((code) => code === 0x00)) {
      return;
    }
    if (opCommand[0] === 0x01) {
      return;
    }
    const rawHumidity = ((opCommand[9] << 8) | opCommand[10]) / 100;
    const humidityCal =
      Math.trunc((((opCommand[11] - opCommand[12]) >> 1) / 255) * -100) / 10;
    const currentHumidity = rawHumidity + humidityCal;

    this.stateValue.next({
      ...this.stateValue.getValue(),
      raw: rawHumidity,
      calibration: humidityCal,
      current: currentHumidity,
    });
  }
}
