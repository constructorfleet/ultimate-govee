import { TemperatureState as BaseState } from '../../../states/temperature.state';
import { DeviceModel } from '../../../devices.model';
import { ParseOption } from '~ultimate-govee-domain/devices/states';

export class TemperatureState extends BaseState {
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
    const rawTempC = ((opCommand[0] << 8) | opCommand[1]) / 100;
    const tempCal =
      Math.trunc((((opCommand[2] - opCommand[3]) >> 1) / 255) * 100) / -10;
    const currentTempC = rawTempC + tempCal;

    this.stateValue.next({
      ...this.stateValue.getValue(),
      raw: rawTempC,
      calibration: tempCal,
      current: currentTempC,
    });
  }
}
