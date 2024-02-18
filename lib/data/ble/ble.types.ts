import { type EventEmitter } from 'events';
import { DeviceId } from '@constructorfleet/ultimate-govee/common';
import { Subject } from 'rxjs';

export const BleModuleOptionsKey: string = 'Ble.Module.Options';

export type BleService = {
  uuid: string;
  name: string;
  type: string;
  includedServiceUuids: string[];
  characteristics: BleCharacteristic[];

  discoverIncludedServices(): void;
  discoverIncludedServicesAsync(): Promise<string[]>;
  discoverIncludedServices(
    serviceUUIDs: string[],
    callback?: (error: string, includedServiceUuids: string[]) => void,
  ): void;
  discoverIncludedServicesAsync(serviceUUIDs: string[]): Promise<string[]>;
  discoverCharacteristics(): void;
  discoverCharacteristicsAsync(): Promise<BleCharacteristic[]>;
  discoverCharacteristics(
    characteristicUUIDs: string[],
    callback?: (error: string, characteristics: BleCharacteristic[]) => void,
  ): void;
  discoverCharacteristicsAsync(
    characteristicUUIDs: string[],
  ): Promise<BleCharacteristic[]>;
  toString(): string;

  on(
    event: 'includedServicesDiscover',
    listener: (includedServiceUuids: string[]) => void,
  ): BleService;
  on(
    event: 'characteristicsDiscover',
    listener: (characteristics: BleCharacteristic[]) => void,
  ): BleService;
  on(event: string, listener: (...args) => void): BleService;

  once(
    event: 'includedServicesDiscover',
    listener: (includedServiceUuids: string[]) => void,
  ): BleService;
  once(
    event: 'characteristicsDiscover',
    listener: (characteristics: BleCharacteristic[]) => void,
  ): BleService;
  once(event: string, listener: (...args) => void): BleService;
};

export type BleCharacteristic = {
  uuid: string;
  name: string;
  type: string;
  properties: string[];
  descriptors: BleDescriptor[];

  read(callback?: (error: string, data: Buffer) => void): void;
  readAsync(): Promise<Buffer>;
  write(
    data: Buffer,
    withoutResponse: boolean,
    callback?: (error: string) => void,
  ): void;
  writeAsync(data: Buffer, withoutResponse: boolean): Promise<void>;
  broadcast(broadcast: boolean, callback?: (error: string) => void): void;
  broadcastAsync(broadcast: boolean): Promise<void>;
  notify(notify: boolean, callback?: (error: string) => void): void;
  notifyAsync(notify: boolean): Promise<void>;
  discoverDescriptors(
    callback?: (error: string, descriptors: BleDescriptor[]) => void,
  ): void;
  discoverDescriptorsAsync(): Promise<BleDescriptor[]>;
  toString(): string;
  subscribe(callback?: (error: string) => void): void;
  subscribeAsync(): Promise<void>;
  unsubscribe(callback?: (error: string) => void): void;
  unsubscribeAsync(): Promise<void>;

  on(
    event: 'read',
    listener: (data: Buffer, isNotification: boolean) => void,
  ): BleCharacteristic;
  on(
    event: 'write',
    withoutResponse: boolean,
    listener: (error: string) => void,
  ): BleCharacteristic;
  on(event: 'broadcast', listener: (state: string) => void): BleCharacteristic;
  on(event: 'notify', listener: (state: string) => void): BleCharacteristic;
  on(
    event: 'data',
    listener: (data: Buffer, isNotification: boolean) => void,
  ): BleCharacteristic;
  on(
    event: 'descriptorsDiscover',
    listener: (descriptors: BleDescriptor[]) => void,
  ): BleCharacteristic;
  on(event: string, listener: (...args) => void): BleCharacteristic;
  on(
    event: string,
    option: boolean,
    listener: (...args) => void,
  ): BleCharacteristic;

  once(
    event: 'read',
    listener: (data: Buffer, isNotification: boolean) => void,
  ): BleCharacteristic;
  once(
    event: 'write',
    withoutResponse: boolean,
    listener: (error: string) => void,
  ): BleCharacteristic;
  once(
    event: 'broadcast',
    listener: (state: string) => void,
  ): BleCharacteristic;
  once(event: 'notify', listener: (state: string) => void): BleCharacteristic;
  once(
    event: 'data',
    listener: (data: Buffer, isNotification: boolean) => void,
  ): BleCharacteristic;
  once(
    event: 'descriptorsDiscover',
    listener: (descriptors: BleDescriptor[]) => void,
  ): BleCharacteristic;
  once(event: string, listener: (...args) => void): BleCharacteristic;
  once(
    event: string,
    option: boolean,
    listener: (...args) => void,
  ): BleCharacteristic;
};

export type BleDescriptor = {
  uuid: string;
  name: string;
  type: string;

  readValue(callback?: (error: string, data: Buffer) => void): void;
  readValueAsync(): Promise<Buffer>;
  writeValue(data: Buffer, callback?: (error: string) => void): void;
  writeValueAsync(data: Buffer): Promise<void>;
  toString(): string;

  on(
    event: 'valueRead',
    listener: (error: string, data: Buffer) => void,
  ): BleDescriptor;
  on(event: 'valueWrite', listener: (error: string) => void): BleDescriptor;
  on(event: string, listener: (...args) => void): BleDescriptor;

  once(
    event: 'valueRead',
    listener: (error: string, data: Buffer) => void,
  ): BleDescriptor;
  once(event: 'valueWrite', listener: (error: string) => void): BleDescriptor;
  once(event: string, listener: (...args) => void): BleDescriptor;
};

