import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PersistResult } from '~ultimate-govee-persist';
import { goveeAuthenticatedHeaders, request } from '../../utils';
import { GoveeDiyConfig } from './govee-diy.config';
import { OAuthData } from '../account/models/account-client';
import axios from 'axios';
import { DiyEffect } from './models/diy-effect.model';
import { DIYGroupResponse } from './models/giy-group.response';
import { rebuildDiyOpCode } from './models/op-code';
import { writeFile } from 'fs/promises';
import stringify from 'json-stringify-safe';

@Injectable()
export class GoveeDiyService {
  private readonly logger: Logger = new Logger(GoveeDiyService.name);

  constructor(
    @Inject(GoveeDiyConfig.KEY)
    private readonly config: ConfigType<typeof GoveeDiyConfig>,
  ) {}

  @PersistResult({
    filename: 'govee.{3}.diys.json',
    // transform: (data) => instanceToPlain(data),
  })
  async getDeviceDiys(
    oauth: OAuthData,
    model: string,
    goodsType: number,
    deviceId: string,
  ): Promise<DiyEffect[]> {
    const authResponse = await axios({
      url: 'https://community-api.govee.com/os/v1/login',
      method: 'post',
      data: {
        email: 'teagan.m.glenn@gmail.com',
        password: '_4gUc_gui6r',
      },
      timeout: 30000,
    });
    const auth: OAuthData = {
      ...oauth,
      accessToken: authResponse.data.data.token,
    };
    try {
      const ttr = await fetch(
        'https://app2.govee.com/bff-app/v1/exec-plat/home',
        {
          headers: goveeAuthenticatedHeaders(auth),
        },
      );
      await writeFile(
        `persisted/govee.${deviceId}.ttr.json`,
        stringify(await ttr?.json()),
      );
      this.logger.log(
        `Retrieving DIY effects for device ${deviceId} from Govee REST API`,
      );
      const response = await request(
        this.config.deviceDiyUrl,
        goveeAuthenticatedHeaders(auth),
        {
          sku: model,
          goodsType,
          device: deviceId,
        },
      ).get(DIYGroupResponse, `persisted/govee.${deviceId}.raw.diys.json`);
      return (response.data as DIYGroupResponse).diyData.diyGroups.reduce(
        (effects, group) => {
          group.diys
            .map(
              (diy) =>
                ({
                  name: diy.name,
                  code: diy.code,
                  type: diy.effectType,
                  cmdVersion: 0,
                  opCode: rebuildDiyOpCode(diy.code, diy.diyOpCodeBase64),
                }) as DiyEffect,
            )
            .forEach((effect) => effects.push(effect));
          return effects;
        },
        [] as DiyEffect[],
      );
    } catch (error) {
      this.logger.error('Unable to retrieve device diys', error);
      return [];
    }
  }
}
