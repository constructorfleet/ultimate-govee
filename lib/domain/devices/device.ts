import {
  BehaviorSubject,
  Subject,
  Subscription,
  interval,
  sampleTime,
} from 'rxjs';
import { Logger, OnModuleDestroy } from '@nestjs/common';
import { DeltaMap, Optional, hexToBase64 } from '~ultimate-govee-common';
import { GoveeDeviceStatus } from '~ultimate-govee-data';
import { deepEquality } from '@santi100/equal-lib';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { PersistResult } from '~ultimate-govee-persist';
import { DeviceModel } from './devices.model';
import { DeviceOpState, DeviceState } from './states/device.state';
import { ModeState, ModeStateName } from './states/mode.state';
import { DeviceRefeshEvent } from './cqrs/events/device-refresh.event';
import { DeviceStateCommandEvent } from './cqrs/events/device-state-command.event';
import { DeviceStateChangedEvent } from './cqrs/events/device-state-changed.event';
import {
  DeviceStateValues,
  DeviceStatesType,
  DeviceType,
} from './devices.types';
import { Version } from './version.info';
import stringify from 'json-stringify-safe';

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

export class Device<States extends DeviceStatesType = DeviceStatesType>
  extends BehaviorSubject<Optional<Device<States>>>
  implements DeviceType<States>, OnModuleDestroy
{
  private readonly logger: Logger;

  static readonly deviceType: string = 'unknown';

  get deviceType(): string {
    return Device.deviceType;
  }

  private readonly deviceStates: DeltaMap<string, DeviceState<string, any>> =
    new DeltaMap({
      isModified: (current, previous) =>
        !deepEquality(current.value, previous.value),
    });
  private readonly opIdentifiers: Set<number[]> = new Set();
  private readonly refresh$ = new Subject<void>();
  private readonly subscriptions: Subscription[] = [];
  protected isDebug: boolean = false;

  protected addState<TDevice extends DeviceState<string, any>>(
    state: TDevice,
  ): TDevice {
    if (
      state instanceof DeviceOpState &&
      state.identifier !== undefined &&
      state.identifier !== null
    ) {
      this.opIdentifiers.add(state.identifier);
    }
    this.subscriptions.push(
      this.device.status.subscribe((status) => state.parse(status)),
    );
    this.deviceStates.set(state.name, state);
    this.subscriptions.push(
      state.subscribe(() => {
        this.next(this);
      }),
    );
    this.subscriptions.push(
      state.clearCommand.subscribe((command) => {
        this.eventBus.publish(
          new DeviceStateChangedEvent(
            this as unknown as Device<DeviceStatesType>,
            command.state,
            command.value,
            command.commandId,
            this.isDebug,
          ),
        );
      }),
    );
    this.subscriptions.push(
      state.commandBus.subscribe((cmd) => {
        this.logger.debug('Publishing state command');
        this.eventBus.publish(
          new DeviceStateCommandEvent(
            this.id,
            state.name,
            {
              deviceId: this.id,
              commandId: cmd.commandId,
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
              bleAddress: this.bleAddress,
            },
            this.isDebug,
          ),
        );
      }),
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

  get pactCode(): number {
    return this.device.pactCode;
  }

  get pactType(): number {
    return this.device.pactType;
  }

  get iotTopic(): Optional<string> {
    return this.device.iotTopic;
  }

  get bleAddress(): Optional<string> {
    return this.device.bleAddress;
  }

  get version(): Version {
    return this.device.version;
  }

  get states(): States {
    return Object.fromEntries(
      Array.from(this.deviceStates.entries()),
    ) as States;
  }

  currentStates(): DeviceStateValues<States> {
    const result = Object.fromEntries(
      Object.entries(this.states ?? {}).map(([k, v]) => [
        k,
        k === ModeStateName ? (v as ModeState)?.activeMode?.name : v?.value,
      ]),
    ) as DeviceStateValues<States>;
    return result;
  }

  previousStates(): DeviceStateValues<States> {
    return Object.fromEntries(
      Object.entries(this.states ?? {}).map(([k, v]) => [
        k,
        k === ModeStateName
          ? (v as ModeState)?.activeMode?.history.peekAll()
          : v?.history.peekAll(),
      ]),
    ) as DeviceStateValues<States>;
  }

  state<TState extends DeviceState<string, any> = DeviceState<string, any>>(
    stateName: string,
  ): Optional<TState> {
    return this.deviceStates.get(stateName) as TState;
  }

  deviceStatus(status: GoveeDeviceStatus) {
    if (status.cmd !== 'status') {
      this.refresh$.next();
    } else {
      this.device.status.next(status);
    }
  }

  refresh() {
    this.logger.debug(`Refreshing state ${this.iotTopic} ${this.bleAddress}`);
    this.eventBus.publish(
      new DeviceRefeshEvent(
        this.id,
        this.model,
        this.goodsType,
        {
          iotTopic: this.iotTopic,
          bleAddress: this.bleAddress,
        },
        Array.from(this.opIdentifiers),
        this.isDebug,
      ),
    );
  }

  setState(stateName: string, nextState: any): any {
    return this.state(stateName)?.setState(nextState);
  }

  debug(isDebug: boolean): this {
    this.isDebug = isDebug;
    return this;
  }

  constructor(
    readonly device: DeviceModel,
    protected readonly eventBus: EventBus,
    protected readonly commandBus: CommandBus,
    stateFactories: StateFactories,
  ) {
    super(undefined);
    this.next(this);
    this.refresh$.pipe(sampleTime(5000)).subscribe(() => this.refresh());
    this.logger = new Logger(`${this.constructor.name}-${device.name}`);
    buildStates(stateFactories, device).forEach((state) => {
      this.addState(state);
      state.parse({
        cmd: 'status',
        ...device.status.value,
      });
    });
    this.subscriptions.push(
      interval(10000).subscribe(() => this.refresh$.next()),
    );
    this.subscriptions.push(
      this.deviceStates.delta$.subscribe(() => {
        this.next(this);
      }),
    );
    this.subscribe(() => {
      this.logState();
    });
  }

  @PersistResult({
    filename: 'govee.{0}.state.json',
  })
  loggableState(deviceId: string) {
    const state = {
      deviceId,
      name: this.name,
      model: this.model,
      type: this.constructor.name,
      iotTopic: this.iotTopic,
      bleAddress: this.bleAddress,
      states: JSON.parse(stringify(this.currentStates() ?? {})),
      history: JSON.parse(stringify(this.previousStates() ?? {})),
    };
    return state;
  }

  logState() {
    if (this.isDebug) {
      this.loggableState(this.id);
    }
  }

  onModuleDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
