import type { MetricsCollector } from '../shared/metrics.js';
import { OtpError, normalizeOtpError } from './errors.js';
import type { OtpProvider, OtpProviderSelection, OtpSendRequest, OtpSendResult } from './otp-provider.js';
import { retryDelayMs, resolveOtpRetryPolicy, type OtpRetryPolicy } from './retry-policy.js';

interface OtpServiceOptions extends OtpProviderSelection {
  providers?: OtpProvider[];
  primary?: OtpProvider;
  secondary?: OtpProvider;
  metrics: MetricsCollector;
  retryPolicy?: Partial<OtpRetryPolicy>;
  sleep?: (ms: number) => Promise<void>;
}

export class OtpDeliveryService {
  private readonly providers: OtpProvider[];
  private readonly retryPolicy: OtpRetryPolicy;
  private readonly sleep: (ms: number) => Promise<void>;

  constructor(private readonly options: OtpServiceOptions) {
    this.providers = options.providers ?? [options.primary, options.secondary].filter(isOtpProvider);
    this.retryPolicy = resolveOtpRetryPolicy(options.retryPolicy);
    this.sleep = options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  }

  async send(request: OtpSendRequest): Promise<OtpSendResult> {
    this.validateRequest(request);

    const provider = this.selectProvider();
    let lastError: OtpError | undefined;

    for (let attempt = 1; attempt <= this.retryPolicy.maxAttempts; attempt++) {
      const startedAt = performance.now();

      try {
        const result = await provider.sendOtp(request);
        this.record('otp_delivery_success_total', 1, provider.name, request, attempt);
        this.record('otp_delivery_latency_ms', result.latencyMs || Math.round(performance.now() - startedAt), provider.name, request);
        return result;
      } catch (error) {
        lastError = normalizeOtpError(error, {
          provider: provider.name,
          channel: request.channel,
          purpose: request.purpose,
          attempt,
          correlationId: request.correlationId,
        });

        this.record('otp_delivery_failure_total', 1, provider.name, request, attempt);

        if (attempt < this.retryPolicy.maxAttempts) {
          this.record('otp_delivery_retry_total', 1, provider.name, request, attempt);
          await this.sleep(retryDelayMs(this.retryPolicy, attempt));
        }
      }
    }

    throw new OtpError('OTP_SEND_FAILED', 'OTP delivery failed after retry policy', {
      provider: provider.name,
      channel: request.channel,
      purpose: request.purpose,
      attempt: this.retryPolicy.maxAttempts,
      correlationId: request.correlationId,
      ...lastError?.context,
    });
  }

  private selectProvider(): OtpProvider {
    if (this.providers.length === 0) {
      throw new OtpError('OTP_PROVIDER_NOT_CONFIGURED', 'OTP provider is not configured');
    }

    if (!this.options.providerName) {
      return this.providers[0];
    }

    const provider = this.providers.find((candidate) => candidate.name === this.options.providerName);
    if (!provider) {
      throw new OtpError('OTP_PROVIDER_NOT_CONFIGURED', 'Configured OTP provider is not available', {
        provider: this.options.providerName,
      });
    }

    return provider;
  }

  private validateRequest(request: OtpSendRequest): void {
    if (!request.destination || !request.otp || !request.channel || !request.purpose || request.ttlSeconds <= 0) {
      throw new OtpError('OTP_INVALID_REQUEST', 'OTP request is invalid', {
        channel: request.channel,
        purpose: request.purpose,
        correlationId: request.correlationId,
      });
    }
  }

  private record(metric: string, value: number, provider: string, request: OtpSendRequest, attempt?: number): void {
    this.options.metrics.record(metric, value, {
      provider,
      channel: request.channel,
      purpose: request.purpose,
      ...(attempt ? { attempt: String(attempt) } : {}),
    });
  }
}

function isOtpProvider(provider: OtpProvider | undefined): provider is OtpProvider {
  return provider != null;
}
