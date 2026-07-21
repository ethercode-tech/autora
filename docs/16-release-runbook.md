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
  - `SUPABASE_DB_URL` o `DATABASE_URL` con esquema `postgres://` o `postgresql://`, o bien `NEXT_PUBLIC_SUPABASE_URL + SUPABASE_DB_PASSWORD`
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
   - para validar la URL productiva desplegada:
     - `E2E_EXTERNAL_BASE_URL=https://autoracontable.vercel.app pnpm test:e2e:live:manufacturer`
     - `E2E_EXTERNAL_BASE_URL=https://autoracontable.vercel.app pnpm test:e2e:live:reseller`
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

Si defines `E2E_EXTERNAL_BASE_URL`, el runner usa esa URL desplegada y omite el `next build` local.

### `pnpm test:sql-smoke:check`

Valida:

- presencia de `SUPABASE_DB_URL` o `DATABASE_URL`,
- que esa URL sea una conexion Postgres directa valida,
- presencia de `psql`,
- existencia de las suites SQL requeridas.

Si falla por variables faltantes, por una URL HTTP/HTTPS mal configurada o porque falta `SUPABASE_DB_PASSWORD` para derivar la URL directa, el bloqueo es externo al codigo del repo.

Con la configuracion actual del proyecto, el ejemplo esperado por el preflight es:

- `postgresql://postgres:<db-password>@db.skqtwagdshdppijswchw.supabase.co:5432/postgres`

### `pnpm test:release:check`

Consolida:

- readiness de live E2E,
- readiness de SQL smoke,
- bloqueos externos de deploy del workspace.

Al 2026-07-20, el resultado esperado de este workspace es:

- `ready=no`
- `live-e2e=ok`
- `sql-smoke=blocked`
- `direct-db-url=missing`
- `hosting-config=present`

Eso significa que el repo ya puede demostrar build productivo, flujos live reales y un target de hosting configurado, pero no puede cerrar el release completo desde este workspace mientras falte una conexion Postgres directa utilizable por `psql`, por ejemplo:

- una URI Postgres valida para `SUPABASE_DB_URL` o `DATABASE_URL`
- o la combinacion `NEXT_PUBLIC_SUPABASE_URL + SUPABASE_DB_PASSWORD`
- una ejecucion completa y documentada de `pnpm test:sql-smoke`

## Bloqueos vigentes al 2026-07-20

1. La configuracion actual para SQL directo no resuelve una conexion Postgres utilizable.
   - impacto:
     - `pnpm test:sql-smoke:check` y `pnpm test:release:check` quedan bloqueados correctamente,
     - no pueden correrse `pnpm test:sql-smoke` ni `pnpm db:apply` contra la base remota.

## Evidencia de deploy vigente al 2026-07-20

- `https://autoracontable.vercel.app` ya fue validado con Playwright live en los dos flujos principales.
- `/dashboard` y `/admin` resuelven a login cuando no hay sesion y ya no muestran el fallback de variables faltantes.
- `admin@autora.local` ya fue validado con acceso visible al panel administrativo sobre la URL productiva.
- `lumiq@autora.local` ya fue validado con acceso visible al dashboard operativo sobre la URL productiva.

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
- [19-sql-smoke-unblock-checklist.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/19-sql-smoke-unblock-checklist.md)
- [check-live-e2e-readiness.mjs](/C:/Users/cecil/proyectosAle/github/origen/webapp/scripts/check-live-e2e-readiness.mjs)
- [run-live-e2e.mjs](/C:/Users/cecil/proyectosAle/github/origen/webapp/scripts/run-live-e2e.mjs)
- [check-release-readiness.mjs](/C:/Users/cecil/proyectosAle/github/origen/webapp/scripts/check-release-readiness.mjs)
