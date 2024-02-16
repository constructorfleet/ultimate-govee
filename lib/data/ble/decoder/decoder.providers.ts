import { Inject, ValueProvider } from '@nestjs/common';
import { Decoder } from './lib/decoder';

const DeviceDecoderKey = 'Ble.Device.Decoder';
export const InjectDecoder = Inject(DeviceDecoderKey);
export const DeviceDecoder: ValueProvider = {
  provide: DeviceDecoderKey,
  useValue: Decoder,
};
