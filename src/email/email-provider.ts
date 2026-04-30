export type EmailTemplateId = 'welcome' | 'auth_confirmation' | 'case_status_update';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  correlationId: string;
}

export interface EmailProviderResult {
  provider: string;
  messageId: string;
  accepted: boolean;
}

export interface EmailProvider {
  readonly name: string;
  send(payload: EmailPayload): Promise<EmailProviderResult>;
}
