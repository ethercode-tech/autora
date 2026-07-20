# Mapa de implementacion actual

Estado consolidado el 2026-07-20.

## Stack operativo

- Next.js App Router.
- TypeScript estricto.
- Tailwind CSS.
- Supabase Auth + Postgres + RLS.
- Vitest para unit tests.
- Playwright preparado para E2E.

## Modulos implementados

- Acceso publico:
  - solicitud de acceso.
  - login.
  - alta controlada desde solicitud aprobada.
  - recuperacion de contrasena.
  - pantalla de estado de cuenta.
- Operacion de negocio:
  - configuracion del emprendimiento.
  - unidades de medida.
  - recursos.
  - productos.
  - compras.
  - consumos manuales.
  - recetas.
  - produccion.
  - ventas.
  - calculadora de costos.
  - resultados y movimientos economicos.
  - exportacion JSON y CSV.
  - observabilidad con logs estructurados en acciones criticas.
- Administracion:
  - revision de solicitudes.
  - gestion de estado de cuenta.
  - planes.
  - suscripciones.
  - pagos.
  - auditoria.
  - bootstrap de usuario admin.
  - bootstrap de emprendimientos de prueba.

## Mapa de carpetas

- `src/app/(public)`: onboarding, acceso, recuperacion y estado de cuenta.
- `src/app/(dashboard)`: operacion diaria del emprendimiento.
- `src/app/admin`: panel interno de AUTORA.
- `src/app/api/export/route.ts`: exportacion del estado del negocio.
- `src/components/forms`: formularios conectados a acciones server-side.
- `src/server/actions`: mutaciones y reglas de aplicacion.
- `src/server/queries`: lecturas consolidadas para vistas y exportes.
- `src/lib/auth`: sesion, estados de cuenta y guardas de acceso.
- `src/lib/validation`: esquemas zod compartidos.
- `supabase/migrations`: esquema, RLS y RPC transaccionales.
- `scripts/bootstrap-admin.mjs`: alta controlada de administrador inicial.
- `scripts/bootstrap-business.mjs`: alta controlada de emprendimientos de prueba y datos semilla.
- `scripts/verify-live-supabase.mjs`: verificacion API real sobre Supabase.
- `scripts/run-sql-smoke.mjs`: ejecucion de smokes SQL por `psql`.

## Fuente de verdad por dominio

- Cuenta y seguridad: `auth.users`, `profiles`, `admin_users`.
- Comercial: `plans`, `subscriptions`, `payments`, `access_requests`.
- Catalogo: `measurement_units`, `resources`, `products`, `recipes`, `recipe_items`.
- Operacion: `purchases`, `purchase_items`, `resource_consumptions`, `production_orders`, `production_items`, `sales`, `sale_items`.
- Trazabilidad: `inventory_movements`, `financial_movements`, `pricing_calculations`, `admin_audit_logs`.

## Flujos con automatizacion real

- Compra:
  - `register_purchase` aumenta stock y genera egreso.
- Consumo manual:
  - `register_resource_consumption` descuenta stock de recurso.
- Produccion:
  - `register_production` valida insumos, descuenta recursos y suma producto.
- Venta:
  - `register_sale` valida stock, descuenta producto y genera ingreso.
- Ciclo comercial:
  - acciones admin sincronizan pago, suscripcion y `account_status`.

## Gaps abiertos

- `src/types/database.ts` esta incompleto respecto del esquema real y no debe tratarse como fuente canonica hasta regenerarlo o ampliarlo.
- Verificacion SQL directa por `psql` pendiente como evidencia de ejecucion completa; el entorno actual ya resuelve readiness y URL directa, pero la corrida total aun no quedo documentada como exitosa.
- Edicion avanzada de recetas existente solo en alta inicial; falta un flujo de edicion posterior si se requiere.
- Exportacion CSV agregada; faltan formatos adicionales si se requieren reportes mas especializados.
