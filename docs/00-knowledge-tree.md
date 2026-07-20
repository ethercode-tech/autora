# Arbol de conocimiento

Este archivo es el indice maestro. Su objetivo es reducir tiempo de onboarding para cualquier agente o ingeniero nuevo.

## Estado operativo rapido

- Build productivo local verificado el 2026-07-20 con `pnpm build`.
- El preflight de release detecta un bloqueo real al 2026-07-20: la configuracion actual para SQL directo no resuelve una conexion Postgres usable, aunque hosting y live E2E si estan listos.
- El mismo preflight ya sugiere el formato esperado para este proyecto: `postgresql://postgres:<db-password>@db.skqtwagdshdppijswchw.supabase.co:5432/postgres`.
- Verificacion live contra Supabase real ejecutada el 2026-07-20 con 22 checks en verde.
- Existe una hoja rapida con la evidencia mas reciente y los checks live exactos: [17-latest-verification-evidence.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/17-latest-verification-evidence.md).
- Existe panel admin separado del workspace operativo y scripts de bootstrap para admin y emprendimientos de prueba.
- Sigue faltando evidencia fuerte de ejecucion completa de `pnpm test:sql-smoke` por `psql`; ahora el runner tambien detecta y reporta URLs directas invalidas antes de intentar correr.

## Lectura minima por objetivo

### Si vas a definir producto o alcance

1. [01-product-context.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/01-product-context.md)
2. [02-domain-map.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/02-domain-map.md)
3. [11-open-decisions.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/11-open-decisions.md)

### Si vas a modelar backend o base de datos

1. [03-system-architecture.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/03-system-architecture.md)
2. [04-data-model.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/04-data-model.md)
3. [05-business-rules.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/05-business-rules.md)
4. [06-security-rls.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/06-security-rls.md)
5. [07-critical-flows.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/07-critical-flows.md)

### Si vas a construir frontend o UX

1. [01-product-context.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/01-product-context.md)
2. [02-domain-map.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/02-domain-map.md)
3. [07-critical-flows.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/07-critical-flows.md)
4. [12-repo-conventions.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/12-repo-conventions.md)

### Si vas a asegurar calidad

1. [05-business-rules.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/05-business-rules.md)
2. [06-security-rls.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/06-security-rls.md)
3. [07-critical-flows.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/07-critical-flows.md)
4. [09-testing-strategy.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/09-testing-strategy.md)

### Si vas a preparar release, CI o despliegue

1. [09-testing-strategy.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/09-testing-strategy.md)
2. [14-verification-matrix.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/14-verification-matrix.md)
3. [15-requirement-audit.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/15-requirement-audit.md)
4. [16-release-runbook.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/16-release-runbook.md)
5. [17-latest-verification-evidence.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/17-latest-verification-evidence.md)

## Mapa rapido

- Producto: [01-product-context.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/01-product-context.md)
- Modulos funcionales: [02-domain-map.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/02-domain-map.md)
- Arquitectura objetivo: [03-system-architecture.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/03-system-architecture.md)
- Modelo de datos: [04-data-model.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/04-data-model.md)
- Reglas de negocio: [05-business-rules.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/05-business-rules.md)
- Seguridad y RLS: [06-security-rls.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/06-security-rls.md)
- Flujos criticos: [07-critical-flows.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/07-critical-flows.md)
- Dependencias entre modulos: [08-dependency-matrix.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/08-dependency-matrix.md)
- Estrategia de pruebas: [09-testing-strategy.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/09-testing-strategy.md)
- Roadmap tecnico: [10-implementation-roadmap.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/10-implementation-roadmap.md)
- Decisiones pendientes: [11-open-decisions.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/11-open-decisions.md)
- Convenciones de repositorio: [12-repo-conventions.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/12-repo-conventions.md)
- Implementacion actual: [13-current-implementation-map.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/13-current-implementation-map.md)
- Matriz de verificacion: [14-verification-matrix.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/14-verification-matrix.md)
- Auditoria de requisitos: [15-requirement-audit.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/15-requirement-audit.md)
- Runbook de release: [16-release-runbook.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/16-release-runbook.md)
- Evidencia mas reciente: [17-latest-verification-evidence.md](/C:/Users/cecil/proyectosAle/github/origen/webapp/docs/17-latest-verification-evidence.md)

## Regla operativa

Si un agente necesita contexto adicional, primero debe ampliar desde este arbol. Solo despues conviene ir a codigo o migraciones puntuales.
