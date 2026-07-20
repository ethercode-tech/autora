# Auditoria de requisitos

Estado consolidado el 2026-07-20.

Este documento cruza el objetivo final del producto con evidencia real del repositorio. No redefine exito: muestra que ya esta cubierto, que solo tiene evidencia parcial y que sigue pendiente.

## Resultado operativo esperado

- Solicitud de acceso, aprobacion, activacion, onboarding y guardas comerciales:
  - evidencia: `src/app/(public)/*`
  - evidencia: `src/server/actions/auth.ts`
  - evidencia: `src/server/actions/admin.ts`
  - evidencia: `src/lib/auth/account-status.ts`
  - estado: parcial verificado
- Configuracion, recursos, productos, compras, recetas, produccion, ventas y dashboard:
  - evidencia: `src/app/(dashboard)/*`
  - evidencia: `src/server/actions/*`
  - evidencia: `src/server/queries/catalog.ts`
  - estado: parcial verificado
- Alertas de faltantes y consulta del estado real del negocio:
  - evidencia: `src/features/inventory/lib/calculate-stock.ts`
  - evidencia: `src/features/dashboard/lib/build-dashboard-metrics.ts`
  - estado: parcial verificado

## Objetivo funcional del MVP

- Cubierto con implementacion visible:
  - solicitud y aprobacion de acceso
  - registro e inicio de sesion
  - recuperacion de contrasena
  - configuracion del emprendimiento
  - gestion de unidades de medida
  - gestion de recursos
  - registro de compras
  - registro de consumos manuales
  - gestion de productos
  - gestion de recetas
  - registro de produccion
  - calculadora de costos
  - historial de calculos
  - registro de ventas
  - stock automatico de recursos y productos
  - movimientos economicos
  - dashboard
  - exportacion JSON y CSV
  - gestion de suscripcion
  - panel administrativo
  - gestion de usuarios y cuentas
  - gestion de planes
  - gestion de pagos
  - metricas globales
  - auditoria administrativa
- Evidencia principal:
  - `docs/13-current-implementation-map.md`
  - `src/app/(dashboard)/*`
  - `src/app/admin/page.tsx`
  - `supabase/migrations/202607200001_initial_schema.sql`
- Gap:
  - evidencia E2E persistente ya disponible para fabricante y reventa; resta evidencia de ejecucion completa de smokes SQL directos por `psql` y evidencia de despliegue productivo

## Objetivo tecnico

- Persistencia en nube y fuente unica de verdad:
  - evidencia: clientes Supabase server-side en `src/lib/supabase/*`
  - evidencia: migraciones en `supabase/migrations/*`
  - evidencia: `src/architecture/storage-boundary.test.ts`
  - estado: cubierto a nivel de arquitectura
- Aislamiento, roles y RLS:
  - evidencia: `docs/06-security-rls.md`
  - evidencia: `src/server/queries/rls-migration.test.ts`
  - evidencia ejecutable: `tests/rls/rls-smoke.sql`
  - estado: parcial verificado
- Validaciones frontend y backend:
  - evidencia: `src/lib/validation/*`
  - evidencia: formularios en `src/components/forms/*`
  - estado: cubierto
- Operaciones transaccionales, integridad y prevencion de stock negativo:
  - evidencia: RPC SQL `register_purchase`, `register_resource_consumption`, `register_production`, `register_sale`, `adjust_inventory`
  - evidencia: `src/server/queries/rls-migration.test.ts`
  - estado: parcial verificado
- Tipado estricto, modularidad, manejo de errores y responsive:
  - evidencia: TypeScript estricto, estructura por dominios y formularios responsivos
  - evidencia: `src/features/operations/lib/operation-feedback.ts`
  - estado: cubierto
- Logs estructurados:
  - evidencia: `src/lib/observability/structured-log.ts`
  - evidencia: integraciones en `src/server/actions/admin.ts`, `src/server/actions/operations.ts`, `src/server/actions/consumption.ts`, `src/server/actions/production.ts`, `src/server/actions/pricing.ts`
  - estado: cubierto de manera inicial
