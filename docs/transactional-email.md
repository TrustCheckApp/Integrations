# TC-S3-INT-06 - Templates transacionais

## Objetivo
Padronizar os templates de email da Sprint 03 com payloads tipados, corpo minimo e dados restritos ao necessario para notificacao transacional.

## Templates implementados
- `otp`: codigo de uso unico para fluxos de autenticacao.
- `claim_received`: confirmacao de claim recebido.
- `claim_approved`: notificacao de claim aprovado.
- `claim_rejected`: notificacao de claim rejeitado com motivo padronizado.
- `case_published`: notificacao de caso publicado.
- `business_response`: notificacao de resposta empresarial.

## Dados permitidos
- `publicId` do claim, caso ou resposta quando aplicavel.
- `otp` somente no corpo do email OTP, nunca em link, metrica ou erro.
- `ttlMinutes` e `purpose` do OTP.
- `rejectionReasonCode` padronizado, sem texto livre com PII.
- URLs publicas ou de portal sem parametros sensiveis.

## Dados proibidos
- CPF, documento, telefone, endereco, nome completo ou email do solicitante no corpo do template.
- `storageKey`, caminho interno de bucket ou identificador privado de arquivo.
- Tokens, OTP, secrets, chaves ou senhas em query string de link.
- Evidencias, anexos ou logs sensiveis.

## Links seguros
- Templates de claim e resposta empresarial usam `portalBaseUrl` e constroem rotas com `publicId`.
- Template de caso publicado aceita `publicUrl` ja publica.
- Qualquer URL com `token`, `otp`, `code`, `secret`, `key` ou `password` em query string deve falhar antes do envio.

## Provedores
- Primario: SendGrid.
- Secundario: Resend.

## Fallback
- Em falha no primario, envia no secundario mantendo o mesmo `correlationId`.
- Eventos de metrica registram somente provider e template.

## Metricas
- `email_delivery_success_total`
- `email_delivery_failure_total`
- `email_delivery_fallback_total`

## Como usar
```ts
await service.sendTemplate('claim_received', to, correlationId, {
  claimPublicId: 'claim_pub_001',
  portalBaseUrl: 'https://app.trustcheck.example',
});
```

## Checklist antes do merge
- [ ] Nenhum template inclui PII desnecessaria.
- [ ] Links nao incluem tokens, OTP, secrets ou senhas.
- [ ] OTP aparece somente no corpo do email OTP.
- [ ] Metricas e erros nao carregam valores de OTP.
- [ ] Tests `npm test` executados apos `npm run build`.
