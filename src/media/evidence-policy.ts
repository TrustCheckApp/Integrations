export type EvidenceType = 'image' | 'video' | 'audio' | 'document';

export type SignedUploadStatus = 'pending_upload' | 'uploaded' | 'expired' | 'rejected';

export type MediaPolicyViolationCode =
  | 'MEDIA_UNSUPPORTED_TYPE'
  | 'MEDIA_SIZE_LIMIT_EXCEEDED'
  | 'MEDIA_CHECKSUM_REQUIRED'
  | 'MEDIA_INVALID_CHECKSUM'
  | 'MEDIA_INVALID_FILE_NAME';

export const EVIDENCE_CONTENT_TYPES: Record<EvidenceType, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/webp'],
  video: ['video/mp4', 'video/quicktime'],
  audio: ['audio/mpeg', 'audio/aac'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
};

export const EVIDENCE_MAX_SIZE_BYTES: Record<EvidenceType, number> = {
  image: 10 * 1024 * 1024,
  video: 100 * 1024 * 1024,
  audio: 20 * 1024 * 1024,
  document: 25 * 1024 * 1024,
};

export const SIGNED_UPLOAD_TTL_SECONDS = 900;

export const SIGNED_PREVIEW_TTL_SECONDS = 300;

export class MediaPolicyViolationError extends Error {
  constructor(
    readonly code: MediaPolicyViolationCode,
    readonly field: 'mimeType' | 'sizeBytes' | 'checksumSha256' | 'evidenceType' | 'fileName',
    message: string,
  ) {
    super(message);
    this.name = 'MediaPolicyViolationError';
  }
}

export interface MediaPolicyInput {
  evidenceType: EvidenceType;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  checksumSha256: string;
}

export function validateMediaPolicy(input: MediaPolicyInput): void {
  if (!/^[a-zA-Z0-9._-]{1,160}$/.test(input.fileName)) {
    throw new MediaPolicyViolationError('MEDIA_INVALID_FILE_NAME', 'fileName', 'Nome de arquivo invalido para upload assinado.');
  }

  if (!EVIDENCE_CONTENT_TYPES[input.evidenceType].includes(input.mimeType)) {
    throw new MediaPolicyViolationError('MEDIA_UNSUPPORTED_TYPE', 'mimeType', 'Tipo MIME nao permitido para a politica de midia.');
  }

  if (input.sizeBytes <= 0 || input.sizeBytes > EVIDENCE_MAX_SIZE_BYTES[input.evidenceType]) {
    throw new MediaPolicyViolationError('MEDIA_SIZE_LIMIT_EXCEEDED', 'sizeBytes', 'Arquivo excede o limite permitido para o tipo informado.');
  }

  if (!input.checksumSha256) {
    throw new MediaPolicyViolationError('MEDIA_CHECKSUM_REQUIRED', 'checksumSha256', 'Checksum SHA-256 e obrigatorio para upload assinado.');
  }

  if (!/^[a-f0-9]{64}$/i.test(input.checksumSha256)) {
    throw new MediaPolicyViolationError('MEDIA_INVALID_CHECKSUM', 'checksumSha256', 'Checksum SHA-256 deve conter 64 caracteres hexadecimais.');
  }
}
