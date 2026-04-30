import { MetricsCollector } from './shared/metrics.js';
import { OtpDeliveryService } from './otp/otp-delivery.service.js';
import { TwilioOtpProvider, ZenviaOtpProvider } from './otp/providers.js';

const metrics = new MetricsCollector();
const otpService = new OtpDeliveryService({
  primary: new TwilioOtpProvider(),
  secondary: new ZenviaOtpProvider(),
  metrics,
});

async function main(): Promise<void> {
  const result = await otpService.send({
    destination: '+5511999998888',
    code: '123456',
    ttlSeconds: 300,
    correlationId: crypto.randomUUID(),
  });

  console.log('OTP envio ok:', result);
  console.log('Metricas snapshot:', metrics.snapshot());
}

main().catch((err) => {
  console.error('Erro no envio OTP:', err);
  process.exit(1);
});
