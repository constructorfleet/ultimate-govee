import { Inject, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigType } from '@nestjs/config';
import { GoveeDeviceConfig } from './govee-device.config';
import { OAuthData } from '../../../domain/models/account-client';
import {
  Device,
  DeviceData,
  DeviceListResponse,
  DeviceSettings,
} from './models/device-list.response';
import { goveeAuthenticatedHeaders } from '../../../utils';
import {
  BluetoothData,
  GoveeDevice,
  Measurement,
  WiFiData,
} from '../../../domain/models/govee-device';

@Injectable()
export class GoveeDeviceService {
  private readonly logger: Logger = new Logger(GoveeDeviceService.name);

  constructor(
    @Inject(GoveeDeviceConfig.KEY)
    private readonly config: ConfigType<typeof GoveeDeviceConfig>,
  ) {}

  async getDeviceList(oauthData: OAuthData): Promise<GoveeDevice[]> {
    try {
      const response = await axios.get<DeviceListResponse>(
        this.config.deviceListUrl,
        {
          headers: goveeAuthenticatedHeaders(oauthData),
        },
      );
      return GoveeDeviceService.parseResponse(response.data);
    } catch (err) {
      this.logger.error(`Unable to retrieve device list`, err);
      throw new Error(`Unable to retrieve device list.`);
    }
  }

  private static parseResponse(response: DeviceListResponse): GoveeDevice[] {
    return response.devices.map((device: Device) => {
      const settings = JSON.parse(
        device.deviceExt.deviceSettings,
      ) as DeviceSettings;
      const data = JSON.parse(device.deviceExt.lastDeviceData) as DeviceData;
      // const externalResources = JSON.parse(
      //   device.deviceExt.extResources,
      // ) as DeviceExternalResources;
      return {
        name: device.deviceName,
        model: device.sku,
        id: device.device,
        pactCode: device.pactCode,
        pactType: device.pactType,
        goodsType: device.goodsType,
        ic: settings.ic,
        wifi: this.getWiFiData(settings),
        blueTooth: this.getBleData(settings),
        online: data.online,
        isOn: data.isOnOff,
        lastTime: data.lastTime,
        waterShortage: settings.waterShortage,
        boilWaterCompleteNotification: settings.boilWaterCompletedNotiOnOff,
        autoShudown: settings.autoShutDownOnOff,
        playState: settings.playState,
        filterExpired: settings.filterExpireOnOff,
        completeNotification: settings.completionNotiOnOff,
        battery: settings.battery,
        temperature: this.getMeasurement('tem', settings, data),
        humidity: this.getMeasurement('hum', settings, data),
      } as GoveeDevice;
    });
  }

  private static getMeasurement(
    measurement: string,
    settings: DeviceSettings,
    data: DeviceData,
  ): Measurement | undefined {
    const measurementProperties: Record<string, keyof Measurement> = {
      Max: 'max',
      Min: 'min',
      Cali: 'calibration',
      Warning: 'warning',
    };
    const result: Partial<Measurement> = Object.entries(
      measurementProperties,
    ).reduce(
      (
        res: Partial<Measurement>,
        [key, prop]: [key: string, prop: keyof Measurement],
      ) => {
        res[prop] = settings[`${measurement}${key}`];
        return res;
      },
      {},
    );
    if (Object.values(result).some((v) => v === undefined)) {
      return undefined;
    }
    result.current = data[measurement];
    return result as Measurement;
  }

  private static getWiFiData(settings: DeviceSettings): WiFiData | undefined {
    if (
      !settings.wifiHardVersion ||
      !settings.wifiSoftVersion ||
      !settings.wifiMac
    ) {
      return undefined;
    }

    return {
      name: settings.wifiName,
      mac: settings.wifiMac,
      hardwareVersion: settings.wifiHardVersion,
      softwareVersion: settings.wifiSoftVersion,
    };
  }

  private static getBleData(
    settings: DeviceSettings,
  ): BluetoothData | undefined {
    if (!settings.address || !settings.bleName) {
      return undefined;
    }

    return {
      name: settings.bleName,
      mac: settings.address,
    };
  }
}
