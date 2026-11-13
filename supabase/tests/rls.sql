begin;
insert into auth.users (id, email) values
  ('11111111-1111-4111-8111-111111111111','owner-smoke@invalid.example'),
  ('22222222-2222-4222-8222-222222222222','other-smoke@invalid.example'),
  ('33333333-3333-4333-8333-333333333333','consultant-smoke@invalid.example'),
  ('44444444-4444-4444-8444-444444444444','admin-smoke@invalid.example');

update public.user_roles set role = 'consultant' where user_id = '33333333-3333-4333-8333-333333333333';
update public.user_roles set role = 'administrator' where user_id = '44444444-4444-4444-8444-444444444444';
insert into public.consultant_directory values ('33333333-3333-4333-8333-333333333333', 'Smoke consultant');
set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
insert into public.skin_assessments (id, version, answers, routine)
  values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'draft-1', '{}', '{}');
insert into public.consultations (channel, question, consultant_id)
  values ('choose', 'Smoke test consultation', '33333333-3333-4333-8333-333333333333');

do $$
begin
  if not exists (select from public.skin_assessments where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') then
    raise exception 'Owner could not read own passport';
  end if;
  update public.user_roles set role = 'administrator' where user_id = auth.uid();
  if found then raise exception 'Customer promoted own account'; end if;
  begin
    perform * from public.knowledge_sources;
    raise exception 'Customer could read source table';
  exception when insufficient_privilege then null;
  end;
end;
$$;
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
do $$
begin
  if exists (select from public.skin_assessments where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')
    or exists (select from public.consultations where question = 'Smoke test consultation') then
    raise exception 'Another customer could read private data';
  end if;
end;
$$;
select set_config('request.jwt.claim.sub', '33333333-3333-4333-8333-333333333333', true);
do $$
begin
  if not exists (select from public.consultations where question = 'Smoke test consultation')
    or exists (select from public.skin_assessments where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') then
    raise exception 'Consultant access is incorrect';
  end if;
end;
$$;
select set_config('request.jwt.claim.sub', '44444444-4444-4444-8444-444444444444', true);
update public.user_roles set role = 'customer' where user_id = '33333333-3333-4333-8333-333333333333';
do $$
begin
  if exists (select from public.consultant_directory where user_id = '33333333-3333-4333-8333-333333333333')
    or not exists (select from public.role_audit where actor_id = auth.uid() and new_role = 'customer') then
    raise exception 'Role change was not reflected in directory or audit';
  end if;
end;
$$;
rollback;
