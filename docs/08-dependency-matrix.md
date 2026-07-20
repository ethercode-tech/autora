# Matriz de dependencias

## Dependencias por modulo

| Modulo | Depende de | Habilita |
| --- | --- | --- |
| Auth | Supabase Auth, perfiles | Proteccion de rutas, sesion |
| Perfiles y onboarding | Auth | Cuenta operativa, moneda, tipo |
| Unidades | Perfiles | Recursos |
| Recursos | Unidades, perfiles | Compras, recetas, consumos |
| Productos | Perfiles | Recetas, ventas, compras de reventa |
| Compras | Recursos o productos, perfiles | Stock, finanzas, costos |
| Recetas | Recursos, productos | Produccion, costos |
| Produccion | Recetas, recursos, stock, perfiles | Stock producto, costos |
| Ventas | Productos, stock, perfiles | Ingresos, dashboard |
| Inventario | Compras, produccion, ventas, consumos | Stock y alertas |
| Finanzas | Compras, ventas, manuales | Dashboard, resultados |
| Dashboard | Inventario, finanzas | Vision operativa |
| Admin | Auth admin, access_requests, subscriptions | Operacion comercial |

## Orden tecnico recomendado

1. Auth y perfiles
2. Unidades
3. Recursos
4. Productos
5. Compras
6. Inventario base
7. Recetas
8. Produccion
9. Ventas
10. Finanzas y dashboard
11. Admin, planes, suscripciones y pagos

## Bloqueos fuertes

- No se puede implementar produccion sin recetas, recursos y libro de movimientos.
- No se puede implementar dashboard real sin inventario y finanzas consistentes.
- No se puede implementar admin seguro sin estrategia de rol administrativo.
