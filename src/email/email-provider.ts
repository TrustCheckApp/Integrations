import type { EmailTemplateId } from './templates/types.js';

export type { EmailTemplateId } from './templates/types.js';

export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
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
