import { MetricsCollector } from './shared/metrics.js';
import { OtpDeliveryService } from './otp/otp-delivery.service.js';
import { TwilioOtpProvider, ZenviaOtpProvider } from './otp/providers.js';

const metrics = new MetricsCollector();
const otpService = new OtpDeliveryService({
  providers: [new TwilioOtpProvider(), new ZenviaOtpProvider()],
  providerName: process.env.OTP_PROVIDER ?? 'twilio',
  metrics,
});

async function main(): Promise<void> {
  const result = await otpService.send({
    destination: '+5511999998888',
    otp: '123456',
    channel: 'sms',
    purpose: 'login',
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
