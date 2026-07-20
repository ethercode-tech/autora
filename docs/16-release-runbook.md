# Runbook de release

Estado consolidado el 2026-07-20.

Este documento define el recorrido operativo minimo para verificar el estado del producto antes de considerar una salida a produccion. No reemplaza la auditoria funcional: la organiza en un orden reproducible.

## Objetivo

Dejar claro:

- que puede verificarse completamente desde este workspace,
- que requiere credenciales o infraestructura externa,
- y que bloqueos siguen vigentes para considerar el release completo.

## Precondiciones

- Node y dependencias ya instaladas.
- `.env` o `.env.local` con:
  - `NEXT_PUBLIC_APP_URL`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Para smokes SQL directos:
  - `SUPABASE_DB_URL` o `DATABASE_URL`
  - `psql` en `PATH`, `PSQL_PATH` o en una ruta estandar de PostgreSQL para Windows
- Para live E2E:
  - Chrome disponible
  - acceso al proyecto Supabase real ya configurado en `.env`

## Secuencia recomendada

1. Baseline local seguro
   - `pnpm lint`
   - `pnpm test`
   - `pnpm build`
2. Readiness local consolidado
   - `pnpm test:e2e:live:check`
   - `pnpm test:sql-smoke:check`
   - `pnpm test:release:check`
3. Flujos live sobre UI real + Supabase real
   - `pnpm test:e2e:live`
   - o variantes:
     - `pnpm test:e2e:live:manufacturer`
     - `pnpm test:e2e:live:reseller`
4. Verificacion live por API real
   - `pnpm test:supabase-live`
5. Smokes SQL directos por Postgres
   - `pnpm test:sql-smoke`
   - o variantes:
     - `pnpm test:sql-smoke:rls`
     - `pnpm test:sql-smoke:multiuser`
     - `pnpm test:sql-smoke:operational`

## Interpretacion de comandos

### `pnpm test:e2e:live:check`

Valida:

- variables necesarias para live E2E,
- presencia de Chrome,
- presencia de specs live.

No valida:

- `SUPABASE_DB_URL`,
- deploy real,
- resultado funcional de los flujos.

### `pnpm test:e2e:live`

Hace:

- build productivo,
- E2E live de fabricante,
- E2E live de reventa.

Sirve para demostrar:

- flujo UI persistente real,
- build utilizable en modo productivo local,
- integracion entre UI, server actions y Supabase.

### `pnpm test:sql-smoke:check`

Valida:

- presencia de `SUPABASE_DB_URL` o `DATABASE_URL`,
- presencia de `psql`,
- existencia de las suites SQL requeridas.

Si falla por variables faltantes, el bloqueo es externo al codigo del repo.

### `pnpm test:release:check`

Consolida:

- readiness de live E2E,
- readiness de SQL smoke,
- bloqueos externos de deploy del workspace.

Al 2026-07-20, el resultado esperado de este workspace es:

- `live-e2e=ok`
- `sql-smoke=blocked`
- `direct-db-url=missing`
- `hosting-config=present`

Eso significa que el repo ya puede demostrar build productivo, flujos live reales y un target de hosting configurado, pero no puede cerrar release completo desde este workspace mientras falten:

- `SUPABASE_DB_URL` o `DATABASE_URL`
- una version productiva publicada sobre el target gestionado del workspace

## Bloqueos externos vigentes al 2026-07-20

1. Base Postgres directa no expuesta al workspace.
   - impacto:
     - no pueden correrse los smokes SQL directos,
     - no pueden aplicarse archivos SQL desde el repo con `pnpm db:apply`.
2. Workspace con target de hosting gestionado pero sin deploy publicado verificable.
   - impacto:
     - aun no hay evidencia de deploy productivo administrado desde este repositorio,
     - no puede afirmarse release completo hacia hosting gestionado solo con la configuracion.

## Definicion practica de release completo

Para marcar el objetivo como completamente cerrado desde este workspace, deberian existir evidencias actuales de:

- `pnpm build`
- `pnpm test:e2e:live`
- `pnpm test:supabase-live`
- `pnpm test:sql-smoke`
- configuracion de hosting real del workspace
- deploy verificable del artefacto resultante

## Artefactos relacionados

- [09-testing-strategy.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/09-testing-strategy.md)
- [14-verification-matrix.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/14-verification-matrix.md)
- [15-requirement-audit.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/15-requirement-audit.md)
- [README.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/README.md)
- [check-live-e2e-readiness.mjs](/C:/Users/cecil/proyectosAle/github/origen/webapp/scripts/check-live-e2e-readiness.mjs)
- [run-live-e2e.mjs](/C:/Users/cecil/proyectosAle/github/origen/webapp/scripts/run-live-e2e.mjs)
- [check-release-readiness.mjs](/C:/Users/cecil/proyectosAle/github/origen/webapp/scripts/check-release-readiness.mjs)
