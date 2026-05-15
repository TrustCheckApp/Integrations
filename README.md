# TrustCheck Integrations

Camada de integracoes externas da plataforma TrustCheck.

## Estado atual (atualizado em 2026-05-14)
- Estruturas de OTP, email transacional e signed media implementadas.
- Build TypeScript funcional.
- Providers atuais em modo adaptador/stub (simulacao de envio).

## Situacao tecnica real
- OTP: servico com tentativas, fallback e metricas.
- Email: servico transacional com fallback entre provedores.
- Midia: contrato de signed upload/download com politicas de tipo/tamanho.

## Gaps para producao
1. Conectar providers a servicos reais (Twilio/Zenvia, SendGrid/Resend).
2. Expandir testes automatizados alem de baseline atual.
3. Formalizar estrategia de observabilidade e erros por provedor externo.

## Adaptador OTP seguro
- Contrato e uso seguro: `docs/otp-adapter.md`
- Providers: `src/otp/providers.ts`
- Retry: `src/otp/retry-policy.ts`
- Metricas seguras: `src/otp/otp-metrics.ts`

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

## Scripts
```bash
npm install
npm run build
npm run test
```

## Fonte de verdade funcional
- https://github.com/TrustCheckApp/Docs
- `Docs/docs/05-sprint-semanal-03-infra-integracoes-qa.md`
