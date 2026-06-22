# Dashboards de ejemplo (importables)

JSON listos para **Dashboards → Import** en Grafana 11.

| Archivo | Unidad |
|---------|--------|
| [lab-m01-03-stack-health.json](../m01-introduccion-grafana/examples/lab-m01-03-stack-health.json) | m01-introduccion-grafana |
| [lab-m02-02-timeseries-testdata.json](../m02-explorando-interfaz/examples/lab-m02-02-timeseries-testdata.json) | m02-explorando-interfaz |
| [lab-m02-03-config-panel.json](../m02-explorando-interfaz/examples/lab-m02-03-config-panel.json) | m02-explorando-interfaz |
| [lab-m02-04-variables.json](../m02-explorando-interfaz/examples/lab-m02-04-variables.json) | m02-explorando-interfaz |
| [lab-m03-datasources-smoke.json](../m03-fuentes-datos/examples/lab-m03-datasources-smoke.json) | m03-fuentes-datos |
| [lab-m04-01-cpu-thresholds.json](../m04-paneles-personalizacion/examples/lab-m04-01-cpu-thresholds.json) | m04-paneles-personalizacion |
| [lab-m04-02-prom-sql.json](../m04-paneles-personalizacion/examples/lab-m04-02-prom-sql.json) | m04-paneles-personalizacion |
| [lab-m04-03-funciones.json](../m04-paneles-personalizacion/examples/lab-m04-03-funciones.json) | m04-paneles-personalizacion |
| [lab-m04-04-filtros-region.json](../m04-paneles-personalizacion/examples/lab-m04-04-filtros-region.json) | m04-paneles-personalizacion |
| [lab-network-rx-job-device.json](../m04-paneles-personalizacion/examples/lab-network-rx-job-device.json) | m04-paneles-personalizacion |
| [lab-m05-01-series-temporales.json](../m05-visualizaciones-avanzadas/examples/lab-m05-01-series-temporales.json) | m05-visualizaciones-avanzadas |
| [lab-m05-02-tablas.json](../m05-visualizaciones-avanzadas/examples/lab-m05-02-tablas.json) | m05-visualizaciones-avanzadas |
| [lab-m05-03-geomap.json](../m05-visualizaciones-avanzadas/examples/lab-m05-03-geomap.json) | m05-visualizaciones-avanzadas |
| [lab-m05-04-alertas.json](../m05-visualizaciones-avanzadas/examples/lab-m05-04-alertas.json) | m05-visualizaciones-avanzadas |
| [lab-m06-01-biblioteca-base.json](../m06-paneles-fuentes-personalizados/examples/lab-m06-01-biblioteca-base.json) | m06-paneles-fuentes-personalizados |
| [lab-m06-02-mixed.json](../m06-paneles-fuentes-personalizados/examples/lab-m06-02-mixed.json) | m06-paneles-fuentes-personalizados |
| [lab-m07-01-diseno-links.json](../m07-tableros-organizacion/examples/lab-m07-01-diseno-links.json) | m07-tableros-organizacion |
| [lab-m07-02-anotaciones.json](../m07-tableros-organizacion/examples/lab-m07-02-anotaciones.json) | m07-tableros-organizacion |
| [lab-m07-03-carpetas-playlist.json](../m07-tableros-organizacion/examples/lab-m07-03-carpetas-playlist.json) | m07-tableros-organizacion |
| [lab-m08-01-usuarios-roles.json](../m08-administracion/examples/lab-m08-01-usuarios-roles.json) | m08-administracion |
| [lab-m08-02-permisos-carpetas.json](../m08-administracion/examples/lab-m08-02-permisos-carpetas.json) | m08-administracion |
| [lab-m08-03-contact-points.json](../m08-administracion/examples/lab-m08-03-contact-points.json) | m08-administracion |
| [lab-m09-01-provisioned-export.json](../m09-integraciones/examples/lab-m09-01-provisioned-export.json) | m09-integraciones |
| [lab-m09-02-api-import.json](../m09-integraciones/examples/lab-m09-02-api-import.json) | m09-integraciones |

## Importar

1. **Dashboards → Import → Upload JSON**
2. Mapea datasources: `Prometheus-Lab`, `PostgreSQL-Lab`, `Loki-Lab` (según el dashboard)
3. TestData (`-- Grafana --`) no requiere mapeo

Los UIDs (`lab-m04-01`, etc.) permiten enlaces entre dashboards del curso.
