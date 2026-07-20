# Seguridad y RLS

## Principios

- El frontend nunca usa `service_role`.
- El `user_id` no se confia desde formularios.
- Las cuentas bloqueadas deben quedar fuera tanto en UI como en backend.
- RLS es obligatoria para todas las tablas multiusuario.

## Regla base de aislamiento

Para tablas de usuaria:

```sql
auth.uid() = user_id
```

Esa regla es el punto de partida, no la solucion completa.

## Controles obligatorios

### SELECT

- La usuaria solo puede leer sus filas.

### INSERT

- Debe impedir crear filas con `user_id` ajeno.
- Cuando sea posible, el servidor o RPC debe derivar `user_id` desde la sesion.

### UPDATE

- Debe impedir modificar filas de otra cuenta.
- Debe evitar reasignar propiedad cambiando `user_id`.

### DELETE

- Debe usarse solo cuando el dominio lo permita.
- En la mayoria de entidades historicas conviene archivado o cancelacion.

## Estrategia administrativa

- Crear `admin_users` o usar claims controladas desde servidor.
- Exponer una funcion `is_admin()` para politicas y servicios.
- Auditar toda accion sensible.

## Buckets privados

- Comprobantes y archivos sensibles en storage privado.
- Acceso mediante URLs firmadas.
- Politicas diferenciadas para usuaria y administracion.

## Operaciones criticas

Estas operaciones no deben resolverse con multiples inserts desde cliente:

- Compra
- Produccion
- Venta
- Ajuste de inventario
- Reversiones

## Riesgos a evitar

- Exponer service keys.
- Autorizar admin por valores editables en cliente.
- Dejar cuentas bloqueadas operar via endpoints internos.
- Aceptar stock negativo por carreras o validaciones solo visuales.
