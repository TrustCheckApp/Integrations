export type OtpChannel = 'sms' | 'email' | 'whatsapp';

export type OtpPurpose = 'login' | 'signup' | 'password_reset' | 'transaction' | 'account_recovery';

export interface OtpSendRequest {
  destination: string;
  otp: string;
  channel: OtpChannel;
  purpose: OtpPurpose;
  ttlSeconds: number;
  correlationId: string;
}

export interface OtpSendResult {
  provider: string;
  messageId: string;
  accepted: boolean;
  latencyMs: number;
}

export interface OtpProvider {
  readonly name: string;
  sendOtp(request: OtpSendRequest): Promise<OtpSendResult>;
}

export interface OtpProviderSelection {
  providerName?: string;
}
