# Arquitectura objetivo

## Stack obligatorio

- Next.js con App Router
- React
- TypeScript estricto
- Tailwind CSS
- Supabase Auth
- PostgreSQL
- Zod
- React Hook Form
- ESLint
- Prettier
- Vitest
- Playwright

## Principios de arquitectura

- Separacion fuerte entre UI, validacion, casos de uso, acceso a datos e infraestructura.
- Toda operacion sensible se resuelve del lado servidor.
- No confiar en calculos enviados por navegador.
- Evitar duplicar logica entre cliente, server actions y SQL.

## Estructura de referencia

```text
src/
  app/
    (public)/
    (auth)/
    (dashboard)/
    admin/
    api/
  components/
    ui/
    layout/
    forms/
    tables/
    charts/
    feedback/
  features/
    auth/
    onboarding/
    units/
    resources/
    products/
    recipes/
    purchases/
    consumptions/
    production/
    sales/
    inventory/
    pricing/
    finances/
    dashboard/
    admin/
    subscriptions/
  lib/
    auth/
    formatting/
    validation/
    permissions/
    errors/
    observability/
    supabase/
  server/
    actions/
    services/
    repositories/
    queries/
  types/
  tests/
```

## Capas recomendadas

### Presentacion

- Rutas App Router
- Layouts
- Componentes de UI
- Formularios

### Aplicacion

- Server Actions
- Route Handlers
- Casos de uso
- Orquestacion de reglas

### Dominio

- Entidades
- Reglas de negocio
- Calculos
- Politicas de validacion

### Infraestructura

- Cliente Supabase
- Repositorios
- RPC
- Logging

## Decisiones estructurales

- Usar `inventory_movements` como libro unico de stock.
- Resolver compras, producciones, ventas y reversiones con transacciones.
- Congelar snapshots historicos cuando el futuro cambio de una receta o precio pueda alterar el pasado.
- Mantener admin y cuenta usuaria en areas separadas, con autorizacion diferenciada.
