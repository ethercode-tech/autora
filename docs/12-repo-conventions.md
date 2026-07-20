# Convenciones de repositorio

## Objetivo

Mantener implementacion y documentacion alineadas para que futuros agentes no reconstruyan contexto desde cero.

## Reglas

- Toda decision estructural relevante se documenta en `docs/`.
- Todo cambio de alcance o regla de negocio actualiza `docs/05-business-rules.md` o `docs/11-open-decisions.md`.
- Toda nueva entidad o RPC actualiza `docs/04-data-model.md`.
- Todo cambio de flujo operativo actualiza `docs/07-critical-flows.md`.
- Toda nueva responsabilidad de agente actualiza `.agents/README.md`.

## Convenciones futuras de codigo

- Sin `any`.
- Sin `@ts-ignore`.
- Sin mocks dentro del flujo productivo real.
- Sin logica compleja embebida en componentes React.
- Sin operaciones de inventario fragmentadas en cliente.

## Definicion de listo para una tarea

- codigo,
- validacion,
- pruebas,
- documentacion actualizada,
- sin contradicciones con este arbol de conocimiento.
