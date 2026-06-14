# Capturas automáticas (docente / mantenimiento)

Genera PNG de referencia para los guiones con **Playwright** y **Google Chrome** del sistema.

## Requisitos

- Lab en marcha: `bash infra/up.sh`
- Node.js + npm

## Uso

```bash
cd scripts/capturas
npm install
npm run capturas:m02-02
npm run capturas:m02-03
npm run capturas:m02-04
npm run capturas:m03
npm run capturas:m04
npm run capturas:m05
# o todas las nuevas de una vez:
npm run capturas:all
```

Salida por módulo:

| Script | Carpeta |
|--------|---------|
| `capturas:m02-02`, `m02-03`, `m02-04` | `docs/capturas/m02-explorando-interfaz/` |
| `capturas:m03` | `docs/capturas/m03-fuentes-datos/` |
| `capturas:m04` | `docs/capturas/m04-paneles-personalizacion/` |
| `capturas:m05` | `docs/capturas/m05-visualizaciones-avanzadas/` |

Modo visible (depurar selectores):

```bash
HEADED=1 npm run capturas:m03
```

Variables opcionales: `GRAFANA_URL`, `GRAFANA_USER`, `GRAFANA_PASS`.

## Ciclo de vida — qué debe verse en cada PNG

Cada captura corresponde a **un momento concreto** del flujo UI, no a la misma pantalla repetida.

### M02-02

| Archivo | Momento |
|---------|---------|
| `M02-02-dashboard-vacio.png` | Canvas sin paneles, **antes** de Add → Visualization |
| `M02-02-add-menu.png` | Menú **Add** desplegado (uso interno; no enlazado en el guion) |
| `M02-02-add-visualization.png` | Editor recién abierto; **selector de datasource** con búsqueda `grafana` |
| `M02-02-editor-panel.png` | Editor con TestData, curva y título `CPU demo (TestData)` |
| `M02-02-panel-timeseries.png` | **Vista** del dashboard con panel incrustado (tras Apply, antes de Save) |
| `M02-02-save-dialog.png` | Modal **Save dashboard** con nombre `Lab M02-02` rellenado |
| `M02-02-dashboard-guardado.png` | Vista final con breadcrumb `Lab M02-02` y panel activo |

### M02-03

| Archivo | Momento |
|---------|---------|
| `M02-03-unidad-medida.png` | Editor; **Search options → Unit** y picker de unidad abierto |
| `M02-03-leyenda.png` | Editor; sección **Legend** con Last/Max visibles |
| `M02-03-panel-vista.png` | Vista del panel con **%** en eje y leyenda con valores |
| `M02-03-bar-chart.png` | Editor del **segundo panel** (Bar chart) |
| `M02-03-save-dialog.png` | Modal Save con nombre `Lab M02-03` |
| `M02-03-dashboard-guardado.png` | Vista con **dos paneles** (time series + bar chart) |

### M02-04

| Archivo | Momento |
|---------|---------|
| `M02-04-variables-lista.png` | **Settings → Variables** con `scenario` e `interval` |
| `M02-04-variable-scenario-form.png` | Formulario edición variable **Custom** `scenario` |
| `M02-04-dashboard-selectors.png` | Vista dashboard con selectores superiores |
| `M02-04-titulo-variable.png` | Editor panel con título `CPU demo — $scenario` |
| `M02-04-save-dialog.png` | Modal Save con nombre `Lab M02-04` |
| `M02-04-dashboard-guardado.png` | Vista final `Lab M02-04` |

### M03

| Archivo | Momento |
|---------|---------|
| `M03-01-catalogo-fuentes.png` | Catálogo **Add new data source** |
| `M03-02-datasources-lista.png` | Listado inicial **Connections → Data sources** |
| `M03-02-prometheus-formulario.png` | Formulario **Prometheus-Lab** |
| `M03-02-prometheus-save-test.png` | **Save & test** Prometheus OK |
| `M03-02-explore-up.png` | **Explore** con consulta `up` |
| `M03-03-postgres-formulario.png` | Formulario **PostgreSQL-Lab** |
| `M03-03-postgres-save-test.png` | **Save & test** PostgreSQL OK |
| `M03-03-explore-sql.png` | **Explore** SQL `daily_sales` |
| `M03-03-loki-formulario.png` | Formulario **Loki-Lab** |
| `M03-03-loki-save-test.png` | **Save & test** Loki OK |
| `M03-03-explore-loki.png` | **Explore** LogQL `{job="demo-app"}` |
| `M03-03-datasources-completas.png` | Listado con tres fuentes del curso |

### M04

| Archivo | Momento |
|---------|---------|
| `M04-01-thresholds-editor.png` | Editor panel CPU — **Thresholds** |
| `M04-01-dashboard-cpu.png` | Dashboard `Lab M04-01` |
| `M04-02-dashboard-prom-sql.png` | Dashboard `Lab M04-02` (Prometheus + SQL) |
| `M04-03-tabla-http.png` | Dashboard `Lab M04-03` — tabla HTTP |
| `M04-04-variable-region.png` | Dashboard `Lab M04-04` con variable región |
| `M04-04-selector-region.png` | Selector **Región** abierto |

### M05

| Archivo | Momento |
|---------|---------|
| `M05-01-stacked-cpu.png` | Time series **stacked** CPU by mode |
| `M05-01-dual-axis.png` | Panel **dual axis** CPU vs red |
| `M05-02-tablas.png` | Tablas HTTP y ventas por región |
| `M05-03-geomap.png` | **Geomap** revenue por región |
| `M05-04-panel-thresholds.png` | Panel con umbrales visuales |
| `M05-04-alert-rules-lista.png` | **Alerting → Alert rules** |
| `M05-04-nueva-regla.png` | Asistente **New alert rule** |

## Notas técnicas

- En Ubuntu reciente Playwright no descarga Chromium; los scripts usan `channel: "chrome"`.
- Tras login limpio, Grafana pide cambiar contraseña: los scripts pulsan **Skip**.
- Grafana 11 usa **Back to dashboard** en lugar de **Apply** en algunos flujos; `capture-utils.mjs` lo contempla.
- Variables de dashboard: URLs `?editview=settings` (lista) y `?editview=variables&editIndex=N` (formulario).
- Paneles M04/M05 se preparan vía API (`seedDashboardViaApi`, `ensureLabDatasources`); menús y formularios por UI en M03.
- Tras cambiar selectores o versión de Grafana, regenerar con los scripts `capturas:m0x` y revisar coherencia con el guion.
