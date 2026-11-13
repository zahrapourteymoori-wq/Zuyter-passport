import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import type { Session } from '@supabase/supabase-js'
import { loginReturn, supabase } from './backend'
import { activeQuestions, cleanAnswers, draftRoutine } from './questionnaire'
import type { Answers } from './questionnaire'
import { Dashboard } from './dashboard'
import { Routine } from './Routine'
import './style.css'

const routes = ['home', 'questions', 'result', 'account'] as const
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

const pendingKey = 'zuyter-pending-passport'
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
      id: draft.id, version: 'draft-1', answers: cleanAnswers(draft.answers), routine,
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

  return <div className="shell">
    <aside><a className="brand" href="#home">زویتر</a><p>پاسپورت پوستی</p>
      <nav aria-label="منوی اصلی">
        <a href="#home" aria-current={page === 'home' ? 'page' : undefined}>خانه</a>
        <a href="#questions" aria-current={page === 'questions' ? 'page' : undefined}>پرسشنامه</a>
        <a href="#account" aria-current={page === 'account' ? 'page' : undefined}>حساب من</a>
      </nav>
    </aside>
    <main>
      {page === 'home' && <section className="card intro">
        <h1>پاسپورت پوستی زویتر</h1>
        <p>با پاسخ به چند سؤال، الگوی اولیه پوست و مراحل روتین صبح و شب را ببینید.</p>
        <button onClick={() => navigate('questions')}>شروع پرسشنامه</button>
      </section>}
      {page === 'questions' && <section className="card">
        <h1>پرسشنامه پوستی</h1>
        <p>سؤال {(index + 1).toLocaleString('fa-IR')} از {questions.length.toLocaleString('fa-IR')}</p>
        <fieldset key={question.id}>
          <legend>{question.label}</legend>
          {question.options.map(option => <label className="choice" key={option}>
            <input type={question.multiple ? 'checkbox' : 'radio'} name={question.id}
              checked={selections.includes(option)} onChange={() => {
                const values = question.multiple
                  ? selections.includes(option) ? selections.filter(value => value !== option) : [...selections, option]
                  : [option]
                setDraft({ id: crypto.randomUUID(), answers: cleanAnswers({ ...draft.answers, [question.id]: values }) })
              }} />{option}
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
            <a href="#account">سؤال بیشتری دارید؟</a>
          </div>
          <p role="status">{status}</p>
        </> : <a href="#questions">تکمیل پرسشنامه</a>}
      </section>}
      {page === 'account' && <section>
        <h1>حساب من</h1>
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
          <Dashboard key={session.user.id} userId={session.user.id} />
        </> : <Login />}
      </section>}
    </main>
  </div>
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.register('./sw.js').catch(() => console.warn('PWA service worker registration failed'))
}
