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
| M02-04 | [Variables de dashboard](m02-explorando-interfaz/M02-04-variables-dashboard.md) | Variables custom/interval, repeat y `Lab M02-04` |
| M03-02 | [Configuración de fuentes](m03-fuentes-datos/M03-02-configuracion-fuentes.md) | Alta Prometheus-Lab, Save & test, Explore con `up` |
| M03-03 | [Conexión externa](m03-fuentes-datos/M03-03-conexion-externa.md) | PostgreSQL-Lab, Loki-Lab y smoke tests Explore |
| M04-01 | [Configuración avanzada de paneles](m04-paneles-personalizacion/M04-01-configuracion-avanzada-paneles.md) | Overrides, thresholds, `Lab M04-01` |
| M04-02 | [Métricas y consultas](m04-paneles-personalizacion/M04-02-metricas-consultas.md) | PromQL red + SQL revenue, `Lab M04-02` |
| M04-03 | [Funciones y operaciones](m04-paneles-personalizacion/M04-03-funciones-operaciones.md) | Agregaciones PromQL/SQL, `Lab M04-03` |
| M04-04 | [Filtros y agrupamientos](m04-paneles-personalizacion/M04-04-filtros-agrupamientos.md) | Variable región, filtros SQL/PromQL, `Lab M04-04` |
| M05-01 | [Series temporales](m05-visualizaciones-avanzadas/M05-01-series-temporales.md) | Stack, dual axis, `Lab M05-01` |
| M05-02 | [Tablas y listas](m05-visualizaciones-avanzadas/M05-02-tablas-listas.md) | Tablas SQL y estilos de celda, `Lab M05-02` |
| M05-03 | [Mapas y geolocalización](m05-visualizaciones-avanzadas/M05-03-mapas-geolocalizacion.md) | Geomap revenue por región, `Lab M05-03` |
| M05-04 | [Alertas y umbrales](m05-visualizaciones-avanzadas/M05-04-alertas-umbrales.md) | Thresholds + alert rules, `Lab M05-04` |
| M06-01 | [Paneles de biblioteca](m06-paneles-fuentes-personalizados/M06-01-paneles-biblioteca.md) | Library panels y propagación, `Lab M06-01` |
| M06-02 | [Fuentes mixtas y transformaciones](m06-paneles-fuentes-personalizados/M06-02-fuentes-mixtas-transformaciones.md) | Panel Mixed Prometheus+SQL, `Lab M06-02` |
| M07-01 | [Diseño y enlaces](m07-tableros-organizacion/M07-01-diseno-dashboards.md) | Filas, links, tags, `Lab M07-01` |
| M07-02 | [Anotaciones y eventos](m07-tableros-organizacion/M07-02-anotaciones-eventos.md) | Anotaciones manual + SQL, `Lab M07-02` |
| M07-03 | [Carpetas y playlists](m07-tableros-organizacion/M07-03-carpetas-playlists.md) | Folders, playlist NOC, kiosk |
| M08-01 | [Usuarios y roles](m08-administracion/M08-01-usuarios-roles.md) | Viewer/Editor, `Lab M08-01` |
| M08-02 | [Permisos en carpetas](m08-administracion/M08-02-permisos-carpetas.md) | Teams, ACL folders, `Lab M08-02` |
| M08-03 | [Contact points y políticas](m08-administracion/M08-03-contact-points-politicas.md) | Webhook, silences, `Lab M08-03` |
| M09-01 | [Versionado y provisioning](m09-integraciones/M09-01-versionado-provisioning.md) | Export JSON, provisioning examples |
| M09-02 | [API e integraciones](m09-integraciones/M09-02-api-integraciones.md) | API import, anotaciones, webhooks |

### Orden recomendado

1. [M01-03](m01-introduccion-grafana/M01-03-instalacion-configuracion.md) — entorno operativo  
2. [M02-01](m02-explorando-interfaz/M02-01-navegacion-estructura.md) → [M02-04](m02-explorando-interfaz/M02-04-variables-dashboard.md) — interfaz y paneles TestData  
3. [M03-01](m03-fuentes-datos/M03-01-tipos-fuentes-datos.md) (lectura) → [M03-02](m03-fuentes-datos/M03-02-configuracion-fuentes.md) → [M03-03](m03-fuentes-datos/M03-03-conexion-externa.md) — datasources  
4. [M04-01](m04-paneles-personalizacion/M04-01-configuracion-avanzada-paneles.md) → [M04-04](m04-paneles-personalizacion/M04-04-filtros-agrupamientos.md) — consultas y variables  
5. [M05-01](m05-visualizaciones-avanzadas/M05-01-series-temporales.md) → [M05-04](m05-visualizaciones-avanzadas/M05-04-alertas-umbrales.md) — visualizaciones y alertas  
6. [M06-01](m06-paneles-fuentes-personalizados/M06-01-paneles-biblioteca.md) → [M06-02](m06-paneles-fuentes-personalizados/M06-02-fuentes-mixtas-transformaciones.md) — biblioteca y paneles Mixed  
7. [M07-01](m07-tableros-organizacion/M07-01-diseno-dashboards.md) → [M07-03](m07-tableros-organizacion/M07-03-carpetas-playlists.md) — organización de tableros  
8. [M08-01](m08-administracion/M08-01-usuarios-roles.md) → [M08-03](m08-administracion/M08-03-contact-points-politicas.md) — administración  
9. [M09-01](m09-integraciones/M09-01-versionado-provisioning.md) → [M09-02](m09-integraciones/M09-02-api-integraciones.md) — Git, provisioning y API  

---

## Unidades sin taller (solo lectura)

| ID | Unidad |
|----|--------|
| M01-01 | [Qué es Grafana y ventajas](m01-introduccion-grafana/M01-01-que-es-grafana.md) |
| M01-02 | [Casos de uso](m01-introduccion-grafana/M01-02-casos-de-uso.md) |
| M03-01 | [Tipos de fuentes de datos](m03-fuentes-datos/M03-01-tipos-fuentes-datos.md) |

---

## Scripts de apoyo

| Script | Uso |
|--------|-----|
| [`scripts/lab-api-demo.sh`](../scripts/lab-api-demo.sh) | Demo API (M09-02) |
| [`scripts/capturas/`](../scripts/capturas/README.md) | Capturas PNG M02–M09 |

Provisioning de ejemplo (M09-01): [`infra/grafana/provisioning/examples/`](../infra/grafana/provisioning/examples/README.md).
