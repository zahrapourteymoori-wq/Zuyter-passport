import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import QRCode from 'qrcode'
import { roles, supabase } from './backend'
import type { Role } from './backend'
import { Routine } from './Routine'
import { answerSummary } from './questionnaire'
import type { Answers, draftRoutine } from './questionnaire'

type Assessment = { id: string; version: string; created_at: string; answers: Answers; routine: ReturnType<typeof draftRoutine> }
type Followup = { day: number; note: string }
type Ticket = { id: string; question: string; channel: keyof typeof channels; consultant_id: string | null }
type Reply = { id: string; consultation_id: string; body: string }
type Member = { user_id: string; role: Role }
type Consultant = { user_id: string; display_name: string }
const channels = { brand: 'متخصص زویتر', referrer: 'مشاور معرفی‌کننده', choose: 'مشاور منتخب' }
const client = () => supabase!
const errorMessage = 'عملیات انجام نشد. دوباره امتحان کنید.'

function ActionForm({ children, submit, label }: {
  children: ReactNode
  submit: (fields: FormData) => Promise<{ error: unknown }>
  label: string
}) {
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  return <form onSubmit={async event => {
    event.preventDefault()
    const form = event.currentTarget
    setBusy(true)
    setStatus('')
    try {
      const result = await submit(new FormData(form))
      setStatus(result.error ? errorMessage : 'ثبت شد.')
      if (!result.error) form.reset()
    } catch {
      setStatus(errorMessage)
    } finally {
      setBusy(false)
    }
  }}>
    {children}<button disabled={busy}>{label}</button>{status && <p role="status">{status}</p>}
  </form>
}

export function Dashboard({ userId, section }: { userId: string; section: string }) {
  const [membership, setMembership] = useState<{ role: Role; referral_code: string; is_super_admin: boolean }>()
  const [error, setError] = useState(false)
  useEffect(() => {
    let active = true
    void client().from('user_roles').select('role, referral_code, is_super_admin').eq('user_id', userId).single()
      .then(result => {
        if (!active) return
        if (result.error) setError(true)
        else setMembership(result.data)
      })
    return () => { active = false }
  }, [userId])
  if (!membership) return <p role="status">{error ? errorMessage : 'در حال دریافت داشبورد…'}</p>
  return <>
    {section === 'account' && <h3>داشبورد {roles[membership.role]}</h3>}
    {(section === 'account' || section === 'followups') && <Passport userId={userId} />}
    {section === 'partners' && (membership.role === 'representative'
      ? <Referrals code={membership.referral_code} />
      : <p className="card">این پنل برای حساب نماینده فعال است.</p>)}
    {section === 'company' && (membership.role === 'administrator'
      ? <><Administration /><SmsSettings superAdmin={membership.is_super_admin} />{membership.is_super_admin && <StagingAdmin />}</>
      : <p className="card">این پنل برای مدیر شرکت فعال است.</p>)}
    {(section === 'chat' || (section === 'company' && membership.role === 'administrator')) &&
      <Consultations role={membership.role} />}
    {section === 'chat' && <Chat />}
  </>
}

