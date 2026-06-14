# Ejemplos de provisioning (M09-01)

Archivos de referencia para **Grafana provisioning**. No se montan por defecto en el stack del curso (M03 registra datasources manualmente).

## Activar en local

En [`infra/docker-compose.yml`](../../docker-compose.yml), descomenta:

```yaml
- ./grafana/provisioning/examples:/etc/grafana/provisioning:ro
```

Reinicia Grafana:

```bash
cd infra && docker compose up -d grafana
```

## Contenido

| Ruta | Recurso |
|------|---------|
| `datasources/prometheus-lab.yaml` | Datasource `Prometheus-Provisioned` |
| `dashboards/dashboards.yaml` | Provider file → folder **Provisioned** |
| `dashboards/lab-provisioned-cpu.json` | Dashboard demo CPU vía `up` |

**Nota:** el uid `prometheus-provisioned` no colisiona con `Prometheus-Lab` creado en M03-02.
