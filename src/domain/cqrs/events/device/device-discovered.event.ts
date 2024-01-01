export class DeviceDiscoveredEvent {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly model: string,
    public readonly ic: number,
    public readonly pactType: number,
    public readonly pactCode: number,
    public readonly goodsType: number,
    public readonly softwareVersion: string,
    public readonly hardwareVersion: string,
    public readonly iotTopic?: string,
  ) {}
}
