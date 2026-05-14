import type { EvidenceType, MediaPolicyViolationCode, SignedUploadStatus } from '../media/evidence-policy.js';

export interface SignedUploadContractRequest {
  caseId: string;
  evidenceType: EvidenceType;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  checksumSha256: string;
}

export interface SignedUploadContractResponse {
  uploadId: string;
  uploadUrl: string;
  expiresAt: string;
  ttlSeconds: number;
  status: SignedUploadStatus;
  requiredHeaders: {
    'Content-Type': string;
    'Content-Length': string;
    'x-amz-checksum-sha256': string;
  };
}

export interface SignedDownloadContractResponse {
  previewUrl: string;
  expiresAt: string;
  ttlSeconds: number;
}

export interface SignedUploadPolicyError {
  code: MediaPolicyViolationCode;
  field: 'mimeType' | 'sizeBytes' | 'checksumSha256' | 'evidenceType' | 'fileName';
  message: string;
}
