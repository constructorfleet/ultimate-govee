import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
  InjectPersisted,
  PersistModule,
  PersistResult,
} from '~ultimate-govee-persist';
import { Optional } from '~ultimate-govee-common';
import { GoveeDeviceConfig } from './govee-device.config';
import {
  GoveeAPIDevice,
  DeviceListResponse,
  DeviceSettings,
} from './models/device-list.response';
import { goveeAuthenticatedHeaders, request } from '../../utils';
import { BluetoothData, GoveeDevice, WiFiData } from '../../govee-device';
import { OAuthData } from '../account/models/account-client';
import { GoveeDiyService } from '../diy/govee-diy.service';
import { join } from 'path';
import { DeviceTopicResponse } from './models/device-topic.response';

@Injectable()
export class GoveeDeviceService {
  private readonly logger: Logger = new Logger(GoveeDeviceService.name);

  constructor(
    @Inject(GoveeDeviceConfig.KEY)
    private readonly config: ConfigType<typeof GoveeDeviceConfig>,
    @InjectPersisted({
      filename: 'govee.devices.json',
    })
    private readonly deviceListResponse: Optional<DeviceListResponse>,
    private readonly diyService: GoveeDiyService,
  ) {}

  async getDeviceList(oauthData: OAuthData): Promise<GoveeDevice[]> {
    try {
      this.logger.log('Retrieving list of devices from Govee REST API');
      const response = await this.getApiResult(oauthData);
      return await this.parseResponse(oauthData, response);
    } catch (err) {
      this.logger.error('Unable to retrieve device list', err);
      return await this.parseResponse(
        oauthData,
        this.deviceListResponse || { message: '', status: 0, devices: [] },
      );
    }
  }

  @PersistResult({
    filename: 'govee.devices.json',
  })
  private async getApiResult(
    oauthData: OAuthData,
  ): Promise<DeviceListResponse> {
    const response = await request(
      this.config.deviceListUrl,
      goveeAuthenticatedHeaders(oauthData),
    ).post(
      DeviceListResponse,
      join(PersistModule.persistRootDirectory, 'govee.devices.raw.json'),
    );
    return response.data as DeviceListResponse;
  }

  private async getIoTTopic(
    oauthData: OAuthData,
    device: GoveeAPIDevice,
  ): Promise<string | undefined> {
    if (device.deviceExt.deviceSettings.topic?.startsWith('GD/') === true) {
      return device.deviceExt.deviceSettings.topic;
    }
    try {
      const response = await request(
        this.config.appDeviceTopicUrl,
        goveeAuthenticatedHeaders(oauthData),
        {
          device: device.device,
          sku: device.sku,
        },
      ).post(DeviceTopicResponse);
      return response.data.iotTopic;
    } catch (err) {
      this.logger.error(
        `Unable to retrieve iot topic for device ${device.device}.`,
        err,
      );
      return undefined;
    }
  }

  private async parseResponse(
    oauthData: OAuthData,
    response: DeviceListResponse,
  ): Promise<GoveeDevice[]> {
    return await Promise.all(
      response.devices.map(async (device: GoveeAPIDevice) => {
        try {
          const settings = device.deviceExt.deviceSettings;
          const data = device.deviceExt.deviceData;
          const iotTopic = await this.getIoTTopic(oauthData, device);

          return {
            name: device.deviceName,
            model: device.sku,
            cmd: 'status',
            softwareVersion: settings.softwareVersion,
            hardwareVersion: settings.hardwareVersion,
            id: device.device,
            iotTopic,
            bleAddress: device.deviceExt.deviceSettings.bleAddress,
            pactCode: device.pactCode,
            pactType: device.pactType,
            goodsType: device.goodsType,
            groupId: device.groupId,
            ic: settings.ic,
            wifi: GoveeDeviceService.getWiFiData(settings),
            blueTooth: GoveeDeviceService.getBleData(settings),
            state: {
              online: data.isOnline,
              isOn: data.isOn,
              lastTime: data.lastReportTimestamp,
              waterShortage: settings.waterShortage,
              boilWaterCompleteNotification: settings.notifyWaterBoiling,
              autoShudown: settings.automaticShutDown,
              playState: settings.playState,
              filterExpired: settings.filterExpired,
              completeNotification: settings.notifyComplete,
              battery: settings.batteryLevel,
              temperature:
                settings.minTemperature !== undefined &&
                settings.maxTemperature !== undefined
                  ? {
                      min: settings.minTemperature / 100,
                      max: settings.maxTemperature / 100,
                      calibration: settings.temperatureCalibration,
                      warning: settings.temperatureWarning,
                      current: data.currentTemperature,
                    }
                  : undefined,
              humidity:
                settings.minHumidity !== undefined &&
                settings.maxHumidity !== undefined
                  ? {
                      min: settings.minHumidity / 100,
                      max: settings.maxHumidity / 100,
                      calibration: settings.Calibration,
                      warning: settings.humidityWarning,
                      current: data.currentHumditity,
                    }
                  : undefined,
            },
          } as GoveeDevice;
        } catch (err) {
          throw new Error('Unable to parse device response');
        }
      }),
    );
  }

  private static getWiFiData(settings: DeviceSettings): Optional<WiFiData> {
    if (
      !settings.wifiHardwareVersion ||
      !settings.wifiSoftVersion ||
      !settings.wifiMacAddress
    ) {
      return undefined;
    }

    return {
      name: settings.wifiName,
      mac: settings.wifiMacAddress,
      hardwareVersion: settings.wifiHardwareVersion,
      softwareVersion: settings.wifiSoftVersion,
    };
  }

  private static getBleData(settings: DeviceSettings): Optional<BluetoothData> {
    if (!settings.bleAddress || !settings.bleName) {
      return undefined;
    }

    return {
      name: settings.bleName,
      mac: settings.bleAddress,
    };
  }
}
