create schema if not exists passport_private;
revoke all on schema passport_private from public;
grant usage on schema passport_private to authenticated;

create type public.passport_role as enum ('customer', 'representative', 'consultant', 'administrator');
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text check (char_length(display_name) between 1 and 80)
);
create table public.user_roles (
  user_id uuid primary key references auth.users on delete cascade,
  role public.passport_role not null default 'customer',
  referral_code uuid not null unique default gen_random_uuid()
);
create function passport_private.new_account() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  insert into public.user_roles (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;
revoke all on function passport_private.new_account() from public;
create trigger zuyter_account_created after insert on auth.users
for each row execute function passport_private.new_account();

insert into public.profiles (id) select id from auth.users on conflict do nothing;
insert into public.user_roles (user_id) select id from auth.users on conflict do nothing;

create function passport_private.has_role(wanted public.passport_role) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.user_roles where user_id = (select auth.uid()) and role = wanted);
$$;
revoke all on function passport_private.has_role(public.passport_role) from public;
grant execute on function passport_private.has_role(public.passport_role) to authenticated;

-- Save answers and routine as one immutable snapshot so retries cannot save half a passport.
create table public.skin_assessments (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  version text not null check (version = 'draft-1'),
  answers jsonb not null check (jsonb_typeof(answers) = 'object' and octet_length(answers::text) <= 10000),
  routine jsonb not null check (jsonb_typeof(routine) = 'object' and octet_length(routine::text) <= 5000),
  created_at timestamptz not null default now()
);
create index skin_assessments_owner on public.skin_assessments (user_id, created_at desc);
create table public.skin_followups (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  day smallint not null check (day in (14, 30)),
  note text not null check (char_length(note) between 1 and 1500),
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);
create table public.consultations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null default auth.uid() references auth.users on delete cascade,
  consultant_id uuid references auth.users on delete set null,
  channel text not null check (channel in ('brand','referrer','choose')),
  question text not null check (char_length(question) between 1 and 1500),
  created_at timestamptz not null default now()
);
create index consultations_customer on public.consultations (customer_id);
create index consultations_consultant on public.consultations (consultant_id);

create table public.consultant_directory (
  user_id uuid primary key references public.user_roles on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80)
);

create table public.consultation_replies (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references public.consultations on delete cascade,
  author_id uuid not null default auth.uid() references auth.users on delete cascade,
  body text not null check (char_length(body) between 1 and 1500),
  created_at timestamptz not null default now()
);
create index consultation_replies_thread on public.consultation_replies (consultation_id, created_at);

-- Referral scans are recorded only after consent. Attribution and commissions await policy.
create table public.referral_interests (
  customer_id uuid not null default auth.uid() references auth.users on delete cascade,
  referral_code uuid not null references public.user_roles (referral_code) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (customer_id, referral_code)
);
create index referral_interests_code on public.referral_interests (referral_code);

create table public.knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  url text not null check (url ~ '^https://(www\.)?zuyter\.ir/'),
  excerpt text not null check (char_length(excerpt) between 1 and 2500),
  approved_at timestamptz
);
create table public.chat_usage (
  user_id uuid not null references auth.users on delete cascade,
  day date not null,
  requests integer not null,
  primary key (user_id, day)
);
-- A single upsert serializes concurrent requests for the daily quota.
create function public.reserve_chat_request(account uuid) returns boolean
language sql set search_path = '' as $$
  with reservation as (
    insert into public.chat_usage (user_id, day, requests) values (account, (now() at time zone 'UTC')::date, 1)
    on conflict (user_id, day) do update set requests = public.chat_usage.requests + 1
      where public.chat_usage.requests < 15
    returning 1
  ) select exists (select 1 from reservation);
$$;
revoke all on function public.reserve_chat_request(uuid) from public, anon, authenticated;
grant execute on function public.reserve_chat_request(uuid) to service_role;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.skin_assessments enable row level security;
alter table public.skin_followups enable row level security;
alter table public.consultations enable row level security;
alter table public.consultant_directory enable row level security;
alter table public.consultation_replies enable row level security;
alter table public.referral_interests enable row level security;
alter table public.knowledge_sources enable row level security;
alter table public.chat_usage enable row level security;

revoke all on public.profiles, public.user_roles, public.skin_assessments, public.skin_followups,
  public.consultations, public.consultant_directory, public.consultation_replies, public.referral_interests,
  public.knowledge_sources, public.chat_usage from public, anon, authenticated;
grant select on public.profiles, public.user_roles, public.skin_assessments, public.skin_followups,
  public.consultations, public.consultant_directory, public.consultation_replies, public.referral_interests to authenticated;
