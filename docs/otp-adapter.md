# TC3-INT-03 - Adapter OTP SMS

## O que foi implementado
- Interface de provider OTP (`OtpProvider`)
- Provider primario (Twilio) e secundario (Zenvia)
- Servico de entrega com retentativa e fallback entre providers
- Coleta de metricas de sucesso, falha e latencia

## Metricas
- `otp_delivery_success_total`
- `otp_delivery_failure_total`
- `otp_delivery_latency_ms`

## Regra de retentativa
- Maximo padrao: 3 tentativas por provider
- Backoff linear: 250ms * tentativa
- Fallback para provider secundario apos exaustao do primario
