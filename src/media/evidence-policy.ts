export type EvidenceType = 'image' | 'video' | 'audio' | 'document';

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
