# Reglas de negocio

## Reglas globales

- No permitir cantidades menores o iguales a cero.
- No permitir precios negativos.
- No permitir stock negativo en el MVP.
- No borrar fisicamente registros con historial.
- Toda operacion queda asociada a la usuaria autenticada.
- Toda cifra monetaria usa `numeric`, nunca `float`.

## Compras

- En `manufacturer`, la compra incrementa stock de recursos.
- En `reseller`, la compra incrementa stock de productos.
- Debe registrarse egreso economico automatico cuando corresponda.
- Editar o anular una compra debe revertir y reaplicar movimientos.

## Consumos manuales

- Solo afectan recursos.
- Deben exigir motivo o nota.
- No reemplazan el flujo de produccion.

## Produccion

- Solo disponible para `manufacturer`.
- Requiere receta activa.
- Debe validar stock suficiente de cada recurso.
- Debe crear snapshot historico de insumos aplicados.
- Debe descontar recursos y sumar producto en una unica transaccion.

## Ventas

- Deben validar stock suficiente de producto.
- Deben descontar stock y registrar ingreso economico.
- No se permite vender parcialmente por error de stock.

## Costos y precios

- El costo usa ultimo precio de compra vigente como regla base del MVP.
- El porcentaje de ganancia es markup sobre costo, no margen sobre venta.
- Guardar el detalle del calculo para preservar trazabilidad.

## Cuenta y acceso

- `pending`, `blocked`, `rejected` y `cancelled` no operan modulos.
- El tipo de emprendimiento no debe cambiar libremente si ya hay movimientos.
- El alta puede requerir aprobacion manual y validacion comercial.

## Administracion

- Aprobar, bloquear, desbloquear, cambiar plan y registrar pagos debe auditarse.
- El panel administrativo no reemplaza politicas server-side.
