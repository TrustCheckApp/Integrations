import type {
  BusinessResponseEmailPayload,
  CasePublishedEmailPayload,
  ClaimApprovedEmailPayload,
  ClaimReceivedEmailPayload,
  ClaimRejectedEmailPayload,
  EmailTemplateDefinition,
} from './types.js';
import {
  assertSafeEmailUrl,
  escapeHtml,
  formatLink,
  renderPublicUrl,
  sanitizeSubjectValue,
} from './safety.js';

const rejectionReasonLabels: Record<ClaimRejectedEmailPayload['rejectionReasonCode'], string> = {
  insufficient_evidence: 'evidencia insuficiente',
  duplicate: 'claim duplicado',
  policy_violation: 'violacao de politica',
  out_of_scope: 'fora do escopo',
};

function publicClaimUrl(baseUrl: string | undefined, publicId: string): string | undefined {
  return renderPublicUrl(baseUrl, `/claims/${encodeURIComponent(publicId)}`);
}

function publicCaseUrl(baseUrl: string | undefined, publicId: string): string | undefined {
  return renderPublicUrl(baseUrl, `/cases/${encodeURIComponent(publicId)}`);
}

function publicResponseUrl(
  baseUrl: string | undefined,
  casePublicId: string,
  responsePublicId: string,
): string | undefined {
  return renderPublicUrl(
    baseUrl,
    `/cases/${encodeURIComponent(casePublicId)}/responses/${encodeURIComponent(responsePublicId)}`,
  );
}

export const claimReceivedTemplate: EmailTemplateDefinition<ClaimReceivedEmailPayload> = {
  id: 'claim_received',
  description: 'Confirmacao de recebimento de claim sem dados pessoais no corpo.',
  render(payload) {
    const link = formatLink('Abrir claim', publicClaimUrl(payload.portalBaseUrl, payload.claimPublicId));
    const safePublicId = escapeHtml(payload.claimPublicId);

    return {
      subject: `Claim recebido - ${sanitizeSubjectValue(payload.claimPublicId)}`,
      text: `Recebemos o claim ${payload.claimPublicId} e iniciaremos a analise.${link.text}`,
      html: `<p>Recebemos o claim <strong>${safePublicId}</strong> e iniciaremos a analise.</p>${link.html}`,
    };
  },
};

export const claimApprovedTemplate: EmailTemplateDefinition<ClaimApprovedEmailPayload> = {
  id: 'claim_approved',
  description: 'Notificacao de aprovacao de claim usando apenas publicId.',
  render(payload) {
    const link = formatLink('Abrir claim', publicClaimUrl(payload.portalBaseUrl, payload.claimPublicId));
    const safePublicId = escapeHtml(payload.claimPublicId);

    return {
      subject: `Claim aprovado - ${sanitizeSubjectValue(payload.claimPublicId)}`,
      text: `O claim ${payload.claimPublicId} foi aprovado.${link.text}`,
      html: `<p>O claim <strong>${safePublicId}</strong> foi aprovado.</p>${link.html}`,
    };
  },
};

export const claimRejectedTemplate: EmailTemplateDefinition<ClaimRejectedEmailPayload> = {
  id: 'claim_rejected',
  description: 'Notificacao de rejeicao de claim com motivo padronizado.',
  render(payload) {
    const reason = rejectionReasonLabels[payload.rejectionReasonCode];
    const link = formatLink('Abrir claim', publicClaimUrl(payload.portalBaseUrl, payload.claimPublicId));
    const safePublicId = escapeHtml(payload.claimPublicId);

    return {
      subject: `Claim rejeitado - ${sanitizeSubjectValue(payload.claimPublicId)}`,
      text: `O claim ${payload.claimPublicId} foi rejeitado. Motivo: ${reason}.${link.text}`,
      html: `<p>O claim <strong>${safePublicId}</strong> foi rejeitado.</p><p>Motivo: ${escapeHtml(reason)}.</p>${link.html}`,
    };
  },
};

export const casePublishedTemplate: EmailTemplateDefinition<CasePublishedEmailPayload> = {
  id: 'case_published',
  description: 'Notificacao de caso publicado usando identificador publico.',
  render(payload) {
    const link = formatLink('Abrir caso', assertSafeEmailUrl(payload.publicUrl));
    const safePublicId = escapeHtml(payload.casePublicId);

    return {
      subject: `Caso publicado - ${sanitizeSubjectValue(payload.casePublicId)}`,
      text: `O caso ${payload.casePublicId} foi publicado.${link.text}`,
      html: `<p>O caso <strong>${safePublicId}</strong> foi publicado.</p>${link.html}`,
    };
  },
};

export const businessResponseTemplate: EmailTemplateDefinition<BusinessResponseEmailPayload> = {
  id: 'business_response',
  description: 'Notificacao de resposta empresarial sem expor PII ou storageKey.',
  render(payload) {
    const link = formatLink(
      'Abrir resposta',
      publicResponseUrl(payload.portalBaseUrl, payload.casePublicId, payload.responsePublicId),
    );
    const safeCasePublicId = escapeHtml(payload.casePublicId);
    const safeResponsePublicId = escapeHtml(payload.responsePublicId);

    return {
      subject: `Resposta empresarial - ${sanitizeSubjectValue(payload.casePublicId)}`,
      text: [
        `Uma resposta empresarial foi registrada para o caso ${payload.casePublicId}.`,
        `Referencia da resposta: ${payload.responsePublicId}.${link.text}`,
      ].join('\n'),
      html: [
        `<p>Uma resposta empresarial foi registrada para o caso <strong>${safeCasePublicId}</strong>.</p>`,
        `<p>Referencia da resposta: <strong>${safeResponsePublicId}</strong>.</p>`,
        link.html,
      ].join(''),
    };
  },
};
