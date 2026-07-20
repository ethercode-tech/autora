# Evidencia mas reciente

Estado consolidado el 2026-07-20.

Este documento resume la evidencia ejecutada mas reciente que hoy demuestra comportamiento real del sistema. No reemplaza la matriz de verificacion ni la auditoria de requisitos: funciona como hoja de consulta rapida para agentes y revisores.

## Señales fuertes ya verificadas

- `pnpm build` completo sobre Next.js 15.5.20.
- `pnpm test:e2e:live` validado con ambos flujos principales.
- `E2E_EXTERNAL_BASE_URL=https://autoracontable.vercel.app` validado para fabricante y reventa sobre el deployment activo.
- `pnpm test:production-access` validado contra `https://autoracontable.vercel.app`.
- Verificacion live contra Supabase real ejecutada otra vez el 2026-07-20 con `22` checks en verde.

## Resultado live contra Supabase real

Ejecucion mas reciente:

- comando: `node scripts/verify-live-supabase.mjs`
- fecha: 2026-07-20
- resultado: `status=ok`
- usuarios temporales creados y limpiados: `4`
- checks en verde: `22`

Checks validados:

- `admin_can_approve_access_requests`
- `admin_can_create_plans`
- `admin_can_create_subscriptions`
- `admin_can_transition_profile_after_subscription`
- `admin_can_create_payments`
- `admin_can_update_subscriptions_after_payment`
- `admin_can_activate_profiles_after_payment`
- `admin_can_write_audit_logs`
- `purchase_increases_resource_stock`
- `sale_decreases_product_stock`
- `production_records_costs`
- `financial_movements_created`
- `stock_alerts_are_triggered`
- `dashboard_source_metrics_are_consistent`
- `oversell_is_blocked`
- `failed_sale_rolls_back`
- `overproduction_is_blocked`
- `failed_production_rolls_back`
- `rls_hides_foreign_resources`
- `rls_blocks_foreign_inserts`
- `rls_blocks_foreign_updates`
- `blocked_accounts_cannot_operate`

Implicancias directas:

- el ciclo comercial admin funciona sobre la base real,
- compras, produccion y ventas afectan stock y movimientos economicos,
- los calculos persistidos de costo quedan consistentes,
- los rollbacks operativos siguen intactos,
- RLS sigue aislando datos entre usuarias,
- las cuentas bloqueadas no pueden seguir operando.

## Evidencia productiva del deployment

- URL productiva activa: `https://autoracontable.vercel.app`
- `admin@autora.local` verificado con acceso visible a `/admin`
- `lumiq@autora.local` verificado con acceso visible a `/dashboard`
- `/admin` y `/dashboard` ya no muestran el fallback de variables faltantes; sin sesion redirigen a login

## Bloqueo que sigue abierto

El release todavia no puede cerrarse con evidencia completa por `psql` directo porque el entorno actual sigue sin resolver una conexion Postgres usable para los runners SQL.

Falta una de estas dos configuraciones:

- `SUPABASE_DB_URL` o `DATABASE_URL` con esquema `postgres://` o `postgresql://`
- o `NEXT_PUBLIC_SUPABASE_URL + SUPABASE_DB_PASSWORD`

Con eso pendiente, `pnpm test:sql-smoke:check` y `pnpm test:release:check` siguen marcando correctamente el bloqueo del smoke SQL directo.
