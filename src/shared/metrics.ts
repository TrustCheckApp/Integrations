export interface MetricEntry {
  metric: string;
  value: number;
  labels?: Record<string, string>;
  timestamp: string;
}

export class MetricsCollector {
  private entries: MetricEntry[] = [];

  record(metric: string, value: number, labels?: Record<string, string>): void {
    this.entries.push({ metric, value, labels, timestamp: new Date().toISOString() });
  }

  snapshot(): MetricEntry[] {
    return [...this.entries];
  }
}
