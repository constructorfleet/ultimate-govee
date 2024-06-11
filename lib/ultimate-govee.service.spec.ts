import {
  BleChannelService,
  DeviceModel,
  DevicesModule,
  IoTChannelService,
  OpenApiChannelService,
} from './domain';
import { Test, TestingModule } from '@nestjs/testing';
import { UltimateGoveeService } from './ultimate-govee.service';
import { UltimateGoveeConfiguration } from './ultimate-govee.config';
import { CqrsModule } from '@nestjs/cqrs';
import { Device } from './domain/devices/device';
import { PurifierDevice } from './domain/devices/impl/appliances/purifier/purifier';
import { HumidifierDevice } from './domain/devices/impl/appliances/humidifier/humidifier';
import { AirQualityDevice } from './domain/devices/impl/home-improvement/air-quality/air-quality';
import { Version } from './domain/devices/version.info';
import { MODULE_OPTIONS_TOKEN } from './ultimate-govee.types';
import { IoTClient } from './data/iot/iot.client';

describe('UltimateGoveeService', () => {
  describe('constructDevice', () => {
    let module: TestingModule;
    let service: UltimateGoveeService;

    beforeEach(async () => {
      module = await Test.createTestingModule({
        imports: [CqrsModule.forRoot(), DevicesModule],
        providers: [
          UltimateGoveeConfiguration,
          UltimateGoveeService,
          BleChannelService,
          IoTChannelService,
          OpenApiChannelService,
          {
            provide: MODULE_OPTIONS_TOKEN,
            useValue: {},
          },
        ],
        exports: [UltimateGoveeService],
      })
        .overrideProvider(BleChannelService)
        .useValue(jest.mocked(BleChannelService))
        .overrideProvider(IoTChannelService)
        .useValue(jest.mocked(IoTChannelService))
        .overrideProvider(OpenApiChannelService)
        .useValue(jest.mocked(OpenApiChannelService))
        .compile();
      service = module.get(UltimateGoveeService);
    });

    afterEach(async () => {
      service.closeSubscriptions();
      await module.close();
    });
    describe('when passed a DeviceModel', () => {
      describe('that is an unknown device type', () => {
        it('returns a generic Device instance', () => {
          const deviceModel = new DeviceModel({
            id: '01:02:03:04:05:06:07:08',
            name: 'My Special Device',
            model: 'H4001',
            modelName: 'Generic Device',
            ic: 10,
            goodsType: 30,
            pactCode: 20,
            pactType: 5,
            version: new Version('1.0.0', '1.2.0'),
            category: 'Device',
            categoryGroup: 'Device Generic',
            cmd: 'status',
            state: {
              online: true,
              isOn: true,
            },
            deviceExt: {
              externalResources: {
                imageUrl: 'https://example.com/H4001.png',
                onImageUrl: 'https://example.com/H4001-on.png',
                offImageUrl: 'https://example.com/H4001-off.png',
              },
            },
          });
          const device = service.constructDevice(deviceModel);
          expect(device).toBeDefined();
          expect(device).toBeInstanceOf(Device);
          expect(device).not.toBeInstanceOf(PurifierDevice);
          expect(device).not.toBeInstanceOf(HumidifierDevice);
          expect(device).not.toBeInstanceOf(AirQualityDevice);
          device.closeSubscriptions();
        });
      });
      describe('that is a purifier device type', () => {
        it('returns a Purifier Device instance', () => {
          const deviceModel = new DeviceModel({
            id: '01:02:03:04:05:06:07:08',
            name: 'My Office Purifier',
            model: 'H7121',
            modelName: 'Smart Air Purifier',
            ic: 10,
            goodsType: 30,
            pactCode: 20,
            pactType: 5,
            version: new Version('1.0.0', '1.2.0'),
            category: 'Home Appliances',
            categoryGroup: 'Air Treatment',
            cmd: 'status',
            state: {
              online: true,
              isOn: true,
            },
            deviceExt: {
              externalResources: {
                imageUrl: 'https://example.com/H7121.png',
                onImageUrl: 'https://example.com/H7121-on.png',
                offImageUrl: 'https://example.com/H7121-off.png',
              },
            },
          });
          const device = service.constructDevice(deviceModel);
          expect(device).toBeDefined();
          expect(device).toBeInstanceOf(PurifierDevice);
          device.closeSubscriptions();
        });
      });
    });
  });
});
