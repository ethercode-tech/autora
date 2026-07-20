create or replace function public.register_resource_consumption(
  consumption_resource_id uuid,
  consumption_quantity numeric,
  consumption_date date,
  consumption_notes text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  consumption_id uuid;
begin
  perform public.ensure_active_account();

  if consumption_quantity <= 0 then
    raise exception 'INVALID_CONSUMPTION_QUANTITY';
  end if;

  if public.resource_stock(consumption_resource_id) < consumption_quantity then
    raise exception 'INSUFFICIENT_RESOURCE_STOCK';
  end if;

  insert into public.resource_consumptions (user_id, resource_id, quantity, date, notes)
  values (auth.uid(), consumption_resource_id, consumption_quantity, consumption_date, consumption_notes)
  returning id into consumption_id;

  insert into public.inventory_movements (
    user_id, entity_type, resource_id, movement_type, quantity_signed, reference_type, reference_id, date, notes
  )
  values (
    auth.uid(),
    'resource',
    consumption_resource_id,
    'manual_consumption_out',
    consumption_quantity * -1,
    'resource_consumption',
    consumption_id,
    consumption_date,
    consumption_notes
  );

  return consumption_id;
end;
$$;
