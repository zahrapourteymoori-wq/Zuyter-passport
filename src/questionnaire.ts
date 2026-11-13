export const legacyQuestions = [
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

export const questions = [
  {
    "id": "q1",
    "label": "در چه بازه سنی قرار دارید؟",
    "hint": "برای تنظیم مسیر مراقبت، بازه سنی خود را انتخاب کنید.",
    "multiple": false,
    "options": [
      [
        "u18",
        "کمتر از ۱۸ سال"
      ],
      [
        "18_24",
        "۱۸ تا ۲۴ سال"
      ],
      [
        "25_34",
        "۲۵ تا ۳۴ سال"
      ],
      [
        "35_44",
        "۳۵ تا ۴۴ سال"
      ],
      [
        "45plus",
        "۴۵ سال یا بیشتر"
      ]
    ]
  },
  {
    "id": "q2",
    "label": "مهم‌ترین دغدغه‌های پوست شما چیست؟",
    "hint": "می‌توانید چند مورد را انتخاب کنید.",
    "multiple": true,
    "options": [
      [
        "oil",
        "چربی و براق‌شدن پوست"
      ],
      [
        "acne",
        "جوش و منافذ قابل مشاهده"
      ],
      [
        "dry",
        "خشکی و کشیدگی"
      ],
      [
        "spots",
        "لک و تیرگی"
      ],
      [
        "sensitivity",
        "قرمزی یا حساسیت"
      ],
      [
        "age",
        "خطوط ریز و نیاز به آبرسانی"
      ],
      [
        "general",
        "داشتن یک روتین منظم"
      ]
    ]
  },
  {
    "id": "q3",
    "label": "چربی پوستتان در طول روز چگونه است؟",
    "hint": "حالتی را انتخاب کنید که بیشتر روزها تجربه می‌کنید.",
    "multiple": false,
    "options": [
      [
        "oily",
        "تقریباً تمام صورتم چرب می‌شود"
      ],
      [
        "combination",
        "پیشانی و بینی چرب‌تر از گونه‌ها هستند"
      ],
      [
        "dry",
        "پوستم بیشتر خشک است یا کشیدگی دارد"
      ],
      [
        "normal",
        "پوستم معمولاً متعادل است"
      ],
      [
        "unsure",
        "دقیق نمی‌دانم"
      ]
    ]
  },
  {
    "id": "q4",
    "label": "بعد از شست‌وشوی صورت چه احساسی دارید؟",
    "hint": "واکنش معمول پوست بعد از استفاده از شوینده را در نظر بگیرید.",
    "multiple": false,
    "options": [
      [
        "comfortable",
        "تمیز و راحت، بدون کشیدگی"
      ],
      [
        "tight",
        "خشکی یا کشیدگی"
      ],
      [
        "red",
        "قرمزی، خارش یا سوزش"
      ],
      [
        "oilysoon",
        "خیلی زود دوباره چرب می‌شود"
      ]
    ]
  },
  {
    "id": "q5",
    "label": "آیا پوستتان به محصولات مراقبتی جدید حساس است؟",
    "hint": "واکنش‌های پوستی هنگام استفاده از محصول جدید را در نظر بگیرید.",
    "multiple": false,
    "options": [
      [
        "no",
        "خیر، معمولاً مشکلی ندارم"
      ],
      [
        "sometimes",
        "گاهی واکنش نشان می‌دهد"
      ],
      [
        "yes",
        "بله، اغلب واکنش نشان می‌دهد"
      ],
      [
        "unsure",
        "مطمئن نیستم"
      ]
    ]
  },
  {
    "id": "q6",
    "label": "اگر پوستتان واکنش نشان بدهد، معمولاً چه علائمی دارد؟",
    "hint": "می‌توانید چند مورد را انتخاب کنید.",
    "multiple": true,
    "options": [
      [
        "red",
        "قرمزی"
      ],
      [
        "itch",
        "خارش"
      ],
      [
        "burn",
        "سوزش"
      ],
      [
        "dry",
        "خشکی یا پوسته‌پوسته‌شدن"
      ],
      [
        "pimple",
        "جوش‌های ریز"
      ],
      [
        "none",
        "واکنش مشخصی ندارم"
      ]
    ]
  },
  {
    "id": "q7",
    "label": "کدام عوامل بیشتر روی پوستتان اثر می‌گذارند؟",
    "hint": "می‌توانید چند مورد را انتخاب کنید.",
    "multiple": true,
    "options": [
      [
        "weather",
        "سرما یا تغییرات آب‌وهوا"
      ],
      [
        "sun",
        "نور خورشید"
      ],
      [
        "scent",
        "محصولات عطردار"
      ],
      [
        "wash",
        "شست‌وشوی زیاد"
      ],
      [
        "stress",
        "استرس و کم‌خوابی"
      ],
      [
        "unknown",
        "عامل مشخصی نمی‌شناسم"
      ]
    ]
  },
  {
    "id": "q8",
    "label": "وضعیت جوش‌های پوستتان چگونه است؟",
    "hint": "نزدیک‌ترین گزینه به شرایط فعلی خود را انتخاب کنید.",
    "multiple": false,
    "options": [
      [
        "none",
        "معمولاً جوش ندارم"
      ],
      [
        "black",
        "بیشتر جوش سرسیاه یا سرسفید دارم"
      ],
      [
        "occasional",
        "گاهی جوش‌های پراکنده می‌زنم"
      ],
      [
        "inflamed",
        "جوش‌های التهابی و مکرر دارم"
      ],
      [
        "unsure",
        "مطمئن نیستم"
      ]
    ]
  },
  {
    "id": "q9",
    "label": "آیا روی پوستتان لک یا تیرگی دارید؟",
    "hint": "این سؤال مشخص می‌کند آیا لازم است یک سؤال تکمیلی بپرسیم.",
    "multiple": false,
    "options": [
      [
        "none",
        "خیر، لک قابل توجهی ندارم"
      ],
      [
        "acnemark",
        "بله، جای جوش دارم"
      ],
      [
        "sun",
        "بله، لکه‌های ناشی از آفتاب یا تیرگی"
      ],
      [
        "other",
        "بله، لک‌هایی با علت نامشخص"
      ]
    ]
  },
  {
    "id": "q9a",
    "label": "لک‌ها و تیرگی‌ها از چه زمانی دیده شده‌اند؟",
    "hint": "سؤال تکمیلی؛ صرفاً برای شناخت بهتر دغدغه پوستی است.",
    "multiple": false,
    "options": [
      [
        "recent",
        "کمتر از سه ماه"
      ],
      [
        "mid",
        "سه تا دوازده ماه"
      ],
      [
        "long",
        "بیشتر از یک سال"
      ],
      [
        "unsure",
        "اطمینان ندارم"
      ]
    ]
  },
  {
    "id": "q10",
    "label": "روتین مراقبت از پوست فعلی شما چگونه است؟",
    "hint": "روشی را انتخاب کنید که بیشترین شباهت را به عادت شما دارد.",
    "multiple": false,
    "options": [
      [
        "none",
        "فعلاً روتین مشخصی ندارم"
      ],
      [
        "wash",
        "فقط از شوینده استفاده می‌کنم"
      ],
      [
        "simple",
        "شوینده و آبرسان دارم"
      ],
      [
        "full",
        "چند مرحله مراقبت پوستی دارم"
      ],
      [
        "varies",
        "روتینم نامنظم است"
      ]
    ]
  },
  {
    "id": "q11",
    "label": "آیا سابقه حساسیت به یک محصول یا ترکیب خاص دارید؟",
    "hint": "در صورت داشتن حساسیت شناخته‌شده، نام آن را بعداً هم می‌توان در پروفایل ثبت کرد.",
    "multiple": false,
    "options": [
      [
        "no",
        "خیر، مورد مشخصی نمی‌شناسم"
      ],
      [
        "yes",
        "بله، سابقه حساسیت دارم"
      ],
      [
        "unsure",
        "مطمئن نیستم"
      ]
    ]
  },
  {
    "id": "q12",
    "label": "کدام شرایط ممکن است روی پوستتان اثر بگذارد؟",
    "hint": "می‌توانید چند مورد را انتخاب کنید؛ این پاسخ‌ها تشخیص پزشکی نیستند.",
    "multiple": true,
    "options": [
      [
        "sleep",
        "کم‌خوابی یا استرس"
      ],
      [
        "season",
        "تغییر فصل یا آب‌وهوا"
      ],
      [
        "hormone",
        "تغییرات هورمونی"
      ],
      [
        "makeup",
        "استفاده زیاد از آرایش"
      ],
      [
        "none",
        "مورد مشخصی ندارم"
      ],
      [
        "other",
        "عوامل دیگر"
      ]
    ]
  }
]

export type Answers = Record<string, string[]>

export function activeQuestions(answers: Answers) {
  const spots = answers.q9?.[0]
  return questions.filter(question => question.id !== 'q9a' || (spots && spots !== 'none'))
}

export function chooseAnswer(id: string, answers: Answers, value: string) {
  const question = questions.find(item => item.id === id)
  if (!question?.options.some(option => option[0] === value)) return answers
  const before = answers[id] ?? []
  const exclusive = (option: string) => option === 'none' || option === 'unknown'
  const choices = !question.multiple || exclusive(value)
    ? before.includes(value) && question.multiple ? [] : [value]
    : before.includes(value) ? before.filter(item => item !== value) : [...before.filter(item => !exclusive(item)), value]
  return cleanAnswers({ ...answers, [id]: choices })
}

export function cleanAnswers(answers: Answers): Answers {
  return Object.fromEntries(activeQuestions(answers).map(question => {
    const values = Array.isArray(answers[question.id]) ? answers[question.id] : []
    const choices = [...new Set(values.filter(value => question.options.some(option => option[0] === value)))]
    return [question.id, question.multiple ? choices : choices.slice(0, 1)]
  }))
}

export function answerSummary(answers: Answers, version: string) {
  const rows = version === 'integrated-1'
    ? questions.map(q => ({ id: q.id, label: q.label, values: answers[q.id]?.map(value =>
        q.options.find(option => option[0] === value)?.[1] ?? value) }))
    : legacyQuestions.map(q => ({ id: q.id, label: q.label, values: answers[q.id] }))
  return rows.filter(row => row.values?.length)
}

const patterns: Record<string, string> = {
  oily: 'چرب', dry: 'خشک', combination: 'مختلط', normal: 'معمولی',
}

// The integrated prototype infers the initial pattern from daily oiliness.
export function draftRoutine(answers: Answers) {
  const pattern = patterns[answers.q3?.[0]] ?? 'نیازمند بررسی'
  const review = answers.q1?.[0] === 'u18' || answers.q11?.[0] !== 'no' ||
    answers.q5?.[0] !== 'no' || answers.q3?.[0] === 'unsure'
  return {
    pattern,
    review,
    morning: ['پاکسازی ملایم', 'مرطوب‌کننده سازگار با پوست', 'ضدآفتاب مناسب'],
    evening: ['پاکسازی ملایم', 'مرطوب‌کننده سازگار با پوست'],
  }
}
