import type { MetricsCollector } from '../shared/metrics.js';
import type { EmailProvider, EmailTemplateId } from './email-provider.js';
import type { EmailTemplatePayloadMap } from './templates/index.js';
import { renderEmailTemplate } from './templates/index.js';

interface TransactionalEmailServiceOptions {
  primary: EmailProvider;
  secondary: EmailProvider;
  metrics: MetricsCollector;
}

export class TransactionalEmailService {
  constructor(private readonly options: TransactionalEmailServiceOptions) {}

  async sendTemplate<TTemplateId extends EmailTemplateId>(
    templateId: TTemplateId,
    to: string,
    correlationId: string,
    data: EmailTemplatePayloadMap[TTemplateId],
  ): Promise<{ provider: string; messageId: string }> {
    const payload = this.build(templateId, to, correlationId, data);

    try {
      const result = await this.options.primary.send(payload);
      this.options.metrics.record('email_delivery_success_total', 1, {
        provider: result.provider,
        template: templateId,
      });
      return { provider: result.provider, messageId: result.messageId };
    } catch (primaryError) {
      this.options.metrics.record('email_delivery_failure_total', 1, {
        provider: this.options.primary.name,
        template: templateId,
      });

      const fallback = await this.options.secondary.send(payload);
      this.options.metrics.record('email_delivery_fallback_total', 1, {
        provider: fallback.provider,
        template: templateId,
      });

      return { provider: fallback.provider, messageId: fallback.messageId };
    }
  }

  private build(
    templateId: EmailTemplateId,
    to: string,
    correlationId: string,
    data: EmailTemplatePayloadMap[EmailTemplateId],
  ) {
    const tpl = renderEmailTemplate(templateId, data);
    return { to, correlationId, ...tpl };
  }
}
