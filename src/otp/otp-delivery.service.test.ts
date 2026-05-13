import assert from 'node:assert/strict';
import test from 'node:test';
import { MetricsCollector } from '../shared/metrics.js';
import { OtpDeliveryService } from './otp-delivery.service.js';
import { OtpError } from './errors.js';
import { StubOtpProvider } from './providers.js';
import type { OtpSendRequest } from './otp-provider.js';

const baseRequest: OtpSendRequest = {
  destination: '+5511999998888',
  otp: '123456',
  channel: 'sms',
  purpose: 'login',
  ttlSeconds: 300,
  correlationId: 'test-correlation-id',
};

test('envia OTP com provider selecionado e metricas seguras', async () => {
  const metrics = new MetricsCollector();
  const ignoredProvider = new StubOtpProvider({ name: 'ignored' });
  const selectedProvider = new StubOtpProvider({ name: 'stub' });
  const service = new OtpDeliveryService({
    providers: [ignoredProvider, selectedProvider],
    providerName: 'stub',
    metrics,
    retryPolicy: { maxAttempts: 2, baseDelayMs: 0, maxDelayMs: 0 },
    sleep: async () => undefined,
  });

  const result = await service.send(baseRequest);

  assert.equal(result.provider, 'stub');
  assert.equal(selectedProvider.sendCount, 1);
  assert.equal(ignoredProvider.sendCount, 0);

  const snapshot = metrics.snapshot();
  assert.equal(snapshot.some((entry) => entry.metric === 'otp_delivery_success_total'), true);
  assert.equal(JSON.stringify(snapshot).includes(baseRequest.otp), false);
  assert.deepEqual(snapshot[0]?.labels, {
    provider: 'stub',
    channel: 'sms',
    purpose: 'login',
    attempt: '1',
  });
});

test('retenta falha temporaria e finaliza com sucesso', async () => {
  const metrics = new MetricsCollector();
  const provider = new StubOtpProvider({ outcomes: ['failure', 'success'] });
  const service = new OtpDeliveryService({
    providers: [provider],
    metrics,
    retryPolicy: { maxAttempts: 2, baseDelayMs: 0, maxDelayMs: 0 },
    sleep: async () => undefined,
  });

  const result = await service.send(baseRequest);

  assert.equal(result.accepted, true);
  assert.equal(provider.sendCount, 2);
  assert.equal(metrics.snapshot().filter((entry) => entry.metric === 'otp_delivery_retry_total').length, 1);
});

test('falha com erro padronizado sem retornar OTP', async () => {
  const metrics = new MetricsCollector();
  const provider = new StubOtpProvider({ outcomes: ['failure', 'failure'] });
  const service = new OtpDeliveryService({
    providers: [provider],
    metrics,
    retryPolicy: { maxAttempts: 2, baseDelayMs: 0, maxDelayMs: 0 },
    sleep: async () => undefined,
  });

  await assert.rejects(
    () => service.send(baseRequest),
    (error) => {
      assert.equal(error instanceof OtpError, true);
      assert.equal((error as OtpError).code, 'OTP_SEND_FAILED');
      assert.equal(JSON.stringify(error).includes(baseRequest.otp), false);
      return true;
    },
  );

  assert.equal(JSON.stringify(metrics.snapshot()).includes(baseRequest.otp), false);
});
