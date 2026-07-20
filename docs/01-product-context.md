# Contexto de producto

## Vision

AUTORA es un SaaS para microemprendimientos de fabricacion o reventa. Reemplaza planillas, anotaciones y calculos manuales por un flujo operativo simple y persistente en la nube.

## Problema que resuelve

- No hay una fuente unica y confiable de stock.
- Compras, producciones y ventas suelen quedar desconectadas.
- El calculo de costos y precios es manual e inconsistente.
- El negocio necesita control comercial sobre altas, pagos y bloqueos.

## Objetivos del MVP

- Una cuenta por emprendedora y un emprendimiento por cuenta.
- Persistencia en Supabase con aislamiento real por usuaria.
- Stock automatico para recursos y productos.
- Costos y precios sugeridos basados en compras y recetas.
- Panel administrativo para aprobacion, bloqueo, planes y pagos.

## Tipos de negocio

- `manufacturer`: fabrica productos a partir de recursos y recetas.
- `reseller`: compra productos terminados para revender.

## Roles

- Solicitante: deja una solicitud de alta y espera aprobacion.
- Usuaria activa: opera solo sobre su emprendimiento.
- Usuaria bloqueada: no puede operar.
- Administrador Origen: administra cuentas, estados y configuracion comercial.

## Estados de cuenta base

- `pending`
- `approved_pending_payment`
- `active`
- `past_due`
- `blocked`
- `rejected`
- `cancelled`

## Principios del producto

- Simplicidad: lenguaje cotidiano y formularios cortos.
- Automatizacion: compras, produccion y ventas mueven stock automaticamente.
- Trazabilidad: todo movimiento debe tener origen identificable.
- Aislamiento: cada usuaria solo accede a sus datos.
- Control comercial: el acceso depende del estado de cuenta.

## Criterio rector

La prioridad no es una demo visual. La prioridad es integridad operativa con una UX simple.
