import type { EmailTemplateDefinition, OtpEmailPayload } from './types.js';
import { escapeHtml } from './safety.js';

const purposeLabels: Record<OtpEmailPayload['purpose'], string> = {
  login: 'acesso',
  signup: 'cadastro',
  password_reset: 'recuperacao de senha',
  account_recovery: 'recuperacao de conta',
};

export const otpTemplate: EmailTemplateDefinition<OtpEmailPayload> = {
  id: 'otp',
  description: 'Codigo OTP de uso unico para fluxos de autenticacao.',
  render(payload) {
    if (!/^[0-9]{4,10}$/.test(payload.otp)) {
      throw new Error('INVALID_OTP_FORMAT');
    }

    if (!Number.isInteger(payload.ttlMinutes) || payload.ttlMinutes <= 0) {
      throw new Error('INVALID_OTP_TTL');
    }

    const safeOtp = escapeHtml(payload.otp);
    const purpose = purposeLabels[payload.purpose];

    return {
      subject: 'Codigo de verificacao TrustCheck',
      text: [
        `Use o codigo ${payload.otp} para concluir o fluxo de ${purpose}.`,
        `O codigo expira em ${payload.ttlMinutes} minuto(s).`,
        'Se voce nao solicitou este codigo, ignore esta mensagem.',
      ].join('\n'),
      html: [
        '<p>Use o codigo abaixo para concluir a verificacao.</p>',
        `<p><strong>${safeOtp}</strong></p>`,
        `<p>Fluxo: ${escapeHtml(purpose)}. Expira em ${payload.ttlMinutes} minuto(s).</p>`,
        '<p>Se voce nao solicitou este codigo, ignore esta mensagem.</p>',
      ].join(''),
    };
  },
};
