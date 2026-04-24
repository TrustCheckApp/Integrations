# TrustCheck Integrations

Camada de integracoes externas da plataforma TrustCheck para autenticacao, comunicacao, moderacao assistida e analytics.

## Escopo V1
- OTP e notificacao por SMS (Twilio ou Zenvia).
- Emails transacionais (SendGrid).
- Push notifications (FCM e APNs).
- Armazenamento de midia (S3/CloudFront).
- IA de apoio para moderacao (OpenAI/Rekognition, conforme regra).
- Analytics de funil e comportamento (Mixpanel).

## Responsabilidades
- Encapsular provedores externos com contrato claro para o `Api`.
- Isolar configuracoes de credenciais e ambiente.
- Assegurar rastreabilidade de falhas e retentativas.
- Suportar governanca de custo e disponibilidade.

## Fora de escopo V1
- Orquestracao juridica de terceiros.
- Moderacao autonoma completa por ML.

## Dependencias
- Consumido principalmente pelo `Api`.
- Operado com suporte do `Infra`.
- Requisitos funcionais definidos no `Docs`.

## Fonte de verdade funcional
- https://github.com/TrustCheckApp/Docs
- `Docs/docs/01-visao-produto-e-modulos.md`
- `Docs/docs/03-planejamento-sprints.md`
