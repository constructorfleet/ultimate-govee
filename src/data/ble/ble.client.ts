import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import {
  BehaviorSubject,
  Subject,
  asapScheduler,
  concatMap,
  distinctUntilKeyChanged,
  filter,
  from,
  interval,
  map,
  observeOn,
  queueScheduler,
  switchMap,
} from 'rxjs';
import { DeltaMap, DeviceId, Optional, sleep } from '@govee/common';
import noble from '@abandonware/noble';
import { platform } from 'os';
import { BleModuleOptions } from './ble.options';
import { BleCommand, BlePeripheral, InjectBleOptions } from './ble.types';
import { DecoderService } from './decoder/decoder.service';
import { DecodedDevice } from './decoder';
import { execSync } from 'child_process';

const STATE_UNKNOWN = 'unknown';
const STATE_POWERED_ON = 'poweredOn';

@Injectable()
export class BleClient implements OnModuleDestroy {
  private readonly logger: Logger = new Logger(BleClient.name);

  private seenNames: string[] = [];
  private lastFoundAt: number = 0;
  private scanning: boolean = false;
  private state: BehaviorSubject<string> = new BehaviorSubject(STATE_UNKNOWN);
  private connectedPeripheral: Optional<BlePeripheral> = undefined;
  readonly enabled: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private readonly peripheralDiscovered: Subject<BlePeripheral> = new Subject();
  private readonly peripherals: DeltaMap<DeviceId, BlePeripheral> =
    new DeltaMap();
  readonly peripheralDecoded: Subject<DecodedDevice> = new Subject();
  readonly commandQueue: Subject<BleCommand> = new Subject();

  constructor(
    @InjectBleOptions private readonly options: BleModuleOptions,
    private readonly decoder: DecoderService,
  ) {
    this.state.subscribe((state) => {
      if (state !== STATE_POWERED_ON) {
        noble.removeAllListeners();
      }
    });
    this.enabled
      .pipe(
        switchMap((enabled) =>
          enabled ? from(this.onEnabled()) : from(this.onDisabled()),
        ),
      )
      .subscribe((enabled) => {
        this.options.enabled = enabled;
      });
    interval(10000)
      .pipe(
        filter(() => this.state.getValue() === STATE_POWERED_ON),
        filter(() => this.enabled.getValue()),
      )
      .subscribe(async () => this.startScanning());
    this.peripheralDiscovered
      .pipe(
        filter(
          (peripheral) => this.enabled.getValue() && peripheral !== undefined,
        ),
        observeOn(queueScheduler),
        concatMap((peripheral) => from(this.recordPeripheral(peripheral))),
        concatMap((peripheral) => from(this.decoder.decodeDevice(peripheral))),
        filter((device) => device !== undefined),
        map((device) => device!),
      )
      .subscribe((event) => {
        if (event) {
          this.peripheralDecoded.next(event);
          this.logger.debug(`Decoded ${event.id}`);
        }
      });
    this.commandQueue
      .pipe(
        filter(() => this.enabled.getValue()),
        observeOn(asapScheduler),
        distinctUntilKeyChanged('address'),
        filter((command) => command.id === '23:3B:C6:38:30:32:48:19'),
        concatMap((command) => from(this.sendCommand(command))),
      )
      .subscribe();
  }

  private async recordPeripheral(
    peripheral: BlePeripheral,
  ): Promise<BlePeripheral> {
    this.lastFoundAt = Date.now();
    if (
      (peripheral.advertisement?.localName ?? '').length === 0 ||
      !/(H[A-Z0-9]{4})_/.exec(peripheral.advertisement.localName)
    ) {
      return peripheral;
    }

    if (this.seenNames.includes(peripheral.advertisement?.localName)) {
      return peripheral;
    }
    if (
      (peripheral.address ?? '').length > 0 &&
      !this.peripherals.has(peripheral.address)
    ) {
      this.peripherals.set(peripheral.address, peripheral);
      this.seenNames.push(peripheral.advertisement.localName);
      return peripheral;
    }

    try {
      await peripheral.connectAsync();
      this.connectedPeripheral = peripheral;
      if (platform() === 'darwin') {
        const btData = execSync('system_profiler SPBluetoothDataType', {
          encoding: 'utf8',
        });
        const btDataIndex = btData
          .split('\n')
          .findIndex((line) =>
            line.includes(peripheral.advertisement.localName),
          );
        if (btDataIndex > 0) {
          peripheral.address = btData
            .split('\n')
            [btDataIndex + 1].trim()
            .replace('Address: ', '');
          if (peripheral.address.length !== 0) {
            {
              this.logger.error(
                `Got address ${peripheral.address} for ${peripheral.advertisement.localName}`,
              );
              this.peripherals.set(peripheral.address, peripheral);
              this.seenNames.push(peripheral.advertisement.localName);
            }
          }
        }
      }
      this.logger.log(
        `Disconnecting from ${peripheral.advertisement.localName}`,
      );
      await peripheral.disconnectAsync();
      this.connectedPeripheral = undefined;
    } catch (err) {
      this.logger.error(err);
    } finally {
      await this.startScanning();
      return peripheral;
    }
  }

