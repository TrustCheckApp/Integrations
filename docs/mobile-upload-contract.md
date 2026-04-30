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
