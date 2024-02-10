import { Injectable, Logger } from '@nestjs/common';
import { Optional } from '@govee/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { AppliancesFactory } from './impl/appliances/appliances.factory';
import { LightsFactory } from './impl/lights/lights.factory';
import { DeviceModel } from './devices.model';
import { Device } from './device';
import { HomeImprovementFactory } from './impl/home-improvement';
import {
  ActiveState,
  BatteryLevelState,
  BrightnessState,
  ColorRGBState,
  ColorTempState,
  ConnectedState,
  ControlLockState,
  DisplayScheduleState,
  FilterState,
  HumidityState,
  LightEffectState,
  ModeState,
  NightLightState,
  PowerState,
  SegmentCountState,
  TemperatureState,
  TimerState,
  WaterShortageState,
} from './states';

const defaultStateFactories = [
  (device) => new ActiveState(device),
  (device) => new BatteryLevelState(device),
  (device) => new BrightnessState(device),
  (device) => new ColorRGBState(device),
  (device) => new ColorTempState(device),
  (device) => new ConnectedState(device),
  (device) => new ControlLockState(device),
  (device) => new DisplayScheduleState(device),
  (device) => new FilterState(device),
  (device) => new HumidityState(device),
  (device) => new LightEffectState(device),
  (device) => new ModeState(device, []),
  (device) => new NightLightState(device),
  (device) => new PowerState(device),
  (device) => new SegmentCountState(device),
  (device) => new TemperatureState(device),
  (device) => new TimerState(device),
  (device) => new WaterShortageState(device),
];

@Injectable()
export class DevicesFactory {
  private readonly logger: Logger = new Logger(DevicesFactory.name);

  constructor(
    private readonly applianceFactory: AppliancesFactory,
    private readonly lightFactory: LightsFactory,
    private readonly homeImprovementFactory: HomeImprovementFactory,
    private readonly eventBus: EventBus,
    private readonly commandBus: CommandBus,
  ) {}

  create(device: DeviceModel): Optional<Device> {
    const knownDevice = [
      this.applianceFactory,
      this.lightFactory,
      this.homeImprovementFactory,
    ]
      .map((factory) => factory.create(device))
      .find((d) => d !== undefined);

    if (knownDevice !== undefined) {
      return knownDevice;
    }

    this.logger.log(
      `Unable to determine device type for ${device.model} ${device.category} ${device.modelName}`,
    );

    return new Device(
      device,
      this.eventBus,
      this.commandBus,
      defaultStateFactories,
    );
  }
}
