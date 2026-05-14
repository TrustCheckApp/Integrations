# Adaptador OTP (Sprint 03)

Tarefa: **TC-S3-INT-05**

Este documento descreve o contrato seguro para envio de OTP via provedores externos.

## Objetivo

- Encapsular provedores OTP por uma interface unica.
- Permitir selecao de provider por configuracao.
- Aplicar retry controlado.
- Expor metricas seguras por canal e finalidade (`purpose`).
- Padronizar erros sem vazar OTP.

## Contrato base

Arquivo principal: `src/otp/otp-provider.ts`.

Campos obrigatorios da requisicao:

- `destination`: destino do envio (ex.: telefone E.164)
- `otp`: codigo OTP a enviar
- `channel`: canal (`sms`, `email`, `whatsapp`)
- `purpose`: finalidade (`login`, `signup`, `password_reset`, `transaction`, `account_recovery`)
- `ttlSeconds`: validade do OTP
- `correlationId`: rastreabilidade sem expor dado sensivel

## Providers

Providers disponiveis:

- `TwilioOtpProvider`
- `ZenviaOtpProvider`
- `StubOtpProvider` (testes)

Selecao por configuracao:

```ts
const service = new OtpDeliveryService({
  providers: [new TwilioOtpProvider(), new ZenviaOtpProvider()],
  providerName: process.env.OTP_PROVIDER ?? 'twilio',
  metrics,
});
```

## Retry

Arquivo: `src/otp/retry-policy.ts`.

Padrao:

- `maxAttempts`: 3
- `baseDelayMs`: 250
- `maxDelayMs`: 1000

Falhas de provider sao retentadas ate o limite. Ao final, o servico retorna `OtpError` com codigo `OTP_SEND_FAILED`.

## Erros padronizados

Arquivo: `src/otp/errors.ts`.

Codigos:

- `OTP_INVALID_REQUEST`
- `OTP_PROVIDER_NOT_CONFIGURED`
- `OTP_PROVIDER_FAILED`
- `OTP_SEND_FAILED`

Erros carregam apenas contexto seguro: provider, channel, purpose, attempt e correlationId. O OTP nunca entra na mensagem ou JSON do erro.

## Metricas seguras

Arquivo: `src/otp/otp-metrics.ts`.

Metricas:

- `otp_delivery_success_total`
- `otp_delivery_failure_total`
- `otp_delivery_retry_total`
- `otp_delivery_latency_ms`

Labels permitidas:

- `provider`
- `channel`
- `purpose`
- `attempt`

Labels proibidas:

- OTP
- destination
- payload do provider
- token/API key

## Regras obrigatorias

- Nunca logar OTP.
- Nunca expor OTP em metricas.
- Nunca retornar OTP em erro.
- Nunca incluir OTP em evidencias de PR, prints ou logs.
- Falhas devem retornar erro padronizado.
- Provider deve ser selecionavel por configuracao.

## Testes

Arquivo: `src/otp/otp-delivery.service.test.ts`.

Cenarios cobertos:

- sucesso com provider selecionado e metricas seguras;
- retry apos falha temporaria;
- falha final com `OtpError` sem retorno do OTP.

