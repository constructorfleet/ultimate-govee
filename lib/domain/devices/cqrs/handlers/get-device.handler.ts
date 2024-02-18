import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetDeviceQuery } from '../queries/get-device.query';
import { DevicesService } from '../../devices.service';

@QueryHandler(GetDeviceQuery)
export class GetDeviceQueryHandler implements IQueryHandler<GetDeviceQuery> {
  constructor(private readonly deviceService: DevicesService) {}

  async execute(query: GetDeviceQuery): Promise<any> {
    await query.deviceId.map((id) => this.deviceService.getDevice(id));
  }
}
