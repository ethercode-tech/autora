create or replace function public.register_production(
  production_date date,
  production_product_id uuid,
  production_recipe_id uuid,
  production_quantity numeric,
  production_notes text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  production_id uuid;
  recipe_item record;
  latest_unit_cost numeric(12, 6);
  line_total_cost numeric(12, 2);
  production_total_cost numeric(12, 2) := 0;
  resource_needed numeric(12, 3);
begin
  perform public.ensure_active_account();

  if production_quantity <= 0 then
    raise exception 'INVALID_PRODUCTION_QUANTITY';
  end if;

  for recipe_item in
    select ri.resource_id, ri.quantity, r.yield_quantity
    from public.recipe_items ri
    inner join public.recipes r on r.id = ri.recipe_id
    where ri.recipe_id = production_recipe_id and r.user_id = auth.uid() and r.active = true
  loop
    resource_needed := (recipe_item.quantity / recipe_item.yield_quantity) * production_quantity;

    if public.resource_stock(recipe_item.resource_id) < resource_needed then
      raise exception 'INSUFFICIENT_RESOURCE_STOCK';
    end if;

    select coalesce(pi.individual_unit_price, pi.unit_price)
    into latest_unit_cost
    from public.purchase_items pi
    inner join public.purchases p on p.id = pi.purchase_id
    where pi.resource_id = recipe_item.resource_id
      and p.user_id = auth.uid()
    order by pi.created_at desc
    limit 1;

    if latest_unit_cost is null then
      raise exception 'MISSING_RESOURCE_COST';
    end if;
  end loop;

  insert into public.production_orders (user_id, product_id, recipe_id, quantity_produced, date, notes)
  values (auth.uid(), production_product_id, production_recipe_id, production_quantity, production_date, production_notes)
  returning id into production_id;

  for recipe_item in
    select ri.resource_id, ri.quantity, r.yield_quantity
    from public.recipe_items ri
    inner join public.recipes r on r.id = ri.recipe_id
    where ri.recipe_id = production_recipe_id and r.user_id = auth.uid() and r.active = true
  loop
    resource_needed := (recipe_item.quantity / recipe_item.yield_quantity) * production_quantity;

    select coalesce(pi.individual_unit_price, pi.unit_price)
    into latest_unit_cost
    from public.purchase_items pi
    inner join public.purchases p on p.id = pi.purchase_id
    where pi.resource_id = recipe_item.resource_id
      and p.user_id = auth.uid()
    order by pi.created_at desc
    limit 1;

    line_total_cost := round((resource_needed * latest_unit_cost)::numeric, 2);
    production_total_cost := production_total_cost + line_total_cost;

    insert into public.production_items (user_id, production_order_id, resource_id, quantity_used, unit_cost, total_cost)
    values (auth.uid(), production_id, recipe_item.resource_id, resource_needed, latest_unit_cost, line_total_cost);

    insert into public.inventory_movements (
      user_id, entity_type, resource_id, movement_type, quantity_signed, reference_type, reference_id, date, notes
    )
    values (
      auth.uid(),
      'resource',
      recipe_item.resource_id,
      'production_resource_out',
      resource_needed * -1,
      'production',
      production_id,
      production_date,
      production_notes
    );
  end loop;

  update public.production_orders
  set
    total_cost = production_total_cost,
    unit_cost = round((production_total_cost / nullif(production_quantity, 0))::numeric, 2)
  where id = production_id;

  insert into public.inventory_movements (
    user_id, entity_type, product_id, movement_type, quantity_signed, reference_type, reference_id, date, notes
  )
  values (
    auth.uid(),
    'product',
    production_product_id,
    'production_product_in',
    production_quantity,
    'production',
    production_id,
    production_date,
    production_notes
  );

  return production_id;
end;
$$;
