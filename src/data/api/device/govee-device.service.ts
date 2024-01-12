import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { GoveeDeviceConfig } from './govee-device.config';
import {
  GoveeAPIDevice,
  DeviceListResponse,
  DeviceSettings,
} from './models/device-list.response';
import { goveeAuthenticatedHeaders, request } from '../../utils';
import { BluetoothData, GoveeDevice, WiFiData } from '../../govee-device';
import { OAuthData } from '../account/models/account-client';
import { InjectPersisted, PersistResult } from '../../../persist';

@Injectable()
export class GoveeDeviceService {
  private readonly logger: Logger = new Logger(GoveeDeviceService.name);

  constructor(
    @Inject(GoveeDeviceConfig.KEY)
    private readonly config: ConfigType<typeof GoveeDeviceConfig>,
    @InjectPersisted({
      filename: 'devices.json',
    })
    private readonly deviceListResponse: DeviceListResponse | undefined,
  ) {}

  async getDeviceList(oauthData: OAuthData): Promise<GoveeDevice[]> {
    try {
      this.logger.log('Getting device list');
      const response = await this.getApiResult(oauthData);
      return GoveeDeviceService.parseResponse(response);
    } catch (err) {
      this.logger.error(err);
      this.logger.error(`Unable to retrieve device list`, err);
      return GoveeDeviceService.parseResponse(
        this.deviceListResponse || { message: '', status: 0, devices: [] },
      );
    }
  }

  @PersistResult({
    filename: 'devices.json',
  })
  private async getApiResult(
    oauthData: OAuthData,
  ): Promise<DeviceListResponse> {
    const response = await request(
      this.config.deviceListUrl,
      goveeAuthenticatedHeaders(oauthData),
    ).post(DeviceListResponse);
    return response.data as DeviceListResponse;
  }

  private static parseResponse(response: DeviceListResponse): GoveeDevice[] {
    return response.devices.map((device: GoveeAPIDevice) => {
      try {
        const settings = device.deviceExt.deviceSettings;
        const data = device.deviceExt.deviceData;
        return {
          name: device.deviceName,
          model: device.sku,
          cmd: 'status',
          softwareVersion: settings.softwareVersion,
          hardwareVersion: settings.hardwareVersion,
          id: device.device,
          iotTopic: device.deviceExt.deviceSettings.topic,
          pactCode: device.pactCode,
          pactType: device.pactType,
          goodsType: device.goodsType,
          groupId: device.groupId,
          ic: settings.ic,
          wifi: this.getWiFiData(settings),
          blueTooth: this.getBleData(settings),
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
              settings.minTemperature && settings.maxTemperature
                ? {
                    min: settings.minTemperature,
                    max: settings.maxTemperature,
                    calibration: settings.temperatureCalibration,
                    warning: settings.temperatureWarning,
                    current: data.currentTemperature,
                  }
                : undefined,
            humidity:
              settings.minHumidity && settings.maxHumidity
                ? {
                    min: settings.minHumidity,
                    max: settings.maxHumidity,
                    calibration: settings.Calibration,
                    warning: settings.humidityWarning,
                    current: data.currentHumditity,
                  }
                : undefined,
          },
        } as GoveeDevice;
      } catch (err) {
        new Logger(GoveeDeviceService.name).error(err);
        throw new Error(`Unable to parse device response`);
      }
    });
  }

  private static getWiFiData(settings: DeviceSettings): WiFiData | undefined {
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

  private static getBleData(
    settings: DeviceSettings,
  ): BluetoothData | undefined {
    if (!settings.bleAddress || !settings.bleName) {
      return undefined;
    }

    return {
      name: settings.bleName,
      mac: settings.bleAddress,
    };
  }
}