- Build y despliegue reproducibles:
  - evidencia: scripts de `package.json`
  - evidencia adicional: `scripts/apply-sql-files.mjs`
  - evidencia adicional: `scripts/check-live-e2e-readiness.mjs`
  - evidencia adicional: `scripts/check-release-readiness.mjs`
  - evidencia adicional: `scripts/run-live-e2e.mjs`
  - evidencia adicional: `src/server/queries/check-live-e2e-readiness.test.ts`
  - evidencia adicional: `src/server/queries/check-release-readiness.test.ts`
  - evidencia adicional: `src/server/queries/run-live-e2e.test.ts`
  - evidencia ejecutada el 2026-07-20: `npm run test:sql-smoke:check` detecta `psql` automaticamente en `C:\Program Files\PostgreSQL\17\bin\psql.exe`
  - evidencia ejecutada el 2026-07-20: `pnpm build` completo sobre Next.js 15.5.20
  - evidencia ejecutada el 2026-07-20: `pnpm test:e2e:live:check` y `pnpm test:e2e:live`
  - evidencia ejecutada el 2026-07-20: `pnpm test:release:check` con bloqueo explicito porque `SUPABASE_DB_URL` o `DATABASE_URL` no usan un esquema Postgres valido
  - evidencia de hosting gestionado: `.openai/hosting.json`
  - evidencia ejecutada el 2026-07-20: `4 passed` en pruebas de helpers operativos
  - evidencia ejecutada el 2026-07-20: `6 passed` en pruebas del runner live
  - estado: parcial, falta evidencia de despliegue productivo real y corregir la URL directa de Postgres para ejecutar el smoke SQL completo

## Objetivo de inventario y economico

- Compra aumenta stock y genera egreso:
  - evidencia: `supabase/migrations/202607200001_initial_schema.sql`
  - evidencia: `src/server/queries/rls-migration.test.ts`
  - estado: verificado declarativamente
- Consumo manual descuenta stock y deja trazabilidad:
  - evidencia: `supabase/migrations/202607200002_consumptions_and_pricing.sql`
  - evidencia: `src/server/queries/rls-migration.test.ts`
  - estado: verificado declarativamente
- Produccion valida recursos, descuenta insumos, suma producto y registra costo:
  - evidencia: `supabase/migrations/202607200003_production_costs.sql`
  - evidencia: `src/server/queries/rls-migration.test.ts`
  - estado: verificado declarativamente
- Venta valida stock, descuenta producto y registra ingreso:
  - evidencia: `supabase/migrations/202607200001_initial_schema.sql`
  - evidencia: `src/server/queries/rls-migration.test.ts`
  - estado: verificado declarativamente
- Calculadora explicable y reproducible:
  - evidencia: `src/features/pricing/lib/calculate-price.ts`
  - evidencia: `src/features/pricing/lib/calculate-price.test.ts`
  - estado: cubierto

## Criterio final de exito y demostraciones requeridas

1. Datos aislados por usuaria.
   - evidencia actual: RLS declarativa y smoke SQL preparado
   - evidencia ejecutable: `tests/rls/multiuser-smoke.sql`
   - evidencia ejecutada el 2026-07-20: `npm run test:supabase-live`
   - estado: verificado por API real; falta solo evidencia adicional por `psql` si se desea doble cobertura
2. Compras aumentan stock.
   - evidencia actual: test declarativo de migracion
   - evidencia ejecutable: `tests/integration/operational-flow-smoke.sql`
   - evidencia ejecutada el 2026-07-20: `npm run test:supabase-live`
   - estado: verificado por API real
3. Consumos disminuyen stock.
   - evidencia actual: RPC y prueba declarativa
   - evidencia ejecutable: `tests/integration/operational-flow-smoke.sql`
   - evidencia ejecutada el 2026-07-20: `npm run test:supabase-live`
   - estado: verificado por API real
4. Produccion descuenta recursos y suma productos.
   - evidencia actual: RPC con costo y prueba declarativa
   - evidencia ejecutable: `tests/integration/operational-flow-smoke.sql`
   - evidencia ejecutada el 2026-07-20: `npm run test:supabase-live`
   - estado: verificado por API real
5. Ventas descuentan productos.
   - evidencia actual: RPC y prueba declarativa
   - evidencia ejecutable: `tests/integration/operational-flow-smoke.sql`
   - evidencia ejecutada el 2026-07-20: `npm run test:supabase-live`
   - estado: verificado por API real
6. No se permite vender o producir sin stock suficiente.
   - evidencia actual: pruebas de invariantes SQL y mensajes operativos
   - evidencia ejecutable: `tests/integration/operational-flow-smoke.sql`
   - evidencia ejecutada el 2026-07-20: `npm run test:supabase-live` con oversell y sobreproduccion rechazadas
   - estado: verificado por API real
7. Movimientos economicos correctos.
   - evidencia actual: pruebas declarativas y metricas dashboard
   - evidencia ejecutada el 2026-07-20: `npm run test:supabase-live`
   - estado: verificado por API real para compra y venta
8. Alertas en el momento adecuado.
   - evidencia actual: calculo de stock y dashboard
   - evidencia ejecutada el 2026-07-20: `npm run test:supabase-live`
   - estado: verificado por API real
9. Calculos de costos reproducibles.
   - evidencia actual: pruebas unitarias y persistencia en produccion
   - estado: cubierto
