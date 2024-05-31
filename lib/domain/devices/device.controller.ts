import {
  Body,
  Controller,
  Get,
  HttpStatus,
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
    return await Promise.all(devices);
  }

  @Get('model/:model')
  async getByModel(@Param('model') model: string) {
    const devices = this.deviceService.getByModel(model);
    return await Promise.all(
      devices.map((device) => device.loggableState(device.id)),
    );
  }

  @Get(':id')
  getDevice(@Param('id') deviceId: string, @Query('state') stateName?: string) {
    const device = this.deviceService.getDevice(deviceId);

    if (!device || !stateName) {
      return device?.loggableState(deviceId);
    }
    return device.state(stateName)?.value;
  }

  @Post(':id/refresh')
  refreshDevice(@Param('id') deviceId: string) {
    this.deviceService.getDevice(deviceId)?.refresh();
  }

  @Post(':id/:stateName')
  setState(
    @Param('id') deviceId: string,
    @Param('stateName') stateName: string,
    @Body('state') stateData: any,
  ) {
    const device = this.deviceService.getDevice(deviceId)?.debug(true);
    const state = device?.state(stateName);
    const commandId = state?.setState(stateData);
    device?.debug(false);
    if (!commandId) {
      return HttpStatus.NOT_FOUND;
    }

    return { commandId };
  }
}
