import assert from 'node:assert/strict';
import test from 'node:test';
import type { EmailProvider, EmailPayload, EmailProviderResult } from '../email-provider.js';
import { TransactionalEmailService } from '../transactional-email.service.js';
import { MetricsCollector } from '../../shared/metrics.js';
import { emailTemplates, renderEmailTemplate } from './index.js';

const expectedTemplateIds = [
  'otp',
  'claim_received',
  'claim_approved',
  'claim_rejected',
  'case_published',
  'business_response',
] as const;

function renderExamples() {
  return {
    otp: renderEmailTemplate('otp', {
      otp: '123456',
      ttlMinutes: 5,
      purpose: 'login',
    }),
    claim_received: renderEmailTemplate('claim_received', {
      claimPublicId: 'claim_pub_001',
      portalBaseUrl: 'https://app.trustcheck.local',
    }),
    claim_approved: renderEmailTemplate('claim_approved', {
      claimPublicId: 'claim_pub_002',
      portalBaseUrl: 'https://app.trustcheck.local',
    }),
    claim_rejected: renderEmailTemplate('claim_rejected', {
      claimPublicId: 'claim_pub_003',
      rejectionReasonCode: 'insufficient_evidence',
      portalBaseUrl: 'https://app.trustcheck.local',
    }),
    case_published: renderEmailTemplate('case_published', {
      casePublicId: 'case_pub_001',
      publicUrl: 'https://trustcheck.local/cases/case_pub_001',
    }),
    business_response: renderEmailTemplate('business_response', {
      casePublicId: 'case_pub_002',
      responsePublicId: 'resp_pub_001',
      portalBaseUrl: 'https://app.trustcheck.local',
    }),
  };
}

test('renderiza todos os templates transacionais da sprint 03', () => {
  assert.deepEqual(Object.keys(emailTemplates).sort(), [...expectedTemplateIds].sort());

  const rendered = renderExamples();
  for (const templateId of expectedTemplateIds) {
    const result = rendered[templateId];

    assert.ok(result.subject.length > 0, `${templateId} precisa de subject`);
    assert.ok(result.text.length > 0, `${templateId} precisa de text body`);
    assert.ok(result.html.length > 0, `${templateId} precisa de html body`);
  }
});

test('usa publicId sem carregar PII desnecessaria nos templates de claims e casos', () => {
  const rendered = renderExamples();
  const caseAndClaimBodies = [
    rendered.claim_received,
    rendered.claim_approved,
    rendered.claim_rejected,
    rendered.case_published,
    rendered.business_response,
  ]
    .map((result) => `${result.subject}\n${result.text}\n${result.html}`)
    .join('\n');

  assert.match(caseAndClaimBodies, /claim_pub_001/);
  assert.match(caseAndClaimBodies, /case_pub_001/);
  assert.doesNotMatch(caseAndClaimBodies, /cliente@|customer@|cpf|documento|telefone|storageKey/i);
});

test('bloqueia links com token, otp ou code em query string', () => {
  assert.throws(
    () =>
      renderEmailTemplate('claim_received', {
        claimPublicId: 'claim_pub_unsafe',
        portalBaseUrl: 'https://app.trustcheck.local?token=secret',
      }),
    /UNSAFE_EMAIL_LINK_PARAM:token/,
  );

  assert.throws(
    () =>
      renderEmailTemplate('case_published', {
        casePublicId: 'case_pub_unsafe',
        publicUrl: 'https://trustcheck.local/cases/case_pub_unsafe?otp=123456',
      }),
    /UNSAFE_EMAIL_LINK_PARAM:otp/,
  );
});

test('template OTP nao cria link com codigo e metricas nao carregam OTP', async () => {
  const sentPayloads: EmailPayload[] = [];
  const provider: EmailProvider = {
    name: 'stub',
    async send(payload: EmailPayload): Promise<EmailProviderResult> {
      sentPayloads.push(payload);
      return { provider: 'stub', messageId: 'msg-1', accepted: true };
    },
  };
  const metrics = new MetricsCollector();
  const service = new TransactionalEmailService({
    primary: provider,
    secondary: provider,
    metrics,
  });

  await service.sendTemplate('otp', 'destinatario@example.invalid', 'corr-1', {
    otp: '123456',
    ttlMinutes: 5,
    purpose: 'login',
  });

  assert.equal(sentPayloads.length, 1);
  assert.doesNotMatch(sentPayloads[0].html, /href=/i);
  assert.match(sentPayloads[0].text, /123456/);
  assert.doesNotMatch(JSON.stringify(metrics.snapshot()), /123456|token=|otp=/i);
});
