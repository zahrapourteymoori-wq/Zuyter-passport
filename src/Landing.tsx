import wordmark from './assets/wordmark.png'
import serum from './assets/serum.jpeg'
import foam from './assets/foam.jpeg'
import { products } from './products'

const stats = [
  ['◈', '۱۲ سؤال', 'برای شناخت الگوی پوست'],
  ['◷', '۱۴ روز', 'زمان اولین پیگیری'],
  ['♧', '۳ مسیر', 'راهنما، نماینده و شرکت'],
]
const journey = [
  ['۱', 'شناخت پوست', 'پاسخ به پرسش‌ها درباره پوست و دغدغه‌های مراقبتی'],
  ['۲', 'دریافت روتین و پاسخ', 'چیدمان مراحل مراقبت و ارتباط با مشاور'],
  ['۳', 'پیگیری و ثبت تغییرات', 'ثبت تجربه و یادداشت روز ۱۴ و ۳۰'],
]

export function Landing({ go }: { go: (page: 'questions' | 'chat') => void }) {
  return <section className="view active">
    <div className="hero">
      <div className="hero-copy">
        <div className="section-kicker">یک همراه در مسیر مراقبت از پوست</div>
        <h2>پوستت، روتینت،<br /><span className="hero-accent">مسیر مخصوص خودت.</span></h2>
        <p className="sub">به پرسش‌های پوست پاسخ بده، ترتیب مراقبتت را ببین، سؤال بپرس و تجربه‌ات را در روز چهاردهم پیگیری کن.</p>
        <div className="stack">
          <button className="btn primary" onClick={() => go('questions')}>ساخت پاسپورت پوستی ←</button>
          <button className="btn light" onClick={() => go('chat')}>گفت‌وگو با راهنما</button>
        </div>
      </div>
      <div className="hero-art">
        <div className="passport-cover">
          <img src={wordmark} alt="زویتر" />
          <span className="line" />
          <div className="cover-title">YOUR SKIN<br />YOUR JOURNEY</div>
        </div>
      </div>
    </div>
    <div className="stats">{stats.map(([icon, title, text]) =>
      <div className="stat" key={title}>
        <div className="bubble" aria-hidden="true">{icon}</div>
        <div><b>{title}</b><span>{text}</span></div>
      </div>)}</div>
    <div className="entry-title"><h3>چطور کار می‌کند؟</h3><span className="muted tiny">آسان و قدم‌به‌قدم</span></div>
    <div className="grid three">{journey.map(([number, title, text]) =>
      <div className="card" key={number}>
        <div className="road"><span className="num">{number}</span><div><h3>{title}</h3><span>{text}</span></div></div>
      </div>)}</div>
    <div className="entry-title"><h3>نمونه‌هایی از محصولات زویتر</h3></div>
    <div className="grid two">
      <div className="card product-spot">
        <img src={serum} alt="سرم نیاسینامید زویتر" />
        <div><span className="tag">ZUYTER / SERUM</span><h3>سرم نیاسینامید ۱۰٪</h3>
          <p className="sub tiny">اطلاعات محصول در فروشگاه رسمی زویتر.</p>
          <a className="btn light small" href={products.niacinamide.url}>مشاهده محصول ←</a></div>
      </div>
      <div className="card product-spot">
        <img src={foam} alt="فوم شست‌وشوی زویتر" />
        <div><span className="tag">ZUYTER / CLEANSER</span><h3>فوم شست‌وشوی صورت</h3>
          <p className="sub tiny">نمونه‌ای از مرحله پاکسازی در روتین پوستی.</p>
          <a className="btn light small" href="https://zuyter.ir/">فروشگاه زویتر ←</a></div>
      </div>
    </div>
  </section>
}
