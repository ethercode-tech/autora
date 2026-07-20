begin;

do $bootstrap$
declare
  selected_user_id uuid;
begin
  select user_id
  into selected_user_id
  from public.profiles
  where account_status = 'active'
  order by created_at
  limit 1;

  if selected_user_id is null then
    raise exception 'ACTIVE_PROFILE_REQUIRED';
  end if;

  perform set_config('request.jwt.claim.sub', selected_user_id::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
end;
$bootstrap$;

set local role authenticated;

do $$
declare
  target_user_id uuid := auth.uid();
  suffix text := substring(gen_random_uuid()::text from 1 for 8);
  unit_id uuid;
  resource_id uuid;
  product_id uuid;
  recipe_id uuid;
  purchase_id uuid;
  consumption_id uuid;
  production_id uuid;
  sale_id uuid;
  purchase_total numeric(12, 2);
  sale_total numeric(12, 2);
  production_total_cost numeric(12, 2);
  production_unit_cost numeric(12, 2);
  resource_stock_after_purchase numeric(12, 3);
  resource_stock_after_consumption numeric(12, 3);
  resource_stock_after_production numeric(12, 3);
  product_stock_after_production numeric(12, 3);
  product_stock_after_sale numeric(12, 3);
  inventory_movement_count integer;
  financial_movement_count integer;
  sales_before_invalid_attempt integer;
  sales_after_invalid_attempt integer;
begin
  if target_user_id is null then
    raise exception 'AUTH_CONTEXT_NOT_SET';
  end if;

  insert into public.measurement_units (user_id, name, normalized_name, symbol)
  values (target_user_id, 'Unidad smoke ' || suffix, 'unidad-smoke-' || suffix, 'un')
  returning id into unit_id;

  insert into public.resources (user_id, measurement_unit_id, name, normalized_name, minimum_stock)
  values (target_user_id, unit_id, 'Cera smoke ' || suffix, 'cera-smoke-' || suffix, 2)
  returning id into resource_id;

  insert into public.products (user_id, name, normalized_name, product_type, sale_unit, minimum_stock)
  values (target_user_id, 'Vela smoke ' || suffix, 'vela-smoke-' || suffix, 'manufactured', 'unidad', 1)
  returning id into product_id;

  insert into public.recipes (user_id, product_id, name, yield_quantity)
  values (target_user_id, product_id, 'Receta smoke ' || suffix, 2)
  returning id into recipe_id;

  insert into public.recipe_items (user_id, recipe_id, resource_id, quantity)
  values (target_user_id, recipe_id, resource_id, 4);

  purchase_id := public.register_purchase(
    current_date,
    'resource',
    'operational-flow-smoke-' || suffix || ':purchase',
    jsonb_build_array(
      jsonb_build_object(
        'resource_id', resource_id,
        'quantity', 10,
        'unit_price', 100,
        'total_price', 1000
      )
    )
  );

  select public.resource_stock(resource_id)
  into resource_stock_after_purchase;

  if resource_stock_after_purchase <> 10 then
    raise exception 'UNEXPECTED_RESOURCE_STOCK_AFTER_PURCHASE:%', resource_stock_after_purchase;
  end if;

  consumption_id := public.register_resource_consumption(
    resource_id,
    2,
    current_date,
    'operational-flow-smoke-' || suffix || ':consumption'
  );

  select public.resource_stock(resource_id)
  into resource_stock_after_consumption;

  if resource_stock_after_consumption <> 8 then
    raise exception 'UNEXPECTED_RESOURCE_STOCK_AFTER_CONSUMPTION:%', resource_stock_after_consumption;
  end if;

  production_id := public.register_production(
    current_date,
    product_id,
    recipe_id,
    4,
    'operational-flow-smoke-' || suffix || ':production'
  );

  select public.resource_stock(resource_id), public.product_stock(product_id)
  into resource_stock_after_production, product_stock_after_production;

  if resource_stock_after_production <> 0 then
    raise exception 'UNEXPECTED_RESOURCE_STOCK_AFTER_PRODUCTION:%', resource_stock_after_production;
  end if;

  if product_stock_after_production <> 4 then
    raise exception 'UNEXPECTED_PRODUCT_STOCK_AFTER_PRODUCTION:%', product_stock_after_production;
  end if;

  select total_cost, unit_cost
  into production_total_cost, production_unit_cost
  from public.production_orders
  where id = production_id;

  if production_total_cost <> 800 then
    raise exception 'UNEXPECTED_PRODUCTION_TOTAL_COST:%', production_total_cost;
  end if;

  if production_unit_cost <> 200 then
    raise exception 'UNEXPECTED_PRODUCTION_UNIT_COST:%', production_unit_cost;
  end if;

  sale_id := public.register_sale(
    current_date,
    'operational-flow-smoke-' || suffix || ':sale',
    jsonb_build_array(
      jsonb_build_object(
        'product_id', product_id,
        'quantity', 3,
        'unit_price', 300
      )
    )
  );

  select public.product_stock(product_id)
  into product_stock_after_sale;

  if product_stock_after_sale <> 1 then
    raise exception 'UNEXPECTED_PRODUCT_STOCK_AFTER_SALE:%', product_stock_after_sale;
  end if;

  select total into purchase_total from public.purchases where id = purchase_id;
  select total into sale_total from public.sales where id = sale_id;

  if purchase_total <> 1000 then
    raise exception 'UNEXPECTED_PURCHASE_TOTAL:%', purchase_total;
  end if;

  if sale_total <> 900 then
    raise exception 'UNEXPECTED_SALE_TOTAL:%', sale_total;
  end if;

  select count(*)
  into inventory_movement_count
  from public.inventory_movements
  where reference_id in (purchase_id, consumption_id, production_id, sale_id);

  if inventory_movement_count <> 5 then
    raise exception 'UNEXPECTED_INVENTORY_MOVEMENT_COUNT:%', inventory_movement_count;
  end if;

  select count(*)
  into financial_movement_count
  from public.financial_movements
  where source_id in (purchase_id, sale_id);

  if financial_movement_count <> 2 then
    raise exception 'UNEXPECTED_FINANCIAL_MOVEMENT_COUNT:%', financial_movement_count;
  end if;

  select count(*)
  into sales_before_invalid_attempt
  from public.sales
  where user_id = target_user_id
    and notes like 'operational-flow-smoke-' || suffix || '%';

  begin
    perform public.register_sale(
      current_date,
      'operational-flow-smoke-' || suffix || ':oversale',
      jsonb_build_array(
        jsonb_build_object(
          'product_id', product_id,
          'quantity', 2,
          'unit_price', 300
        )
      )
    );

    raise exception 'EXPECTED_INSUFFICIENT_PRODUCT_STOCK';
  exception
    when others then
      if sqlerrm not like '%INSUFFICIENT_PRODUCT_STOCK%' then
        raise;
      end if;
  end;

  select count(*)
  into sales_after_invalid_attempt
  from public.sales
  where user_id = target_user_id
    and notes like 'operational-flow-smoke-' || suffix || '%';

  if sales_after_invalid_attempt <> sales_before_invalid_attempt then
    raise exception 'FAILED_SALE_WAS_NOT_ROLLED_BACK';
  end if;

  update public.profiles
  set account_status = 'blocked'
  where user_id = target_user_id;

  begin
    perform public.register_purchase(
      current_date,
      'resource',
      'operational-flow-smoke-' || suffix || ':blocked',
      jsonb_build_array(
        jsonb_build_object(
          'resource_id', resource_id,
          'quantity', 1,
          'unit_price', 100,
          'total_price', 100
        )
      )
    );

    raise exception 'EXPECTED_ACCOUNT_NOT_ACTIVE';
  exception
    when others then
      if sqlerrm not like '%ACCOUNT_NOT_ACTIVE%' then
        raise;
      end if;
  end;

  raise notice 'OPERATIONAL_FLOW_SMOKE_OK:%', suffix;
end;
$$;

rollback;
