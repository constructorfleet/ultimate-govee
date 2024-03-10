import {
  Duration,
  Distance,
  Optional,
  OpType,
  total,
} from '~ultimate-govee-common';
import { DeviceModel } from '../devices.model';
import { DeviceOpState } from './device.state';

export type PresenceStateTypeName<PresenceType extends string> =
  `presence-${PresenceType}`;
export const PresenceStateName = <PresenceType extends string>(
  type: PresenceType,
): PresenceStateTypeName<PresenceType> => {
  return `presence-${type}`;
};

export type PresenceData = {
  type: string;
  detected: boolean;
  duration?: Duration;
  distance?: Distance;
};

export class PresenceState<
  PresenceType extends string = 'basic',
> extends DeviceOpState<
  PresenceStateTypeName<PresenceType>,
  Optional<PresenceData>
> {
  constructor(
    device: DeviceModel,
    private readonly presenceType: PresenceType,
    opType: number = OpType.REPORT,
    ...identifier: number[]
  ) {
    super(
      { opType, identifier },
      device,
      PresenceStateName(presenceType),
      undefined,
      'opCode',
    );
  }

  parseOpCommand(opCommand: number[]) {
    const [detected, distanceByte1, distanceByte0] = opCommand.slice(0, 3);
    const distance = total([distanceByte1, distanceByte0]);
    let duration: number | undefined;
    if (opCommand.length > 14) {
      duration = total(opCommand.slice(-12, -8));
    }

    this.stateValue.next({
      type: this.presenceType,
      detected: detected === 0x01,
      distance: {
        unit: 'cm',
        value: distance,
      },
      duration:
        duration === undefined
          ? undefined
          : {
              unit: 's',
              value: duration,
            },
    });
  }
}
