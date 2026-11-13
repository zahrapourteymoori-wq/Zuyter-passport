export type Source = { title: string; url: string; excerpt: string }

export const noSource = 'برای این سؤال اطلاعات تأییدشده‌ای پیدا نشد. می‌توانید از بخش مشاوره با تیم زویتر تماس بگیرید.'
export const medical = 'برای تشخیص، درمان، بررسی عوارض یا تجویز دارو با پزشک یا داروساز مشورت کنید.'

function normalized(value: string) {
  return value.toLowerCase().normalize('NFKC').replace(/ي/g, 'ی').replace(/ك/g, 'ک')
    .replace(/[\u064b-\u065f]/g, '')
}
const stop = new Set(['محصول', 'زویتر', 'برای', 'چطور', 'کدام', 'چیست', 'استفاده', 'دارد', 'داره', 'میشه', 'مناسب', 'پوست'])
export function retrieve(question: string, sources: Source[]) {
  const terms = [...new Set((normalized(question).match(/[\p{L}\p{N}]{3,}/gu) ?? []).filter(term => !stop.has(term)))]
  return sources.map(source => {
    const title = normalized(source.title)
    const excerpt = normalized(source.excerpt)
    const score = terms.reduce((sum, term) => sum + (title.includes(term) ? 3 : excerpt.includes(term) ? 1 : 0), 0)
    return { source, score }
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 4).map(item => item.source)
}

export function isMedical(question: string) {
  return /تشخیص|درمان|تجویز|دارو|باردار|شیرده|عوارض|حساسیت|آلرژی|سوختگی|تاول|زخم|عفونت|درد|اگزما|روزاسه|پزشک|pregnan|diagnos|treat|prescri|allerg|eczema|infect/i.test(normalized(question))
}

// The model selects a source index. Its generated text never reaches the customer.
export function groundedAnswer(selection: string, sources: Source[]) {
  const match = /^([1-4])$/.exec(selection.trim())
  const source = match ? sources[Number(match[1]) - 1] : undefined
  return source
    ? { answer: source.excerpt, sources: [{ title: source.title, url: source.url }] }
    : { answer: noSource, sources: [] }
}
