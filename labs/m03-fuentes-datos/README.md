# M03 — Fuentes de datos

[← Página anterior](../m02-explorando-interfaz/M02-04-variables-dashboard.md) · [Siguiente página →](M03-01-tipos-fuentes-datos.md)

## Qué aprenderás

- Clasificar fuentes del lab: Prometheus, Loki, PostgreSQL y TestData.
- Registrar datasources, ejecutar **Save & test** y validar en **Explore**.
- Conectar el stack completo del curso antes de paneles avanzados (M04).

## Contexto

- M02 practicó paneles con **TestData**; operaciones reales exigen backends del repo (`infra/docker-compose.yml`).
- En **M03-02** registrarás Prometheus y consultarás la métrica **`up`** (disponibilidad del target).
- Desde el contenedor Grafana las URLs usan **nombres de servicio** Docker, no `localhost` del portátil.
- Parámetros detallados: [infra/README.md](../../infra/README.md).

## Cómo está organizado este módulo

| ID | Unidad | Enfoque |
|----|--------|---------|
| M03-01 | [Tipos de fuentes de datos](M03-01-tipos-fuentes-datos.md) | Conceptos (sin taller) |
| M03-02 | [Configuración de fuentes](M03-02-configuracion-fuentes.md) | **Taller** — Prometheus-Lab |
| M03-03 | [Conexión externa](M03-03-conexion-externa.md) | **Taller** — PostgreSQL-Lab y Loki-Lab |

M03-01 es lectura y autoevaluación; los talleres empiezan en M03-02.

→ [Índice de laboratorios del curso](../LABORATORIOS.md)

## Antes de empezar

- Stack en marcha (`bash infra/up.sh`) y [M02-04](../m02-explorando-interfaz/M02-04-variables-dashboard.md) completado (paneles y variables con TestData).
- Credenciales Grafana: `admin` / `admin`.
