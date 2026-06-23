# M06 — Paneles y fuentes de datos personalizados

[← Página anterior](../m05-visualizaciones-avanzadas/M05-04-alertas-umbrales.md) · [Siguiente página →](M06-01-paneles-biblioteca.md)

## Qué aprenderás

- Publicar y reutilizar **Library panels** entre dashboards.
- Combinar **Prometheus**, **PostgreSQL** y transformaciones en paneles **Mixed**.
- Documentar paneles híbridos con contenido **Text** / Markdown.

## Contexto

- Parte de consultas y paneles creados en [M04](../m04-paneles-personalizacion/README.md) y [M05](../m05-visualizaciones-avanzadas/README.md).
- La gobernanza de permisos sobre biblioteca y carpetas se profundiza en [M08](../m08-administracion/README.md).

## Unidades

| ID | Unidad | Objetivo |
|----|--------|----------|
| M06-01 | [Paneles de biblioteca](M06-01-paneles-biblioteca.md) | Library panels y propagación |
| M06-02 | [Fuentes mixtas y transformaciones](M06-02-fuentes-mixtas-transformaciones.md) | Panel Mixed + transforms |

Todas las unidades incluyen **Laboratorio**. Índice: [Laboratorios](../LABORATORIOS.md).

## Dashboards de ejemplo

- [`lab-m06-01-biblioteca-base.json`](examples/lab-m06-01-biblioteca-base.json)
- [`lab-m06-02-mixed-prom-join.json`](examples/lab-m06-02-mixed-prom-join.json) — **recomendado M06-02:** Mixed + 2 Prom, Merge, Join, cálculo RX+TX
- [`lab-m06-02-mixed.json`](examples/lab-m06-02-mixed.json) — Mixed Prom + SQL (alternativa)

Índice global: [labs/examples/README.md](../examples/README.md).

## Antes de empezar

- Al menos un dashboard `Lab M04-xx` o `Lab M05-xx` guardado.
- Datasources `Prometheus-Lab`, `PostgreSQL-Lab` y `Loki-Lab` operativos ([M03](../m03-fuentes-datos/README.md)).

> Si reseteaste el entorno y no conservas esos dashboards, recréalos rápidamente con las consultas incluidas en [M04](../m04-paneles-personalizacion/README.md) / [M05](../m05-visualizaciones-avanzadas/README.md), o parte del dashboard provisionado de ejemplo ([M09-01](../m09-integraciones/M09-01-versionado-provisioning.md)).
