# Matriz de verificacion

Estado consolidado el 2026-07-20.

## Objetivo y evidencia actual

- Flujo publico base:
  - evidencia: `src/app/(public)/public-routes.test.tsx`
  - evidencia: `tests/e2e/public-flows.spec.ts`
- Recuperacion de contrasena:
  - evidencia: `src/app/(public)/public-routes.test.tsx`
  - evidencia: `tests/e2e/public-flows.spec.ts`
  - evidencia: `tests/e2e/configuration-guards.spec.ts`
- Bloqueo y guardas de acceso:
  - evidencia: `src/lib/auth/account-status.test.ts`
  - evidencia: `src/app/(public)/public-routes.test.tsx`
  - evidencia: `tests/e2e/configuration-guards.spec.ts`
- Exportacion:
  - evidencia: `src/server/queries/export.test.ts`
  - evidencia: `tests/e2e/export-route.spec.ts`
- Ciclo comercial y estados de cuenta:
  - evidencia: `src/features/commercial/lib/account-commercial-state.test.ts`
- Calculo de costos:
  - evidencia: `src/features/pricing/lib/calculate-price.test.ts`
- Stock y alertas:
  - evidencia: `src/features/inventory/lib/calculate-stock.test.ts`
- Dashboard y movimientos economicos:
  - evidencia: `src/features/dashboard/lib/build-dashboard-metrics.test.ts`
- Conversion de packs:
  - evidencia: `src/features/inventory/lib/pack-pricing.test.ts`
- RLS y frontera SaaS declarativa:
  - evidencia: `src/server/queries/rls-migration.test.ts`
  - evidencia ejecutable en base: `tests/rls/rls-smoke.sql`

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

## Gaps todavia abiertos

- No hay todavia E2E del flujo completo de fabricante con persistencia real.
- No hay todavia E2E del flujo de reventa.
- Falta una prueba real de lectura cruzada con dos usuarias autenticadas.
- Falta correr el smoke SQL de RLS en un proyecto Supabase activo.
- El entorno local actual no pudo sostener Playwright completo por limites de recursos del proceso, aunque la suite ya quedo preparada.
