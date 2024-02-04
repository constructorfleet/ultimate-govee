import { BehaviorSubject, interval } from 'rxjs';
import { Logger } from '@nestjs/common';
import { DeltaMap, Optional, startDelta } from '@govee/common';
import { GoveeDeviceStatus } from '@govee/data';
import DailyRotateFile from 'winston-daily-rotate-file';
import Winston from 'winston';
import { deepEquality } from '@santi100/equal-lib';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { DeviceModel } from './devices.model';
import { DeviceState } from './states/device.state';
import { ModeStateName } from './states/mode.state';
import { DeviceRefeshEvent } from './cqrs/events/device-refresh.event';

const getLogger = (deviceId: string, deviceModel: string): Winston.Logger =>
  Winston.createLogger({
    level: 'info',
    format: Winston.format.combine(
      Winston.format.timestamp(),
      Winston.format.json({
        space: 2,
      }),
    ),
    transports: [
      new DailyRotateFile({
        dirname: `persisted/devices/${deviceModel}`,
        filename: `${deviceId.replace(/:/g, '')}-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '7d',
      }),
    ],
  });

export type DeviceStates = Record<string, DeviceState<string, any>>;
export type DeviceStateValues = Record<string, unknown>;

export const DefaultFactory: 'default' = 'default' as const;

export type StateFactory<TDevice extends DeviceState<string, unknown>> = (
  device: DeviceModel,
) => TDevice;

type ModelStateFactoryValue =
  | StateFactory<DeviceState<string, any>>
  | StateFactory<DeviceState<string, any>>[];

export type ModelStateFactory =
  | Record<string, ModelStateFactoryValue>
  | StateFactory<DeviceState<string, any>>;

export type StateFactories = ModelStateFactory[];

const buildStates = (
  stateFactories: StateFactories,
  device: DeviceModel,
): DeviceState<string, any>[] =>
  stateFactories
    .map((factory) =>
      typeof factory === 'object'
        ? factory[device.model] ?? factory[DefaultFactory]
        : factory,
    )
    .filter((factory) => factory !== undefined)
    .map((factory) =>
      Array.isArray(factory) ? factory.map((f) => f(device)) : factory(device),
    )
    .flat();

export abstract class Device extends BehaviorSubject<DeviceStateValues> {
  private readonly logger: Logger;

  static readonly deviceType: string = 'unknown';

  private readonly states: DeltaMap<string, DeviceState<string, any>> =
    new DeltaMap();
  private readonly stateValues: DeltaMap<string, any> = new DeltaMap({
    isModified: (current, previous) => !deepEquality(current, previous),
  });

  protected addState<TDevice extends DeviceState<string, any>>(
    state: TDevice,
  ): void {
    this.device.status.subscribe((status) => state.parse(status));
    this.states.set(state.name, state);
    state.subscribe((value) => {
      this.stateValues.set(state.name, value);
    });
  }

  get id(): string {
    return this.device.id;
  }

  get model(): string {
    return this.device.model;
  }

  get name(): string {
    return this.device.name;
  }

  get goodsType(): number {
    return this.device.goodsType;
  }

  get iotTopic(): Optional<string> {
    return this.device.iotTopic;
  }

  get currentState() {
    return Object.entries(this.states).reduce((s, [k, v]) => {
      s[k] = v.value;
      return s;
    }, {});
  }

  state<TState extends DeviceState<string, any> = DeviceState<string, any>>(
    stateName: string,
  ): Optional<TState> {
    return this.states.get(stateName) as TState;
  }

  deviceStatus(status: GoveeDeviceStatus) {
    if (status.cmd !== 'status') {
      this.device.refresh();
    } else {
      this.device.status.next(status);
    }
  }

  refresh() {
    this.eventBus.publish(new DeviceRefeshEvent(this.id));
    this.device.refresh();
  }

  setState(stateName: string, nextState: any): any {
    return this.state(stateName)?.setState(nextState);
  }

  protected stateLogger: Winston.Logger | undefined;

  constructor(
    protected readonly device: DeviceModel,
    protected readonly eventBus: EventBus,
    protected readonly commandBus: CommandBus,
    stateFactories: StateFactories,
  ) {
    super({});
    this.logger = new Logger(`${this.constructor.name}-${device.name}`);
    buildStates(stateFactories, device).forEach((state) => {
      this.addState(state);
      state.parse({
        cmd: 'status',
        ...device.status.value,
      });
    });
    interval(5000).subscribe(() => this.refresh());
    this.stateValues.delta$.pipe(startDelta()).subscribe((stateValues) => {
      const values = Object.fromEntries(stateValues.all.entries());
      this.next(values);
    });
    this.subscribe((states) => {
      if (this.stateLogger === undefined) {
        this.stateLogger = getLogger(this.id, this.model);
      }
      this.stateLogger.info({
        deviceId: this.id,
        name: this.name,
        model: this.model,
        type: this.constructor.name,
        ...states,
      });
      this.logger.log({
        deviceId: this.id,
        name: this.name,
        model: this.model,
        type: this.constructor.name,
        ...Object.fromEntries(
          Object.entries(states).filter((s) => s[0] !== ModeStateName),
        ),
      });
    });
  }
}
