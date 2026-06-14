# Índice de laboratorios

[← Curso](../README.md)

En este curso, **laboratorio** significa **taller práctico**: acciones verificables sobre el entorno del repo (contenedores, Grafana, API o CLI). Las unidades solo conceptuales **no** incluyen sección Laboratorio.

**Requisito:** stack en marcha (`bash infra/up.sh`) y Grafana en http://localhost:3000 (o puerto reenviado en Codespace). Credenciales: `admin` / `admin`.

Detalle del entorno: [infra/README.md](../infra/README.md).

---

## Talleres publicados

| ID | Unidad | Objetivo del taller |
|----|--------|---------------------|
| M01-03 | [Instalación y configuración](m01-introduccion-grafana/M01-03-instalacion-configuracion.md) | Validar stack, login Grafana, APIs y PostgreSQL de demo |
| M02-01 | [Navegación y estructura](m02-explorando-interfaz/M02-01-navegacion-estructura.md) | Recorrido por menú, búsqueda global y breadcrumbs |
| M02-02 | [Paneles y gráficos](m02-explorando-interfaz/M02-02-paneles-graficos.md) | Primer dashboard con TestData y time series |
| M02-03 | [Configuración básica de paneles](m02-explorando-interfaz/M02-03-configuracion-paneles.md) | Unidad, leyenda, bar chart y dashboard `Lab M02-03` |

### Orden recomendado

1. [M01-03](m01-introduccion-grafana/M01-03-instalacion-configuracion.md) — entorno operativo  
2. [M02-01](m02-explorando-interfaz/M02-01-navegacion-estructura.md) — orientación en la UI  
3. [M02-02](m02-explorando-interfaz/M02-02-paneles-graficos.md) — primer panel  
4. [M02-03](m02-explorando-interfaz/M02-03-configuracion-paneles.md) — ajustes de presentación  

---

## Unidades sin taller (solo lectura)

Estas páginas preparan conceptos antes del primer taller; usan **Conceptos**, **Comprueba tu entendimiento** y **Reto**, sin acciones sobre el entorno.

| ID | Unidad |
|----|--------|
| M01-01 | [Qué es Grafana y ventajas](m01-introduccion-grafana/M01-01-que-es-grafana.md) |
| M01-02 | [Casos de uso](m01-introduccion-grafana/M01-02-casos-de-uso.md) |

---

## Pendientes de publicación

Talleres planificados en módulos aún sin unidad publicada. Consulta el README de cada módulo.

| Módulo | Índice |
|--------|--------|
| M03 — Fuentes de datos | [labs/m03-fuentes-datos/README.md](m03-fuentes-datos/README.md) |
| M04 — Paneles y personalización | [labs/m04-paneles-personalizacion/README.md](m04-paneles-personalizacion/README.md) |
| M05 — Visualizaciones avanzadas | [labs/m05-visualizaciones-avanzadas/README.md](m05-visualizaciones-avanzadas/README.md) |
| M06 — Paneles y datasources personalizados | [labs/m06-paneles-fuentes-personalizados/README.md](m06-paneles-fuentes-personalizados/README.md) |
| M07 — Tableros y organización | [labs/m07-tableros-organizacion/README.md](m07-tableros-organizacion/README.md) |
| M08 — Administración | [labs/m08-administracion/README.md](m08-administracion/README.md) |
| M09 — Integraciones | [labs/m09-integraciones/README.md](m09-integraciones/README.md) |
