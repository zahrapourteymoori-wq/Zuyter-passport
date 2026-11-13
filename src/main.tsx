import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import type { Session } from '@supabase/supabase-js'
import { loginReturn, supabase } from './backend'
import { activeQuestions, chooseAnswer, cleanAnswers, draftRoutine } from './questionnaire'
import type { Answers } from './questionnaire'
import { Dashboard } from './dashboard'
import { Routine } from './Routine'
import { Landing } from './Landing'
import { VisualShell } from './VisualShell'
import './style.css'

const routes = ['home', 'questions', 'result', 'account', 'chat', 'followups', 'partners', 'company', 'settings'] as const
type Page = typeof routes[number]

function currentPage(): Page {
  const hash = location.hash.slice(1)
  return routes.find(page => page === hash) ?? 'home'
}

function Login() {
  const [signup, setSignup] = useState(false)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  if (!supabase) return <p role="status">اتصال حساب کاربری هنوز پیکربندی نشده است.</p>
  const client = supabase
  return <form onSubmit={async event => {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const email = String(fields.get('email'))
    const password = String(fields.get('password'))
    setBusy(true)
    try {
      const { error, data } = signup
        ? await client.auth.signUp({ email, password, options: { emailRedirectTo: loginReturn() } })
        : await client.auth.signInWithPassword({ email, password })
      setMessage(error ? 'ورود یا ثبت‌نام انجام نشد. ایمیل و گذرواژه را بررسی کنید.'
        : data.session ? 'وارد شدید.' : 'برای فعال‌سازی حساب، ایمیل خود را بررسی کنید.')
    } catch {
      setMessage('ارتباط برقرار نشد. دوباره امتحان کنید.')
    } finally {
      setBusy(false)
    }
  }}>
    <label>ایمیل<input name="email" type="email" dir="ltr" autoComplete="email" required /></label>
    <label>گذرواژه<input name="password" type="password" dir="ltr" minLength={8}
      autoComplete={signup ? 'new-password' : 'current-password'} required /></label>
    <div className="actions">
      <button disabled={busy}>{signup ? 'ساخت حساب' : 'ورود'}</button>
      <button type="button" className="secondary" onClick={() => { setSignup(!signup); setMessage('') }}>
        {signup ? 'حساب دارم' : 'ثبت‌نام'}
      </button>
    </div>
    <p role="status">{message}</p>
  </form>
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
      setAuthReady(true)
      if (event === 'SIGNED_IN' && location.hash === '') location.hash = 'account'
    })
    return () => { window.removeEventListener('hashchange', handle); listener?.data.subscription.unsubscribe() }
  }, [])

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

  return <VisualShell page={page}>
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
      {page === 'settings' && <section className="card">
        <h2>حریم خصوصی و تنظیمات</h2>
        <p>پاسپورت فقط پس از ورود و انتخاب «ذخیره پاسپورت» در حساب شما ثبت می‌شود.</p>
        <p>عکس پوست و پیامک در این نسخه فعال نیستند. متن سؤال دستیار برای پردازش به AvalAI ارسال می‌شود.</p>
        <a href="#account">مدیریت حساب</a>
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
        </> : <Login />}
      </section>}
  </VisualShell>
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.register('./sw.js').catch(() => console.warn('PWA service worker registration failed'))
}
