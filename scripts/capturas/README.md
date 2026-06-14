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
```

Salida: `docs/capturas/m02-explorando-interfaz/`

Modo visible (depurar selectores):

```bash
npm run capturas:headed
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

## Notas técnicas

- En Ubuntu reciente Playwright no descarga Chromium; los scripts usan `channel: "chrome"`.
- Tras login limpio, Grafana pide cambiar contraseña: los scripts pulsan **Skip**.
- Grafana 11 usa **Back to dashboard** en lugar de **Apply** en algunos flujos; `capture-utils.mjs` lo contempla.
- Paneles con datos fiables se preparan vía API (`seedDashboardViaApi`); menús y modales se capturan por UI.
- Tras cambiar selectores o versión de Grafana, regenerar con `npm run capturas:m02-0x` y revisar coherencia con el guion.
