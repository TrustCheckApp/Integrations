import type { MetricsCollector } from '../shared/metrics.js';
import type { OtpSendRequest } from './otp-provider.js';

export type OtpMetricName =
  | 'otp_delivery_success_total'
  | 'otp_delivery_failure_total'
  | 'otp_delivery_retry_total'
  | 'otp_delivery_latency_ms';

export function recordOtpMetric(
  metrics: MetricsCollector,
  metric: OtpMetricName,
  value: number,
  provider: string,
  request: Pick<OtpSendRequest, 'channel' | 'purpose'>,
  attempt?: number,
): void {
  metrics.record(metric, value, {
    provider,
    channel: request.channel,
    purpose: request.purpose,
    ...(attempt ? { attempt: String(attempt) } : {}),
  });
}
