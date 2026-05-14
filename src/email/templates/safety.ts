const UNSAFE_LINK_PARAMS = ['token', 'otp', 'code', 'secret', 'key', 'password'];

function assertNoUnsafeQueryParams(url: URL): void {
  for (const unsafeParam of UNSAFE_LINK_PARAMS) {
    if (url.searchParams.has(unsafeParam)) {
      throw new Error(`UNSAFE_EMAIL_LINK_PARAM:${unsafeParam}`);
    }
  }
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function sanitizeSubjectValue(value: string): string {
  return value.replaceAll(/\s+/g, ' ').trim();
}

export function assertSafeEmailUrl(rawUrl: string | undefined): string | undefined {
  if (!rawUrl) {
    return undefined;
  }

  const url = new URL(rawUrl);
  assertNoUnsafeQueryParams(url);
  return url.toString();
}

export function renderPublicUrl(baseUrl: string | undefined, path: string): string | undefined {
  if (!baseUrl) {
    return undefined;
  }

  const base = new URL(baseUrl);
  assertNoUnsafeQueryParams(base);

  const url = new URL(path, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);
  assertNoUnsafeQueryParams(url);
  return url.toString();
}

export function formatLink(label: string, url?: string): { text: string; html: string } {
  if (!url) {
    return { text: '', html: '' };
  }

  const safeUrl = escapeHtml(url);
  const safeLabel = escapeHtml(label);
  return {
    text: `\nAcesse: ${url}`,
    html: `<p><a href="${safeUrl}">${safeLabel}</a></p>`,
  };
}
