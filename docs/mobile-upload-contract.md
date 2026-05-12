# TC2-MOB-06 - Contrato de upload para jornada mobile

## Endpoint de contrato (integração)
- `POST /integrations/media/signed-upload`
  - request: `SignedUploadContractRequest`
  - response: `SignedUploadContractResponse`

- `POST /integrations/media/signed-download`
  - request: `{ key: string }`
  - response: `SignedDownloadContractResponse`

## Garantias
- URL com expiração curta
- validação por tipo/tamanho de evidência
- acesso privado por assinatura

## Fluxo ponta a ponta com API
1. Cliente solicita URL assinada no backend API.
2. API usa SignedMediaService para gerar uploadUrl e key.
3. Cliente envia binario diretamente ao S3 com uploadUrl.
4. Cliente confirma metadata no backend API com token temporario de upload.

