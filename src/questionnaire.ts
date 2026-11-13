export const questions = [
  { id: 'age', label: 'در چه بازه سنی هستید؟', options: ['زیر ۱۸ سال', '۱۸ تا ۲۹ سال', '۳۰ تا ۴۴ سال', '۴۵ سال یا بیشتر'] },
  { id: 'concerns', label: 'دغدغه‌های اصلی پوستتان چیست؟', options: ['خشکی', 'چربی', 'جوش', 'لک', 'حساسیت', 'هیچ‌کدام'], multiple: true },
  { id: 'oil', label: 'در طول روز کدام قسمت‌های صورتتان براق می‌شود؟', options: ['هیچ‌کدام', 'پیشانی و بینی', 'بیشتر صورت'] },
  { id: 'cleanse', label: 'بعد از شست‌وشو چه احساسی دارید؟', options: ['کشیدگی', 'راحت', 'چربی'] },
  { id: 'newProduct', label: 'پوستتان به محصولات جدید چه واکنشی نشان می‌دهد؟', options: ['اغلب واکنش دارد', 'گاهی واکنش دارد', 'معمولاً واکنش ندارد'] },
  { id: 'sensitivity', label: 'قرمزی، سوزش یا خارش را چقدر تجربه می‌کنید؟', options: ['اغلب', 'گاهی', 'به‌ندرت'] },
  { id: 'triggers', label: 'چه چیزهایی روی پوستتان اثر می‌گذارد؟', options: ['آفتاب', 'سرما', 'گرما', 'استرس', 'مطمئن نیستم'], multiple: true },
  { id: 'acne', label: 'هر چند وقت جوش می‌زنید؟', options: ['به‌ندرت', 'گاهی', 'اغلب'] },
  { id: 'spots', label: 'آیا روی پوستتان لک دارید؟', options: ['بله', 'خیر', 'مطمئن نیستم'] },
  { id: 'spotDuration', label: 'چه مدت است که لک‌ها را دیده‌اید؟', options: ['کمتر از سه ماه', 'سه ماه یا بیشتر', 'مطمئن نیستم'] },
  { id: 'routine', label: 'الان چقدر منظم از محصولات مراقبت پوست استفاده می‌کنید؟', options: ['هر روز', 'گاهی', 'روتین ندارم'] },
  { id: 'reaction', label: 'آیا سابقه حساسیت به ترکیب یا محصولی دارید؟', options: ['بله', 'خیر', 'مطمئن نیستم'] },
  { id: 'other', label: 'عامل دیگری هست که دوست دارید با مشاور مطرح کنید؟', options: ['بله', 'خیر'] },
]

export type Answers = Record<string, string[]>

export function activeQuestions(answers: Answers) {
  return questions.filter(question => question.id !== 'spotDuration' || answers.spots?.[0] === 'بله')
}

export function cleanAnswers(answers: Answers): Answers {
  return Object.fromEntries(activeQuestions(answers).map(question => {
    const choices = [...new Set((answers[question.id] ?? []).filter(value => question.options.includes(value)))]
    return [question.id, question.multiple ? choices : choices.slice(0, 1)]
  }))
}

// Draft behavior rules describe a pattern. Product eligibility requires Zuyter approval.
export function draftRoutine(answers: Answers) {
  const oil = answers.oil?.[0]
  const cleanse = answers.cleanse?.[0]
  const pattern = oil === 'پیشانی و بینی' ? 'مختلط'
    : oil === 'بیشتر صورت' && cleanse !== 'کشیدگی' ? 'متمایل به چربی'
    : oil === 'هیچ‌کدام' && cleanse === 'کشیدگی' ? 'متمایل به خشکی'
    : 'الگوی مشخصی دیده نشد'
  const review = answers.age?.[0] === 'زیر ۱۸ سال' || answers.reaction?.[0] === 'بله' ||
    answers.newProduct?.[0] === 'اغلب واکنش دارد' || answers.sensitivity?.[0] === 'اغلب'
  return {
    pattern,
    review,
    morning: ['پاکسازی ملایم', 'مرطوب‌کننده سازگار با پوست', 'ضدآفتاب مناسب'],
    evening: ['پاکسازی ملایم', 'مرطوب‌کننده سازگار با پوست'],
  }
}
