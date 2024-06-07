import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import stringify from 'json-stringify-safe';
import { platform } from 'os';
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
  tap,
} from 'rxjs';
import { DeltaMap, Optional, sleep } from '~ultimate-govee-common';
import { BleConfig } from './ble.options';
import {
  BleCommand,
  BlePeripheral,
  BleServicesAndCharacteristics,
  NobleBle,
} from './ble.types';
import { DecodedDevice } from './decoder';
import { DecoderService } from './decoder/decoder.service';

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
  private readonly peripheralIds: DeltaMap<string, BlePeripheral> =
    new DeltaMap();
  private readonly peripheralAddresses: Map<string, string> = new Map();
  private readonly cancelledCommands: string[] = [];
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
      if (state !== STATE_POWERED_ON && this.noble !== undefined) {
        try {
          this.noble?.removeAllListeners();
        } catch (err) {
          this.logger.warn(err);
        }
      }
    });
    this.enabled
      .subscribe(async () => 
        this.enabled.getValue() ? await this.onEnabled() : await this.onDisabled()
      );
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
        filter((command) => this.peripheralAddresses.has(command.address)),
        distinctUntilKeyChanged('address'),
      )
      .subscribe(async (command) => {
        if(this.cancelledCommands.includes(command.commandId)) {
          this.logger.debug('Command cancelled', {
            ...command,
            results$: 'subscription'
          })
          return;
        }
        await this.sendCommand(command);
      });
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
        this.peripheralIds.get(decodedDevice.id)?.address ?? '';
    }
    return decodedDevice;
  }

  private async recordPeripheral(
    peripheral: BlePeripheral,
  ): Promise<BlePeripheral> {
    const manufacturerData =
      peripheral.advertisement.manufacturerData?.toString('hex');
    const data: string[] = [
      `Name: ${peripheral.advertisement.localName}`,
      `Id: ${peripheral.id}`,
      `Address: ${peripheral.address}`,
      `Manufacturer Data: ${manufacturerData}`,
      `Service UUIDs: ${peripheral.advertisement.serviceUuids?.join(', ')}`,
    ];
    this.logger.warn(stringify(data, null, 2));
    const path = `ble/${manufacturerData?.substring(0, 4) ?? 'unknown'}`;
    if (!existsSync(path)) {
      await mkdir(path, { recursive: true });
    }
    await writeFile(
      `${path}/${peripheral.advertisement.localName ?? peripheral.address ?? peripheral.id}.txt`,
      data.join('\n'),
      { encoding: 'utf-8' },
    );
    if (
      (peripheral.advertisement?.localName ?? '').length === 0 ||
      !/.*?((GV)|(GVH)|(H)[A-Z0-9]{4})_?[A-Z0-9]{4}.*/.exec(
        peripheral.advertisement.localName,
      )
    ) {
      return peripheral;
    }

    if (this.seenNames.includes(peripheral.advertisement?.localName)) {
      return peripheral;
    }
    if (
      (peripheral.address ?? '').length > 0 &&
      !this.peripheralIds.has(peripheral.id)
    ) {
      this.peripheralIds.set(peripheral.id, peripheral);
      this.peripheralAddresses.set(peripheral.address, peripheral.id);
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
              this.peripheralIds.set(peripheral.id, peripheral);
              this.peripheralAddresses.set(peripheral.address, peripheral.id);
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
      if (this.noble !== undefined) {
        this.noble?.removeAllListeners();
        this.noble?.stopScanning();
      }
      await this.connectedPeripheral?.disconnectAsync();
    } catch (err) {
      this.logger.error('Error disabling BLE', err);
    }
    return false;
  }

  private async onEnabled() {
    if (this.noble === undefined) {
      this.noble = await import('@abandonware/noble').then(
        (module) => module.default,
      );
    }
    await sleep(100);
    if (this.noble?.on === undefined) {
      this.logger.debug('Unable to import BLE library');
      return;
    }
    this.logger.log('BLE enabled');
    this.state.next(this.noble?._state);
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
    this.noble?.on('discover', (peripheral: BlePeripheral) => {
      this.peripheralDiscovered.next(peripheral);
    });
    try {
      this.noble?.reset();
    } catch (_) {
      // no-op
    }
    await this.startScanning();
    return true;
  }

  async stopScanning() {
    if (this.enabled.getValue() && this.scanning) {
      this.logger.debug('Stop scanning');
      await this.noble?.stopScanningAsync();
    }
  }

  async startScanning() {
    if (this.enabled.getValue() && this.state.getValue() === STATE_POWERED_ON) {
      this.logger.debug('Start scanning');
      return await this.noble?.startScanningAsync();
    }
  }

  cancelCommand(commandId: string) {
    this.cancelledCommands.push(commandId);
    if(this.cancelledCommands.length > 100) {
      const overCount = this.cancelledCommands.length - 100;
      this.cancelledCommands.splice(0, overCount);
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
      this.logger.warn(`Ble is disabled, unable to send command to ${id}`);
      return results$.complete();
    }

    const peripheralId = this.peripheralAddresses.get(address);
    const peripheral = this.peripheralIds.get(peripheralId ?? '');
    if (!peripheral) {
      this.logger.warn(
        `Device ${id} with address ${address} not yet discovered`,
      );
      return results$.complete();
    }
    try {
      // await this.stopScanning();
      try {
        await peripheral.connectAsync();
        this.connectedPeripheral = peripheral;
      } catch (err) {
        throw new Error(`Error connecting to ${id}`);
      }
      debug && this.logger.debug(`Connected to ${id}`);
      try {
        let serviceChars: BleServicesAndCharacteristics | undefined;
        let uuidSet:
          | {
              serviceUUID: string;
              dataCharUUID: string;
              controlCharUUID: string;
            }
          | undefined;
        const uuids = [this.config.primary, this.config.secondary];
        for (const uuidset of uuids) {
          if (uuidSet !== undefined) {
            break;
          }
          try {
            serviceChars =
              await peripheral.discoverSomeServicesAndCharacteristicsAsync(
                [uuidset.serviceUUID],
                [uuidset.controlCharUUID, uuidset.dataCharUUID],
              );
            uuidSet = uuidset;
          } catch {
            // no-op
          }
        }
        if (uuidSet === undefined || serviceChars === undefined) {
          this.logger.warn('Unable to locate service with data characteristic');
          return results$.complete();
        }
        const dataChar = serviceChars.characteristics.find(
          (c) => c.uuid === uuidSet.dataCharUUID,
        );
        const writeChar = serviceChars.characteristics.find(
          (c) => c.uuid === uuidSet.controlCharUUID,
        );
        if (dataChar === undefined) {
          this.logger.warn(
            `Unable to locate service ${uuidSet.serviceUUID} with data characteristic ${uuidSet.dataCharUUID}`,
          );
          return results$.complete();
        }
        if (writeChar === undefined) {
          this.logger.warn(
            `Unable to locate service ${uuidSet.serviceUUID} with write characteristic ${uuidSet.controlCharUUID}`,
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
      // await this.startScanning();
    }
  }
}