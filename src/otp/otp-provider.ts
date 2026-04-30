export type DeliveryChannel = 'sms';

export interface OtpSendRequest {
  destination: string;
  code: string;
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
