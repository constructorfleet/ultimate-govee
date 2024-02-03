export class StateUpdatedEvent<StateName extends string, StateValue> {
  constructor(
    readonly deviceId: string,
    readonly stateName: StateName,
    readonly state: StateValue,
  ) {}
}
