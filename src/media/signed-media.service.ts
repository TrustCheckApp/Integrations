import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { EVIDENCE_CONTENT_TYPES, EVIDENCE_MAX_SIZE_BYTES, type EvidenceType } from './evidence-policy.js';

interface SignedUploadRequest {
  caseId: string;
  evidenceType: EvidenceType;
  fileName: string;
  contentType: string;
  contentLength: number;
}

export class SignedMediaService {
  private readonly s3: S3Client;

  constructor(
    private readonly bucket: string,
    region = process.env.AWS_REGION ?? 'sa-east-1',
  ) {
    this.s3 = new S3Client({ region });
  }

  async createUploadUrl(input: SignedUploadRequest): Promise<{ key: string; uploadUrl: string; expiresIn: number }> {
    this.validate(input.evidenceType, input.contentType, input.contentLength);
    const key = `cases/${input.caseId}/${input.evidenceType}/${Date.now()}-${input.fileName}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: input.contentType,
      ServerSideEncryption: 'AES256',
    });

    const expiresIn = 900;
    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn });
    return { key, uploadUrl, expiresIn };
  }

  async createDownloadUrl(key: string): Promise<{ downloadUrl: string; expiresIn: number }> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    const expiresIn = 600;
    const downloadUrl = await getSignedUrl(this.s3, command, { expiresIn });
    return { downloadUrl, expiresIn };
  }

  private validate(type: EvidenceType, contentType: string, contentLength: number): void {
    if (!EVIDENCE_CONTENT_TYPES[type].includes(contentType)) {
      throw new Error(`EVIDENCE_INVALID_CONTENT_TYPE:${type}:${contentType}`);
    }

    if (contentLength > EVIDENCE_MAX_SIZE_BYTES[type]) {
      throw new Error(`EVIDENCE_MAX_SIZE_EXCEEDED:${type}`);
    }
  }
}
