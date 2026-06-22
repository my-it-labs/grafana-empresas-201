# M04 — Creación y personalización de paneles

[← Página anterior](../m03-fuentes-datos/M03-03-conexion-externa.md) · [Siguiente página →](M04-01-configuracion-avanzada-paneles.md)

## Qué aprenderás

- Overrides, thresholds y transformations en paneles con fuentes reales.
- Consultas PromQL y SQL, funciones de agregación y filtros con variables.
- Dashboards `Lab M04-01` … `Lab M04-04` como artefactos progresivos.

## Dashboards de ejemplo

JSON importables en [`examples/`](examples/):

- [`lab-m04-01-cpu-thresholds.json`](examples/lab-m04-01-cpu-thresholds.json)
- [`lab-m04-02-prom-sql.json`](examples/lab-m04-02-prom-sql.json)
- [`lab-m04-03-funciones.json`](examples/lab-m04-03-funciones.json)
- [`lab-m04-04-filtros-region.json`](examples/lab-m04-04-filtros-region.json)
- [`lab-network-rx-job-device.json`](examples/lab-network-rx-job-device.json) — variables job/device + tabla Join by field

Índice global: [labs/examples/README.md](../examples/README.md).

## Contexto

- Requiere datasources registradas en [M03](../m03-fuentes-datos/README.md).
- Prometheus aporta métricas ops; PostgreSQL, escenarios negocio/IoT/IT del lab.
- Las variables de dashboard (M02-04) se combinan aquí con variables **Query**.

## Unidades

| ID | Unidad | Objetivo |
|----|--------|----------|
| M04-01 | [Configuración avanzada de paneles](M04-01-configuracion-avanzada-paneles.md) | Overrides, thresholds, organize fields |
| M04-02 | [Métricas y consultas](M04-02-metricas-consultas.md) | PromQL + SQL en un tablero |
| M04-03 | [Funciones y operaciones](M04-03-funciones-operaciones.md) | Agregaciones PromQL/SQL |
| M04-04 | [Filtros y agrupamientos](M04-04-filtros-agrupamientos.md) | Variables query y `GROUP BY` / `sum by` |

Todas las unidades incluyen **Laboratorio**. Índice: [Laboratorios](../LABORATORIOS.md).

## Antes de empezar

- `Prometheus-Lab`, `PostgreSQL-Lab` y `Loki-Lab` operativos ([M03-02](M03-02-configuracion-fuentes.md), [M03-03](M03-03-conexion-externa.md)).
- Explore validado en [M03-02](../m03-fuentes-datos/M03-02-configuracion-fuentes.md) (consulta `up`) y consulta SQL sobre `daily_sales`.
