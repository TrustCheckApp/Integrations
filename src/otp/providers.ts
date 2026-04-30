import type { OtpProvider, OtpSendRequest, OtpSendResult } from './otp-provider.js';

export class TwilioOtpProvider implements OtpProvider {
  readonly name = 'twilio';

  async sendOtp(request: OtpSendRequest): Promise<OtpSendResult> {
    const start = performance.now();
    if (!request.destination.startsWith('+')) {
      throw new Error('TWILIO_INVALID_DESTINATION');
    }

    return {
      provider: this.name,
      messageId: `twilio-${crypto.randomUUID()}`,
      accepted: true,
      latencyMs: Math.round(performance.now() - start),
    };
  }
}

export class ZenviaOtpProvider implements OtpProvider {
  readonly name = 'zenvia';

  async sendOtp(request: OtpSendRequest): Promise<OtpSendResult> {
    const start = performance.now();
    if (!request.destination.startsWith('+')) {
      throw new Error('ZENVIA_INVALID_DESTINATION');
    }

    return {
      provider: this.name,
      messageId: `zenvia-${crypto.randomUUID()}`,
      accepted: true,
      latencyMs: Math.round(performance.now() - start),
    };
  }
}
