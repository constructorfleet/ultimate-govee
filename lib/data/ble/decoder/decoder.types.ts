import { Expose, Transform } from 'class-transformer';
import { Conditions, DecoderArgs } from './lib/types';
import { GoveeDeviceStatus } from '../../govee-device';

export const typeMappings = {
  1: ['Temperature, Humidity, Battery'],
  2: ['Termperature, Humidity, Battery, Extra'],
  3: ['BBQ'], // Multip probe temperatures only
  4: ['CTMO'], // Contact and/or Motion sensor
  5: 'SCALE', // weight scale
  6: 'iBeacon protocol',
  7: 'acceleration',
  8: 'battery',
  9: 'plant sensors',
  10: 'tire pressure monitoring system',
  11: 'health monitoring devices',
  12: 'energy monitoring devices',
  13: 'window covering',
  14: 'ON/OFF actuators',
  15: 'air environmental monitoring devices',
  16: 'Bluetooth tracker',
  17: 'Button',
  254: 'random MAC address devices',
  255: 'Unique', // unique devices
};

export class DecoderPropertyMetadata {
  @Expose({ name: 'unit' })
  unit!: string;

  @Expose({ name: 'name' })
  name!: string;
}

export class DecoderPropertiesMetadata {
  @Expose({ name: 'properties' })
  properties!: Record<string, DecoderPropertyMetadata>;
}

export class DeviceProperty {
  @Expose({ name: 'condition' })
  condition?: any[];

  @Expose({ name: 'decoder' })
  decoder!: DecoderArgs;

  @Expose({ name: 'post_proc' })
  post_proc?: any[];
}

export class DeviceProperties {
  @Expose({ name: 'tempc' })
  tempCelcius?: unknown;

  @Expose({ name: '_tempC' })
  negativeTempCelcius?: unknown;

  @Expose({ name: 'hum' })
  humidity?: unknown;

  @Expose({ name: 'batt' })
  batteryLevel?: unknown;

  @Expose({ name: '.cal' })
  calibration?: unknown;

  @Expose({ name: 'pm25' })
  pm25?: unknown;
}

export class DecoderDeviceSpecification {
  @Expose({ name: 'brand' })
  brand!: string;

  @Expose({ name: 'model' })
  @Transform(({ value }) => value.trim())
  modelName!: string;

  @Expose({ name: 'model_id' })
  model!: string;

  @Expose({ name: 'tag' })
  tag!: string;

  @Expose({ name: 'type' })
  @Transform(
    ({ obj }: { obj: { tag: string } }) => {
      return (
        typeMappings[Number.parseInt(obj.tag.substring(0, 2), 16)] || 'unknown'
      );
    },
    { toClassOnly: true },
  )
  type!: string;

  @Expose({ name: 'condition' })
  conditions?: Conditions;

  @Expose({ name: 'properties' })
  properties?: Record<string, DeviceProperty>;

  @Expose({ name: 'propertyMetadata' })
  propertyMetadata?: Record<string, DecoderPropertyMetadata>;
}

export type DecodedProperty =
  | {
      name: string;
      unit: string;
      value: number;
    }
  | number;

export type DecodedDevice = {
  id: string;
  brand: string;
  model: string;
  modelName: string;
  type: string;
  state: GoveeDeviceStatus['state'];
};
