# AUTORA

Aplicacion SaaS para pequenos emprendimientos que centraliza recursos, compras, produccion, stock, costos, ventas, movimientos economicos y administracion comercial.

Estado del repositorio al 2026-07-20:

- Base documental y arbol de conocimiento disponibles.
- MVP funcional implementado sobre Next.js + Supabase.
- Panel operativo, panel administrativo, autenticacion y migraciones presentes.
- Recuperacion de contrasena y exportacion JSON incluidas.
- Tests unitarios activos y E2E todavia pendientes.

## Punto de entrada recomendado

1. [docs/00-knowledge-tree.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/00-knowledge-tree.md)
2. [docs/13-current-implementation-map.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/13-current-implementation-map.md)
3. [docs/03-system-architecture.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/03-system-architecture.md)
4. [docs/04-data-model.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/04-data-model.md)
5. [docs/06-security-rls.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/06-security-rls.md)
6. [docs/09-testing-strategy.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/09-testing-strategy.md)

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

## Pendientes principales

- E2E de flujos criticos.
- Pruebas de aislamiento RLS multiusuario.
- Mejoras de ergonomia para recetas con multiples insumos.
- Opciones de exportacion adicionales a JSON.
