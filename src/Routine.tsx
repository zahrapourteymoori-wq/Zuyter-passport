import { products } from './products'
import type { draftRoutine } from './questionnaire'

export function Routine({ routine }: { routine: ReturnType<typeof draftRoutine> }) {
  return <>
    <p>الگوی اولیه پوست: <strong>{routine.pattern}</strong></p>
    {routine.review && <p>پیش از انتخاب محصول، با متخصص درباره حساسیت‌ها و شرایطتان صحبت کنید.</p>}
    <div className="columns">
      {[['صبح', routine.morning], ['شب', routine.evening]].map(([label, steps]) =>
        <section className="card" key={String(label)}><h3>{label}</h3>
          <ol>{(steps as string[]).map(step => <li key={step}>{step}</li>)}</ol>
        </section>
      )}
    </div>
    <details>
      <summary>محصولات زویتر در فروشگاه</summary>
      <p>برای مشاهده توضیحات رسمی محصول و خرید به فروشگاه بروید. انتخاب محصول مناسب روتین شما نیاز به بررسی دارد.</p>
      <ul>{Object.values(products).map(product => <li key={product.url}><a href={product.url}>{product.title}</a></li>)}</ul>
    </details>
  </>
}
