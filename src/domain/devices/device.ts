import { BehaviorSubject, Subject, interval, sampleTime } from 'rxjs';
import { ConsoleLogger, Logger } from '@nestjs/common';
import { DeltaMap, Optional, hexToBase64 } from '@govee/common';
import { GoveeDeviceStatus } from '@govee/data';
import DailyRotateFile from 'winston-daily-rotate-file';
import Winston from 'winston';
import { deepEquality } from '@santi100/equal-lib';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { PersistResult } from '@govee/persist';
import { DeviceModel } from './devices.model';
import { DeviceState } from './states/device.state';
import { ModeState, ModeStateName } from './states/mode.state';
import { DeviceRefeshEvent } from './cqrs/events/device-refresh.event';
import { DeviceStateCommandEvent } from './cqrs/events/device-state-command.event';

class JsonLogger extends ConsoleLogger {}

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
  private readonly refreshSubject: Subject<undefined> = new Subject();

  protected addState<TDevice extends DeviceState<string, any>>(
    state: TDevice,
  ): TDevice {
    this.device.status.subscribe((status) => state.parse(status));
    this.states.set(state.name, state);
    state.subscribe((value) => {
      this.loggableState(this.id);
      this.stateValues.set(state.name, value);
    });
    state.commandBus.subscribe((cmd) =>
      this.eventBus.publish(
        new DeviceStateCommandEvent(
          state.name,
          {
            deviceId: this.id,
            command: cmd.command,
            cmdVersion: cmd.cmdVersion ?? 0,
            type: cmd.type ?? 1,
            data: {
              ...cmd.data,
              ...(cmd.data.command !== undefined
                ? { command: cmd.data.command.map((x) => hexToBase64(x)) }
                : {}),
            },
          },
          {
            iotTopic: this.iotTopic,
          },
        ),
      ),
    );
    return state;
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
    return Array.from(this.states.entries()).reduce((s, [k, v]) => {
      if (k === ModeStateName) {
        s[k] = (v as ModeState).activeIdentifier;
      } else {
        s[k] = v.value;
      }
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
    this.refreshSubject.next(undefined);

    // this.device.refresh();
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
    this.refreshSubject
      .pipe(sampleTime(1000))
      .subscribe(() =>
        this.eventBus.publish(
          new DeviceRefeshEvent(
            this.id,
            this.model,
            this.goodsType,
            this.iotTopic,
          ),
        ),
      );
    interval(5000).subscribe(() => this.refresh());
    this.stateValues.delta$.subscribe(() => {
      const values = Object.fromEntries(
        Array.from(this.stateValues.keys()).map((k) => [
          k,
          this.stateValues[k],
        ]),
      );
      this.next(values);
    });
    this.subscribe(async (states) => {
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
    });
  }

  @PersistResult({
    path: 'persisted',
    filename: '{0}.state.json',
  })
  loggableState(deviceId: string) {
    const state = {
      deviceId,
      name: this.name,
      model: this.model,
      type: this.constructor.name,
      ...Object.fromEntries(
        Array.from(this.stateValues.keys()).map((s) =>
          s !== ModeStateName
            ? [s, this.stateValues.get(s)]
            : [
                s,
                (
                  this.stateValues.get(s) as ModeState
                )?.activeIdentifier?.getValue(),
              ],
        ),
      ),
    };
    return state;
  }
}
