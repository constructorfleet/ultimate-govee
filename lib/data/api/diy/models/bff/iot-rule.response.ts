import { Expose, Type } from 'class-transformer';
import { DeviceObjectResponse } from './device-object.response';
import { RuleResponse } from './rule.response';

export class IoTRuleResponse {
  @Expose({ name: 'deviceObj' })
  @Type(() => DeviceObjectResponse)
  device!: DeviceObjectResponse;

  @Expose({ name: 'rule' })
  @Type(() => RuleResponse)
  rules!: RuleResponse[];
}