10. Dashboard refleja datos reales.
   - evidencia actual: agregadores probados
   - evidencia ejecutada el 2026-07-20: `npm run test:supabase-live` sobre ventas, ingresos, egresos, saldo y alertas
   - evidencia ejecutada el 2026-07-20: `tests/e2e/live-manufacturer-flow.spec.ts` y `tests/e2e/live-reseller-flow.spec.ts`
   - estado: verificado en fuente real y desde UI persistente
11. Cuentas bloqueadas no pueden operar.
   - evidencia actual: guardas y pruebas de estado
   - evidencia ejecutable: `tests/integration/operational-flow-smoke.sql`
   - evidencia ejecutada el 2026-07-20: `npm run test:supabase-live`
   - estado: verificado por API real
12. Administracion del ciclo comercial.
   - evidencia actual: panel admin, acciones y pruebas de transicion comercial
   - evidencia adicional: `src/app/admin/page.test.tsx`
   - evidencia adicional: `src/components/forms/payment-form.test.tsx`
   - evidencia adicional: `src/features/commercial/lib/payment-subscription-selection.test.ts`
   - evidencia adicional: `src/features/commercial/lib/account-commercial-state.test.ts`
   - evidencia adicional: `supabase/migrations/202607200004_admin_commercial_rls.sql`
   - evidencia adicional: `supabase/migrations/202607200005_fix_is_admin_recursion.sql`
   - evidencia de implementacion: `src/server/actions/admin.ts` deriva `user_id` del pago desde la suscripcion persistida
   - evidencia de implementacion: `src/server/actions/admin.ts` resuelve la promocion de estado tras crear suscripciones con el `account_status` real del perfil
   - evidencia ejecutada el 2026-07-20: `npm run test:supabase-live` valido aprobacion de solicitudes, alta de planes, suscripciones, pagos, activacion de cuenta y auditoria admin
   - estado: verificado por API real
13. Operaciones criticas transaccionales.
   - evidencia actual: RPC SQL atomicas
   - evidencia ejecutable: `tests/integration/operational-flow-smoke.sql`
   - evidencia ejecutada el 2026-07-20: `npm run test:supabase-live` con rollback comprobado en venta y produccion fallidas
   - estado: verificado por API real
14. Flujos principales con pruebas automatizadas.
   - evidencia actual: unitarias, declarativas y suite E2E local ejecutada
   - evidencia ejecutada el 2026-07-20: `24 passed` en Playwright
   - evidencia ejecutada el 2026-07-20: `tests/e2e/live-manufacturer-flow.spec.ts` con `1 passed` sobre UI real + Supabase real
   - evidencia ejecutada el 2026-07-20: `tests/e2e/live-reseller-flow.spec.ts` con `1 passed` sobre UI real + Supabase real
   - estado: verificado
15. Despliegue sin datos locales.
   - evidencia actual: arquitectura server-side con Supabase
   - evidencia adicional: `src/architecture/storage-boundary.test.ts`
   - evidencia ejecutada el 2026-07-20: `pnpm build`
   - evidencia ejecutada el 2026-07-20: `pnpm test:e2e:live` construye bundle productivo y verifica ambos flujos principales sobre Supabase real
   - evidencia ejecutada el 2026-07-20: `pnpm test:release:check` confirma que el workspace ya tiene target de hosting, pero no una URL directa Postgres valida para los smokes SQL
   - estado: parcial, falta evidencia de despliegue productivo y smoke SQL directo

## Siguiente tramo recomendado

- Ejecutar una prueba integrada real sobre Supabase para compra, consumo, produccion y venta.
- Corregir `SUPABASE_DB_URL` o `DATABASE_URL` a una URI Postgres valida y luego ejecutar smoke SQL directo por `psql`, incluyendo el caso multiusuario, para sumar evidencia adicional de aislamiento RLS.
- Publicar una version productiva real sobre el target ya configurado del workspace.

## Runner operativo disponible

- Script: `scripts/run-sql-smoke.mjs`
- Preflight: `scripts/check-sql-smoke-readiness.mjs`
- Apply runner: `scripts/apply-sql-files.mjs`
- Verificacion live: `scripts/verify-live-supabase.mjs`
- Comando principal: `npm run test:sql-smoke`
- Comando de readiness: `npm run test:sql-smoke:check`
- Comando live: `npm run test:supabase-live`
- Suites disponibles:
  - `npm run test:sql-smoke:rls`
  - `npm run test:sql-smoke:multiuser`
  - `npm run test:sql-smoke:operational`
- Requisitos:
  - `SUPABASE_DB_URL` o `DATABASE_URL` con esquema `postgres://` o `postgresql://`
  - `psql` en `PATH`, `PSQL_PATH` o instalado en una ruta estandar de PostgreSQL para Windows
