import { DeviceModel } from '../../../devices.model';
import { DeviceOpState } from '../../../states/device.state';
import { StateCommandAndStatus } from '../../../states/states.types';
import {
  PresenceState,
  PresenceStateTypeName,
} from '../../../states/presence.state';
import {
  Duration,
  OpType,
  Optional,
  Distance,
  asOpCode,
  total,
} from '~ultimate-govee-common';
import MomentLib from 'moment';
import { GoveeCommand } from '~ultimate-govee-data';

export const MMWavePresenceStateName: PresenceStateTypeName<'mmWave'> =
  'presence-mmWave' as const;
export type MMWavePresenceStateName = typeof MMWavePresenceStateName;
export const BiologicalPresenceStateName: PresenceStateTypeName<'biological'> =
  'presence-biological' as const;
export type BiologicalPresenceStateName = typeof BiologicalPresenceStateName;

export class MMWavePresenceState extends PresenceState<'mmWave'> {
  constructor(device: DeviceModel) {
    super(device, 'mmWave', OpType.REPORT, 1);
  }
}

export class BiologicalPresenceState extends PresenceState<'biological'> {
  constructor(device: DeviceModel) {
    super(device, 'biological', OpType.REPORT, 1, -1, -1, -1);
  }
}

export const EnablePresenceStateName: 'enablePresence' =
  'enablePresence' as const;
export type EnablePresenceStateName = typeof EnablePresenceStateName;

export type EnablePresenceFlags = {
  mmWaveEnabled?: boolean;
  biologicalEnabled?: boolean;
};

export class EnablePresenceState extends DeviceOpState<
  EnablePresenceStateName,
  EnablePresenceFlags
> {
  constructor(device: DeviceModel, defaultState: EnablePresenceFlags = {}) {
    super(
      { opType: OpType.REPORT, identifier: [31] },
      device,
      EnablePresenceStateName,
      defaultState,
    );
  }

  parseOpCommand(opCommand: number[]): void {
    this.stateValue.next({
      biologicalEnabled: opCommand[0] === 0x01,
      mmWaveEnabled: opCommand[1] === 0x01,
    });
  }

  protected stateToCommand(
    state: EnablePresenceFlags,
  ): Optional<StateCommandAndStatus> {
    if (
      (state.biologicalEnabled ?? this.value.biologicalEnabled) === undefined
    ) {
      this.logger.warn('Missing biologicalEnabled, skipping command');
      return undefined;
    }
    if ((state.mmWaveEnabled ?? this.value.mmWaveEnabled) === undefined) {
      this.logger.warn('Missing mmWaveEnabled, skipping command');
      return undefined;
    }
    return {
      command: {
        command: 'multiSync' as GoveeCommand,
        data: {
          command: [
            asOpCode(
              OpType.COMMAND,
              ...(this.identifier as number[])!,
              (state.biologicalEnabled ?? this.value.biologicalEnabled) === true
                ? 0x01
                : 0x00,
              (state.mmWaveEnabled ?? this.value.mmWaveEnabled) === true
                ? 0x01
                : 0x00,
            ),
          ],
        },
      },
      status: {
        op: {
          command: [
            [
              (state.biologicalEnabled ?? this.value.biologicalEnabled) === true
                ? 0x01
                : 0x00,
              (state.mmWaveEnabled ?? this.value.mmWaveEnabled) === true
                ? 0x01
                : 0x00,
            ],
          ],
        },
      },
    };
  }
}

export const DetectionSettingsStateName: 'detectionSettings' =
  'detectionSettings' as const;
export type DetectionSettingsStateName = typeof DetectionSettingsStateName;

export type DetectionSettings = {
  reportDetection?: Duration;
  absenceDuration?: Duration;
  detectionDistance?: Distance;
};

export class DetectionSettingsState extends DeviceOpState<
  DetectionSettingsStateName,
  DetectionSettings
> {
  constructor(device: DeviceModel) {
    super(
      {
        opType: OpType.REPORT,
        identifier: [0x05, 0x01],
      },
      device,
      DetectionSettingsStateName,
      {},
      'opCode',
    );
  }

  parseOpCommand(opCommand: number[]): void {
    this.stateValue.next({
      detectionDistance: {
        value: total(opCommand.slice(0, 2)),
        unit: 'cm',
      },
      absenceDuration: {
        value: total(opCommand.slice(2, 4)),
        unit: 's',
      },
      reportDetection: {
        value: total(opCommand.slice(4, 6)),
        unit: 's',
      },
    });
  }

  protected stateToCommand(
    state: DetectionSettings,
  ): Optional<StateCommandAndStatus> {
    const distance = state.detectionDistance ?? this.value.detectionDistance;
    const absence = state.absenceDuration ?? this.value.absenceDuration;
    const report = state.reportDetection ?? this.value.reportDetection;
    if (distance?.value === undefined) {
      this.logger.warn('Missing detection distance value, ignoring command.');
      return;
    }
    if (absence?.value === undefined) {
      this.logger.warn('Missing absence duration, ignoring command');
      return;
    }
    if (report?.value === undefined) {
      this.logger.warn('Missing report detection, ignoring command');
      return;
    }

    absence.value = MomentLib.duration(absence.value, absence.unit).asSeconds();
    report.value = MomentLib.duration(report.value, report.unit).asSeconds();

    // TODO: Convert distance
    const distanceValue = [distance.value >> 8, distance.value % 256];
    const absenceValue = [absence.value >> 8, absence.value % 256];
    const reportValue = [report.value >> 8, report.value % 256];

    return {
      command: {
        data: {
          command: [
            asOpCode(OpType.COMMAND, 0x05, 0x00, 0x01),
            asOpCode(
              OpType.COMMAND,
              ...(this.identifier as number[]),
              ...distanceValue,
              ...absenceValue,
              ...reportValue,
            ),
          ],
        },
      },
      status: {
        op: {
          command: [[...distanceValue, ...absenceValue, ...reportValue]],
        },
      },
    };
  }
}
