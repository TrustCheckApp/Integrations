import type { EmailProvider, EmailPayload, EmailProviderResult } from './email-provider.js';

export class SendgridProvider implements EmailProvider {
  readonly name = 'sendgrid';

  async send(payload: EmailPayload): Promise<EmailProviderResult> {
    if (!payload.to.includes('@')) {
      throw new Error('SENDGRID_INVALID_TO');
    }

    return {
      provider: this.name,
      messageId: `sg-${crypto.randomUUID()}`,
      accepted: true,
    };
  }
}

export class ResendProvider implements EmailProvider {
  readonly name = 'resend';

  async send(payload: EmailPayload): Promise<EmailProviderResult> {
    if (!payload.to.includes('@')) {
      throw new Error('RESEND_INVALID_TO');
    }

    return {
      provider: this.name,
      messageId: `rs-${crypto.randomUUID()}`,
      accepted: true,
    };
  }
}
