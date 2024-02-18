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
import {
  bufferCount,
  bufferWhen,
  filter,
  map,
  race,
  reduce,
  takeWhile,
  timeout,
  timer,
} from 'rxjs';
import { EventBus, ofType } from '@nestjs/cqrs';
import { DeviceStateChangedEvent } from './cqrs';

@Controller('devices')
export class DeviceController {
  private readonly logger: Logger = new Logger(DeviceController.name);
  constructor(
    private readonly deviceService: DevicesService,
    private readonly eventBus: EventBus,
  ) {}

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
