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
- `scripts/apply-sql-files.mjs`
- `scripts/run-baseline-checks.mjs`
- `src/architecture/storage-boundary.test.ts`
- `src/server/queries/check-live-e2e-readiness.test.ts`
- `src/server/queries/check-release-readiness.test.ts`
- `src/server/queries/run-baseline-checks.test.ts`
- `src/server/queries/run-live-e2e.test.ts`

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
- `tests/e2e/export-route.spec.ts`
- `tests/e2e/live-manufacturer-flow.spec.ts` con `E2E_LIVE_SUPABASE=1` y `E2E_USE_PROD_SERVER=1`
- `tests/e2e/live-reseller-flow.spec.ts` con `E2E_LIVE_SUPABASE=1` y `E2E_USE_PROD_SERVER=1`
- `pnpm test:e2e:live:check` para readiness de entorno
- `pnpm test:e2e:live` para correr fabricante + reventa con build productivo previo
- `pnpm test:e2e:live:manufacturer` para aislar fabricante
- `pnpm test:e2e:live:reseller` para aislar reventa
- `E2E_EXTERNAL_BASE_URL=https://autoracontable.vercel.app pnpm test:e2e:live:manufacturer` para validar una URL desplegada real sin levantar servidor local
- `E2E_EXTERNAL_BASE_URL=https://autoracontable.vercel.app pnpm test:e2e:live:reseller` para validar el segundo flujo principal sobre el deployment activo
- `pnpm test:production-access` para validar login real de una cuenta admin y una cuenta de negocio contra la URL desplegada
- `pnpm verify:baseline` para consolidar lint, typecheck, Vitest y build productivo en una sola pasada
- `pnpm test:release:check` para consolidar readiness de live E2E, SQL smoke y bloqueos de deploy del workspace

Resultado local mas reciente:

- ejecucion completa de Playwright del 2026-07-20: `24 passed`
- build productivo local del 2026-07-20: `npm run build` exitoso
- ejecucion live opt-in del flujo fabricante el 2026-07-20: `1 passed`
- ejecucion live opt-in del flujo reventa el 2026-07-20: `1 passed`
- readiness live del 2026-07-20: `pnpm test:e2e:live:check` en verde
- runner unificado live del 2026-07-20: `pnpm test:e2e:live` con build productivo + `2 passed`
- flujo `manufacturer` contra `https://autoracontable.vercel.app` el 2026-07-20: `1 passed`
- flujo `reseller` contra `https://autoracontable.vercel.app` el 2026-07-20: `1 passed`
- `pnpm test:production-access` contra `https://autoracontable.vercel.app` el 2026-07-20: admin y negocio verificados
- auditoria de release del 2026-07-20: `pnpm test:release:check` devolvio `ready=no`, `live-e2e=ok`, `sql-smoke=blocked`, `direct-db-url=missing` y `hosting-config=present` porque la configuracion actual no resuelve una conexion Postgres directa usable
- baseline del 2026-07-20: `pnpm verify:baseline` en verde con lint, typecheck, `102 passed` en Vitest y build productivo exitoso
- tests de helpers operativos del 2026-07-20: `4 passed` en `check-live-e2e-readiness.test.ts` y `check-release-readiness.test.ts`
- tests del runner baseline del 2026-07-20: `3 passed` en `run-baseline-checks.test.ts`
- tests del runner live del 2026-07-20: `6 passed` en `run-live-e2e.test.ts`
- la ejecucion directa completa de `pnpm test:sql-smoke` sigue pendiente como evidencia separada; ademas, hoy la configuracion real debe exponer una conexion Postgres usable, ya sea con `SUPABASE_DB_URL`/`DATABASE_URL` validas o con `NEXT_PUBLIC_SUPABASE_URL + SUPABASE_DB_PASSWORD`, antes de poder correrla

## Verificacion live actual

- `npm run test:supabase-live` valido el 2026-07-20:
  - aislamiento RLS real por API
  - compras, consumos, produccion y ventas con persistencia real
  - rollback en fallos operativos
  - bloqueo por cuenta no activa
- aprobacion de solicitudes, alta de planes, suscripciones, pagos, activacion comercial y auditoria admin
- Resultado mas reciente:
  - 22 checks live en verde el 2026-07-20
  - los fixes de `supabase/migrations/202607200004_admin_commercial_rls.sql` y `supabase/migrations/202607200005_fix_is_admin_recursion.sql` ya quedaron reflejados en la verificacion API real
  - la URL productiva `https://autoracontable.vercel.app` ya quedo validada con ambos flujos principales usando Playwright live y `E2E_EXTERNAL_BASE_URL`
- Para aplicar fixes sin Supabase CLI:
  - `npm run db:apply:admin-fixes`
  - requiere `SUPABASE_DB_URL` o `DATABASE_URL` con esquema `postgres://` o `postgresql://`, o bien `NEXT_PUBLIC_SUPABASE_URL + SUPABASE_DB_PASSWORD`

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
