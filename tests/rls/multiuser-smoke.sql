begin;

do $bootstrap$
declare
  user_a uuid;
  user_b uuid;
begin
  select user_id
  into user_a
  from public.profiles
  where account_status = 'active'
  order by created_at
  limit 1;

  select user_id
  into user_b
  from public.profiles
  where account_status = 'active'
    and user_id <> user_a
  order by created_at
  limit 1;

  if user_a is null or user_b is null then
    raise exception 'TWO_ACTIVE_PROFILES_REQUIRED';
  end if;

  perform set_config('autora.test.user_a', user_a::text, true);
  perform set_config('autora.test.user_b', user_b::text, true);
  perform set_config('request.jwt.claim.sub', user_a::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
end;
$bootstrap$;

set local role authenticated;

do $$
declare
  user_a uuid := current_setting('autora.test.user_a')::uuid;
  user_b uuid := current_setting('autora.test.user_b')::uuid;
  suffix text := substring(gen_random_uuid()::text from 1 for 8);
  unit_a_id uuid;
  resource_a_id uuid;
  visible_as_user_b integer;
begin
  if user_a is null or user_b is null then
    raise exception 'AUTH_CONTEXT_NOT_SET';
  end if;

  perform set_config('request.jwt.claim.sub', user_a::text, true);

  insert into public.measurement_units (user_id, name, normalized_name, symbol)
  values (user_a, 'Unidad RLS ' || suffix, 'unidad-rls-' || suffix, 'un')
  returning id into unit_a_id;

  insert into public.resources (user_id, measurement_unit_id, name, normalized_name)
  values (user_a, unit_a_id, 'Recurso RLS ' || suffix, 'recurso-rls-' || suffix)
  returning id into resource_a_id;

  perform set_config('request.jwt.claim.sub', user_b::text, true);

  select count(*)
  into visible_as_user_b
  from public.resources
  where id = resource_a_id;

  if visible_as_user_b <> 0 then
    raise exception 'RLS_LEAK_ON_SELECT:%', visible_as_user_b;
  end if;

  begin
    insert into public.resources (user_id, measurement_unit_id, name, normalized_name)
    values (user_a, unit_a_id, 'Recurso prohibido ' || suffix, 'recurso-prohibido-' || suffix);

    raise exception 'EXPECTED_RLS_INSERT_REJECTION';
  exception
    when others then
      if sqlerrm not like '%row-level security%' and sqlerrm not like '%permission denied%' then
        raise;
      end if;
  end;

  update public.resources
  set name = 'Recurso alterado ' || suffix
  where id = resource_a_id;

  if found then
    raise exception 'RLS_LEAK_ON_UPDATE';
  end if;

  raise notice 'MULTIUSER_RLS_SMOKE_OK:%', suffix;
end;
$$;

rollback;
