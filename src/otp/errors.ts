import type { OtpChannel, OtpPurpose } from './otp-provider.js';

export type OtpErrorCode =
  | 'OTP_INVALID_REQUEST'
  | 'OTP_PROVIDER_NOT_CONFIGURED'
  | 'OTP_PROVIDER_FAILED'
  | 'OTP_SEND_FAILED';

export interface OtpErrorContext {
  provider?: string;
  channel?: OtpChannel;
  purpose?: OtpPurpose;
  attempt?: number;
  correlationId?: string;
}

export class OtpError extends Error {
  readonly code: OtpErrorCode;
  readonly context: OtpErrorContext;

  constructor(code: OtpErrorCode, message: string, context: OtpErrorContext = {}) {
    super(message);
    this.name = 'OtpError';
    this.code = code;
    this.context = context;
  }

  toJSON(): { code: OtpErrorCode; message: string; context: OtpErrorContext } {
    return {
      code: this.code,
      message: this.message,
      context: this.context,
    };
  }
}

export function normalizeOtpError(error: unknown, context: OtpErrorContext): OtpError {
  if (error instanceof OtpError) {
    return new OtpError(error.code, error.message, { ...error.context, ...context });
  }

  return new OtpError('OTP_PROVIDER_FAILED', 'OTP provider failed', context);
}
