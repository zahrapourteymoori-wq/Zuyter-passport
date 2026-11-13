-- Secrets stay in Supabase project secrets. This table stores only non-sensitive
-- connection metadata and the last health state shown in the admin panel.
alter table public.user_roles add column if not exists is_super_admin boolean not null default false;

create table if not exists public.sms_service_settings (
  id boolean primary key default true check (id),
  provider text not null default 'melipayamak' check (provider = 'melipayamak'),
  connection_method text not null default 'pattern' check (connection_method in ('pattern', 'webservice')),
  body_id text check (body_id is null or char_length(body_id) between 1 and 80),
  sender text check (sender is null or char_length(sender) between 1 and 40),
  status text not null default 'unconfigured' check (status in ('unconfigured', 'needs_review', 'connected', 'error')),
  last_checked_at timestamptz,
  last_error text check (last_error is null or char_length(last_error) <= 500),
  updated_by uuid references auth.users on delete set null,
  updated_at timestamptz not null default now()
);
alter table public.sms_service_settings enable row level security;
revoke all on public.sms_service_settings from public, anon, authenticated;
grant select, insert, update on public.sms_service_settings to authenticated;

create function passport_private.is_super_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid()) and role = 'administrator' and is_super_admin
  );
$$;
revoke all on function passport_private.is_super_admin() from public;
grant execute on function passport_private.is_super_admin() to authenticated;

drop policy if exists roles_admin on public.user_roles;
create policy roles_admin on public.user_roles for update to authenticated
  using (
    user_id <> (select auth.uid())
    and (select passport_private.is_super_admin())
  )
  with check (
    user_id <> (select auth.uid())
    and (select passport_private.is_super_admin())
  );

create policy sms_settings_read on public.sms_service_settings for select to authenticated
  using ((select passport_private.is_super_admin()));
create policy sms_settings_write on public.sms_service_settings for insert to authenticated
  with check ((select passport_private.is_super_admin()) and updated_by = (select auth.uid()));
create policy sms_settings_update on public.sms_service_settings for update to authenticated
  using ((select passport_private.is_super_admin()))
  with check ((select passport_private.is_super_admin()) and updated_by = (select auth.uid()));
