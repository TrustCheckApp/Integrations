export interface OtpRetryPolicy {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

export const defaultOtpRetryPolicy: OtpRetryPolicy = {
  maxAttempts: 3,
  baseDelayMs: 250,
  maxDelayMs: 1000,
};

export function resolveOtpRetryPolicy(policy?: Partial<OtpRetryPolicy>): OtpRetryPolicy {
  return {
    maxAttempts: policy?.maxAttempts ?? defaultOtpRetryPolicy.maxAttempts,
    baseDelayMs: policy?.baseDelayMs ?? defaultOtpRetryPolicy.baseDelayMs,
    maxDelayMs: policy?.maxDelayMs ?? defaultOtpRetryPolicy.maxDelayMs,
  };
}

export function retryDelayMs(policy: OtpRetryPolicy, attempt: number): number {
  return Math.min(policy.baseDelayMs * attempt, policy.maxDelayMs);
}
