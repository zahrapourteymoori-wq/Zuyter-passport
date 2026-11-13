-- Staging-only password accounts and server-validated admin permissions.
alter table public.profiles
  add column if not exists password_change_required boolean not null default false,
  add column if not exists staging_only boolean not null default false;

create table if not exists public.admin_permissions (
  user_id uuid references auth.users(id) on delete cascade not null,
  permission text not null check (permission in ('manage_users', 'manage_roles', 'manage_permissions', 'manage_sms_settings')),
  granted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, permission)
);
alter table public.admin_permissions enable row level security;
revoke all on public.admin_permissions from public, anon, authenticated;
grant select, insert, delete on public.admin_permissions to authenticated;

create or replace function passport_private.has_admin_permission(required_permission text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid()) and role = 'administrator' and is_super_admin
  ) or exists (
    select 1 from public.admin_permissions
    where user_id = (select auth.uid()) and permission = required_permission
  );
$$;
revoke all on function passport_private.has_admin_permission(text) from public;
grant execute on function passport_private.has_admin_permission(text) to authenticated;

create policy admin_permissions_read on public.admin_permissions for select to authenticated
  using ((select passport_private.is_super_admin()) or user_id = (select auth.uid()));
create policy admin_permissions_write on public.admin_permissions for insert to authenticated
  with check ((select passport_private.is_super_admin()) and granted_by = (select auth.uid()));
create policy admin_permissions_delete on public.admin_permissions for delete to authenticated
  using ((select passport_private.is_super_admin()));

-- A user can only edit their display name through PostgREST. Password flags are
-- changed by the staging Edge Function after a successful password update.
drop policy if exists profiles_owner_update on public.profiles;
create policy profiles_owner_update on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists roles_admin on public.user_roles;
create policy roles_admin on public.user_roles for update to authenticated
  using (user_id <> (select auth.uid()) and (select passport_private.has_admin_permission('manage_roles')))
  with check (user_id <> (select auth.uid()) and (select passport_private.has_admin_permission('manage_roles')));
