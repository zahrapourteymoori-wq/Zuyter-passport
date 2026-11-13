import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './backend'
import { normalizeIranianMobile, toSupabasePhone } from './phone'
import { activeQuestions, chooseAnswer, cleanAnswers, draftRoutine } from './questionnaire'
import type { Answers } from './questionnaire'
import { Dashboard } from './dashboard'
import { Routine } from './Routine'
import { Landing } from './Landing'
import { VisualShell } from './VisualShell'
import './style.css'

const stagingEmail = (mobile: string) => `staging-${mobile.slice(1)}@zuyter.invalid`

const routes = ['home', 'questions', 'result', 'account', 'chat', 'followups', 'partners', 'company'] as const
type Page = typeof routes[number]

function currentPage(): Page {
  const hash = location.hash.slice(1)
  return routes.find(page => page === hash) ?? 'home'
}

function Login() {
  const [mode, setMode] = useState<'otp' | 'password'>('password')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [sent, setSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  if (!supabase) return <p role="status">اتصال حساب کاربری هنوز پیکربندی نشده است.</p>
  const client = supabase
  useEffect(() => {
    if (!cooldown) return
    const timer = window.setInterval(() => setCooldown(value => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [cooldown])
  return <form onSubmit={async event => {
    event.preventDefault()
    setBusy(true)
    try {
      const normalized = normalizeIranianMobile(phone)
      if (!normalized) {
        setMessage('شماره باید ۱۱ رقم و با ۰۹ شروع شود.')
        return
      }
      const supabasePhone = toSupabasePhone(normalized)
      if (!supabasePhone) return
      if (mode === 'password') {
        const { error } = await client.auth.signInWithPassword({ email: stagingEmail(normalized), password })
        setMessage(error ? 'شماره یا رمز Staging معتبر نیست.' : 'وارد شدید.')
      } else if (!sent) {
        const { error } = await client.auth.signInWithOtp({ phone: supabasePhone })
        setMessage(error ? 'ارسال کد انجام نشد. تنظیمات پیامک را بررسی کنید.' : 'کد تأیید ارسال شد.')
        if (!error) {
          setSent(true)
          setCooldown(60)
        }
      } else {
        const { error } = await client.auth.verifyOtp({ phone: supabasePhone, token: token.trim(), type: 'sms' })
        setMessage(error ? 'کد معتبر نیست یا منقضی شده است.' : 'وارد شدید.')
      }
    } catch {
      setMessage('ارتباط برقرار نشد. دوباره امتحان کنید.')
    } finally {
      setBusy(false)
    }
  }}>
    <div className="actions"><button type="button" className={mode === 'password' ? '' : 'secondary'} onClick={() => { setMode('password'); setSent(false); setMessage('') }}>ورود Staging با رمز</button><button type="button" className={mode === 'otp' ? '' : 'secondary'} onClick={() => { setMode('otp'); setSent(false); setMessage('') }}>ورود با کد پیامکی</button></div>
    <label>شماره موبایل ایران<input name="phone" inputMode="tel" dir="ltr" autoComplete="tel"
      value={phone} onChange={event => setPhone(event.target.value)} placeholder="۰۹۱۲۳۴۵۶۷۸۹" required /></label>
    {mode === 'password' && <label>رمز Staging<input name="password" type="password" dir="ltr" autoComplete="current-password"
      value={password} onChange={event => setPassword(event.target.value)} minLength={8} required /></label>}
    {sent && <label>کد تأیید<input name="token" inputMode="numeric" dir="ltr" autoComplete="one-time-code"
      value={token} onChange={event => setToken(event.target.value)} minLength={4} maxLength={8} required /></label>}
    <div className="actions">
      <button disabled={busy}>{mode === 'password' ? 'ورود' : (sent ? 'تأیید کد' : 'ارسال کد')}</button>
      {sent && <button type="button" className="secondary"
        onClick={() => { setSent(false); setToken(''); setMessage('') }}>تغییر شماره</button>}
    </div>
    <p role="status">{message || (mode === 'password' ? 'این مسیر فقط برای حساب‌های آزمایشی Staging فعال است.' : (cooldown
      ? 'برای جلوگیری از ارسال تکراری، کد بعدی پس از ' + cooldown.toLocaleString('fa-IR') + ' ثانیه قابل درخواست است.'
      : 'کد یکبارمصرف از طریق سرویس پیامکی تنظیم‌شده ارسال می‌شود.'))}</p>
  </form>
}

function PasswordChange({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  return <section className="card"><h2>تغییر رمز اجباری</h2><p>برای ادامه، یک رمز جدید و حداقل ۱۰ نویسه تعیین کنید.</p><form onSubmit={async event => {
    event.preventDefault(); setBusy(true); setStatus('')
    const result = await supabase!.functions.invoke('staging-password', { body: { password } })
    setBusy(false)
    if (result.error) return setStatus('تغییر رمز انجام نشد. رمز قوی‌تری انتخاب کنید.')
    setStatus('رمز تغییر کرد.'); onDone()
  }}><label>رمز جدید<input type="password" dir="ltr" minLength={10} required value={password} onChange={event => setPassword(event.target.value)} /></label><button disabled={busy}>ذخیره رمز جدید</button>{status && <p role="status">{status}</p>}</form></section>
}

const pendingKey = 'zuyter-pending-passport-integrated'
const blankDraft = { id: '', answers: {} as Answers }
function restoreDraft() {
  try {
    const value = JSON.parse(sessionStorage.getItem(pendingKey) ?? 'null')
    if (value?.id && value.answers && typeof value.answers === 'object') return value as typeof blankDraft
  } catch {
    // Storage may be unavailable in a restricted browser.
  }
  return blankDraft
}

function App() {
  const [page, setPage] = useState(currentPage)
  const [draft, setDraft] = useState(restoreDraft)
  const [index, setIndex] = useState(0)
  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(!supabase)
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState('')
  const [role, setRole] = useState<'guest' | 'customer' | 'representative' | 'consultant' | 'administrator'>('guest')
  const [passwordRequired, setPasswordRequired] = useState(false)
  const questions = activeQuestions(draft.answers)
  const question = questions[index] ?? questions[0]
  const selections = draft.answers[question.id] ?? []
  const complete = questions.every(item => draft.answers[item.id]?.length)
  const routine = draftRoutine(draft.answers)
  const navigate = (next: Page) => { location.hash = next; setPage(next); window.scrollTo(0, 0) }

  useEffect(() => {
    const handle = () => { setPage(currentPage()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', handle)
    const listener = supabase?.auth.onAuthStateChange((event, next) => {
      setSession(next)
      setRole(next ? 'customer' : 'guest')
      if (!next) setPasswordRequired(false)
      setAuthReady(true)
      if (event === 'SIGNED_IN' && location.hash === '') location.hash = 'account'
    })
    return () => { window.removeEventListener('hashchange', handle); listener?.data.subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    if (!supabase || !session) {
      setRole('guest')
      return
    }
    let active = true
    void Promise.all([
      supabase.from('user_roles').select('role').eq('user_id', session.user.id).single(),
      supabase.from('profiles').select('password_change_required, staging_only').eq('id', session.user.id).single(),
    ]).then(async ([membership, profile]) => {
        if (import.meta.env.VITE_APP_ENV === 'production' && profile.data?.staging_only) {
          await supabase!.auth.signOut()
          if (active) setStatus('این حساب فقط برای محیط Staging فعال است.')
          return
        }
        if (active && membership.data?.role) setRole(membership.data.role)
        if (active) setPasswordRequired(Boolean(profile.data?.password_change_required))
      })
    return () => { active = false }
  }, [session])

  async function save() {
    if (!supabase || !session) return
    setSaving(true)
    setStatus('')
    const { error } = await supabase.from('skin_assessments').insert({
      id: draft.id, version: 'integrated-1', answers: cleanAnswers(draft.answers), routine,
    })
    const exists = error?.code === '23505'
      ? (await supabase.from('skin_assessments').select('id').eq('id', draft.id).maybeSingle()).data
      : null
    setSaving(false)
    if (error && !exists) return setStatus('ذخیره انجام نشد. دوباره امتحان کنید.')
    sessionStorage.removeItem(pendingKey)
    setSaved(draft.id)
    navigate('account')
  }

  return <VisualShell page={page} role={role}>
      {session && passwordRequired ? <PasswordChange onDone={() => setPasswordRequired(false)} /> : null}
      {page === 'home' && <Landing go={navigate} />}
      {page === 'questions' && <section className="card quiz-panel">
        <h1>پرسشنامه پوستی</h1>
        <p>سؤال {(index + 1).toLocaleString('fa-IR')} از {questions.length.toLocaleString('fa-IR')}</p>
        <progress value={index + 1} max={questions.length} aria-label="پیشرفت پرسشنامه" />
        <fieldset key={question.id}>
          <legend>{question.label}</legend>
          <p className="sub">{question.hint}</p>
          {question.options.map(([option, label]) => <label className="choice" key={option}>
            <input type={question.multiple ? 'checkbox' : 'radio'} name={question.id}
              checked={selections.includes(option)} onChange={() => {
                setDraft({ id: crypto.randomUUID(), answers: chooseAnswer(question.id, draft.answers, option) })
              }} />{label}
          </label>)}
        </fieldset>
        <div className="actions">
          <button className="secondary" disabled={!index} onClick={() => setIndex(index - 1)}>قبلی</button>
          <button disabled={!selections.length || (index === questions.length - 1 && !complete)}
            onClick={() => index === questions.length - 1 ? navigate('result') : setIndex(index + 1)}>
            {index === questions.length - 1 ? 'مشاهده نتیجه' : 'بعدی'}
          </button>
        </div>
      </section>}
      {page === 'result' && <section className="card">
        <h1>نتیجه اولیه</h1>
        {complete ? <>
          <p>پیش‌نمایش روتین عمومی مراقبت پوست. برای انتخاب محصولات زویتر، بررسی مشاور لازم است.</p>
          <Routine routine={routine} />
          <div className="actions">
            {session ? <button onClick={() => void save()} disabled={saving || saved === draft.id}>ذخیره پاسپورت</button>
              : <button onClick={() => {
                try { sessionStorage.setItem(pendingKey, JSON.stringify(draft)) } catch { /* Keep the in-memory draft. */ }
                navigate('account')
              }}>ورود برای ذخیره پاسپورت</button>}
            <a href="#chat">سؤال بیشتری دارید؟</a>
          </div>
          <p role="status">{status}</p>
        </> : <a href="#questions">تکمیل پرسشنامه</a>}
      </section>}
      {(page === 'account' || page === 'chat' || page === 'followups' || page === 'partners' || page === 'company') && <section>
        <h2>{({ account: 'پاسپورت من', chat: 'راهنما و مشاوره زویتر', followups: 'پیگیری مسیر روتین', partners: 'پنل نماینده / مدرس', company: 'پنل شرکت زویتر' })[page]}</h2>
        {!authReady ? <p role="status">در حال بررسی حساب…</p> : session ? <>
          <div className="actions">
            <button className="secondary" onClick={async () => {
              const { error } = await supabase!.auth.signOut()
              if (error) return setStatus('خروج انجام نشد. دوباره امتحان کنید.')
              sessionStorage.removeItem(pendingKey)
              setDraft(blankDraft)
              setSaved('')
              setIndex(0)
              setStatus('')
            }}>خروج</button>
            {complete && saved !== draft.id && <a href="#result">بازگشت برای ذخیره نتیجه</a>}
          </div>
          <p role="status">{status}</p>
          <Dashboard key={session.user.id} userId={session.user.id} section={page} />
        </> : page === 'account'
          ? <Login />
          : <p className="card" role="status">برای مشاهده این بخش وارد شوید.</p>}
      </section>}
  </VisualShell>
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.register('./sw.js').catch(() => console.warn('PWA service worker registration failed'))
}
