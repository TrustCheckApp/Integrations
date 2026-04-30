# TC3-INT-04 - Email transacional

## Templates implementados
- `welcome`
- `auth_confirmation`
- `case_status_update`

## Provedores
- Primario: SendGrid
- Secundario: Resend

## Fallback
- Em falha no primario, envia no secundario mantendo o mesmo `correlationId`.
- Eventos de metrica registrados para sucesso, falha e fallback.

## Metricas
- `email_delivery_success_total`
- `email_delivery_failure_total`
- `email_delivery_fallback_total`
