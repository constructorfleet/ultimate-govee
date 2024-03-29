import { Expose, Type } from 'class-transformer';
import { ArrayParameter } from './fields/array.field';
import { EnumParameter } from './fields/enum.field';
import { Parameter, FieldDataType } from './fields/field';
import { IntegerParameter } from './fields/integer.field';
import { StructParameter } from './fields/struct.field';

export const OnOffCapability = 'on_off' as const;
export const ToggleCapability = 'toggle' as const;
export const ColorSettingCapability = 'color_setting' as const;
export const ModeCapability = 'mode' as const;
export const RangeCapability = 'range' as const;
export const WorkModeCapability = 'work_mode' as const;
export const SegmentColorSettingCapability = 'segment_color_setting' as const;
export const DynamicSceneCapability = 'dynamic_scene' as const;
export const MusicSettingCapability = 'music_setting' as const;
export const TemperatureSettingCapability = 'temperature_setting' as const;
export const EventCapability = 'event' as const;

export type Capabilities =
  | typeof OnOffCapability
  | typeof ToggleCapability
  | typeof ColorSettingCapability
  | typeof ModeCapability
  | typeof RangeCapability
  | typeof WorkModeCapability
  | typeof SegmentColorSettingCapability
  | typeof DynamicSceneCapability
  | typeof MusicSettingCapability
  | typeof TemperatureSettingCapability
  | typeof EventCapability;

export type Capability<Cap extends Capabilities> =
  `devices.capabilities.${Cap}`;

export class DeviceCapability<
  Cap extends Capabilities,
  CapabilityKey = Capability<Cap>,
> {
  @Expose({ name: 'type' })
  type!: CapabilityKey;

  @Expose({ name: 'instance' })
  instance!: string;

  @Expose({ name: 'parameters' })
  @Type(() => Parameter, {
    discriminator: {
      property: 'dataType',
      subTypes: [
        { name: FieldDataType.ARRAY, value: ArrayParameter },
        { name: FieldDataType.INTEGER, value: IntegerParameter },
        { name: FieldDataType.ENUM, value: EnumParameter },
        { name: FieldDataType.STRUCT, value: StructParameter },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  parameters!: Parameter<FieldDataType>;
}
