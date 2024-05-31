import { GoveeApiError, GoveeCommunityApiError } from './govee-api.error';

export class GoveeApiAuthenticationError extends GoveeApiError {
  constructor(message?: string) {
    super(`Authentication: ${message ?? 'Unexpected error occurred.'}`);
  }
}

export class GoveeCommunityApiAuthenticationError extends GoveeCommunityApiError {
  constructor(message?: string) {
    super(`Authentication: ${message ?? 'Unexpected error occurred.'}`);
  }
}
