import {
  ActiveState,
  LightEffectStateName,
  ModeStateName,
  UnknownState,
} from '../../../states';
import {
  DIYModeState,
  DIYModeStateName,
  MicModeState,
  MicModeStateName,
  SceneModeState,
  SegmentColorModeState,
  SegmentColorModeStateName,
  SyncBoxActiveState,
  VideoModeState,
  VideoModeStateName,
} from './dreamview.states';
import { OpType, Optional } from '~ultimate-govee-common';
import { Device, StateFactories } from '../../../device';
import { DeviceFactory } from '../../../device.factory';
import { Injectable } from '@nestjs/common';
import { DeviceModel } from '../../../devices.model';
import { CommandBus, EventBus } from '@nestjs/cqrs';

export const DreamViewDeviceType: 'dreamview' = 'dreamview' as const;
export type DreamViewDeviceType = typeof DreamViewDeviceType;

const stateFactories: StateFactories = [
  (device) => new ActiveState(device),
  (device) => new VideoModeState(device),
  (device) => new SegmentColorModeState(device),
  (device) => new MicModeState(device),
  (device) => new SceneModeState(device),
  (device) => new DIYModeState(device),
  (device) => new UnknownState(device, OpType.REPORT, 17),
  (device) => new UnknownState(device, OpType.REPORT, 18),
  (device) => new UnknownState(device, OpType.REPORT, 35),
  (device) => new UnknownState(device, OpType.REPORT, 7, 7),
  (device) => new UnknownState(device, OpType.REPORT, 7, 8),
  (device) => new UnknownState(device, OpType.REPORT, 183),
  (device) => new UnknownState(device, OpType.REPORT, 174),
  (device) => new UnknownState(device, 238),
];

export class DreamViewDevice extends Device<DreamView> implements DreamView {
  static readonly deviceType = DreamViewDeviceType;
  protected isDebug: boolean = true;

  constructor(device: DeviceModel, eventBus: EventBus, commandBus: CommandBus) {
    super(device, eventBus, commandBus, stateFactories);
  }

  get deviceType(): string {
    return DreamViewDevice.deviceType;
  }
  get [VideoModeStateName](): Optional<VideoModeState> {
    return this.state(VideoModeStateName);
  }
  get [MicModeStateName](): Optional<MicModeState> {
    return this.state(MicModeStateName);
  }
  get [LightEffectStateName](): Optional<SceneModeState> {
    return this.state(LightEffectStateName);
  }
  get [SegmentColorModeStateName](): Optional<SegmentColorModeState> {
    return this.state(SegmentColorModeStateName);
  }
  get [DIYModeStateName](): Optional<DIYModeState> {
    return this.state(DIYModeStateName);
  }
  get [ModeStateName](): Optional<SyncBoxActiveState> {
    return this.state(ModeStateName);
  }
  get ['unknown-17'](): Optional<UnknownState> {
    return this.state('unknown-17');
  }
  get ['unknown-18'](): Optional<UnknownState> {
    return this.state('unknown-18');
  }
  get ['unknown-35'](): Optional<UnknownState> {
    return this.state('unknown-38');
  }
  get ['unknown-7,7'](): Optional<UnknownState> {
    return this.state('unknown-7,7');
  }
  get ['unknown-7,8'](): Optional<UnknownState> {
    return this.state('unknown-7,8');
  }
  get ['unknown-183'](): Optional<UnknownState> {
    return this.state('unknown-183');
  }
  get ['unknown-174'](): Optional<UnknownState> {
    return this.state('unknown-174');
  }
  get ['unknown-238'](): Optional<UnknownState> {
    return this.state('unknown-238');
  }
}

export type DreamView = {
  get [VideoModeStateName](): Optional<VideoModeState>;
  get [MicModeStateName](): Optional<MicModeState>;
  get [LightEffectStateName](): Optional<SceneModeState>;
  get [SegmentColorModeStateName](): Optional<SegmentColorModeState>;
  get [DIYModeStateName](): Optional<DIYModeState>;
  get [ModeStateName](): Optional<SyncBoxActiveState>;
  get ['unknown-17'](): Optional<UnknownState>;
  get ['unknown-18'](): Optional<UnknownState>;
  get ['unknown-35'](): Optional<UnknownState>;
  get ['unknown-7,7'](): Optional<UnknownState>;
  get ['unknown-7,8'](): Optional<UnknownState>;
  get ['unknown-183'](): Optional<UnknownState>;
  get ['unknown-174'](): Optional<UnknownState>;
  get ['unknown-238'](): Optional<UnknownState>;
};

@Injectable()
export class DreamViewFactory extends DeviceFactory<
  DreamViewDevice,
  DreamView
> {
  constructor() {
    super(DreamViewDevice, {
      'LED Strip Light': {
        'TV BackLights': /.*dreamview.*/i,
      },
      'Indoor Lighting': {
        'Table Lamps': /.*dreamview.*/i,
      },
    });
  }
}
