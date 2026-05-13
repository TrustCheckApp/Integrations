# TC-S3-INT-07 - Contrato mobile API de upload assinado

## Objetivo
Definir o contrato de upload assinado consumido pelo app mobile e mediado pela API, garantindo arquivo privado, URL temporaria, validacao de politica antes da assinatura e ausencia de URL publica permanente.

## Endpoint de contrato
- `POST /integrations/media/signed-upload`
  - request: `SignedUploadContractRequest`
  - response: `SignedUploadContractResponse`

- `POST /integrations/media/signed-preview`
  - request: `{ uploadId: string }`
  - response: `SignedDownloadContractResponse`

## Request
```json
{
  "caseId": "case_123",
  "evidenceType": "image",
  "fileName": "evidencia.png",
  "mimeType": "image/png",
  "sizeBytes": 1048576,
  "checksumSha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
}
```

## Response
```json
{
  "uploadId": "0b66c011-cd2f-4c0c-a67a-21f5d9b80d27",
  "uploadUrl": "https://storage-provider.example/signed-put-url",
  "expiresAt": "2026-05-13T05:47:00.000Z",
  "ttlSeconds": 900,
  "status": "pending_upload",
  "requiredHeaders": {
    "Content-Type": "image/png",
    "Content-Length": "1048576",
    "x-amz-checksum-sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
  }
}
```

## Preview temporario
```json
{
  "previewUrl": "https://storage-provider.example/signed-get-url",
  "expiresAt": "2026-05-13T05:37:00.000Z",
  "ttlSeconds": 300
}
```

## Status
- `pending_upload`: URL assinada emitida e aguardando envio do binario.
- `uploaded`: arquivo recebido e metadados confirmados pela API.
- `expired`: TTL expirou antes da confirmacao.
- `rejected`: requisicao violou politica de midia.

## Limites por tipo de arquivo
- `image`: `image/jpeg`, `image/png`, `image/webp`; maximo 10 MB.
- `video`: `video/mp4`, `video/quicktime`; maximo 100 MB.
- `audio`: `audio/mpeg`, `audio/aac`; maximo 20 MB.
- `document`: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`; maximo 25 MB.

## Erros por violacao de politica
- `MEDIA_UNSUPPORTED_TYPE`: `mimeType` nao permitido para o `evidenceType`.
- `MEDIA_SIZE_LIMIT_EXCEEDED`: `sizeBytes` menor/igual a zero ou acima do limite por tipo.
- `MEDIA_CHECKSUM_REQUIRED`: `checksumSha256` ausente.
- `MEDIA_INVALID_CHECKSUM`: `checksumSha256` fora do formato SHA-256 hexadecimal.
- `MEDIA_INVALID_FILE_NAME`: `fileName` fora do padrao aceito.

## Garantias LGPD e seguranca
- O bucket deve permanecer privado.
- A API nao deve retornar URL publica permanente.
- A API nao deve expor `storageKey` direto para o mobile.
- O app deve usar somente `uploadId`, `uploadUrl`, headers obrigatorios e URLs temporarias.
- O checksum SHA-256 deve ser validado antes de assinar o upload e enviado no header `x-amz-checksum-sha256`.
- O TTL do upload e de 900 segundos.
- O TTL do preview e de 300 segundos.

## Fluxo ponta a ponta com API
1. Cliente solicita URL assinada no backend API.
2. API chama `SignedMediaService` com `mimeType`, `sizeBytes` e `checksumSha256`.
3. Integrations valida politica e retorna `uploadId`, URL temporaria e headers obrigatorios.
4. Cliente envia o binario diretamente ao storage privado usando a URL assinada.
5. Cliente confirma metadata no backend API usando `uploadId`.
6. Preview ocorre somente via nova URL temporaria emitida pela API.
