import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetDeviceQuery } from '../queries';
import { DevicesService } from '../../devices.service';

@QueryHandler(GetDeviceQuery)
export class GetDeviceQueryHandler implements IQueryHandler<GetDeviceQuery> {
  constructor(private readonly deviceService: DevicesService) {}

  async execute(query: GetDeviceQuery): Promise<any> {
    return this.deviceService.getDevice(query.deviceId);
  }
}
