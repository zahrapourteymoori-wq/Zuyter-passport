import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
const roles = new Set(['customer', 'representative', 'consultant', 'administrator'])
const permissions = new Set(['manage_users', 'manage_roles', 'manage_permissions', 'manage_sms_settings'])
function phone(value: unknown) {
  const raw = String(value ?? '').replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/\s|-/g, '')
  if (!/^09\d{9}$/.test(raw)) return null
  return `+98${raw.slice(1)}`
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return json({ error: 'ورود لازم است.' }, 401)
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const authUser = await admin.auth.getUser(token)
  if (authUser.error || !authUser.data.user) return json({ error: 'نشست معتبر نیست.' }, 401)
  const actor = await admin.from('user_roles').select('role, is_super_admin').eq('user_id', authUser.data.user.id).single()
  if (actor.error || actor.data?.role !== 'administrator' || !actor.data.is_super_admin) return json({ error: 'فقط مدیر اصلی مجاز است.' }, 403)
  const body = await req.json().catch(() => ({}))
  const action = String(body.action ?? '')
  if (action === 'list') {
    const users = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
    const roleRows = await admin.from('user_roles').select('user_id, role, is_super_admin')
    const profiles = await admin.from('profiles').select('id, display_name, password_change_required, staging_only')
    const roleMap = new Map((roleRows.data ?? []).map(row => [row.user_id, row]))
    const profileMap = new Map((profiles.data ?? []).map(row => [row.id, row]))
    return json({ users: (users.data.users ?? []).map(user => ({ id: user.id, phone: user.phone, created_at: user.created_at, ...(roleMap.get(user.id) ?? {}), ...(profileMap.get(user.id) ?? {}) })) })
  }
  if (action === 'create_user') {
    const mobile = phone(body.phone)
    const password = String(body.password ?? '')
    const role = String(body.role ?? 'customer')
    if (!mobile || password.length < 10 || !roles.has(role)) return json({ error: 'شماره، رمز یا نقش معتبر نیست.' }, 400)
    const created = await admin.auth.admin.createUser({ email: `staging-${mobile.slice(1)}@zuyter.invalid`, password, email_confirm: true, user_metadata: { staging_phone: mobile.slice(1) } })
    if (created.error || !created.data.user) return json({ error: 'ساخت حساب انجام نشد.' }, 400)
    const id = created.data.user.id
    await admin.from('profiles').update({ display_name: String(body.display_name ?? '').trim() || null, password_change_required: true, staging_only: true }).eq('id', id)
    await admin.from('user_roles').update({ role, is_super_admin: false }).eq('user_id', id)
    if (Array.isArray(body.permissions)) {
      const rows = body.permissions.filter((p: unknown) => permissions.has(String(p))).map((permission: string) => ({ user_id: id, permission, granted_by: authUser.data.user!.id }))
      if (rows.length) await admin.from('admin_permissions').upsert(rows)
    }
    return json({ ok: true, user_id: id })
  }
  const target = String(body.user_id ?? '')
  if (!target) return json({ error: 'شناسه حساب لازم است.' }, 400)
  if (action === 'reset_password') {
    const password = String(body.password ?? '')
    if (password.length < 10) return json({ error: 'رمز عبور باید حداقل ۱۰ نویسه باشد.' }, 400)
    const updated = await admin.auth.admin.updateUserById(target, { password })
    if (updated.error) return json({ error: 'تغییر رمز انجام نشد.' }, 400)
    await admin.from('profiles').update({ password_change_required: true, staging_only: true }).eq('id', target)
    return json({ ok: true })
  }
  if (action === 'set_role') {
    const role = String(body.role ?? '')
    if (!roles.has(role)) return json({ error: 'نقش معتبر نیست.' }, 400)
    const result = await admin.from('user_roles').update({ role, is_super_admin: false }).eq('user_id', target)
    return result.error ? json({ error: 'تغییر نقش انجام نشد.' }, 400) : json({ ok: true })
  }
  if (action === 'set_permissions') {
    const selected = Array.isArray(body.permissions) ? body.permissions.filter((p: unknown) => permissions.has(String(p))) : []
    await admin.from('admin_permissions').delete().eq('user_id', target)
    if (selected.length) await admin.from('admin_permissions').insert(selected.map((permission: string) => ({ user_id: target, permission, granted_by: authUser.data.user!.id })))
    return json({ ok: true })
  }
  return json({ error: 'عملیات ناشناخته است.' }, 400)
})
