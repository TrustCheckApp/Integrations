import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { SignedDownloadContractResponse, SignedUploadContractResponse } from '../contracts/signed-upload-contract.js';
import { SIGNED_PREVIEW_TTL_SECONDS, SIGNED_UPLOAD_TTL_SECONDS, validateMediaPolicy, type EvidenceType } from './evidence-policy.js';

interface SignedUploadRequest {
  caseId: string;
  evidenceType: EvidenceType;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  checksumSha256: string;
}

export class SignedMediaService {
  private readonly s3: S3Client;

  constructor(
    private readonly bucket: string,
    region = process.env.AWS_REGION ?? 'sa-east-1',
  ) {
    this.s3 = new S3Client({ region });
  }

  async createUploadUrl(input: SignedUploadRequest): Promise<SignedUploadContractResponse> {
    validateMediaPolicy(input);
    const uploadId = crypto.randomUUID();
    const storageKey = `cases/${input.caseId}/${input.evidenceType}/${uploadId}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      ContentType: input.mimeType,
      ContentLength: input.sizeBytes,
      ChecksumSHA256: input.checksumSha256,
      ServerSideEncryption: 'AES256',
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: SIGNED_UPLOAD_TTL_SECONDS });
    return {
      uploadId,
      uploadUrl,
      expiresAt: new Date(Date.now() + SIGNED_UPLOAD_TTL_SECONDS * 1000).toISOString(),
      ttlSeconds: SIGNED_UPLOAD_TTL_SECONDS,
      status: 'pending_upload',
      requiredHeaders: {
        'Content-Type': input.mimeType,
        'Content-Length': String(input.sizeBytes),
        'x-amz-checksum-sha256': input.checksumSha256,
      },
    };
  }

  async createPreviewUrl(storageKey: string): Promise<SignedDownloadContractResponse> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: storageKey });
    const previewUrl = await getSignedUrl(this.s3, command, { expiresIn: SIGNED_PREVIEW_TTL_SECONDS });
    return {
      previewUrl,
      expiresAt: new Date(Date.now() + SIGNED_PREVIEW_TTL_SECONDS * 1000).toISOString(),
      ttlSeconds: SIGNED_PREVIEW_TTL_SECONDS,
    };
  }
}
