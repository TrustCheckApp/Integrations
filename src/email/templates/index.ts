import { otpTemplate } from './auth.js';
import {
  businessResponseTemplate,
  casePublishedTemplate,
  claimApprovedTemplate,
  claimReceivedTemplate,
  claimRejectedTemplate,
} from './cases.js';
import type {
  EmailTemplateDefinition,
  EmailTemplateId,
  EmailTemplatePayloadMap,
  RenderedEmailTemplate,
} from './types.js';

export type * from './types.js';

export const emailTemplates: {
  [TTemplateId in EmailTemplateId]: EmailTemplateDefinition<EmailTemplatePayloadMap[TTemplateId]>;
} = {
  otp: otpTemplate,
  claim_received: claimReceivedTemplate,
  claim_approved: claimApprovedTemplate,
  claim_rejected: claimRejectedTemplate,
  case_published: casePublishedTemplate,
  business_response: businessResponseTemplate,
};

export function renderEmailTemplate<TTemplateId extends EmailTemplateId>(
  templateId: TTemplateId,
  payload: EmailTemplatePayloadMap[TTemplateId],
): RenderedEmailTemplate {
  const template = emailTemplates[templateId] as EmailTemplateDefinition<
    EmailTemplatePayloadMap[TTemplateId]
  >;

  return template.render(payload);
}