grant update (display_name) on public.profiles to authenticated;
grant update (role) on public.user_roles to authenticated;
grant insert (id, version, answers, routine) on public.skin_assessments to authenticated;
grant insert (day, note), update (note, updated_at) on public.skin_followups to authenticated;
grant insert (channel, question, consultant_id), update (consultant_id) on public.consultations to authenticated;
grant insert, update, delete on public.consultant_directory to authenticated;
grant insert (consultation_id, body) on public.consultation_replies to authenticated;
grant insert (referral_code) on public.referral_interests to authenticated;
grant select on public.knowledge_sources to service_role;
grant select, insert, update on public.chat_usage to service_role;

create policy profile_owner on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy profile_edit on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy roles_read on public.user_roles for select to authenticated
  using (user_id = (select auth.uid()) or (select passport_private.has_role('administrator')));
-- Prevent accidental demotion of the active administrator and escalation by other roles.
create policy roles_admin on public.user_roles for update to authenticated
  using (user_id <> (select auth.uid()) and (select passport_private.has_role('administrator')))
  with check (user_id <> (select auth.uid()) and (select passport_private.has_role('administrator')));
create policy assessment_read on public.skin_assessments for select to authenticated using (user_id = (select auth.uid()));
create policy assessment_save on public.skin_assessments for insert to authenticated with check (user_id = (select auth.uid()));
create policy followup_read on public.skin_followups for select to authenticated using (user_id = (select auth.uid()));
create policy followup_insert on public.skin_followups for insert to authenticated with check (user_id = (select auth.uid()));
create policy followup_edit on public.skin_followups for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy directory_read on public.consultant_directory for select to authenticated using (true);
create policy directory_manage on public.consultant_directory for all to authenticated
  using ((select passport_private.has_role('administrator')))
  with check ((select passport_private.has_role('administrator')) and exists (
    select 1 from public.user_roles r where r.user_id = consultant_directory.user_id and r.role = 'consultant'
  ));
create policy consultations_read on public.consultations for select to authenticated using (
  customer_id = (select auth.uid()) or (select passport_private.has_role('administrator'))
  or (consultant_id = (select auth.uid()) and (select passport_private.has_role('consultant')))
);
create policy consultations_open on public.consultations for insert to authenticated with check (
  customer_id = (select auth.uid()) and (
    (channel <> 'choose' and consultant_id is null)
    or (channel = 'choose' and exists (select 1 from public.consultant_directory d where d.user_id = consultant_id))
  )
);
create policy consultations_assign on public.consultations for update to authenticated
  using ((select passport_private.has_role('administrator')))
  with check ((select passport_private.has_role('administrator')) and (
    consultant_id is null or exists (select 1 from public.consultant_directory d where d.user_id = consultant_id)
  ));
create policy replies_read on public.consultation_replies for select to authenticated
  using (exists (select 1 from public.consultations c where c.id = consultation_id));
create policy replies_send on public.consultation_replies for insert to authenticated with check (
  author_id = (select auth.uid()) and exists (select 1 from public.consultations c where c.id = consultation_id)
);
create function passport_private.is_representative_code(code uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.user_roles
    where referral_code = code and role = 'representative' and user_id <> (select auth.uid()));
$$;
revoke all on function passport_private.is_representative_code(uuid) from public;
grant execute on function passport_private.is_representative_code(uuid) to authenticated;
create policy referral_record on public.referral_interests for insert to authenticated
  with check (customer_id = (select auth.uid()) and passport_private.is_representative_code(referral_code));
create policy referral_read on public.referral_interests for select to authenticated using (
  customer_id = (select auth.uid()) or (select passport_private.has_role('administrator'))
  or exists (select 1 from public.user_roles r where r.user_id = (select auth.uid())
    and r.role = 'representative' and r.referral_code = referral_interests.referral_code)
);
-- Keep the published directory in sync with role changes.
create function passport_private.remove_inactive_consultant() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.role <> 'consultant' then
    delete from public.consultant_directory where user_id = new.user_id;
  end if;
  return new;
end;
$$;
revoke all on function passport_private.remove_inactive_consultant() from public;
create trigger remove_inactive_consultant after update of role on public.user_roles
for each row when (old.role is distinct from new.role)
execute function passport_private.remove_inactive_consultant();

create table public.role_audit (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  subject_id uuid not null,
  old_role public.passport_role not null,
  new_role public.passport_role not null,
  created_at timestamptz not null default now()
);
alter table public.role_audit enable row level security;
revoke all on public.role_audit from public, anon, authenticated;
grant select on public.role_audit to authenticated;
create policy role_audit_admin on public.role_audit for select to authenticated
  using ((select passport_private.has_role('administrator')));
create function passport_private.audit_role_change() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.role_audit (actor_id, subject_id, old_role, new_role)
    values (auth.uid(), new.user_id, old.role, new.role);
  return new;
end;
$$;
revoke all on function passport_private.audit_role_change() from public;
create trigger audit_role_change after update of role on public.user_roles
for each row when (old.role is distinct from new.role)
execute function passport_private.audit_role_change();
