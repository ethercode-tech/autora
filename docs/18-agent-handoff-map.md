# Mapa de handoff entre agentes

Estado consolidado el 2026-07-20.

Este documento resume como usar los subagentes del proyecto sin tener que recorrer uno por uno los archivos de `.agents/`.

## Regla de entrada

Antes de activar cualquier subagente:

1. leer [00-knowledge-tree.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/00-knowledge-tree.md)
2. revisar [17-latest-verification-evidence.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/17-latest-verification-evidence.md) si la tarea toca release, evidencia o entorno real
3. tomar el agente segun el tipo de cambio

## Secuencia base recomendada

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

No siempre hace falta usar toda la secuencia. La regla es activar el conjunto minimo que permita cerrar la tarea sin romper integridad, seguridad ni trazabilidad.

## Matriz rapida

| Agente | Cuando activarlo | Debe leer ademas de `00-knowledge-tree.md` | Entrega principal |
| --- | --- | --- | --- |
| `orchestrator` | cambios transversales o coordinacion multi-modulo | `08-dependency-matrix.md`, `10-implementation-roadmap.md`, `11-open-decisions.md` | secuencia de trabajo, riesgos y handoffs |
| `product-manager` | cambios de alcance, lenguaje de negocio o prioridades | `01-product-context.md`, `02-domain-map.md`, `11-open-decisions.md` | criterio funcional y alcance |
| `solution-architect` | cambios estructurales, integracion entre modulos o decisiones de diseño | `03-system-architecture.md`, `08-dependency-matrix.md`, `10-implementation-roadmap.md` | diseño tecnico y limites de modulo |
| `supabase-data-engineer` | nuevas tablas, vistas, RPC, migraciones o semillas | `04-data-model.md`, `05-business-rules.md`, `06-security-rls.md` | migraciones, SQL y contratos de datos |
| `security-rls-engineer` | cambios de permisos, roles, aislamiento o auditoria | `06-security-rls.md`, `14-verification-matrix.md`, `15-requirement-audit.md` | politicas RLS y chequeos de seguridad |
| `backend-engineer` | server actions, queries, validaciones sensibles y contratos operativos | `03-system-architecture.md`, `04-data-model.md`, `05-business-rules.md`, `06-security-rls.md` | logica server-side y errores operativos |
| `frontend-engineer` | pantallas, formularios, estados y flujos de usuario | `02-domain-map.md`, `07-critical-flows.md`, `12-repo-conventions.md` | UI funcional conectada a datos reales |
| `ux-ui-designer` | claridad de pantalla, copy, ayudas contextuales o responsive | `01-product-context.md`, `07-critical-flows.md`, `12-repo-conventions.md` | mejoras de experiencia y legibilidad |
| `qa-engineer` | nuevas pruebas, regresiones, criterios de aceptacion o cobertura faltante | `05-business-rules.md`, `07-critical-flows.md`, `09-testing-strategy.md`, `14-verification-matrix.md` | plan de pruebas y evidencia |
| `devops-release-engineer` | build, variables, readiness, deploy, CI o evidencias de release | `09-testing-strategy.md`, `12-repo-conventions.md`, `16-release-runbook.md`, `17-latest-verification-evidence.md` | scripts, readiness y release |
| `knowledge-librarian` | documentacion, onboarding, arbol de conocimiento o auditoria de estado | `12-repo-conventions.md`, `17-latest-verification-evidence.md`, `README.md` | docs consistentes y navegables |

## Handoffs criticos

- `product-manager` -> `solution-architect`
  - cuando cambia alcance o prioridad y eso afecta modelo, UI o flujo operativo
- `solution-architect` -> `supabase-data-engineer` / `backend-engineer`
  - cuando una decision estructural impacta contratos, RPC o modularidad
- `supabase-data-engineer` -> `security-rls-engineer`
  - toda nueva entidad o RPC sensible debe revisarse con permisos y aislamiento
- `security-rls-engineer` -> `backend-engineer`
  - backend no debe cerrar cambios sobre operaciones criticas sin validacion de seguridad
- `backend-engineer` -> `frontend-engineer`
  - cuando ya existe contrato estable para conectar formularios, tablas y estados
- `frontend-engineer` -> `ux-ui-designer`
  - para pulir claridad, feedback, vacios y responsive sin romper el flujo funcional
- `frontend-engineer` / `backend-engineer` -> `qa-engineer`
  - antes de cerrar el cambio, para validar cobertura local, live o release
- `qa-engineer` -> `devops-release-engineer`
  - cuando la evidencia debe integrarse a readiness, CI o despliegue
- todos -> `knowledge-librarian`
  - al final de cada cambio que altere reglas, rutas de lectura o estado verificado

## Uso recomendado por tipo de tarea

### Cambio funcional chico

- `orchestrator`
- `backend-engineer` o `frontend-engineer`
- `qa-engineer`
- `knowledge-librarian`

### Cambio de inventario, costos o RPC

- `orchestrator`
- `solution-architect`
- `supabase-data-engineer`
- `security-rls-engineer`
- `backend-engineer`
- `qa-engineer`
- `knowledge-librarian`

### Cambio de release o produccion

- `orchestrator`
- `devops-release-engineer`
- `qa-engineer`
- `knowledge-librarian`

## Estado actual relevante para cualquier agente

- El deployment productivo en `https://autoracontable.vercel.app` ya esta verificado.
- Los flujos live principales y la verificacion live contra Supabase real ya quedaron ejecutados el 2026-07-20.
- El bloqueo tecnico remanente para cerrar el release completo sigue siendo la conexion Postgres directa usable para `pnpm test:sql-smoke`.