  private async onDisabled() {
    this.logger.log('BLE disabled');
    this.state.next(STATE_UNKNOWN);
    try {
      noble.removeAllListeners();
      noble.stopScanning();
      await this.connectedPeripheral?.disconnectAsync();
    } catch (e) {}
    return false;
  }

  private async onEnabled() {
    this.logger.log('BLE enabled');
    this.state.next(noble.state);
    noble.on('stateChange', (state) => {
      this.state.next(state);
      this.logger.warn(`State changed to ${state}`);
    });
    noble.on('scanStart', () => {
      this.logger.debug('Begin scanning');
      this.scanning = true;
    });
    noble.on('scanStop', () => {
      this.logger.debug('Scanning stopped');
      this.scanning = false;
    });
    noble.on('warning', (message: string) => this.logger.warn(message));
    noble.on('discover', (peripheral: BlePeripheral) =>
      this.peripheralDiscovered.next(peripheral),
    );
    await this.startScanning();
    return true;
  }

  async stopScanning() {
    if (this.enabled.getValue() && this.scanning) {
      this.lastFoundAt = Date.now();
      await noble.stopScanningAsync();
    }
  }

  async startScanning() {
    if (this.enabled.getValue() && this.state.getValue() === STATE_POWERED_ON) {
      return await noble.startScanningAsync();
    }
  }

  private async sendCommand({
    id,
    address,
    serviceUuid,
    dataUuid,
    writeUuid,
    commands,
    results$,
  }: BleCommand): Promise<void> {
    if (!this.enabled.getValue()) {
      this.logger.error(`Ble is disabled, unable to send command to ${id}`);
      return results$.complete();
    }
    const peripheral = this.peripherals.get(address);
    if (!peripheral) {
      this.logger.error(
        `Device ${id} with address ${address} not yet discovered`,
      );
      return results$.complete();
    }
    try {
      await this.stopScanning();
      try {
        await peripheral.connectAsync();
        this.connectedPeripheral = peripheral;
      } catch (err) {
        throw new Error(`Error connecting to ${id}`);
      }

      this.logger.debug(`Connected to ${id}`);
      try {
        const serviceChars =
          await peripheral.discoverSomeServicesAndCharacteristicsAsync(
            [serviceUuid],
            [dataUuid, writeUuid],
          );
        const dataChar = serviceChars.characteristics.find(
          (c) => c.uuid === dataUuid,
        );
        const writeChar = serviceChars.characteristics.find(
          (c) => c.uuid === writeUuid,
        );
        if (dataChar === undefined) {
          this.logger.warn(
            `Unable to locate service ${serviceUuid} with data characteristic ${dataUuid}`,
          );
          return results$.complete();
        }
        if (writeChar === undefined) {
          this.logger.warn(
            `Unable to locate service ${serviceUuid} with write characteristic ${writeUuid}`,
          );
          return results$.complete();
        }
        dataChar.on('data', (data: Buffer) => {
          results$.next(Array.from(new Uint8Array(data)));
        });
        await dataChar.notifyAsync(true);
        await Promise.all(
          commands
            .map((command) => Buffer.from(new Uint8Array(command)))
            .map(async (command) => {
              await writeChar.writeAsync(command, true);
              await sleep(100);
            }),
        );
        await sleep(300);
        await dataChar.notifyAsync(false);
        return results$.complete();
      } catch (err) {
        throw new Error(`Error sending command to ${id}: ${err}`);
      } finally {
        await peripheral.disconnectAsync();
        this.connectedPeripheral = undefined;
      }
    } catch (err) {
      this.logger.error(`Error while sending commands to ${id}`, err);
      return results$.complete();
    } finally {
      await this.startScanning();
    }
  }

  async onModuleDestroy() {
    await this.onDisabled();
    this.commandQueue.complete();
    this.peripheralDiscovered.complete();
  }
}
