begin;
create table if not exists public.portfolio_editors (
  user_id uuid primary key references auth.users(id) on delete cascade
);
create table if not exists public.portfolio_content (
  id text primary key check (id = 'main'),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  reviewed_by_pastor boolean not null default false,
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz,
  check ((reviewed_by_pastor and reviewed_at is not null) or (not reviewed_by_pastor and reviewed_at is null))
);
alter table public.portfolio_editors enable row level security;
alter table public.portfolio_content enable row level security;
revoke all on public.portfolio_editors, public.portfolio_content from anon, authenticated;
grant select on public.portfolio_editors to authenticated;
grant select on public.portfolio_content to anon, authenticated;
drop policy if exists own_editor_membership on public.portfolio_editors;
create policy own_editor_membership on public.portfolio_editors for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists public_content_read on public.portfolio_content;
create policy public_content_read on public.portfolio_content for select to anon, authenticated using (id = 'main');

-- No application role can insert/update/delete directly. This function is the
-- only write path, and independently authorises its caller and checks revisions.
create or replace function public.save_portfolio_content(p_payload jsonb, p_expected_revision bigint, p_reviewed boolean default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare current_row public.portfolio_content; result_row public.portfolio_content; value_row record; board jsonb; profile_value jsonb; k text; ids text[] := array['leadership','teaching','discipleship','evangelism']; i int;
begin
  if auth.uid() is null or not exists (select 1 from public.portfolio_editors where user_id = auth.uid()) then
    raise exception 'Editor access required' using errcode = '42501';
  end if;
  if p_payload is null or octet_length(p_payload::text) > 64000 or jsonb_typeof(p_payload) <> 'object'
     or (select count(*) from jsonb_object_keys(p_payload)) <> 2
     or jsonb_typeof(p_payload->'profile') is distinct from 'object'
     or jsonb_typeof(p_payload->'stations') is distinct from 'array' then
    raise exception 'Invalid payload' using errcode = '22023';
  end if;
  profile_value := p_payload->'profile';
  if (select count(*) from jsonb_object_keys(profile_value)) <> 15 or not profile_value ?& array['name','descriptor','church','location','districtRole','education','biography','ministryFocus','works','invitations','social','milestones','resourceShelves','reflectionCategories','leadershipModules'] then
    raise exception 'Invalid profile keys' using errcode = '22023';
  end if;
  foreach k in array array['name','descriptor','church','location','districtRole','education'] loop
    if jsonb_typeof(profile_value->k) is distinct from 'string' then raise exception 'Invalid profile field' using errcode='22023'; end if;
    if length(profile_value->>k) > (case k when 'name' then 100 when 'descriptor' then 240 when 'church' then 160 when 'location' then 160 when 'districtRole' then 400 else 300 end) then raise exception 'Profile field too long' using errcode='22023'; end if;
  end loop;
  foreach k in array array['biography','ministryFocus','resourceShelves','reflectionCategories','leadershipModules','works','milestones'] loop
    if jsonb_typeof(profile_value->k) is distinct from 'array' then raise exception 'Invalid list' using errcode='22023'; end if;
    if jsonb_array_length(profile_value->k) not between 1 and 20 then raise exception 'Invalid list size' using errcode='22023'; end if;
  end loop;
  if jsonb_array_length(profile_value->'works') <> 3 or jsonb_array_length(profile_value->'milestones') > 12 then raise exception 'Invalid list size' using errcode='22023'; end if;
  foreach k in array array['invitations','social'] loop
    if jsonb_typeof(profile_value->k) is distinct from 'object' then raise exception 'Invalid profile object' using errcode='22023'; end if;
  end loop;
  foreach k in array array['biography','ministryFocus','resourceShelves','reflectionCategories','leadershipModules'] loop
    for value_row in select value from jsonb_array_elements(profile_value->k) loop
      if jsonb_typeof(value_row.value) is distinct from 'string' or length(value_row.value#>>'{}') > (case k when 'biography' then 2000 when 'ministryFocus' then 300 else 150 end) then raise exception 'Invalid list item' using errcode='22023'; end if;
    end loop;
  end loop;
  for value_row in select value from jsonb_array_elements(profile_value->'works') loop
    if jsonb_typeof(value_row.value) is distinct from 'object' then raise exception 'Invalid work' using errcode='22023'; end if;
    if (select count(*) from jsonb_object_keys(value_row.value)) <> 3 or not value_row.value ?& array['title','type','description'] then raise exception 'Invalid work fields' using errcode='22023'; end if;
    foreach k in array array['title','type','description'] loop
      if jsonb_typeof(value_row.value->k) is distinct from 'string' or length(value_row.value->>k) > (case k when 'title' then 200 when 'type' then 100 else 1200 end) then raise exception 'Invalid work text' using errcode='22023'; end if;
    end loop;
  end loop;
  for value_row in select value from jsonb_array_elements(profile_value->'milestones') loop
    if jsonb_typeof(value_row.value) is distinct from 'object' then raise exception 'Invalid milestone' using errcode='22023'; end if;
    if (select count(*) from jsonb_object_keys(value_row.value)) <> 2 or not value_row.value ?& array['title','detail'] or jsonb_typeof(value_row.value->'title') is distinct from 'string' or jsonb_typeof(value_row.value->'detail') is distinct from 'string' or length(value_row.value->>'title')>200 or length(value_row.value->>'detail')>500 then raise exception 'Invalid milestone fields' using errcode='22023'; end if;
  end loop;
  if (select count(*) from jsonb_object_keys(profile_value->'invitations')) <> 2 or not (profile_value->'invitations') ?& array['intro','include'] or jsonb_typeof(profile_value->'invitations'->'intro') is distinct from 'string' or length(profile_value->'invitations'->>'intro')>1500 or jsonb_typeof(profile_value->'invitations'->'include') is distinct from 'array' then raise exception 'Invalid invitations' using errcode='22023'; end if;
  if jsonb_array_length(profile_value->'invitations'->'include') not between 1 and 20 then raise exception 'Invalid invitation list' using errcode='22023'; end if;
  for value_row in select value from jsonb_array_elements(profile_value->'invitations'->'include') loop
    if jsonb_typeof(value_row.value) is distinct from 'string' or length(value_row.value#>>'{}')>100 then raise exception 'Invalid invitation item' using errcode='22023'; end if;
  end loop;
  if (select count(*) from jsonb_object_keys(profile_value->'social')) <> 4 or not (profile_value->'social') ?& array['facebookProfile','facebookShare','instagram','instagramHandle'] then raise exception 'Invalid social fields' using errcode='22023'; end if;
  foreach k in array array['facebookProfile','facebookShare','instagram','instagramHandle'] loop
    if jsonb_typeof(profile_value->'social'->k) is distinct from 'string' or length(profile_value->'social'->>k) > (case k when 'instagramHandle' then 100 else 500 end) then raise exception 'Invalid social text' using errcode='22023'; end if;
    if k <> 'instagramHandle' and (profile_value->'social'->>k) !~ '^https://[^/@[:space:]]+([/?#]|$)' then raise exception 'HTTPS links without credentials required' using errcode='22023'; end if;
  end loop;
  if jsonb_array_length(p_payload->'stations') <> 4 then raise exception 'Exactly four boards required' using errcode='22023'; end if;
  for i in 0..3 loop
    board := p_payload->'stations'->i;
    if jsonb_typeof(board) is distinct from 'object' then raise exception 'Invalid board' using errcode='22023'; end if;
    if (select count(*) from jsonb_object_keys(board)) <> 4 or not board ?& array['id','title','lines','meaning'] or board->>'id' is distinct from ids[i+1]
      or jsonb_typeof(board->'title') is distinct from 'string' or jsonb_typeof(board->'meaning') is distinct from 'string'
      or jsonb_typeof(board->'lines') is distinct from 'array' then raise exception 'Invalid board fields' using errcode='22023'; end if;
    if jsonb_array_length(board->'lines') <> 2 then raise exception 'Two scene lines required' using errcode='22023'; end if;
    if length(board->>'title')>80 or length(board->>'meaning')>1600 then raise exception 'Board text too long' using errcode='22023'; end if;
    for value_row in select value from jsonb_array_elements(board->'lines') loop
      if jsonb_typeof(value_row.value) is distinct from 'string' or length(value_row.value#>>'{}')>100 then raise exception 'Invalid scene line' using errcode='22023'; end if;
    end loop;
  end loop;
  -- Reject HTML, control characters, non-text leaves and oversized text even
  -- when someone calls the RPC directly instead of using the server action.
  for value_row in with recursive nodes(v) as (
    select p_payload union all select child.v from nodes n cross join lateral (
      select value v from jsonb_each(case when jsonb_typeof(n.v)='object' then n.v else '{}'::jsonb end)
      union all select value v from jsonb_array_elements(case when jsonb_typeof(n.v)='array' then n.v else '[]'::jsonb end)
    ) child
  ) select v from nodes where jsonb_typeof(v) not in ('object','array') loop
    if jsonb_typeof(value_row.v) <> 'string' or length(trim(value_row.v#>>'{}')) not between 1 and 2000 or (value_row.v#>>'{}') ~ E'[<>\x01-\x08\x0B\x0C\x0E-\x1F]' then
      raise exception 'Plain text required' using errcode='22023';
    end if;
  end loop;
  select * into current_row from public.portfolio_content where id='main' for update;
  if not found then
    if p_expected_revision is distinct from 0 or p_reviewed is true then raise exception 'Revision conflict' using errcode='40001'; end if;
    begin
      insert into public.portfolio_content(id,payload) values('main',p_payload) returning * into result_row;
    exception when unique_violation then raise exception 'Revision conflict' using errcode='40001'; end;
  else
    if current_row.revision is distinct from p_expected_revision then raise exception 'Revision conflict' using errcode='40001'; end if;
    if p_reviewed is true and p_payload <> current_row.payload then raise exception 'Save before review' using errcode='22023'; end if;
    update public.portfolio_content set payload=p_payload,
      reviewed_by_pastor=coalesce(p_reviewed,case when payload=p_payload then reviewed_by_pastor else false end),
      reviewed_at=case when p_reviewed is true then now() when p_reviewed is false or payload<>p_payload then null else reviewed_at end,
      revision=revision+1, updated_at=now() where id='main' returning * into result_row;
  end if;
  return to_jsonb(result_row)-'id';
end;
$$;
revoke all on function public.save_portfolio_content(jsonb,bigint,boolean) from public, anon;
grant execute on function public.save_portfolio_content(jsonb,bigint,boolean) to authenticated;
commit;
