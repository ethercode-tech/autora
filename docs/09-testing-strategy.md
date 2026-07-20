# Estrategia de testing

## Unitarias

Cubrir como minimo:

- calculo de costos,
- calculo de precio sugerido,
- conversion de pack,
- agregacion de stock,
- alertas de stock,
- totales de ventas,
- totales economicos,
- normalizacion y validaciones.

## Integracion

Cubrir como minimo:

- `register_purchase`,
- `register_resource_consumption`,
- `register_production`,
- `register_sale`,
- `adjust_inventory`,
- reversiones,
- bloqueo por cuenta no activa.

Artefactos ejecutables preparados:

- `tests/integration/operational-flow-smoke.sql`
- `tests/rls/rls-smoke.sql`
- `tests/rls/multiuser-smoke.sql`
- `scripts/run-sql-smoke.mjs`
- `scripts/verify-live-supabase.mjs`

## Seguridad y RLS

Probar:

- lectura cruzada entre dos usuarios,
- escritura con `user_id` ajeno,
- acceso admin versus usuaria,
- cuenta bloqueada.

## End-to-end

Escenarios minimos:

- alta, aprobacion y primer acceso,
- flujo completo de fabricante,
- flujo completo de reventa,
- bloqueo administrativo,
- exportacion.

Cobertura E2E actualmente ejecutada:

- `tests/e2e/public-flows.spec.ts`
- `tests/e2e/access-onboarding.spec.ts`
- `tests/e2e/configuration-guards.spec.ts`
- `tests/e2e/panel-guardrails.spec.ts`
- `tests/e2e/export-route.spec.ts` condicionado a Supabase configurado

## Responsive

Revisar al menos:

- 360 px
- 390 px
- 768 px
- 1024 px
- escritorio ancho

## Politica de calidad

Ningun modulo se considera terminado sin:

- validacion frontend,
- validacion backend,
- persistencia real,
- manejo de errores,
- estado vacio,
- estado de carga,
- pruebas correspondientes.
