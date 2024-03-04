import { Injectable } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { StateFactories } from '../../../device';
import {
  BrightnessState,
  ConnectedState,
  LightEffectStateName,
  PowerState,
  SegmentCountState,
  SegmentCountStateName,
  ColorTempState,
  ActiveState,
  ActiveStateName,
  BrightnessStateName,
  ColorTempStateName,
  ConnectedStateName,
  ModeStateName,
  PowerStateName,
  LightEffectState,
} from '../../../states';
import { DeviceModel } from '../../../devices.model';
import {
  SegmentColorModeState,
  ColorModeState,
  MicModeState,
  RGBICActiveState,
  WholeColorModeStateName,
  MicModeStateName,
  SegmentColorModeStateName,
  AdvancedColorModeStateName,
  SceneModeState,
  AdvancedColorModeState,
} from './rgbic-light.modes';
import { DeviceFactory } from '../../../device.factory';
import { LightDevice } from '../light.device';
import { Optional } from '../../../../../common/types';

const StateFactory: StateFactories = [
  (device: DeviceModel) => new PowerState(device),
  (device: DeviceModel) => new ConnectedState(device),
  (device: DeviceModel) => new ActiveState(device),
  (device: DeviceModel) => new BrightnessState(device),
  (device: DeviceModel) => new ColorTempState(device),
  (device: DeviceModel) => new SegmentCountState(device),
  (device: DeviceModel) => new ColorModeState(device),
  (device: DeviceModel) => new SceneModeState(device),
  (device: DeviceModel) => new MicModeState(device),
  (device: DeviceModel) => new AdvancedColorModeState(device),
];

export const RGBICLightType: 'rgbic' = 'rgbic' as const;
export type RGBICLightType = typeof RGBICLightType;

export class RGBICLightDevice
  extends LightDevice<RGBICLight>
  implements RGBICLight
{
  static readonly deviceType = RGBICLightType;
  get deviceType(): string {
    return RGBICLightDevice.deviceType;
  }

  constructor(device: DeviceModel, eventBus: EventBus, commandBus: CommandBus) {
    super(device, eventBus, commandBus, StateFactory);
    this.addState(
      new SegmentColorModeState(
        device,
        this.state<SegmentCountState>(SegmentCountStateName)!,
      ),
    );
    this.addState(
      new RGBICActiveState(device, [
        this.state(WholeColorModeStateName),
        this.state(MicModeStateName),
        this.state(SegmentColorModeStateName),
        this.state(AdvancedColorModeStateName),
        this.state(LightEffectStateName),
      ]),
    );
  }
  get [PowerStateName](): Optional<PowerState> {
    return this.state(PowerStateName);
  }
  get [ConnectedStateName](): Optional<ConnectedState> {
    return this.state(ConnectedStateName);
  }
  get [ActiveStateName](): Optional<ActiveState> {
    return this.state(ActiveStateName);
  }
  get [BrightnessStateName](): Optional<BrightnessState> {
    return this.state(BrightnessStateName);
  }
  get [ColorTempStateName](): Optional<ColorTempState> {
    return this.state(ColorTempStateName);
  }
  get [SegmentCountStateName](): Optional<SegmentCountState> {
    return this.state(SegmentCountStateName);
  }
  get [WholeColorModeStateName](): Optional<ColorModeState> {
    return this.state(WholeColorModeStateName);
  }
  get [LightEffectStateName](): Optional<LightEffectState> {
    return this.state(LightEffectStateName);
  }
  get [MicModeStateName](): Optional<MicModeState> {
    return this.state(MicModeStateName);
  }
  get [AdvancedColorModeStateName](): Optional<AdvancedColorModeState> {
    return this.state(AdvancedColorModeStateName);
  }
  get [ModeStateName](): Optional<RGBICActiveState> {
    return this.state(ModeStateName);
  }
  get [SegmentColorModeStateName](): Optional<SegmentColorModeState> {
    return this.state(SegmentColorModeStateName);
  }
}

@Injectable()
export class RGBICLightFactory extends DeviceFactory<
  RGBICLightDevice,
  RGBICLight
> {
  constructor() {
    super(RGBICLightDevice, {
      'LED Strip Light': {
        'RGBIC Strip Lights': [/2\*10m RGBIC Strip Light.*/, /.*RGBIC.*/],
      },
      'Indoor Lighting': {
        'Floor Lamps': [/2\*10m RGBIC Strip Light.*/, /.*RGBIC.*/],
        'Wall Lamps': [/Glide/],
      },
      'Outdoor Lighting': {
        'Strip Lights': [/Phantasy/, /RGBIC/],
        'String Lights': [/RGBIC/],
      },
      'Other Lights': {
        'Car Lights': [/RGBIC/],
      },
    });
  }
}
export type RGBICLight = {
  [PowerStateName]: Optional<PowerState>;
  [ConnectedStateName]: Optional<ConnectedState>;
  [ActiveStateName]: Optional<ActiveState>;
  [BrightnessStateName]: Optional<BrightnessState>;
  [ColorTempStateName]: Optional<ColorTempState>;
  [SegmentCountStateName]: Optional<SegmentCountState>;
  [WholeColorModeStateName]: Optional<ColorModeState>;
  [import { Characteristic, Service } from 'hap-nodejs';

// Define the available light effect states based on the make/model of the light
type LightEffectStateName = 'effect1' | 'effect2' | 'effect3';

// Create a custom LightEffect characteristic using the UUID and the format defined in the HomeKit guidelines
const LightEffectUUID = 'your_light_effect_uuid_here'; // Replace with your UUID
const LightEffectCharacteristic = new Characteristic(LightEffectUUID, LightEffectUUID)
  .setProps({
    format: Characteristic.Formats.STRING,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE],
    // Add any additional properties or permissions as required by your custom characteristic
  })
  .on('set', (value, callback) => {
    // Handle the set event when the user selects a light effect state
    const selectedEffect = value as LightEffectStateName;

    // Perform the necessary actions to set the light effect state
    switch (selectedEffect) {
      case 'effect1':
        // Set the light effect state to effect1
        // Perform any additional actions specific to effect1
        break;
      case 'effect2':
        // Set the light effect state to effect2
        // Perform any additional actions specific to effect2
        break;
      case 'effect3':
        // Set the light effect state to effect3
        // Perform any additional actions specific to effect3
        break;
      default:
        // Handle any unrecognized or invalid light effect state
        break;
    }

    // After setting the light effect state, callback with null for successful operation
    callback(null);
  })
  .on('get', (callback) => {
    // Handle the get event when the current light effect state is requested
    const currentEffectState = 'effect1'; // Replace with the actual current state

    // Return the current light effect state to the callback
    callback(null, currentEffectState);
  });

// Add the LightEffect characteristic to the LightBulb service
const lightBulbService = new Service.Lightbulb('Your Lightbulb', 'your_lightbulb_type_uuid_here') // Replace with your UUID

// Add other required characteristics to the LightBulb service
// ...

// Add the]: Optional<LightEffectState>;
  [MicModeStateName]: Optional<MicModeState>;
  [AdvancedColorModeStateName]: Optional<AdvancedColorModeState>;
  [ModeStateName]: Optional<RGBICActiveState>;
  [SegmentColorModeStateName]: Optional<SegmentColorModeState>;
};