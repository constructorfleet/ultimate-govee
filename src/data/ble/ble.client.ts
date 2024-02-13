import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import {
  BehaviorSubject,
  Subject,
  asapScheduler,
  buffer,
  concat,
  concatMap,
  delay,
  distinctUntilKeyChanged,
  filter,
  from,
  groupBy,
  interval,
  map,
  merge,
  mergeMap,
  observeOn,
  of,
  queueScheduler,
  reduce,
  switchMap,
  take,
  tap,
  toArray,
} from 'rxjs';
import { DeltaMap, DeviceId, Optional, sleep } from '@govee/common';
import noble from '@abandonware/noble';
import { platform } from 'os';
import { Lock } from 'async-await-mutex-lock';
import { BleModuleOptions } from './ble.options';
import { BleCommand, BlePeripheral, InjectBleOptions } from './ble.types';
import { DecoderService } from './decoder/decoder.service';
import { DecodedDevice } from './decoder';
import { execSync } from 'child_process';

@Injectable()
export class BleClient implements OnModuleDestroy {
  private readonly logger: Logger = new Logger(BleClient.name);

  private seenNames: string[] = [];
  private scanning: boolean = false;
  private connectedPeripheral: Optional<BlePeripheral> = undefined;
  readonly enabled: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private readonly peripheralDiscovered: Subject<BlePeripheral> = new Subject();
  private readonly peripherals: DeltaMap<DeviceId, BlePeripheral> =
    new DeltaMap();
  readonly peripheralDecoded: Subject<DecodedDevice> = new Subject();
  readonly commandQueue: Subject<BleCommand> = new Subject();
  private readonly lock: Lock<number> = new Lock();
  private lockIndex: number = 0;

  constructor(
    @InjectBleOptions private readonly options: BleModuleOptions,
    private readonly decoder: DecoderService,
  ) {
    this.enabled
      .pipe(
        switchMap((enabled) =>
          enabled ? from(this.onEnabled()) : from(this.onDisabled()),
        ),
      )
      .subscribe((enabled) => {
        this.options.enabled = enabled;
      });
    interval(5000)
      .pipe(
        switchMap(() =>
          this.scanning
            ? from(this.stopScanning())
            : from(this.startScanning()),
        ),
      )
      .subscribe();
    this.peripheralDiscovered
      .pipe(
        filter(
          (peripheral) => this.enabled.getValue() && peripheral !== undefined,
        ),
        observeOn(queueScheduler),
        tap((peripheral) =>
          from(this.recordPeripheral(peripheral)).subscribe(),
        ),
        concatMap((peripheral) => from(this.decoder.decodeDevice(peripheral))),
        filter((device) => device !== undefined),
        map((device) => device!),
      )
      .subscribe((event) => {
        if (event) {
          this.peripheralDecoded.next(event);
          this.logger.log(`Decoded ${event.id}`);
        }
      });
    const commands$ = this.commandQueue
      .pipe(
        filter(() => this.enabled.getValue()),
        observeOn(asapScheduler),
        distinctUntilKeyChanged('address'),
        concatMap((command) => from(this.sendCommand(command))),
        tap(() =>
          of(this.scanning)
            .pipe(
              filter((s) => !s),
              map(() => from(this.startScanning())),
            )
            .subscribe(),
        ),
      )
      .subscribe((event) => {
        if (event) {
          this.logger.log(`Sent ${event.commands.length} to ${event.id}`);
        }
      });
  }

  private async recordPeripheral(
    peripheral: BlePeripheral,
  ): Promise<BlePeripheral> {
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
      this.logger.debug(`Got address ${peripheral.address}`);
      this.peripherals.set(peripheral.address, peripheral);
      this.seenNames.push(peripheral.advertisement.localName);
      return peripheral;
    }
    await this.lock.acquire(this.lockIndex++ % 4);
    await this.stopScanning();
    try {
      await peripheral.connectAsync();
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
          if (peripheral.address.length === 0) {
            this.logger.error(peripheral);
          } else {
            this.logger.warn(
              `Got address ${peripheral.address} for ${peripheral.advertisement.localName}`,
            );
            this.peripherals.set(peripheral.address, peripheral);
            this.seenNames.push(peripheral.advertisement.localName);
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
      await this.stopScanning();
      if (this.lock.isAcquired()) {
        this.lock.release();
      }
    }
    return peripheral;
  }

  private async onDisabled() {
    this.logger.log('BLE disabled');
    try {
      noble.removeAllListeners();
      noble.stopScanning();
      await this.lock.acquire();
      try {
        noble.reset();
        await this.connectedPeripheral?.disconnectAsync();
      } finally {
        this.lock.release();
      }
    } catch (e) {}
    return false;
  }

  private async onEnabled() {
    this.logger.log('BLE enabled');

    noble.on('stateChange', (state) => {
      this.logger.debug(`State changed to ${state}`);
    });
    noble.on('scanStart', () => {
      this.logger.log('Begin scanning');
      this.scanning = true;
    });
    noble.on('scanStop', () => {
      this.logger.log('Scanning stopped');
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
      await noble.stopScanningAsync();
    }
  }

  async startScanning() {
    if (this.enabled.getValue() && !this.scanning) {
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
    response,
  }: BleCommand): Promise<Optional<{ id: string; commands: number[][] }>> {
    const peripheral = this.peripherals.get(address);
    if (!peripheral) {
      this.logger.error(
        `Device with address ${address} not found`,
        Array.from(this.peripherals.keys()),
      );
      return undefined;
    }
    this.logger.log(`Device with id ${id} found! Sending commands`);
    try {
      if (!this.enabled.getValue()) {
        this.logger.error(`Ble is disabled, unable to send command to ${id}`);
        return undefined;
      }
      // await this.lock.acquire((this.lockIndex++) % 4);
      await this.stopScanning();
      try {
        await peripheral.connectAsync();
      } catch (err) {
        throw new Error(`Error connecting to ${id}`);
      }
      this.connectedPeripheral = peripheral;
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
          return undefined;
        }
        if (writeChar === undefined) {
          this.logger.warn(
            `Unable to locate service ${serviceUuid} with write characteristic ${writeUuid}`,
          );
          return undefined;
        }
        const result: number[][] = [];
        dataChar.on('data', (data: Buffer) => {
          result.push(Array.from(new Uint8Array(data)));
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
        await sleep(200);
        await dataChar.notifyAsync(false);
        this.logger.log(id);
        this.logger.log(JSON.stringify(commands));
        this.logger.log(JSON.stringify(result));
        response.next(result);
        return {
          id,
          commands,
        };
      } catch (err) {
        throw new Error(`Error sending command to ${id}: ${err}`);
      } finally {
        await peripheral.disconnectAsync();
        this.connectedPeripheral = undefined;
      }
    } catch (err) {
      this.logger.error(`Error`, err);
      return undefined;
    } finally {
      await this.startScanning();
      if (this.lock.isAcquired()) {
        this.lock.release();
      }
    }
  }

  async onModuleDestroy() {
    await this.onDisabled();
  }
}
