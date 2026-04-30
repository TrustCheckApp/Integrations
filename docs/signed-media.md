# TC3-INT-05 - Upload assinado e acesso privado

## Capacidades entregues
- Geracao de URL assinada para upload (`PutObject`) com expiracao curta.
- Geracao de URL assinada para download (`GetObject`) com expiracao curta.
- Validacao de MIME e tamanho por tipo de evidencia.
- Criptografia em repouso (`AES256`) no upload.

## Politicas por tipo de evidencia
- image: jpg/png/webp, max 10MB
- video: mp4/mov, max 100MB
- audio: mp3/aac, max 20MB
- document: pdf/doc/xlsx, max 25MB

## Fluxo esperado
1. Api solicita URL assinada para upload.
2. Cliente envia arquivo diretamente ao S3 com URL temporaria.
3. Api persiste somente `key` do objeto.
4. Download ocorre via nova URL assinada de curta duracao.
