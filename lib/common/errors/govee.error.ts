export class GoveeError extends Error {
  constructor(message?: string) {
    super(`[Govee] ${message ?? 'Unknown exception occurred'}`);
  }
}
