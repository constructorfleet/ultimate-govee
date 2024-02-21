import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  BehaviorSubject,
  Subject,
  concatMap,
  delay,
  distinctUntilKeyChanged,
  filter,
  from,
  interval,
  map,
  switchMap,
  tap,
} from 'rxjs';
import { DeltaMap, DeviceId, Optional, sleep } from '~ultimate-govee-common';
import { platform } from 'os';
import { BleCommand, BlePeripheral, NobleBle } from './ble.types';
import { DecoderService } from './decoder/decoder.service';
import { DecodedDevice } from './decoder';
import { execSync } from 'child_process';
import { BleConfig } from './ble.options';
import { ConfigType } from '@nestjs/config';

const STATE_UNKNOWN = 'unknown';
const STATE_POWERED_ON = 'poweredOn';

@Injectable()
export class BleClient {
  private readonly logger: Logger = new Logger(BleClient.name);

  private noble: Optional<NobleBle> = undefined;
  private seenNames: string[] = [];
  private scanning: boolean = false;
  private state: BehaviorSubject<string> = new BehaviorSubject(STATE_UNKNOWN);
  private connectedPeripheral: Optional<BlePeripheral> = undefined;
  readonly enabled: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private readonly peripheralDiscovered: Subject<BlePeripheral> = new Subject();
  private readonly peripherals: DeltaMap<DeviceId, BlePeripheral> =
    new DeltaMap();
  readonly peripheralDecoded: Subject<DecodedDevice> = new Subject();
  readonly commandQueue: Subject<BleCommand> = new Subject();
  private peripheralFilter: (peripheral: BlePeripheral) => boolean = () => true;
  set filterPeripherals(predicate: (peripheral: BlePeripheral) => boolean) {
    this.peripheralFilter = predicate;
  }

  constructor(
    @Inject(BleConfig.KEY)
    private readonly config: ConfigType<typeof BleConfig>,
    private readonly decoder: DecoderService,
  ) {
    this.state.subscribe((state) => {
      if (state !== STATE_POWERED_ON) {
        this.noble?.removeAllListeners();
      }
    });
    this.enabled
      .pipe(
        switchMap((enabled) =>
          enabled ? from(this.onEnabled()) : from(this.onDisabled()),
        ),
      )
      .subscribe();
    interval(10000)
      .pipe(
        filter(() => this.state.getValue() === STATE_POWERED_ON),
        filter(() => this.enabled.getValue()),
        tap(async () => await this.stopScanning()),
        tap(() => {
          try {
            this.noble?.reset();
          } catch (_) {
            // no-op
          }
        }),
        delay(1000),
        filter(() => this.enabled.getValue()),
        tap(async () => await this.startScanning()),
      )
      .subscribe();
    this.peripheralDiscovered
      .pipe(
        filter(
          (peripheral) => this.enabled.getValue() && peripheral !== undefined,
        ),
        filter((peripheral) => this.peripheralFilter(peripheral)),
        concatMap((peripheral) => from(this.decodePeripheral(peripheral))),
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
        distinctUntilKeyChanged('address'),
        concatMap((command) => from(this.sendCommand(command))),
      )
      .subscribe();
  }

  private async decodePeripheral(
    peripheral: BlePeripheral,
  ): Promise<Optional<DecodedDevice>> {
    await this.recordPeripheral(peripheral);
    const decodedDevice = await this.decoder.decodeDevice(peripheral);
    if (decodedDevice === undefined) {
      return undefined;
    }
    if ((decodedDevice.address ?? '').length === 0) {
      decodedDevice.address =
        this.peripherals.get(decodedDevice.id)?.address ?? '';
    }
    return decodedDevice;
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
    if (peripheral.advertisement.localName.includes('H5121')) {
      this.logger.debug(peripheral.advertisement);
    }

    if (this.seenNames.includes(peripheral.advertisement?.localName)) {
      return peripheral;
    }
    if (
      (peripheral.address ?? '').length > 0 &&
      !this.peripherals.has(peripheral.id)
    ) {
      this.peripherals.set(peripheral.id, peripheral);
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
              this.logger.debug(
                `Got address ${peripheral.address} for ${peripheral.advertisement.localName}`,
              );
              this.peripherals.set(peripheral.id, peripheral);
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
      this.logger.error(`Error while retrieving address: ${err}`);
    } finally {
      await this.startScanning();
    }
    return peripheral;
  }

  private async onDisabled() {
    this.logger.log('BLE disabled');
    this.state.next(STATE_UNKNOWN);
    try {
      this.noble?.removeAllListeners();
      this.noble?.stopScanning();
      await this.connectedPeripheral?.disconnectAsync();
    } catch (err) {
      this.logger.error('Error disabling BLE', err);
    }
    return false;
  }

  private async onEnabled() {
    this.logger.log('BLE enabled');
    if (this.noble === undefined) {
      this.noble = await import('@abandonware/noble');
    }
    this.state.next(this.noble?.state);
    this.noble?.on('stateChange', (state) => {
      this.state.next(state);
      this.logger.warn(`State changed to ${state}`);
    });
    this.noble?.on('scanStart', () => {
      this.logger.debug('Begin scanning');
      this.scanning = true;
    });
    this.noble?.on('scanStop', () => {
      this.logger.debug('Scanning stopped');
      this.scanning = false;
    });
    this.noble?.on('warning', (message: string) => this.logger.warn(message));
    this.noble?.on('discover', (peripheral: BlePeripheral) =>
      this.peripheralDiscovered.next(peripheral),
    );
    await this.startScanning();
    return true;
  }

  async stopScanning() {
    if (this.enabled.getValue() && this.scanning) {
      await this.noble?.stopScanningAsync();
    }
  }

  async startScanning() {
    if (this.enabled.getValue() && this.state.getValue() === STATE_POWERED_ON) {
      return await this.noble?.startScanningAsync();
    }
  }

  private async sendCommand({
    id,
    address,
    commands,
    results$,
    debug,
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
      debug && this.logger.debug(`Connected to ${id}`);
      try {
        const serviceChars =
          await peripheral.discoverSomeServicesAndCharacteristicsAsync(
            [this.config.serviceUUID],
            [this.config.dataCharUUID, this.config.controlCharUUID],
          );
        const dataChar = serviceChars.characteristics.find(
          (c) => c.uuid === this.config.dataCharUUID,
        );
        const writeChar = serviceChars.characteristics.find(
          (c) => c.uuid === this.config.controlCharUUID,
        );
        if (dataChar === undefined) {
          this.logger.warn(
            `Unable to locate service ${this.config.serviceUUID} with data characteristic ${this.config.dataCharUUID}`,
          );
          return results$.complete();
        }
        if (writeChar === undefined) {
          this.logger.warn(
            `Unable to locate service ${this.config.serviceUUID} with write characteristic ${this.config.controlCharUUID}`,
          );
          return results$.complete();
        }
        debug &&
          this.logger.debug(`Sending ${commands.length} commands to ${id}`);
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
}
