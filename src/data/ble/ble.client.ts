import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { BehaviorSubject, Subject } from 'rxjs';
import { Optional } from '@govee/common';
import { BleModuleOptions } from './ble.options';
import { BlePeripheral, InjectBleOptions, NobleBle } from './ble.types';

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

  readonly peripheralDiscovered: Subject<BlePeripheral> = new Subject();

  constructor(@InjectBleOptions private readonly options: BleModuleOptions) {
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
  }

  async onDisabled() {
    await this.connectedPeripheral?.disconnectAsync();
    this.noble?.removeAllListeners();
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
  }

  async onApplicationBootstrap() {
    if (!this.options.enabled) {
      return;
    }

    this.state.next('STATE_ENABLED');
  }
}
