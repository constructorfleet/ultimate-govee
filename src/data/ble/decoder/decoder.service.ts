import { Inject, Injectable, Logger } from '@nestjs/common';
import { DecoderConfig } from './decoder.config';
import { ConfigType } from '@nestjs/config';
import { request } from '../../utils';
import {
  DecoderDeviceSpecification,
  DecoderPropertiesMetadata,
} from './decoder.types';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class DecoderService {
  private readonly logger: Logger = new Logger(DecoderService.name);
  private readonly properties: Record<string, DecoderPropertiesMetadata> = {};
  private readonly devices: Record<string, DecoderDeviceSpecification> = {};
  private readonly deviceProperties: Record<string, string> = {};

  constructor(
    @Inject(DecoderConfig.KEY)
    private readonly config: ConfigType<typeof DecoderConfig>,
  ) {}

  async getCommonProperties() {
    try {
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
    let deviceSpec = this.devices[`_${model}_json`];
    if (deviceSpec === undefined) {
      const url = this.config.deviceJsonUrl(model);
      try {
        const file = await this.getHeaderFile(url);
        if (!file) {
          return undefined;
        }
        this.processHeaderFile(file);
        deviceSpec = this.devices[`_${model}_json`];
        if (deviceSpec === undefined) {
          return undefined;
        }
      } catch (err) {
        this.logger.error(`Error retrieving header from ${url} for ${model}`);
        return undefined;
      }
    }
    deviceSpec.propertyMetadata =
      this.properties[`_${model}_json_props`]?.properties;
    return deviceSpec;
  }

  private processHeaderFile(file: string) {
    const itemsInFile = this.findJsonInResponse(file);
    itemsInFile.forEach((item) => {
      if (item.name.endsWith('_props')) {
        this.properties[item.name] = plainToInstance(
          DecoderPropertiesMetadata,
          item['value'],
        );
      } else if (item.name.endsWith('_json')) {
        this.devices[item.name] = plainToInstance(
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
}
