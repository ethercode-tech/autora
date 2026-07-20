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
  - evidencia adicional: `src/app/api/export/route.test.ts`
  - evidencia adicional: `src/app/(dashboard)/results/page.test.tsx`
  - evidencia: `tests/e2e/export-route.spec.ts`
  - cubre: descarga JSON y CSV desde la misma ruta de exportacion
- Ciclo comercial y estados de cuenta:
  - evidencia: `src/features/commercial/lib/account-commercial-state.test.ts`
  - evidencia adicional: `src/features/commercial/lib/payment-subscription-selection.test.ts`
  - evidencia adicional: `src/components/forms/payment-form.test.tsx`
  - evidencia adicional: `src/app/admin/page.test.tsx`
  - evidencia de implementacion: `src/server/actions/admin.ts` resuelve transiciones de suscripcion con el estado real del perfil
- Recetas con multiples insumos:
  - evidencia: `src/lib/validation/catalog.test.ts`
  - evidencia adicional: `src/components/forms/recipe-form.test.tsx`
  - evidencia adicional: `src/app/(dashboard)/recipes/page.test.tsx`
  - evidencia de implementacion: `src/components/forms/recipe-form.tsx`
  - evidencia de implementacion: `src/server/actions/production.ts`
  - cubre: experiencia fabricante con alta multi-insumo y bloqueo explicito del modulo para cuentas de reventa
- Flujo diario segun tipo de negocio:
  - evidencia: `src/app/(dashboard)/purchases/page.test.tsx`
  - evidencia adicional: `src/app/(dashboard)/production/page.test.tsx`
  - evidencia adicional: `src/app/(dashboard)/pricing/page.test.tsx`
  - cubre: compras con mensaje distinto para fabricante/reventa y bloqueo explicito de produccion/costos en cuentas de reventa
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
  - resultado: checks en verde sobre stock, costos, movimientos economicos, alertas, metricas fuente de dashboard, aislamiento RLS, bloqueo de cuenta y rollback de fallos operativos
- Correccion RLS del ciclo comercial admin:
  - evidencia: `supabase/migrations/202607200004_admin_commercial_rls.sql`
  - evidencia complementaria: `supabase/migrations/202607200005_fix_is_admin_recursion.sql`
  - evidencia: `src/server/queries/rls-migration.test.ts`
  - cubre: escritura admin sobre `subscriptions` y `payments`
  - cubre: evita recursion RLS en `public.is_admin()` al consultar `admin_users`
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
  - requiere `SUPABASE_DB_URL` o `DATABASE_URL`
  - resuelve `psql` desde `PATH`, `PSQL_PATH` o rutas estandar de PostgreSQL en Windows

## Gaps todavia abiertos

- La suite E2E local paso el 2026-07-20 con `22 passed` y `1 skipped`; el skip corresponde a exportacion sin Supabase configurado.
- No hay todavia E2E del flujo completo de fabricante con persistencia real.
- No hay todavia E2E del flujo de reventa con persistencia real.
 - La verificacion live contra Supabase ya cubrio lectura cruzada y escrituras cruzadas por API real el 2026-07-20.
 - El panel admin ya tiene cobertura adicional de render y contrato comercial local; el formulario de pagos deriva `user_id` desde la suscripcion seleccionada y ya no depende de ingreso manual de ese dato.
 - La verificacion live del 2026-07-20 detecto que el proyecto Supabase remoto todavia responde `stack depth limit exceeded` en la aprobacion admin de solicitudes; eso confirma que la correccion de `public.is_admin()` aun debe aplicarse en la base remota.
 - El preflight `npm run test:sql-smoke:check` ya detecta `psql` automaticamente en este host Windows; el faltante externo restante para smokes Postgres directos es `SUPABASE_DB_URL` o `DATABASE_URL`.
 - Falta correr el smoke SQL via Postgres directo si se quiere evidencia adicional a nivel `psql`.
- La ejecucion completa de Playwright ya es estable en entorno local sin Supabase, pero la persistencia real sigue pendiente de un entorno configurado.
