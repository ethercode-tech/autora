# AUTORA

Aplicacion SaaS para pequenos emprendimientos que centraliza recursos, compras, produccion, stock, costos, ventas, movimientos economicos y administracion comercial.

Estado del repositorio al 2026-07-20:

- Base documental y arbol de conocimiento disponibles.
- MVP funcional implementado sobre Next.js + Supabase.
- Panel operativo, panel administrativo, autenticacion y migraciones presentes.
- Recuperacion de contrasena y exportacion JSON incluidas.
- Tests unitarios activos, smokes SQL preparados y suite E2E local validada.

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
- `pnpm test:e2e`
- `pnpm test:sql-smoke`
- `pnpm test:sql-smoke:rls`
- `pnpm test:sql-smoke:multiuser`
- `pnpm test:sql-smoke:operational`

## Entorno

Parti de `.env.example` y completa:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

Si `psql` no esta disponible en `PATH`, define tambien:

- `PSQL_PATH`

## Verificacion sobre Supabase real

Con el proyecto Supabase configurado y una base accesible por Postgres:

1. Completa `.env.local` desde `.env.example`.
2. Asegura un binario `psql` disponible en `PATH` o configura `PSQL_PATH`.
3. Ejecuta `pnpm test:sql-smoke` para correr RLS declarativa, aislamiento multiusuario y flujo operativo integrado.
4. Si necesitas aislar una suite, usa:
   - `pnpm test:sql-smoke:rls`
   - `pnpm test:sql-smoke:multiuser`
   - `pnpm test:sql-smoke:operational`

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
  - exportacion
- Flujo comercial base cubierto:
  - planes
  - suscripciones
  - pagos manuales
  - bloqueo operativo por estado de cuenta
  - auditoria administrativa
- Evidencia automatizada actual:
  - suite E2E local ejecutada el 2026-07-20 con `22 passed` y `1 skipped`
  - runner reproducible para smokes SQL sobre Supabase real

## Pendientes principales

- E2E de fabricante y reventa con persistencia real.
- Ejecucion real de smokes SQL multiusuario y operativos contra un proyecto Supabase activo.
- Mejoras de ergonomia para recetas con multiples insumos.
- Opciones de exportacion adicionales a JSON.
