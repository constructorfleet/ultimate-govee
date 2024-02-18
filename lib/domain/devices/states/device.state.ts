import {
  BehaviorSubject,
  Connectable,
  Observer,
  Subject,
  Subscription,
  connectable,
} from 'rxjs';
import {
  Optional,
  Ignorable,
  deepPartialCompare,
} from '@constructorfleet/ultimate-govee/common';
import { Logger } from '@nestjs/common';
import {
  GoveeDeviceCommand,
  GoveeDeviceStateCommand,
  GoveeDeviceStatus,
  GoveeStatusForStateCommand,
} from '@constructorfleet/ultimate-govee/data';
import { DeviceModel } from '../devices.model';
import { v4 as uuidv4 } from 'uuid';

type MessageData = Partial<GoveeDeviceStatus>;

export type StateCommandAndStatus = {
  command: GoveeDeviceStateCommand;
  status: GoveeStatusForStateCommand;
};

const StatusCommand = 'status';

export const filterCommands = (
  commands: number[][],
  type?: Optional<number>,
  identifier?: Optional<number | number[]>,
) =>
  commands
    .filter((command) => {
      if (type === undefined) {
        return true;
      }
      const identifiers =
        identifier === undefined
          ? undefined
          : typeof identifier === 'number'
            ? [identifier]
            : identifier;
      const [cmdType, ...cmdIdentifiers] = command.slice(
        0,
        1 + (identifiers?.length ?? 0),
      );
      if (identifiers !== undefined) {
        return cmdIdentifiers.every((i, index) => i === identifiers[index]);
      }

      return cmdType === type;
    })
    .map((command) => {
      if (type === undefined && identifier === undefined) {
        return command;
      }
      if (identifier === undefined) {
        return command.slice(1);
      }
      return command.slice(
        1 + (typeof identifier === 'number' ? 1 : identifier.length),
      );
    });

type CommandResult = {
  state: string;
  value: any;
  commandId: string;
};

export class DeviceState<StateName extends string, StateValue> {
  protected readonly logger: Logger = new Logger(this.constructor.name);

  protected readonly pendingCommands: Map<
    string,
    Partial<
      Pick<GoveeDeviceStatus, 'state'> & {
        op?: { command: (number | undefined)[][] };
      }
    >[]
  > = new Map();
  protected readonly stateValue$: BehaviorSubject<StateValue>;
  protected readonly stateValue: Connectable<StateValue>;
  readonly commandBus: Subject<Omit<GoveeDeviceCommand, 'deviceId'>> =
    new Subject();
  protected readonly clearCommand$: Subject<CommandResult> = new Subject();
  readonly clearCommand = connectable(this.clearCommand$);

  subscribe(
    observerOrNext?:
      | Partial<Observer<StateValue>>
      | ((value: StateValue) => void),
  ): Subscription {
    return this.stateValue.subscribe(observerOrNext);
  }

  public get value(): StateValue {
    return this.stateValue$.getValue();
  }

  constructor(
    protected readonly device: DeviceModel,
    public readonly name: StateName,
    initialValue: StateValue,
  ) {
    this.stateValue$ = new BehaviorSubject(initialValue);
    this.stateValue = connectable(this.stateValue$);
    this.device.status?.subscribe((status) => this.parse(status));
    this.clearCommand.subscribe(({ commandId }) =>
      this.pendingCommands.delete(commandId),
    );
  }

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  parseState(data: unknown) {
    // no-op
  }

  parse(data: MessageData) {
    if (data.cmd && data.cmd !== StatusCommand) {
      return;
    }
    const commandId = Array.from(this.pendingCommands.entries()).find(
      ([_, statuses]) =>
        statuses.some((s) => deepPartialCompare(s.state, data.state)),
    )?.[0];
    this.parseState(data);
    if (commandId !== undefined) {
      this.clearCommand$.next({
        commandId,
        state: this.name,
        value: this.value,
      });
    }
  }

  setState(nextState: StateValue): string[] {
    const commandAndStatus = this.stateToCommand(nextState);
    if (!commandAndStatus) {
      return [];
    }

    const { command, status } = commandAndStatus;
    const commandId = uuidv4();
    const commands = (Array.isArray(command) ? command : [command]).map(
      (cmd) => ({
        commandId,
        ...cmd,
      }),
    );
    this.pendingCommands.set(
      commandId,
      Array.isArray(status) ? status : [status],
    );
    return commands.map((cmd) => {
      this.commandBus.next(cmd);
      return cmd.commandId;
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  protected stateToCommand(state: StateValue): Optional<StateCommandAndStatus> {
    return undefined;
  }
}

export type OpCommandData = {
  op?: {
    command?: number[][];
  };
} & MessageData;

export type OpCommandIdentifier = {
  opType?: Ignorable<Optional<number>>;
  identifier?: Ignorable<Optional<number[]>>;
};

export type ParseOption = 'opCode' | 'state' | 'both';

export class DeviceOpState<
  StateName extends string,
  StateValue,
> extends DeviceState<StateName, StateValue> {
  protected readonly opType: Ignorable<Optional<number>>;
  readonly identifier: Ignorable<Optional<number[]>>;
  constructor(
    { opType, identifier }: OpCommandIdentifier,
    device: DeviceModel,
    name: StateName,
    initialValue: StateValue,
    private readonly parseOption: ParseOption = 'opCode',
  ) {
    super(device, name, initialValue);
    this.opType = opType;
    this.identifier = identifier;
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars, no-unused-vars
  parseOpCommand(opCommand: number[]) {}

  parse(data: OpCommandData) {
    const commands = data.op?.command ?? [];
    if (['both', 'opCode'].includes(this.parseOption)) {
      this.filterOpCommands(commands).forEach((command) => {
        const commandId = Array.from(this.pendingCommands.entries()).find(
          ([_, statuses]) =>
            statuses.some((s) =>
              s.op?.command
                ?.at(0)
                ?.every((c, i) => c === undefined || command[i] === c),
            ),
        )?.[0];
        this.parseOpCommand(command);
        if (commandId !== undefined) {
          this.clearCommand$.next({
            commandId,
            state: this.name,
            value: this.value,
          });
        }
      });
    }
    if (['both', 'state'].includes(this.parseOption)) {
      this.parseState(data);
    }
  }

  protected filterOpCommands(opCommands: number[][]): number[][] {
    if (this.opType === null) {
      return opCommands;
    }
    return filterCommands(
      opCommands,
      this.opType,
      this.identifier || undefined,
    );
  }
}
