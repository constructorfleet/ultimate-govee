import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { GoveeDeviceConfig } from './govee-device.config';
import { OAuthData } from '../../../domain/models/account-client';
import {
  GoveeAPIDevice,
  DeviceListResponse,
  DeviceSettings,
} from './models/device-list.response';
import { goveeAuthenticatedHeaders, request } from '../../utils';
import { BluetoothData, GoveeDevice, WiFiData } from '../../govee-device';

@Injectable()
export class GoveeDeviceService {
  private readonly logger: Logger = new Logger(GoveeDeviceService.name);

  constructor(
    @Inject(GoveeDeviceConfig.KEY)
    private readonly config: ConfigType<typeof GoveeDeviceConfig>,
  ) {}

  async getDeviceList(oauthData: OAuthData): Promise<GoveeDevice[]> {
    try {
      const response = await request(
        this.config.deviceListUrl,
        goveeAuthenticatedHeaders(oauthData),
      ).get(DeviceListResponse);
      return GoveeDeviceService.parseResponse(
        response.data as DeviceListResponse,
      );
    } catch (err) {
      this.logger.error(err);
      this.logger.error(`Unable to retrieve device list`, err);
      throw new Error(`Unable to retrieve device list.`);
    }
  }

  private static parseResponse(response: DeviceListResponse): GoveeDevice[] {
    return response.devices.map((device: GoveeAPIDevice) => {
      try {
        const settings = device.deviceExt.deviceSettings;
        const data = device.deviceExt.deviceData;
        return {
          name: device.deviceName,
          model: device.sku,
          softwareVersion: settings.softwareVersion,
          hardwareVersion: settings.hardwareVersion,
          id: device.device,
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
