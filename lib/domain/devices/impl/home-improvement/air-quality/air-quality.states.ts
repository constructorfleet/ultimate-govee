import { HumidityState as BaseHumidityState } from '../../../states/humidity.state';
import { TemperatureState as BaseTemperatureState } from '../../../states/temperature.state';
import { DeviceModel } from '../../../devices.model';
import {
  ParseOption,
  MeasurementData,
  MessageData,
} from '../../../states/states.types';
import { DeviceOpState } from '../../../states/device.state';

export class HumidityState extends BaseHumidityState {
  constructor(device: DeviceModel) {
    super(device, null, ParseOption.multiOp);
  }

  parseMultiOpCommand(opCommands: number[][]): void {
    const opCommand = opCommands[0];
    const raw = ((opCommand[9] << 8) | opCommand[10]) / 100;
    const rawCal = (opCommand[11] << 8) | opCommand[12];
    const calibration = ((rawCal & 0x7fff) - (rawCal & 0x8000)) / 100;
    const current = raw + calibration;

    this.stateValue.next({
      ...this.stateValue.getValue(),
      raw,
      calibration,
      current,
      unit: '%',
    });
  }
}

export class TemperatureState extends BaseTemperatureState {
  protected parseOption: ParseOption = ParseOption.multiOp.union(
    ParseOption.state,
  );
  constructor(device: DeviceModel) {
    super(device, null, ParseOption.multiOp);
  }

  parseMultiOpCommand(opCommands: number[][]) {
    const opCommand = opCommands[0];
    const raw = ((opCommand[0] << 8) | opCommand[1]) / 100;
    const rawCal = (opCommand[2] << 8) | opCommand[3];
    const calibration = ((rawCal & 0x7fff) - (rawCal & 0x8000)) / 100;
    const current = raw + calibration;
    // const unit = opCommands[1][8] === 1 ? 'F' : 'C';

    this.stateValue.next({
      ...this.stateValue.getValue(),
      raw,
      calibration,
      current,
      unit: 'C',
    });
  }
}

export const PM25StateName: 'pm25' = 'pm25' as const;
export type PM25StateName = typeof PM25StateName;

export class PM25State extends DeviceOpState<PM25StateName, MeasurementData> {
  constructor(device: DeviceModel) {
    super(
      { opType: null, identifier: null },
      device,
      PM25StateName,
      {},
      ParseOption.multiOp.union(ParseOption.state),
    );
  }

  parseMultiOpCommand(opCommands: number[][]): void {
    const opCommand = opCommands[0];
    this.stateValue.next({
      range: {
        min: 0,
        max: 1000,
      },
      current: (opCommand[18] << 8) | opCommand[19],
      unit: '\u00B5g/m\u00B3',
    });
  }

  parseState(data: MessageData['state']): void {
    if (data?.pm25 !== undefined) {
      this.stateValue.next({
        range: {
          min: 0,
          max: 1000,
        },
        current: data.pm25.current,
      });
    }
  }
}

// Warning [0n 4] High [5 6] / 100 Low [7 8] / 100

// Unit line 2 [8] 0 = F, 1 = C
// Display line 2 [5] 0 = PM2.5 1 = Time
// Time 24H [7] 0 = 12H, 1 = 24H

// Daytime Display [7] 0 = off 1 =on
//    Start = hour [9] min [10]
//    Brighness = [11] 1 - 7

// Nightime display [15] 0 = off 1 = on
//
//    Brightness = [19] 1 - 7

// Warning [0n 13] low [16 17] high[14 15]
