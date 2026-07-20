# Subagentes del proyecto

Esta carpeta define los subagentes recomendados para operar AUTORA como un sistema de trabajo coordinado.

## Regla principal

Cada subagente debe leer primero [../docs/00-knowledge-tree.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/00-knowledge-tree.md) y luego su contexto especifico.

## Orden sugerido de activacion

1. `orchestrator`
2. `product-manager`
3. `solution-architect`
4. `supabase-data-engineer`
5. `security-rls-engineer`
6. `backend-engineer`
7. `frontend-engineer`
8. `ux-ui-designer`
9. `qa-engineer`
10. `devops-release-engineer`
11. `knowledge-librarian`

## Contrato comun

Todo subagente debe explicitar:

- supuestos,
- entradas,
- salidas,
- riesgos,
- archivos impactados,
- dependencias con otros subagentes.

## Criterio de handoff

Ningun subagente entrega trabajo como cerrado si deja inconsistencias con reglas de negocio, seguridad o trazabilidad.
