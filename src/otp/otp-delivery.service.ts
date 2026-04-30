import type { MetricsCollector } from '../shared/metrics.js';
import type { OtpProvider, OtpSendRequest, OtpSendResult } from './otp-provider.js';

interface OtpServiceOptions {
  primary: OtpProvider;
  secondary: OtpProvider;
  metrics: MetricsCollector;
  maxAttempts?: number;
}

export class OtpDeliveryService {
  private readonly maxAttempts: number;

  constructor(private readonly options: OtpServiceOptions) {
    this.maxAttempts = options.maxAttempts ?? 3;
  }

  async send(request: OtpSendRequest): Promise<OtpSendResult> {
    const providers = [this.options.primary, this.options.secondary];
    let lastError: unknown;

    for (const provider of providers) {
      for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
        const startedAt = performance.now();
        try {
          const result = await provider.sendOtp(request);
          this.options.metrics.record('otp_delivery_success_total', 1, {
            provider: provider.name,
            attempt: String(attempt),
          });
          this.options.metrics.record('otp_delivery_latency_ms', result.latencyMs || Math.round(performance.now() - startedAt), {
            provider: provider.name,
          });
          return result;
        } catch (error) {
          lastError = error;
          this.options.metrics.record('otp_delivery_failure_total', 1, {
            provider: provider.name,
            attempt: String(attempt),
          });
          if (attempt < this.maxAttempts) {
            await this.backoff(attempt);
          }
        }
      }
    }

    throw new Error(`OTP_DELIVERY_FAILED:${String(lastError)}`);
  }

  private async backoff(attempt: number): Promise<void> {
    const waitMs = attempt * 250;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
}
