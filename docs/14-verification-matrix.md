# Matriz de verificacion

Estado consolidado el 2026-07-20.

## Objetivo y evidencia actual

- Flujo publico base:
  - evidencia: `src/app/(public)/public-routes.test.tsx`
  - evidencia: `tests/e2e/public-flows.spec.ts`
  - evidencia adicional: `tests/e2e/access-onboarding.spec.ts`
- Recuperacion de contrasena:
  - evidencia: `src/app/(public)/public-routes.test.tsx`
  - evidencia: `tests/e2e/public-flows.spec.ts`
  - evidencia adicional: `tests/e2e/access-onboarding.spec.ts`
  - evidencia: `tests/e2e/configuration-guards.spec.ts`
- Bloqueo y guardas de acceso:
  - evidencia: `src/lib/auth/account-status.test.ts`
  - evidencia: `src/app/(public)/public-routes.test.tsx`
  - evidencia: `tests/e2e/configuration-guards.spec.ts`
  - evidencia adicional: `tests/e2e/panel-guardrails.spec.ts`
- Exportacion:
  - evidencia: `src/server/queries/export.test.ts`
  - evidencia: `tests/e2e/export-route.spec.ts`
- Ciclo comercial y estados de cuenta:
  - evidencia: `src/features/commercial/lib/account-commercial-state.test.ts`
- Metricas globales de administracion:
  - evidencia: `src/features/admin/lib/build-admin-dashboard-metrics.test.ts`
- Calculo de costos:
  - evidencia: `src/features/pricing/lib/calculate-price.test.ts`
- Stock y alertas:
  - evidencia: `src/features/inventory/lib/calculate-stock.test.ts`
- Errores operativos y mensajes de bloqueo:
  - evidencia: `src/features/operations/lib/operation-feedback.test.ts`
- Dashboard y movimientos economicos:
  - evidencia: `src/features/dashboard/lib/build-dashboard-metrics.test.ts`
- Conversion de packs:
  - evidencia: `src/features/inventory/lib/pack-pricing.test.ts`
- RLS y frontera SaaS declarativa:
  - evidencia: `src/server/queries/rls-migration.test.ts`
  - evidencia ejecutable en base: `tests/rls/rls-smoke.sql`
- Verificacion live contra Supabase real:
  - evidencia ejecutada el 2026-07-20: `npm run test:supabase-live`
  - resultado: 8 checks en verde sobre stock, costos, movimientos economicos, aislamiento RLS y bloqueo de cuenta
- Invariantes SQL de stock, costos y movimientos financieros:
  - evidencia: `src/server/queries/rls-migration.test.ts`
  - cubre: bloqueos por stock insuficiente en venta, produccion, consumo y ajustes
  - cubre: alta obligatoria de `financial_movements` para compras y ventas
  - cubre: persistencia de `total_cost` y `unit_cost` en produccion
- Flujo integrado SQL sobre base real:
  - evidencia ejecutable en base: `tests/integration/operational-flow-smoke.sql`
  - cubre: compra, consumo, produccion, venta, rollback de venta invalida y bloqueo por cuenta no activa
- Smoke multiusuario de aislamiento:
  - evidencia ejecutable en base: `tests/rls/multiuser-smoke.sql`
  - cubre: no lectura cruzada, no escritura con `user_id` ajeno y no modificacion cruzada

## Comandos de verificacion

- Unitarias e invariantes:
  - `pnpm test`
- TypeScript:
  - `pnpm exec tsc --noEmit`
- Build:
  - `pnpm build`
- E2E:
  - `pnpm test:e2e`
- Smoke RLS en Supabase:
  - ejecutar `tests/rls/rls-smoke.sql` contra la base del entorno objetivo.
- Smoke multiusuario en Supabase:
  - ejecutar `tests/rls/multiuser-smoke.sql` contra la base del entorno objetivo.
- Smoke operativo integrado en Supabase:
  - ejecutar `tests/integration/operational-flow-smoke.sql` contra la base del entorno objetivo.
- Runner reproducible de smokes SQL:
  - `npm run test:sql-smoke:check`
  - `npm run test:sql-smoke`
  - variantes: `npm run test:sql-smoke:rls`, `npm run test:sql-smoke:multiuser`, `npm run test:sql-smoke:operational`
  - requiere `SUPABASE_DB_URL` o `DATABASE_URL` y un binario `psql` disponible o configurable por `PSQL_PATH`

## Gaps todavia abiertos

- La suite E2E local paso el 2026-07-20 con `22 passed` y `1 skipped`; el skip corresponde a exportacion sin Supabase configurado.
- No hay todavia E2E del flujo completo de fabricante con persistencia real.
- No hay todavia E2E del flujo de reventa con persistencia real.
 - La verificacion live contra Supabase ya cubrio lectura cruzada y escrituras cruzadas por API real el 2026-07-20.
 - Falta correr el smoke SQL via Postgres directo si se quiere evidencia adicional a nivel `psql`.
- La ejecucion completa de Playwright ya es estable en entorno local sin Supabase, pero la persistencia real sigue pendiente de un entorno configurado.