export type BlePeripheral = {
  id: string;
  uuid: string;
  address: string;
  addressType: string;
  connectable: boolean;
  advertisement: BleAdvertisement;
  rssi: number;
  mtu: number | null;
  services: BleService[];
  state:
    | 'error'
    | 'connecting'
    | 'connected'
    | 'disconnecting'
    | 'disconnected';

  connect(callback?: (error: string) => void): void;
  connectAsync(): Promise<void>;
  disconnect(callback?: () => void): void;
  disconnectAsync(): Promise<void>;
  updateRssi(callback?: (error: string, rssi: number) => void): void;
  updateRssiAsync(): Promise<number>;
  discoverServices(): void;
  discoverServicesAsync(): Promise<BleService[]>;
  discoverServices(
    serviceUUIDs: string[],
    callback?: (error: string, services: BleService[]) => void,
  ): void;
  discoverServicesAsync(serviceUUIDs: string[]): Promise<BleService[]>;
  discoverAllServicesAndCharacteristics(
    callback?: (
      error: string,
      services: BleService[],
      characteristics: BleCharacteristic[],
    ) => void,
  ): void;
  discoverAllServicesAndCharacteristicsAsync(): Promise<BleServicesAndCharacteristics>;
  discoverSomeServicesAndCharacteristics(
    serviceUUIDs: string[],
    characteristicUUIDs: string[],
    callback?: (
      error: string,
      services: BleService[],
      characteristics: BleCharacteristic[],
    ) => void,
  ): void;
  discoverSomeServicesAndCharacteristicsAsync(
    serviceUUIDs: string[],
    characteristicUUIDs: string[],
  ): Promise<BleServicesAndCharacteristics>;
  cancelConnect(options?: object): void;

  readHandle(
    handle: number,
    callback: (error: string, data: Buffer) => void,
  ): void;
  readHandleAsync(handle: number): Promise<Buffer>;
  writeHandle(
    handle: number,
    data: Buffer,
    withoutResponse: boolean,
    callback: (error: string) => void,
  ): void;
  writeHandleAsync(
    handle: number,
    data: Buffer,
    withoutResponse: boolean,
  ): Promise<void>;
  toString(): string;

  on(event: 'connect', listener: (error: string) => void): BlePeripheral;
  on(event: 'disconnect', listener: (error: string) => void): BlePeripheral;
  on(event: 'rssiUpdate', listener: (rssi: number) => void): BlePeripheral;
  on(
    event: 'servicesDiscover',
    listener: (services: BleService[]) => void,
  ): BlePeripheral;
  on(event: string, listener: (...args) => void): BlePeripheral;

  once(event: 'connect', listener: (error: string) => void): BlePeripheral;
  once(event: 'disconnect', listener: (error: string) => void): BlePeripheral;
  once(event: 'rssiUpdate', listener: (rssi: number) => void): BlePeripheral;
  once(
    event: 'servicesDiscover',
    listener: (services: BleService[]) => void,
  ): BlePeripheral;
  once(event: string, listener: (...args) => void): BlePeripheral;
};

export type BleServicesAndCharacteristics = {
  services: BleService[];
  characteristics: BleCharacteristic[];
};

export type BleAdvertisement = {
  localName: string;
  serviceData: Array<{
    uuid: string;
    data: Buffer;
  }>;
  txPowerLevel: number;
  manufacturerData: Buffer;
  serviceUuids: string[];
};

type NobleEvent =
  | 'stateChange'
  | 'scanStart'
  | 'scanStop'
  | 'discover'
  | 'warning';

export type NobleBle = {
  startScanning(
    serviceUUIDs?: string[],
    allowDuplicates?: boolean,
    callback?: (error?: Error) => void,
  ): void;
  startScanningAsync(
    serviceUUIDs?: string[],
    allowDuplicates?: boolean,
  ): Promise<void>;
  stopScanning(callback?: () => void): void;
  stopScanningAsync(): Promise<void>;
  cancelConnect(peripheralUuid: string, options?: object): void;
  reset(): void;

  // on(event: 'stateChange', listener: (state: string) => void): EventEmitter;
  // on(event: 'scanStart', listener: () => void): EventEmitter;
  // on(event: 'scanStop', listener: () => void): EventEmitter;
  // on(
  //   event: 'discover',
  //   listener: (peripheral: BlePeripheral) => void,
  // ): NobleBle;
  on(event: NobleEvent, listener: (...args) => void): EventEmitter;

  // once(event: 'stateChange', listener: (state: string) => void): EventEmitter;
  // once(event: 'scanStart', listener: () => void): EventEmitter;
  // once(event: 'scanStop', listener: () => void): EventEmitter;
  // once(
  //   event: 'discover',
  //   listener: (peripheral: BlePeripheral) => void,
  // ): EventEmitter;
  once(event: NobleEvent, listener: (...args) => void): EventEmitter;

  // removeListener(
  //   event: 'stateChange',
  //   listener: (state: string) => void,
  // ): NobleBle;
  // removeListener(event: 'scanStart', listener: () => void): EventEmitter;
  // removeListener(event: 'scanStop', listener: () => void): EventEmitter;
  // removeListener(
  //   event: 'discover',
  //   listener: (peripheral: BlePeripheral) => void,
  // ): EventEmitter;
  removeListener(NobleEvent: string, listener: (...args) => void): EventEmitter;

  removeAllListeners(event?: string): EventEmitter;

  state: string;
};

export type BleCommand = {
  id: DeviceId;
  address: string;
  commands: number[][];
  results$: Subject<number[]>;
  debug?: boolean;
};
