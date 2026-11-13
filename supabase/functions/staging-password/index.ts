import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return json({ error: 'ورود لازم است.' }, 401)
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const userResult = await admin.auth.getUser(token)
  if (userResult.error || !userResult.data.user) return json({ error: 'نشست معتبر نیست.' }, 401)
  const user = userResult.data.user
  const body = await req.json().catch(() => ({}))
  const password = typeof body.password === 'string' ? body.password : ''
  if (password.length < 10) return json({ error: 'رمز عبور باید حداقل ۱۰ نویسه باشد.' }, 400)
  const profile = await admin.from('profiles').select('password_change_required, staging_only').eq('id', user.id).single()
  if (profile.error || !profile.data?.password_change_required) return json({ error: 'تغییر رمز برای این حساب لازم نیست.' }, 400)
  const updated = await admin.auth.admin.updateUserById(user.id, { password })
  if (updated.error) return json({ error: 'تغییر رمز انجام نشد.' }, 400)
  await admin.from('profiles').update({ password_change_required: false }).eq('id', user.id)
  return json({ ok: true })
})
