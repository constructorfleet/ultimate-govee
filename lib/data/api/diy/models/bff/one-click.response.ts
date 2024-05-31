import { Expose, Type } from 'class-transformer';
import { IoTRuleResponse } from './iot-rule.response';

export class OneClickResponse {
  @Expose({ name: 'name' })
  name?: string;

  @Expose({ name: 'planType' })
  planType?: number;

  @Expose({ name: 'siriEngineId' })
  siriEngineId?: number;

  @Expose({ name: 'presetId' })
  presetId?: number;

  @Expose({ name: 'groupName' })
  groupName?: string;

  @Expose({ name: 'groupId' })
  groupId?: number;

  @Expose({ name: 'desc' })
  description?: string;

  @Expose({ name: 'presetState' })
  presetState?: number;

  @Expose({ name: 'type' })
  type!: number;

  @Expose({ name: 'iotRules' })
  @Type(() => IoTRuleResponse)
  iotRules!: IoTRuleResponse[];
}
