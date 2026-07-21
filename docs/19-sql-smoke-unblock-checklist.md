# Checklist para destrabar SQL smoke

Estado consolidado el 2026-07-21.

Este documento existe para cerrar el ultimo bloqueo tecnico que hoy impide completar la evidencia full del release desde este workspace.

## Bloqueo actual

Al 2026-07-21:

- `psql` ya esta disponible en `C:\Program Files\PostgreSQL\17\bin\psql.exe`
- `pnpm test:e2e:live`, `pnpm test:supabase-live` y el deployment productivo ya quedaron verificados
- el unico bloqueo restante es que `pnpm test:sql-smoke:check` no encuentra una conexion Postgres usable

Estado observado en el entorno actual:

- `.env` y `.env.local` contienen `SUPABASE_DB_URL`
- esa variable no apunta a una URI Postgres directa usable por `psql`
- no existe `SUPABASE_DB_PASSWORD`

## Formas validas de desbloquearlo

### Opcion A

Definir una de estas variables con una conexion Postgres directa:

- `SUPABASE_DB_URL`
- `DATABASE_URL`

Formato esperado:

- `postgresql://postgres:<db-password>@db.skqtwagdshdppijswchw.supabase.co:5432/postgres`

### Opcion B

Mantener `NEXT_PUBLIC_SUPABASE_URL` y agregar:

- `SUPABASE_DB_PASSWORD`

Con esa combinacion, el runner ya puede derivar automaticamente:

- host `db.skqtwagdshdppijswchw.supabase.co`
- puerto `5432`
- usuario `postgres`
- base `postgres`

## Secuencia exacta para cerrar el bloqueo

1. Cargar una conexion Postgres valida por Opcion A o Opcion B en `.env.local`
2. Ejecutar:
   - `pnpm test:sql-smoke:check`
3. Confirmar salida esperada:
   - `ready=yes`
   - `psql=ok`
4. Ejecutar:
   - `pnpm test:sql-smoke`
5. Si hace falta aislar fallas por suite:
   - `pnpm test:sql-smoke:rls`
   - `pnpm test:sql-smoke:multiuser`
   - `pnpm test:sql-smoke:operational`
6. Actualizar:
   - [17-latest-verification-evidence.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/17-latest-verification-evidence.md)
   - [14-verification-matrix.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/14-verification-matrix.md)
   - [15-requirement-audit.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/15-requirement-audit.md)
   - [16-release-runbook.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/16-release-runbook.md)

## Qué debería probar ese smoke

Cuando el comando pase, la evidencia adicional esperada es:

- aislamiento RLS por SQL directo
- no lectura cruzada entre usuarias
- no escritura con `user_id` ajeno
- compra con aumento de stock
- consumo con descuento de stock
- produccion con descuento de recursos y suma de producto
- venta con descuento de producto
- bloqueo por stock insuficiente
- rollback transaccional ante fallas operativas
- bloqueo de cuentas no activas

## Qué no hace falta volver a demostrar

No hace falta reabrir como bloqueo:

- deploy productivo
- login real admin y negocio
- flujos live principales con Playwright
- verificacion live por API sobre Supabase real

Todo eso ya tiene evidencia vigente en:

- [17-latest-verification-evidence.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/17-latest-verification-evidence.md)
- [15-requirement-audit.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/15-requirement-audit.md)

## Criterio de salida

Este checklist se considera resuelto cuando:

- `pnpm test:sql-smoke:check` devuelve `ready=yes`
- `pnpm test:sql-smoke` completa en verde
- la evidencia resultante queda reflejada en el arbol documental
