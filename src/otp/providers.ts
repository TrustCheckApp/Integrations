import type { OtpProvider, OtpSendRequest, OtpSendResult } from './otp-provider.js';
import { OtpError } from './errors.js';

export class TwilioOtpProvider implements OtpProvider {
  readonly name = 'twilio';

  async sendOtp(request: OtpSendRequest): Promise<OtpSendResult> {
    const start = performance.now();
    if (!request.destination.startsWith('+')) {
      throw new OtpError('OTP_PROVIDER_FAILED', 'OTP provider rejected destination', {
        provider: this.name,
        channel: request.channel,
        purpose: request.purpose,
        correlationId: request.correlationId,
      });
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
      throw new OtpError('OTP_PROVIDER_FAILED', 'OTP provider rejected destination', {
        provider: this.name,
        channel: request.channel,
        purpose: request.purpose,
        correlationId: request.correlationId,
      });
    }

    return {
      provider: this.name,
      messageId: `zenvia-${crypto.randomUUID()}`,
      accepted: true,
      latencyMs: Math.round(performance.now() - start),
    };
  }
}

type StubOutcome = 'success' | 'failure';

export class StubOtpProvider implements OtpProvider {
  readonly name: string;
  private readonly outcomes: StubOutcome[];
  private sentCount = 0;

  constructor(options: { name?: string; outcomes?: StubOutcome[] } = {}) {
    this.name = options.name ?? 'stub';
    this.outcomes = options.outcomes ?? ['success'];
  }

  get sendCount(): number {
    return this.sentCount;
  }

  async sendOtp(request: OtpSendRequest): Promise<OtpSendResult> {
    const start = performance.now();
    this.sentCount += 1;
    const outcome = this.outcomes[Math.min(this.sentCount - 1, this.outcomes.length - 1)];

    if (outcome === 'failure') {
      throw new OtpError('OTP_PROVIDER_FAILED', 'OTP provider failed', {
        provider: this.name,
        channel: request.channel,
        purpose: request.purpose,
        correlationId: request.correlationId,
      });
    }

    return {
      provider: this.name,
      messageId: `${this.name}-${crypto.randomUUID()}`,
      accepted: true,
      latencyMs: Math.round(performance.now() - start),
    };
  }
}