function StagingAdmin() {
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [users, setUsers] = useState<{ id: string; phone?: string; role?: Role; staging_only?: boolean; password_change_required?: boolean }[]>([])
  const refresh = async () => {
    const result = await client().functions.invoke<{ users: typeof users }>('staging-admin', { body: { action: 'list' } })
    if (result.error) setStatus(errorMessage)
    else setUsers(result.data?.users ?? [])
  }
  useEffect(() => { void refresh() }, [])
  return <section className="card"><h3>حساب‌های آزمایشی Staging</h3>
    <p className="sub">این حساب‌ها فقط برای Staging هستند و رمز اولیه هرگز در سامانه ذخیره یا نمایش داده نمی‌شود.</p>
    <form onSubmit={async event => {
      event.preventDefault(); setBusy(true); setStatus('')
      const data = new FormData(event.currentTarget)
      const result = await client().functions.invoke('staging-admin', { body: {
        action: 'create_user', phone: data.get('phone'), display_name: data.get('display_name'), role: data.get('role'), password: data.get('password'),
      } })
      setBusy(false); setStatus(result.error ? errorMessage : 'حساب تستر ساخته شد.'); if (!result.error) { event.currentTarget.reset(); await refresh() }
    }}>
      <label>شماره موبایل<input name="phone" inputMode="tel" dir="ltr" placeholder="۰۹۱۲۳۴۵۶۷۸۹" required /></label>
      <label>نام نمایشی<input name="display_name" maxLength={80} /></label>
      <label>نقش<select name="role" defaultValue="customer">{Object.entries(roles).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>رمز اولیه<input name="password" type="password" dir="ltr" minLength={10} required /></label>
      <button disabled={busy}>ساخت حساب تستر</button>{status && <p role="status">{status}</p>}
    </form>
    {users.length > 0 && <details><summary>فهرست حساب‌ها</summary><ul>{users.filter(user => user.staging_only).map(user => <li key={user.id}><bdi>{user.phone || user.id}</bdi> · {roles[user.role || 'customer']} · {user.password_change_required ? 'تغییر رمز لازم است' : 'فعال'}</li>)}</ul></details>}
  </section>
}

function SmsSettings({ superAdmin }: { superAdmin: boolean }) {
  const [settings, setSettings] = useState<{
    provider: string; connection_method: string; body_id: string | null
    sender: string | null; status: string; last_checked_at: string | null
  } | null>(null)
  const [status, setStatus] = useState('در حال بررسی تنظیمات سرویس پیامکی…')

  useEffect(() => {
    if (!superAdmin) {
      setStatus('تنظیمات Secret فقط برای مدیر اصلی قابل مدیریت است.')
      return
    }
    void client().from('sms_service_settings').select(
      'provider, connection_method, body_id, sender, status, last_checked_at'
    ).eq('id', true).maybeSingle().then(result => {
      setSettings(result.data)
      setStatus(result.error ? errorMessage : result.data ? '' : 'هنوز تنظیمی ثبت نشده است.')
    })
  }, [superAdmin])

  return <section className="card">
    <h3>تنظیمات سرویس پیامکی</h3>
    <p className="sub">ملی‌پیامک · ارسال کد ورود از Send SMS Hook</p>
    {status && <p role="status">{status}</p>}
    {settings && <dl>
      <div><dt>روش اتصال</dt><dd>{settings.connection_method === 'pattern' ? 'ارسال با پترن' : 'وب‌سرویس'}</dd></div>
      <div><dt>شناسه پترن</dt><dd>{settings.body_id || 'ثبت نشده'}</dd></div>
      <div><dt>شماره ارسال‌کننده</dt><dd>{settings.sender || 'طبق تنظیمات سرویس'}</dd></div>
      <div><dt>وضعیت</dt><dd>{({ unconfigured: 'تنظیم‌نشده', needs_review: 'نیازمند بررسی', connected: 'متصل', error: 'دارای خطا' } as Record<string, string>)[settings.status]}</dd></div>
    </dl>}
    <div className="notice info">
      نام کاربری، رمز و API Key اینجا ذخیره نمی‌شوند. آن‌ها باید فقط در Supabase Project Secrets
      قرار بگیرند و Hook سمت Auth به تابع ارسال پیامک متصل شود.
    </div>
    <p className="tiny">تست اتصال هزینه‌دار تا ثبت Secretهای سرور و تأیید مدیر اصلی فعال نمی‌شود.</p>
  </section>
}

function Passport({ userId }: { userId: string }) {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [followups, setFollowups] = useState<Followup[]>([])
  const [status, setStatus] = useState('در حال دریافت پاسپورت…')
  const code = new URLSearchParams(location.search).get('ref')
  const validCode = code && /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(code)

  useEffect(() => {
    let active = true
    void Promise.all([
      client().from('skin_assessments').select('id, version, created_at, answers, routine')
        .eq('user_id', userId).order('created_at', { ascending: false }).limit(12),
      client().from('skin_followups').select('day, note').eq('user_id', userId),
    ]).then(([passport, notes]) => {
      if (!active) return
      setStatus(passport.error || notes.error ? errorMessage : '')
      setAssessments(passport.data ?? [])
      setFollowups(notes.data ?? [])
    })
    return () => { active = false }
  }, [userId])

  return <section className="card">
    <h3>پاسپورت و پیگیری پوست</h3>
    {status && <p role="status">{status}</p>}
    {!status && !assessments.length && <p>هنوز پاسپورتی ذخیره نشده است.</p>}
    {assessments.map((assessment, index) => <details key={assessment.id} open={index === 0}>
      <summary>نتیجه {new Date(assessment.created_at).toLocaleDateString('fa-IR')}</summary>
      <Routine routine={assessment.routine} />
      <details><summary>مرور پاسخ‌ها</summary>
        <dl>{answerSummary(assessment.answers, assessment.version).map(question =>
          <div key={question.id}><dt>{question.label}</dt><dd>{question.values?.join('، ')}</dd></div>
        )}</dl>
      </details>
    </details>)}
    <div className="actions"><a href="#questions">ارزیابی مجدد</a><a href="https://zuyter.ir/">فروشگاه زویتر</a></div>
    {assessments.length > 0 && <div className="columns">
      {[14, 30].map(day => <ActionForm key={day} label="ذخیره یادداشت" submit={async fields => {
        const note = String(fields.get('note')).trim()
        if (!note) return { error: true }
        const updated_at = new Date().toISOString()
        const previous = followups.some(item => item.day === day)
        let result = previous
          ? await client().from('skin_followups').update({ note, updated_at }).eq('user_id', userId).eq('day', day)
          : await client().from('skin_followups').insert({ day, note })
        if (result.error?.code === '23505') {
          result = await client().from('skin_followups').update({ note, updated_at }).eq('user_id', userId).eq('day', day)
        }
        if (!result.error) setFollowups(items => [...items.filter(item => item.day !== day), { day, note }])
        return result
      }}>
        <label>یادداشت روز {day.toLocaleString('fa-IR')}
          <textarea key={followups.find(item => item.day === day)?.note} name="note" maxLength={1500} required
            defaultValue={followups.find(item => item.day === day)?.note} />
        </label>
      </ActionForm>)}
    </div>}
    {validCode && <ActionForm label="ثبت معرفی" submit={async () => {
      const result = await client().from('referral_interests').insert({ referral_code: code })
      return { error: result.error?.code === '23505' ? null : result.error }
    }}>
      <label><input type="checkbox" required /> با ثبت ارتباط با نماینده معرفی‌کننده موافقم.</label>
    </ActionForm>}
  </section>
}

function Referrals({ code }: { code: string }) {
  const [image, setImage] = useState('')
  const [count, setCount] = useState<number | null>(null)
  const [error, setError] = useState(false)
  const url = new URL(location.pathname, location.origin)
  url.searchParams.set('ref', code)
  const link = url.href
  useEffect(() => {
    void QRCode.toDataURL(link, { width: 200, margin: 3 }).then(setImage).catch(() => setError(true))
    void client().from('referral_interests').select('created_at', { count: 'exact', head: true })
      .eq('referral_code', code).then(result => {
        if (result.error) setError(true)
        else setCount(result.count)
      })
  }, [code, link])
  return <section className="card">
    <h3>معرفی مشتری</h3>
    <a className="break" dir="ltr" href={link}>{link}</a>
    {image && <p><img src={image} alt="QR لینک معرفی نماینده" width="200" height="200" /></p>}
    {count !== null && <p>معرفی‌های ثبت‌شده با رضایت مشتری: {count.toLocaleString('fa-IR')}</p>}
    {error && <p role="status">{errorMessage}</p>}
    <p>سفارش‌ها و پورسانت پس از اتصال فروشگاه و تأیید قوانین نمایش داده می‌شوند.</p>
  </section>
}

function Administration() {
  const [members, setMembers] = useState<Member[]>([])
  const [status, setStatus] = useState('')
  async function refresh() {
    const result = await client().from('user_roles').select('user_id, role').order('user_id').limit(100)
    setMembers(result.data ?? [])
    setStatus(result.error ? errorMessage : '')
  }
  useEffect(() => { void refresh() }, [])
  return <section className="card">
    <h3>مدیریت نقش‌ها</h3>
    {status && <p role="status">{status}</p>}
    <details><summary>شناسه و نقش حساب‌ها</summary>
      <ul>{members.map(member => <li key={member.user_id}><bdi>{member.user_id}</bdi> · {roles[member.role]}</li>)}</ul>
    </details>
    <ActionForm label="تغییر نقش" submit={async fields => {
      const result = await client().from('user_roles').update({ role: fields.get('role') })
        .eq('user_id', fields.get('user')).select('user_id').single()
      if (!result.error) await refresh()
      return result
    }}>
      <label>شناسه حساب<input name="user" dir="ltr" required /></label>
      <label>نقش<select name="role">{Object.entries(roles).map(([role, label]) =>
        <option key={role} value={role}>{label}</option>)}</select></label>
    </ActionForm>
    <ActionForm label="ثبت مشاور در فهرست" submit={async fields => {
      const result = await client().from('consultant_directory').upsert({
        user_id: fields.get('user'), display_name: String(fields.get('name')).trim(),
      })
      if (!result.error) window.dispatchEvent(new Event('consultant-directory-change'))
      return result
    }}>
      <label>شناسه حساب مشاور<input name="user" dir="ltr" required /></label>
      <label>نام نمایشی<input name="name" maxLength={80} required /></label>
    </ActionForm>
  </section>
}

function Consultations({ role }: { role: Role }) {
  const [directory, setDirectory] = useState<Consultant[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [replies, setReplies] = useState<Reply[]>([])
  const [status, setStatus] = useState('')
  const [channel, setChannel] = useState<keyof typeof channels>('brand')
  async function refresh() {
    const [people, conversations] = await Promise.all([
      client().from('consultant_directory').select('user_id, display_name').order('display_name'),
      client().from('consultations').select('id, question, channel, consultant_id').order('created_at', { ascending: false }).limit(30),
    ])
    const ids = (conversations.data ?? []).map(ticket => ticket.id)
    const messages = ids.length ? await client().from('consultation_replies').select('id, consultation_id, body')
      .in('consultation_id', ids).order('created_at') : { data: [], error: null }
    setStatus(people.error || conversations.error || messages.error ? errorMessage : '')
    setDirectory(people.data ?? [])
    setTickets(conversations.data ?? [])
    setReplies(messages.data ?? [])
  }
  useEffect(() => {
    const update = () => { void refresh() }
    update()
    window.addEventListener('consultant-directory-change', update)
    return () => window.removeEventListener('consultant-directory-change', update)
  }, [])
  const consultantOptions = directory.map(person =>
    <option key={person.user_id} value={person.user_id}>{person.display_name}</option>)
  return <section className="card">
    <h3>مشاوره با زویتر</h3>
    {status && <p role="status">{status}</p>}
    <ActionForm label="ارسال درخواست" submit={async fields => {
      const result = await client().from('consultations').insert({
        channel,
        question: String(fields.get('question')).trim(),
        consultant_id: channel === 'choose' ? fields.get('consultant') : null,
      })
      if (!result.error) { setChannel('brand'); await refresh() }
      return result
    }}>
      <label>مسیر مشاوره<select value={channel} onChange={event => setChannel(event.target.value as keyof typeof channels)}>
        {Object.entries(channels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select></label>
      {channel === 'referrer' && <p>درخواست برای بررسی و ارجاع به تیم زویتر ارسال می‌شود.</p>}
      {channel === 'choose' && <label>مشاور<select name="consultant" required><option value="">انتخاب کنید</option>
        {consultantOptions}</select></label>}
      <label>سؤال<textarea name="question" maxLength={1500} required /></label>
      <p>با ارسال سؤال، متن آن با تیم پشتیبانی و مشاور تعیین‌شده به اشتراک گذاشته می‌شود.</p>
    </ActionForm>
    {tickets.map(ticket => <details key={ticket.id} className="card">
      <summary>{channels[ticket.channel]} · {ticket.question.slice(0, 60)}</summary>
      <p>{ticket.question}</p>
      {replies.filter(reply => reply.consultation_id === ticket.id).map(reply => <p key={reply.id}>{reply.body}</p>)}
      <ActionForm label="ارسال پیام" submit={async fields => {
        const result = await client().from('consultation_replies').insert({
          consultation_id: ticket.id, body: String(fields.get('reply')).trim(),
        })
        if (!result.error) await refresh()
        return result
      }}><label>پیام<textarea name="reply" maxLength={1500} required /></label></ActionForm>
      {role === 'administrator' && <ActionForm label="ارجاع" submit={async fields => {
        const result = await client().from('consultations').update({ consultant_id: fields.get('consultant') || null })
          .eq('id', ticket.id).select('id').single()
        if (!result.error) await refresh()
        return result
      }}>
        <label>ارجاع به<select name="consultant" defaultValue={ticket.consultant_id ?? ''}>
          <option value="">بدون مشاور</option>{consultantOptions}
        </select></label>
      </ActionForm>}
    </details>)}
  </section>
}

type ChatAnswer = { answer: string; sources: { title: string; url: string }[] }
function Chat() {
  const [answers, setAnswers] = useState<{ question: string; response: ChatAnswer }[]>([])
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  return <section className="card">
    <h3>دستیار اطلاعات محصولات زویتر</h3>
    <p>متن سؤال برای پردازش به AvalAI فرستاده می‌شود. اطلاعات شخصی، عکس یا شرح وضعیت پزشکی وارد نکنید.</p>
    {answers.map(({ question, response }, index) => <article className="card" key={index}>
      <h4>{question}</h4><p>{response.answer}</p>
      {response.sources.map(source => <p key={source.url}><a href={source.url}>{source.title}</a></p>)}
    </article>)}
    <form onSubmit={async event => {
      event.preventDefault()
      const form = event.currentTarget
      const question = String(new FormData(form).get('question')).trim()
      if (!question) return
      setBusy(true)
      setStatus('')
      try {
        const { data, error } = await client().functions.invoke<ChatAnswer>('zuyter-chat', { body: { question } })
        if (error || !data) return setStatus('دستیار فعلاً در دسترس نیست یا سقف درخواست‌های امروز پر شده است.')
        setAnswers(items => [...items, { question, response: data }].slice(-15))
        form.reset()
      } catch {
        setStatus(errorMessage)
      } finally {
        setBusy(false)
      }
    }}>
      <label>سؤال درباره محصولات<textarea name="question" maxLength={500} required /></label>
      <button disabled={busy}>{busy ? 'در حال بررسی…' : 'ارسال سؤال'}</button>
      {status && <p role="status">{status}</p>}
    </form>
  </section>
}
