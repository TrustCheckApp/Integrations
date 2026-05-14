export type EmailTemplateId =
  | 'otp'
  | 'claim_received'
  | 'claim_approved'
  | 'claim_rejected'
  | 'case_published'
  | 'business_response';

export interface OtpEmailPayload {
  otp: string;
  ttlMinutes: number;
  purpose: 'login' | 'signup' | 'password_reset' | 'account_recovery';
}

export interface ClaimReceivedEmailPayload {
  claimPublicId: string;
  portalBaseUrl?: string;
}

export interface ClaimApprovedEmailPayload {
  claimPublicId: string;
  portalBaseUrl?: string;
}

export interface ClaimRejectedEmailPayload {
  claimPublicId: string;
  rejectionReasonCode: 'insufficient_evidence' | 'duplicate' | 'policy_violation' | 'out_of_scope';
  portalBaseUrl?: string;
}

export interface CasePublishedEmailPayload {
  casePublicId: string;
  publicUrl?: string;
}

export interface BusinessResponseEmailPayload {
  casePublicId: string;
  responsePublicId: string;
  portalBaseUrl?: string;
}

export interface EmailTemplatePayloadMap {
  otp: OtpEmailPayload;
  claim_received: ClaimReceivedEmailPayload;
  claim_approved: ClaimApprovedEmailPayload;
  claim_rejected: ClaimRejectedEmailPayload;
  case_published: CasePublishedEmailPayload;
  business_response: BusinessResponseEmailPayload;
}

export interface RenderedEmailTemplate {
  subject: string;
  text: string;
  html: string;
}

export interface EmailTemplateDefinition<TPayload> {
  readonly id: EmailTemplateId;
  readonly description: string;
  render(payload: TPayload): RenderedEmailTemplate;
}
