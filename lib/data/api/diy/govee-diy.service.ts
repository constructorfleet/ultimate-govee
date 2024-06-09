import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { GoveeCommunityApiError, GoveeError } from '~ultimate-govee-common';
import { AuthState } from '~ultimate-govee-domain';
import { PersistResult } from '~ultimate-govee-persist';
import { goveeAuthenticatedHeaders, request } from '../../utils';
import { GoveeDiyConfig } from './govee-diy.config';
import { OneClickComponent } from './models/bff/one-click-component.response';
import { OneClickResponse } from './models/bff/one-click.response';
import { TapToRunResponse } from './models/bff/tap-to-run.response';
import { DiyEffect } from './models/diy-effect.model';
import { DIYGroupResponse } from './models/diy-group.response';

@Injectable()
export class GoveeDiyService {
  private readonly logger: Logger = new Logger(GoveeDiyService.name);

  constructor(
    @Inject(GoveeDiyConfig.KEY)
    private readonly config: ConfigType<typeof GoveeDiyConfig>,
  ) {}

  @PersistResult({
    filename: 'govee.one-clicks.json',
  })
  async getOneClicks(authState: AuthState): Promise<OneClickResponse[]> {
    if (authState.bffAuth === undefined) {
      this.logger.error(
        'Unable to retrieve One-Click actions: not authenticated',
      );
      throw new GoveeError('Not Authenticated');
    }
    try {
      const response = await request(
        this.config.oneClicksUrl,
        this.config.headers(authState.bffAuth.oauth),
      ).get(TapToRunResponse);
      const ttrResponse: TapToRunResponse = response.data as TapToRunResponse;

      return ttrResponse.componentData.components
        .filter((comp) => comp instanceof OneClickComponent)
        .map((comp) => (comp as OneClickComponent).oneClicks)
        .flat();
    } catch (error) {
      this.logger.error('Error retrieving OneClicks from Govee', error);
      throw new GoveeCommunityApiError('Error retrieving OneClicks');
    }
  }

  @PersistResult({
    filename: 'govee.{3}.diys.json',
    // transform: (data) => instanceToPlain(data),
  })
  async getDiyEffects(
    authState: AuthState,
    model: string,
    goodsType: number,
    deviceId: string,
  ): Promise<DiyEffect[]> {
    if (authState.bffAuth === undefined) {
      this.logger.error(
        `Unable to retrieve DIY Effects for ${deviceId}: not authenticated`,
      );
      throw new GoveeError('Not Authenticated');
    }
    try {
      const response = await request(
        this.config.deviceDiyUrl,
        goveeAuthenticatedHeaders(authState.bffAuth.oauth),
        {
          sku: model,
          goodsType,
          device: deviceId,
        },
      ).get(DIYGroupResponse);
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
                  diyOpCodeBase64: diy.diyOpCodeBase64,
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
