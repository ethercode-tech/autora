# Modelo de datos

## Entidades de cuenta

- `profiles`
- `access_requests`
- `admin_users`

## Entidades de catalogo

- `measurement_units`
- `resources`
- `products`
- `recipes`
- `recipe_items`

## Entidades operativas

- `purchases`
- `resource_consumptions`
- `productions`
- `production_items`
- `sales`

## Entidades de inventario y costos

- `inventory_movements`
- `price_calculations`

## Entidades financieras y comerciales

- `economic_movements`
- `plans`
- `subscriptions`
- `payments`
- `admin_audit_log`

## Fuente de verdad por dominio

### Stock

- Fuente principal: `inventory_movements`
- Derivados: `resource_stock_view`, `product_stock_view`, `low_stock_view`

### Finanzas

- Fuente principal: `economic_movements`
- Derivados: `monthly_financial_summary`, `dashboard_monthly_view`

### Costos

- Fuente principal del calculo: ultimo costo valido de compra
- Bitacora historica: `price_calculations`
- Snapshot de produccion: `production_items`

## Relaciones criticas

- `profiles.user_id` referencia a usuario autenticado.
- `measurement_units.user_id`, `resources.user_id`, `products.user_id` y tablas de negocio dependen de la cuenta.
- `recipes.product_id` referencia a `products`.
- `recipe_items.recipe_id` referencia a `recipes`.
- `recipe_items.resource_id` referencia a `resources`.
- `production_items.production_id` referencia a `productions`.
- `inventory_movements.source_id` apunta al documento origen segun `source_type`.
- `subscriptions.plan_id` referencia a `plans`.
- `payments.subscription_id` referencia a `subscriptions`.

## Restricciones recomendadas

- UUID como clave primaria.
- `numeric` para importes y cantidades monetarias.
- `check` para cantidades y montos mayores a cero.
- nombres normalizados para unicidad por cuenta.
- `archived_at` o `active` para entidades historicas.

## RPC minimas

- `register_purchase`
- `register_production`
- `register_sale`
- `adjust_inventory`

## Decision importante

No calcular stock agrupando nombres ni depender de texto libre para productos o recursos. Todo vinculo operativo debe ser por ID.
