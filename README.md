# AUTORA

Aplicacion SaaS para pequenos emprendimientos que centraliza recursos, compras, produccion, stock, costos, ventas, movimientos economicos y administracion comercial.

Estado del repositorio al 2026-07-20:

- Base documental y arbol de conocimiento disponibles.
- MVP funcional implementado sobre Next.js + Supabase.
- Panel operativo, panel administrativo, autenticacion y migraciones presentes.
- Recuperacion de contrasena y exportacion JSON/CSV incluidas.
- Tests unitarios activos, deploy productivo verificado y suite E2E local validada.
  - nota: el readiness de release ya no bloquea por hosting, pero sigue bloqueado por SQL directo porque `SUPABASE_DB_URL` no es una URI Postgres valida.

## Punto de entrada recomendado

1. [docs/00-knowledge-tree.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/00-knowledge-tree.md)
2. [docs/13-current-implementation-map.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/13-current-implementation-map.md)
3. [docs/03-system-architecture.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/03-system-architecture.md)
4. [docs/04-data-model.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/04-data-model.md)
5. [docs/06-security-rls.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/06-security-rls.md)
6. [docs/09-testing-strategy.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/09-testing-strategy.md)
7. [docs/14-verification-matrix.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/14-verification-matrix.md)

## Estructura principal

```text
.
|-- .agents/
|-- docs/
|-- src/
|   |-- app/
|   |-- components/
|   |-- lib/
|   |-- server/
|   `-- features/
|-- supabase/
`-- tests/
```

## Comandos

- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm verify:baseline`
- `pnpm test:e2e`
- `pnpm test:e2e:live:check`
- `pnpm test:e2e:live`
- `pnpm test:e2e:live:manufacturer`
- `pnpm test:e2e:live:reseller`
- `pnpm test:production-access`
- `pnpm test:release:check`
- `pnpm test:sql-smoke:check`
- `pnpm test:sql-smoke`
- `pnpm test:sql-smoke:rls`
- `pnpm test:sql-smoke:multiuser`
- `pnpm test:sql-smoke:operational`
- `pnpm db:apply -- <sql-file> [sql-file...]`
- `pnpm db:apply:admin-fixes`

## Entorno

Parti de `.env.example` y completa:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

Si `psql` no esta disponible en `PATH`, define tambien:

- `PSQL_PATH`

En Windows, el runner intenta autodetectar `psql` en instalaciones comunes de PostgreSQL, por ejemplo `C:\Program Files\PostgreSQL\17\bin\psql.exe`.

## Verificacion sobre Supabase real

Con el proyecto Supabase configurado y una base accesible por Postgres:

1. Completa `.env.local` desde `.env.example`.
2. Asegura un binario `psql` disponible en `PATH` o configura `PSQL_PATH`.
3. Ejecuta `pnpm test:sql-smoke:check` para validar variables, `psql` y archivos requeridos.
4. Ejecuta `pnpm test:sql-smoke` para correr RLS declarativa, aislamiento multiusuario y flujo operativo integrado.
5. Si necesitas aislar una suite, usa:
   - `pnpm test:sql-smoke:rls`
   - `pnpm test:sql-smoke:multiuser`
   - `pnpm test:sql-smoke:operational`
6. Para aplicar fixes SQL puntuales sin Supabase CLI, usa:
   - `pnpm db:apply -- supabase/migrations/<archivo>.sql`
   - `pnpm db:apply:admin-fixes` para reaplicar los fixes admin/comerciales del 2026-07-20
7. Para verificar readiness de live E2E:
   - `pnpm test:e2e:live:check`
8. Para ejecutar los E2E live sobre UI real + Supabase real:
   - ambos flujos: `pnpm test:e2e:live`
   - solo fabricante: `pnpm test:e2e:live:manufacturer`
   - solo reventa: `pnpm test:e2e:live:reseller`
   - contra la URL productiva desplegada: define `E2E_EXTERNAL_BASE_URL=https://autoracontable.vercel.app` antes de correr cualquiera de esos comandos
