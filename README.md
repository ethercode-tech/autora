# AUTORA

Base documental y operativa para construir el MVP de AUTORA, una plataforma SaaS de gestion para pequenos emprendimientos de fabricacion o reventa.

Hoy el repositorio no contiene la aplicacion implementada. Este primer commit deja preparado el contexto compartido para que futuros agentes y equipos trabajen con un marco unico de producto, arquitectura y ejecucion.

## Objetivo de este commit

- Definir el arbol de conocimiento del producto.
- Crear una malla de subagentes con responsabilidades explicitas.
- Evitar que cada agente tenga que reconstruir el contexto leyendo requerimientos dispersos.
- Dejar una base lista para la fase de implementacion.

## Punto de entrada recomendado

1. [docs/00-knowledge-tree.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/00-knowledge-tree.md)
2. [docs/01-product-context.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/01-product-context.md)
3. [docs/03-system-architecture.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/03-system-architecture.md)
4. [docs/04-data-model.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/04-data-model.md)
5. [docs/06-security-rls.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/06-security-rls.md)
6. [docs/10-implementation-roadmap.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/10-implementation-roadmap.md)
7. [docs/11-open-decisions.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/11-open-decisions.md)

## Estructura creada

```text
.
|-- .agents/
|   |-- README.md
|   |-- orchestrator.md
|   |-- product-manager.md
|   |-- solution-architect.md
|   |-- ux-ui-designer.md
|   |-- frontend-engineer.md
|   |-- backend-engineer.md
|   |-- supabase-data-engineer.md
|   |-- security-rls-engineer.md
|   |-- qa-engineer.md
|   |-- devops-release-engineer.md
|   `-- knowledge-librarian.md
`-- docs/
    |-- 00-knowledge-tree.md
    |-- 01-product-context.md
    |-- 02-domain-map.md
    |-- 03-system-architecture.md
    |-- 04-data-model.md
    |-- 05-business-rules.md
    |-- 06-security-rls.md
    |-- 07-critical-flows.md
    |-- 08-dependency-matrix.md
    |-- 09-testing-strategy.md
    |-- 10-implementation-roadmap.md
    |-- 11-open-decisions.md
    `-- 12-repo-conventions.md
```

## Fuente funcional

La fuente principal de requerimientos es `AUTORA_Especificacion_Funcional_MVP.docx`, complementada por el brief operativo adjunto al pedido.

Fecha de consolidacion documental: 2026-07-20.

## Estado del proyecto

- Aplicacion: no implementada todavia.
- Requerimientos funcionales: consolidados.
- Arquitectura objetivo: definida.
- Subagentes: creados.
- Roadmap inicial: definido.

## Siguiente paso recomendado

Iniciar la fase de fundaciones tecnicas con:

1. scaffolding de Next.js App Router,
2. configuracion de TypeScript, lint, formato y testing,
3. integracion de Supabase,
4. migraciones iniciales,
5. autenticacion y perfiles.
