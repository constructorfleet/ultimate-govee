import { GoveeError } from './govee.error';

enum ApiType {
  GOVEE_API = 'Govee',
  COMMUNITY_API = 'GoveeCommunity',
}

export abstract class BaseGoveeApiError extends GoveeError {
  constructor(api: ApiType, message?: string) {
    super(`[${api}API]${message ?? 'Unknown exception occurred'}`);
  }
}

export class GoveeApiError extends BaseGoveeApiError {
  constructor(message?: string) {
    super(ApiType.GOVEE_API, message);
  }
}

export class GoveeCommunityApiError extends BaseGoveeApiError {
  constructor(message?: string) {
    super(ApiType.COMMUNITY_API, message);
  }
}
