import type { MetricsCollector } from '../shared/metrics.js';
import type { EmailProvider, EmailTemplateId } from './email-provider.js';
import { templates } from './templates/index.js';

interface TransactionalEmailServiceOptions {
  primary: EmailProvider;
  secondary: EmailProvider;
  metrics: MetricsCollector;
}

export class TransactionalEmailService {
  constructor(private readonly options: TransactionalEmailServiceOptions) {}

  async sendTemplate(
    templateId: EmailTemplateId,
    to: string,
    correlationId: string,
    data: Record<string, string>,
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
    data: Record<string, string>,
  ) {
    if (templateId === 'welcome') {
      const tpl = templates.welcome(data.name ?? 'Usuario');
      return { to, correlationId, ...tpl };
    }
    if (templateId === 'auth_confirmation') {
      const tpl = templates.auth_confirmation(data.code ?? '000000');
      return { to, correlationId, ...tpl };
    }

    const tpl = templates.case_status_update(data.caseId ?? 'N/A', data.status ?? 'atualizado');
    return { to, correlationId, ...tpl };
  }
}
