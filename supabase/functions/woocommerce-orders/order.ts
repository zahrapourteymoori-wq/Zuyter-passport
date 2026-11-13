export async function validSignature(body: Uint8Array<ArrayBuffer>, signature: string, secret: string) {
  try {
    const bytes = Uint8Array.from(atob(signature), char => char.charCodeAt(0))
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'])
    return await crypto.subtle.verify('HMAC', key, bytes, body)
  } catch {
    return false
  }
}

export function orderSnapshot(value: unknown) {
  if (!value || typeof value !== 'object') return null
  const { id, status, currency, total, date_modified_gmt } = value as Record<string, unknown>
  if (typeof id !== 'number' || !Number.isSafeInteger(id) || id <= 0 ||
    typeof status !== 'string' || !/^[a-z0-9_-]{1,40}$/.test(status) ||
    typeof currency !== 'string' || !/^[A-Z]{3}$/.test(currency) ||
    typeof total !== 'string' || !/^\d{1,12}(\.\d{1,4})?$/.test(total) ||
    typeof date_modified_gmt !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:Z)?$/.test(date_modified_gmt)) return null
  const time = new Date(date_modified_gmt.replace(/Z?$/, 'Z'))
  if (!Number.isFinite(time.getTime())) return null
  return { wc_id: id, wc_status: status, wc_currency: currency, wc_total: total, wc_modified: time.toISOString() }
}
