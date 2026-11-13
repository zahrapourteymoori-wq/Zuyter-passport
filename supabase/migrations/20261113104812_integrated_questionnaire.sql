alter table public.skin_assessments drop constraint skin_assessments_version_check, add constraint skin_assessments_version_check check (version in ('draft-1', 'integrated-1'));
