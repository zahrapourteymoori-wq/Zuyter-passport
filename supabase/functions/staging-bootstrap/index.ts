import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const existing = await admin.from('user_roles').select('user_id').eq('is_super_admin', true).maybeSingle()
  if (existing.data?.user_id) return new Response(JSON.stringify({ error: 'bootstrap_closed' }), { status: 403, headers: { ...cors, 'Content-Type': 'application/json' } })
  const body = await req.json().catch(() => ({}))
  const password = typeof body.password === 'string' ? body.password : ''
  if (password.length < 8) return new Response(JSON.stringify({ error: 'رمز باید حداقل ۸ نویسه باشد.' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
  const created = await admin.auth.admin.createUser({ email: 'staging-09122177919@zuyter.invalid', password, email_confirm: true, user_metadata: { staging_phone: '09122177919' } })
  if (created.error || !created.data.user) return new Response(JSON.stringify({ error: 'ساخت حساب انجام نشد.' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
  const id = created.data.user.id
  await admin.from('profiles').update({ display_name: 'مدیر اصلی آزمایشی', password_change_required: true, staging_only: true }).eq('id', id)
  await admin.from('user_roles').update({ role: 'administrator', is_super_admin: true }).eq('user_id', id)
  return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, 'Content-Type': 'application/json' } })
})
