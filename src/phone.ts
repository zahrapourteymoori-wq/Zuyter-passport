const persianDigits = '۰۱۲۳۴۵۶۷۸۹'
const arabicDigits = '٠١٢٣٤٥٦٧٨٩'

export function normalizeIranianMobile(value: string) {
  const latin = [...value].map(character => {
    const persian = persianDigits.indexOf(character)
    const arabic = arabicDigits.indexOf(character)
    return persian >= 0 ? String(persian) : arabic >= 0 ? String(arabic) : character
  }).join('').replace(/[\s-]/g, '')
  return /^09[0-9]{9}$/.test(latin) ? latin : null
}

export function toSupabasePhone(mobile: string) {
  const normalized = normalizeIranianMobile(mobile)
  return normalized ? '+98' + normalized.slice(1) : null
}