9. Para verificar accesos productivos con cuentas reales:
   - `pnpm test:production-access`
   - variables esperadas:
     - `PRODUCTION_BASE_URL` o `E2E_EXTERNAL_BASE_URL` o `NEXT_PUBLIC_APP_URL`
     - `PRODUCTION_ADMIN_EMAIL`
     - `PRODUCTION_ADMIN_PASSWORD`
     - `PRODUCTION_BUSINESS_EMAIL`
     - `PRODUCTION_BUSINESS_PASSWORD`
10. Para auditar readiness de release del repositorio:
   - `pnpm test:release:check`
   - al 2026-07-20 reporta `ready=no`, `live-e2e=ok`, `sql-smoke=blocked`, `direct-db-url=missing` y `hosting-config=present` porque la variable configurada para SQL directo no usa esquema `postgres://` o `postgresql://`

## Estado actual

- Flujo operativo base cubierto:
  - solicitud de acceso
  - aprobacion administrativa
  - alta controlada
  - configuracion del emprendimiento
  - catalogo
  - compras
  - consumos
  - produccion
  - ventas
  - costos
  - dashboard
  - exportacion JSON y CSV
  - recetas con multiples insumos en un solo alta
- Flujo comercial base cubierto:
  - planes
  - suscripciones
  - pagos manuales
  - resolucion automatica de cuenta desde la suscripcion al registrar pagos
  - bloqueo operativo por estado de cuenta
  - auditoria administrativa
- Evidencia automatizada actual:
  - suite E2E local ejecutada el 2026-07-20 con `24 passed`
  - E2E live opt-in de fabricante ejecutado el 2026-07-20 con `1 passed` sobre UI real + Supabase real
  - E2E live opt-in de reventa ejecutado el 2026-07-20 con `1 passed` sobre UI real + Supabase real
  - runner unificado `pnpm test:e2e:live` ejecutado el 2026-07-20 con build productivo + `2 passed`
  - flujo `manufacturer` ejecutado el 2026-07-20 contra `https://autoracontable.vercel.app` con `1 passed`
  - flujo `reseller` ejecutado el 2026-07-20 contra `https://autoracontable.vercel.app` con `1 passed`
  - `pnpm test:production-access` ejecutado el 2026-07-20 contra `https://autoracontable.vercel.app`
  - login real del admin bootstrap `admin@autora.local` verificado el 2026-07-20 sobre `https://autoracontable.vercel.app/admin`
  - login real del emprendimiento bootstrap `lumiq@autora.local` verificado el 2026-07-20 sobre `https://autoracontable.vercel.app/dashboard`
  - auditoria `pnpm test:release:check` ejecutada el 2026-07-20 con bloqueo explicito por URL directa invalida para `psql`
  - baseline reproducible `pnpm verify:baseline` ejecutado el 2026-07-20 con lint, typecheck, suite Vitest y build productivo en verde
  - target de hosting del workspace configurado en `.openai/hosting.json` el 2026-07-20
  - build productivo local ejecutado el 2026-07-20 con `pnpm build`
  - runner reproducible para smokes SQL sobre Supabase real
  - verificacion live sobre Supabase ejecutada el 2026-07-20 con 22 checks operativos, comerciales y de RLS en verde
  - deployment productivo verificado el 2026-07-20 en `https://autoracontable.vercel.app`, incluyendo redireccion a login para `/dashboard` y `/admin` sin fallback de variables faltantes

## Pendientes principales

- Reemplazar `SUPABASE_DB_URL` o `DATABASE_URL` por una URI Postgres real (`postgres://` o `postgresql://`) para poder correr smokes SQL directos y `db:apply`.
  - ejemplo esperado por el preflight actual: `postgresql://postgres:<db-password>@db.skqtwagdshdppijswchw.supabase.co:5432/postgres`
- Ejecutar smokes SQL multiusuario y operativos contra un proyecto Supabase activo por `psql` una vez corregida esa configuracion.
- Opciones de exportacion adicionales a CSV cuando aparezcan necesidades de reporte mas especializadas.
