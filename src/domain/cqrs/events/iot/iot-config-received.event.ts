export class IoTConfigReceivedEvent {
  constructor(
    public readonly certificate: string,
    public readonly privateKey: string,
    public readonly endpoint: string,
    public readonly accountId: string,
    public readonly clientId: string,
    public readonly topic: string,
  ) {}
}
