import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { DevicesService } from './devices.service';

@Controller('devices')
export class DeviceController {
  private readonly logger: Logger = new Logger(DeviceController.name);
  constructor(private readonly deviceService: DevicesService) {}

  @Get()
  async getAllDevices() {
    const deviceIds = this.deviceService.getDeviceIds();
    const devices = deviceIds
      .map((id) => this.deviceService.getDevice(id))
      .map((device) => device?.loggableState(device.id));
    return Promise.all(devices);
  }

  @Get('model/:model')
  async getByModel(@Param('model') model: string) {
    const devices = this.deviceService.getByModel(model);
    return Promise.all(
      devices.map((device) => device.loggableState(device.id)),
    );
  }

  @Get(':id')
  async getDevice(
    @Param('id') deviceId: string,
    @Query('state') stateName?: string,
  ) {
    const device = this.deviceService.getDevice(deviceId);

    if (!device || !stateName) {
      return device?.loggableState(deviceId);
    }
    return device.state(stateName)?.value;
  }

  @Post(':id/refresh')
  async refreshDevice(@Param('id') deviceId: string) {
    this.deviceService.getDevice(deviceId)?.refresh();
  }

  @Post(':id/:state')
  async setState(
    @Param('id') deviceId: string,
    @Param('state') stateName: string,
    @Body('state') stateData: any,
  ) {
    this.deviceService
      .getDevice(deviceId)
      ?.state(stateName)
      ?.setState(stateData);
  }
}
