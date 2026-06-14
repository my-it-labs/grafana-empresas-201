# Infraestructura de laboratorio

El repo incluye **todo el stack** del curso. No necesitas instalar Grafana, Prometheus, PostgreSQL ni Loki por tu cuenta: vienen en `docker-compose.yml`.

| Servicio | Uso en el curso | Puerto (host) |
|----------|-----------------|---------------|
| **Grafana** | UI, dashboards, alertas | 3000 |
| **Prometheus** | Métricas y series temporales | 9090 |
| **PostgreSQL** | Consultas SQL, tablas de negocio/IoT | 5432 |
| **Loki** | Logs de aplicación | 3100 |
| **node-exporter** | Métricas de sistema (vía Prometheus) | — |
| **loggen + promtail** | Generación e ingesta de logs de demo | — |

Credenciales **solo para el lab** (no uses en producción):

| Sistema | Acceso |
|---------|--------|
| Grafana | `admin` / `admin` — http://localhost:3000 |
| PostgreSQL | host `postgres` (desde Grafana) o `localhost:5432` (desde terminal), BD `lab`, usuario `grafana`, contraseña `grafana` |

---

## Arranque rápido

Desde la raíz del repo:

```bash
bash infra/up.sh
```

O manualmente:

```bash
cd infra
docker compose up -d
docker compose ps
```

La primera vez puede tardar **1–2 minutos** en descargar imágenes y crear volúmenes.

Comprueba Grafana:

```bash
curl -s -u admin:admin http://localhost:3000/api/health
```

---

## En GitHub Codespaces (recomendado)

1. Haz **fork** del repo y crea un **Codespace** en la rama principal.
2. Al abrir el Codespace, el entorno ejecuta `infra/up.sh` automáticamente.
3. Cuando aparezca la notificación del puerto **3000**, abre **Grafana** en el navegador.
4. Si no ves la notificación: pestaña **Ports** → puerto **3000** → **Open in Browser**.

El stack corre en Docker dentro del Codespace; los guiones usan los mismos comandos y URLs que en local.

---

## En local (Docker)

Requisitos: **Docker** y **Docker Compose** v2.

```bash
git clone <tu-fork>
cd grafana-empresas-201
bash infra/up.sh
```

Abre http://localhost:3000

---

## Dev Containers (VS Code / Cursor)

1. Clona el repo y abre la carpeta en el editor.
2. **Reopen in Container** (usa `.devcontainer/devcontainer.json`).
3. Tras crear el contenedor, se ejecuta `infra/up.sh` y se reenvía el puerto 3000.

---

## Parar y resetear

Parar sin borrar datos:

```bash
cd infra
docker compose down
```

Reset completo del lab (borra dashboards y datos de Grafana, Prometheus, PostgreSQL y Loki):

```bash
cd infra
docker compose down -v
docker compose up -d
```

---

## Conectar datasources desde Grafana

En los módulos M03 en adelante configurarás fuentes en la UI. Desde el contenedor **Grafana**, usa los **nombres de servicio** de la red Docker:

| Tipo | Parámetro | Valor |
|------|-----------|-------|
| **Prometheus** | URL | `http://prometheus:9090` |
| **PostgreSQL** | Host | `postgres:5432` |
| | Database | `lab` |
| | User / Password | `grafana` / `grafana` |
| | TLS/SSL | disable |
| **Loki** | URL | `http://loki:3100` |

**TestData** (datos sintéticos) viene integrado en Grafana; no requiere contenedor extra.

### Tablas PostgreSQL de demo

- `regions`, `daily_sales` — escenario negocio / BI  
- `sensor_readings` — escenario IoT / industrial  
- `http_events` — escenario IT / tráfico HTTP  

### Provisioning (M09)

Ejemplos declarativos en [`grafana/provisioning/examples/`](grafana/provisioning/examples/README.md). Descomenta el volumen en `docker-compose.yml` para activarlos en local.

---

## Diagnóstico

```bash
cd infra
docker compose ps
docker compose logs grafana --tail 30
docker compose logs prometheus --tail 30
docker compose logs postgres --tail 30
docker compose logs loki --tail 30
```
