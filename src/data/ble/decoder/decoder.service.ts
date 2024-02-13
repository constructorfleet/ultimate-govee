import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { DecoderConfig } from './decoder.config';
import { ConfigType } from '@nestjs/config';
import { request } from '../../utils';
import {
  DecodedDevice,
  DecoderDeviceSpecification,
  DecoderPropertiesMetadata,
} from './decoder.types';
import { plainToInstance } from 'class-transformer';
import { BlePeripheral } from '..';
import { InjectDecoder } from './decoder.providers';
import { Decoder } from './lib/decoder';
import { DecodeDevice } from './lib/types';
import { Optional } from '@govee/common';
import axios, { AxiosError } from 'axios';

@Injectable()
export class DecoderService implements OnApplicationBootstrap {
  private readonly logger: Logger = new Logger(DecoderService.name);
  private readonly properties: Record<string, DecoderPropertiesMetadata> = {};
  private readonly deviceSpecifications: Record<
    string,
    DecoderDeviceSpecification
  > = {};
  private readonly deviceProperties: Record<string, string> = {};

  constructor(
    @Inject(DecoderConfig.KEY)
    private readonly config: ConfigType<typeof DecoderConfig>,
    @InjectDecoder private readonly decoder: typeof Decoder,
  ) {}

  async decodeDevice(
    peripheral: BlePeripheral,
  ): Promise<Optional<DecodedDevice>> {
    const modelMatch = /(H\d{4})/.exec(peripheral.advertisement.localName);
    if (!modelMatch) {
      return undefined;
    }
    if (!modelMatch[1]) {
      this.logger.warn(
        `Could not match model number for ${peripheral.id} ${peripheral.advertisement.localName}`,
      );
      return undefined;
    }
    this.logger.log(`Matched model ${modelMatch[1]}`);
    const spec = await this.getDeviceSpec(modelMatch[1] || '');
    if (spec === undefined) {
      return undefined;
    }
    const device: DecodeDevice = {
      name: peripheral.advertisement.localName,
      macAddress: peripheral.id,
      uuid: peripheral.uuid,
      manufacturerData:
        peripheral.advertisement.manufacturerData?.toString('hex'),
      serviceData: [],
    };
    if (spec.conditions && !this.decoder.matches(device, spec.conditions)) {
      return undefined;
    }
    return {
      id: device.macAddress,
      brand: spec.brand,
      model: spec.model,
      modelName: spec.modelName,
      type: spec.type,
      state: this.decoder.decodeProperties(device, spec.properties ?? {}),
    };
  }

  async getCommonProperties() {
    try {
      this.logger.log('Retrieving common propertiest header');
      const file = await this.getHeaderFile(this.config.commonPropertiesUrl);
      if (!file) {
        return;
      }
      this.processHeaderFile(file);
    } catch (err) {
      this.logger.error(
        `Error retrieving header from ${this.config.commonPropertiesUrl}`,
      );
    }
  }

  async getDeviceSpec(
    model: string,
  ): Promise<DecoderDeviceSpecification | undefined> {
    let deviceSpec = this.deviceSpecifications[`_${model}_json`];
    if (deviceSpec === undefined) {
      const url = this.config.deviceJsonUrl(model);
      try {
        const file = await this.getHeaderFile(url);
        if (!file) {
          return undefined;
        }
        this.processHeaderFile(file);
        deviceSpec = this.deviceSpecifications[`_${model}_json`];
        if (deviceSpec === undefined) {
          return undefined;
        }
      } catch (err) {
        this.logger.debug(
          `Error retrieving header from ${url} for ${model}`,
          err,
        );
        return undefined;
      }
    }
    deviceSpec.propertyMetadata =
      this.properties[`_${model}_json_props`]?.properties;
    return deviceSpec;
  }

  private processHeaderFile(file: string) {
    this.logger.debug('Processing header file');
    const itemsInFile = this.findJsonInResponse(file);
    itemsInFile.forEach((item) => {
      if (item.name.endsWith('_props')) {
        this.properties[item.name] = plainToInstance(
          DecoderPropertiesMetadata,
          item['value'],
        );
      } else if (item.name.endsWith('_json')) {
        this.deviceSpecifications[item.name] = plainToInstance(
          DecoderDeviceSpecification,
          item['value'],
        );
      }
    });
    const propertyMapping = file.match(
      /const char\* (_.*?_json_props) = (_.*?);/,
    );
    if (!propertyMapping) {
      return;
    }
    this.deviceProperties[propertyMapping[1]] = propertyMapping[2];
  }

  private async getHeaderFile(url: string): Promise<string | undefined> {
    const headerFile = await request(url, {
      Accept: 'text/*',
    }).get();
    return headerFile.data as string;
  }

  private findJsonInResponse(
    response: string,
  ): { name: string; value: Record<string, unknown> }[] {
    const matches = response.match(/const char\* (_.+?) = "(.*?)";/g);
    return (matches
      ?.map((m) => ({
        name: this.getJsonItemName(m),
        value: this.getJsonItemValue(m),
      }))
      ?.filter((i) => i['name'] !== undefined && i['value'] !== undefined) ??
      []) as { name: string; value: Record<string, unknown> }[];
  }

  private getJsonItemName(item: string): string | undefined {
    const nameMatch = item.match(/char\* (_.+?) =/);
    if (!nameMatch) {
      return undefined;
    }
    return nameMatch[1];
  }

  private getJsonItemValue(item: string): Record<string, unknown> | undefined {
    const valueMatch = item.match(/= "(.+?)";/);
    if (!valueMatch) {
      return undefined;
    }
    return JSON.parse(valueMatch[1].replace(/\\/g, ''));
  }

  async onApplicationBootstrap() {
    this.logger.log('Loading decoder metadata...');
    await this.getCommonProperties();
  }
}
