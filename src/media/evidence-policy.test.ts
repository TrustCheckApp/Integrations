import assert from 'node:assert/strict';
import test from 'node:test';
import { EVIDENCE_MAX_SIZE_BYTES, MediaPolicyViolationError, SIGNED_PREVIEW_TTL_SECONDS, SIGNED_UPLOAD_TTL_SECONDS, validateMediaPolicy } from './evidence-policy.js';

const validChecksum = 'a'.repeat(64);

test('aceita politica valida para imagem com checksum sha256', () => {
  assert.doesNotThrow(() => validateMediaPolicy({
    evidenceType: 'image',
    fileName: 'evidencia.png',
    mimeType: 'image/png',
    sizeBytes: EVIDENCE_MAX_SIZE_BYTES.image,
    checksumSha256: validChecksum,
  }));
});

test('rejeita mimeType fora da politica do tipo de evidencia', () => {
  assert.throws(() => validateMediaPolicy({
    evidenceType: 'image',
    fileName: 'evidencia.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 1024,
    checksumSha256: validChecksum,
  }), (error) => error instanceof MediaPolicyViolationError && error.code === 'MEDIA_UNSUPPORTED_TYPE' && error.field === 'mimeType');
});

test('rejeita arquivo acima do limite por tipo', () => {
  assert.throws(() => validateMediaPolicy({
    evidenceType: 'document',
    fileName: 'contrato.pdf',
    mimeType: 'application/pdf',
    sizeBytes: EVIDENCE_MAX_SIZE_BYTES.document + 1,
    checksumSha256: validChecksum,
  }), (error) => error instanceof MediaPolicyViolationError && error.code === 'MEDIA_SIZE_LIMIT_EXCEEDED' && error.field === 'sizeBytes');
});

test('rejeita checksum ausente ou invalido', () => {
  assert.throws(() => validateMediaPolicy({
    evidenceType: 'audio',
    fileName: 'audio.mp3',
    mimeType: 'audio/mpeg',
    sizeBytes: 1024,
    checksumSha256: '',
  }), (error) => error instanceof MediaPolicyViolationError && error.code === 'MEDIA_CHECKSUM_REQUIRED');

  assert.throws(() => validateMediaPolicy({
    evidenceType: 'audio',
    fileName: 'audio.mp3',
    mimeType: 'audio/mpeg',
    sizeBytes: 1024,
    checksumSha256: 'invalid',
  }), (error) => error instanceof MediaPolicyViolationError && error.code === 'MEDIA_INVALID_CHECKSUM');
});

test('define ttl curto para upload e preview temporarios', () => {
  assert.equal(SIGNED_UPLOAD_TTL_SECONDS, 900);
  assert.equal(SIGNED_PREVIEW_TTL_SECONDS, 300);
});
