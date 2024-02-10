import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { BehaviorSubject, Subject } from 'rxjs';
import { Optional } from '@govee/common';
import { BleModuleOptions } from './ble.options';
import { BlePeripheral, InjectBleOptions, NobleBle } from './ble.types';
import { DecoderService } from './decoder/decoder.service';
import { DecodeDevice } from './decoder/lib/types';
import { DecodedDevice } from './decoder';

const STATE_DISABLED = 'disabled';
const STATE_ENABLED = 'enabled';

@Injectable()
export class BleClient implements OnApplicationBootstrap {
  private noble: Optional<NobleBle> = undefined;
  private connectedPeripheral: Optional<BlePeripheral> = undefined;
  private readonly logger: Logger = new Logger(BleClient.name);
  private readonly state: BehaviorSubject<string> = new BehaviorSubject(
    STATE_DISABLED,
  );

  private readonly peripheralDiscovered: Subject<BlePeripheral> = new Subject();
  readonly peripheralDecoded: Subject<DecodedDevice> = new Subject();

  constructor(
    @InjectBleOptions private readonly options: BleModuleOptions,
    private readonly decoder: DecoderService,
  ) {
    this.state.subscribe(async (state) => {
      switch (state) {
        case STATE_ENABLED:
          return this.onEnabled();
        case STATE_DISABLED:
          return this.onDisabled();
        default:
          return undefined;
      }
    });
    this.peripheralDiscovered.subscribe(async (peripheral) => {
      const device = await this.decoder.decodeDevice(peripheral);
      if (!device) {
        return;
      }
      this.peripheralDecoded.next(device);
    });
  }

  async onDisabled() {
    await this.noble?.stopScanning();
    await this.connectedPeripheral?.disconnectAsync();
    this.noble?.removeAllListeners();
    this.noble = undefined;
  }

  async onEnabled() {
    const noble = await import('@abandonware/noble');
    this.noble = {
      ...noble,
    };
    this.noble.on('stateChange', (state) => {
      if (state === STATE_DISABLED) {
        return;
      }
      this.state.next(state);
    });
    this.noble.on('scanStart', () => this.logger.debug('Begin scanning'));
    this.noble.on('scanStart', () => this.logger.debug('Scanning stopped'));
    this.noble.on('warning', (message: string) => this.logger.warn(message));
    this.noble.on('discover', (peripheral: BlePeripheral) => {
      this.logger.debug(
        `Discovered peripheral with address: ${peripheral.address}`,
      );
      this.peripheralDiscovered.next(peripheral);
    });
    await this.noble.startScanningAsync();
  }

  async onApplicationBootstrap() {
    if (!this.options.enabled) {
      return;
    }

    this.state.next('STATE_ENABLED');
  }
}
