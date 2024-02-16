import { Type } from '@nestjs/common';
import * as cqrs from './cqrs';
import { Devices as ImplDevices, DeviceStates as ImplStates } from './impl';
import { Device } from './device';
import { DeviceStates as CommonStates } from './states';

export * from './devices.module';
export * from './devices.service';
export * from './devices.model';
export * from './states';

export const CQRS = cqrs;
export const Devices: Type<Device>[] = [...ImplDevices, Device];
export const DeviceStates: string[] = [...ImplStates, ...CommonStates];
