export interface SignedUploadContractRequest {
  caseId: string;
  evidenceType: 'image' | 'video' | 'audio' | 'document';
  fileName: string;
  contentType: string;
  contentLength: number;
}

export interface SignedUploadContractResponse {
  key: string;
  uploadUrl: string;
  expiresIn: number;
}

export interface SignedDownloadContractResponse {
  downloadUrl: string;
  expiresIn: number;
}
