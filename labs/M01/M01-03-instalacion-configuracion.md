# M01-03 — Instalación y configuración

[← Página anterior](M01-02-casos-de-uso.md) · [Siguiente página →](../M02/README.md)

Tras situar qué es Grafana y para qué perfiles sirve (M01-01, M01-02), el curso asume un **entorno reproducible**: contenedores del repo, Grafana accesible y fuentes de demo listas para M03.

En esta unidad levantarás (o confirmarás) el stack, accederás a Grafana por primera vez y validarás servicios con API y CLI. No conectarás datasources en la UI todavía.

### Objetivos

Al cerrar la unidad deberías:

- Tener en estado **Up** los contenedores `grafana-lab`, `prometheus-lab`, `postgres-lab` y `loki-lab`.
- Acceder a Grafana en el puerto **3000** y completar el primer login (`admin` / **Skip** en cambio de contraseña).
- Verificar salud de Grafana, Prometheus y tablas PostgreSQL de demo con comandos del lab.

---

## Conceptos

El stack del curso vive en [`infra/docker-compose.yml`](../../infra/docker-compose.yml):

| Servicio | Contenedor | Puerto (host) | Rol |
|----------|------------|---------------|-----|
| Grafana 11 | `grafana-lab` | 3000 | UI, dashboards, alerting |
| Prometheus | `prometheus-lab` | 9090 | Métricas |
| PostgreSQL | `postgres-lab` | 5432 | SQL de demo |
| Loki | `loki-lab` | 3100 | Logs |
| loggen + Promtail | `loggen-lab`, `promtail-lab` | — | Logs sintéticos → Loki |

Datos persistentes: volumen Docker `grafana-data` (dashboards/usuarios Grafana). `docker compose down` **sin** `-v` conserva el estado entre sesiones.

Variables relevantes en Grafana: `GF_USERS_ALLOW_SIGN_UP: "false"` desactiva registro público de usuarios.

---

## En Grafana

### Arranque del stack

En **Codespace** o **Dev Container**, el stack suele arrancar al crear el entorno. En local, desde la raíz del repo:

```bash
bash infra/up.sh
```

Referencia completa: [infra/README.md](../../infra/README.md).

### Primer acceso

| Entorno | URL |
|---------|-----|
| Codespace | Puerto **3000** → *Open in Browser* |
| Local / Dev Container | http://localhost:3000 |

Credenciales de lab: **admin** / **admin**.

![Pantalla de login](../../docs/capturas/M02/M02-01-login.png)

Tras **Log in**, en el **primer acceso** aparece *Update your password*. En formación se elige **Skip** para continuar sin bloquear el hilo del curso.

### Home y administración básica

Tras **Skip**, la vista **Home** confirma sesión válida. En **Administration → General** se revisan preferencias de organización; en **Profile → Preferences**, la **Timezone** del usuario.

![Administration → General](../../docs/capturas/M02/M02-01-admin-general.png)

---

## Laboratorio

### Objetivo

Confirmar que el entorno del repo está operativo y que puedes acceder a Grafana antes de [M02](../M02/README.md).

### En qué consiste

Cinco comprobaciones encadenadas: contenedores, UI, preferencias, APIs y parada ordenada.

### 1 — Contenedores en marcha

**Acción:** si Grafana no responde, ejecuta `bash infra/up.sh`. Comprueba:

```bash
cd infra && docker compose ps
```

**Por qué:** M02 asume Grafana en `localhost:3000` (o puerto reenviado).

**Resultado esperado:** estado **Up** en `grafana-lab`, `prometheus-lab`, `postgres-lab`, `loki-lab` (y servicios auxiliares del compose).

### 2 — Login y Skip

**Acción:** abre Grafana en el puerto 3000. Inicia sesión con `admin` / `admin`. Si aparece cambio de contraseña, pulsa **Skip**.

**Por qué:** valida credenciales y org por defecto antes de unidades prácticas.

**Resultado esperado:** **Home** visible; menú lateral completo.

![Login — paso 2](../../docs/capturas/M02/M02-01-login.png)

### 3 — Organización y timezone

**Acción:** abre **Administration → General** y confirma la org activa (*Main Org.* o equivalente). En **Profile → Preferences**, localiza **Timezone**.

**Por qué:** la timezone de usuario afecta ejes temporales en dashboards y Explore.

**Resultado esperado:** org por defecto visible; campo **Timezone** editable.

### 4 — APIs y PostgreSQL

**Acción:** ejecuta:

```bash
curl -s -u admin:admin http://localhost:3000/api/health | head
curl -s http://localhost:9090/-/ready
docker compose -f infra/docker-compose.yml exec postgres psql -U grafana -d lab -c '\dt'
```

**Por qué:** confirma que Grafana, Prometheus y PostgreSQL responden antes de M03.

**Resultado esperado:** JSON de salud Grafana; `Prometheus is Ready.`; tablas `daily_sales`, `sensor_readings`, `http_events`, etc.

Si algo falla:

```bash
cd infra && docker compose logs grafana --tail 30
```

### 5 — Parada ordenada (fin de jornada)

**Acción:** `cd infra && docker compose down` (sin `-v` si quieres conservar datos).

**Por qué:** libera recursos; el volumen `grafana-data` mantiene dashboards entre sesiones.

**Resultado esperado:** contenedores detenidos; tras `up.sh` de nuevo, Grafana recupera estado previo.

---

## Conclusiones

- El repo trae Grafana **y** fuentes del curso; M03 las registra en **Connections → Data sources**.
- Puerto **3000** y `admin`/`admin` son solo para lab; en producción aplican políticas de contraseña y permisos por rol (M08).
- `GF_USERS_ALLOW_SIGN_UP: "false"` evita altas públicas en el contenedor de formación.
- loggen + Promtail alimentan Loki con logs de demo continuos.

---

## Comprueba tu entendimiento

**Health Grafana**  
`curl -s -u admin:admin http://localhost:3000/api/health`  
→ Respuesta JSON con `"database": "ok"` (o equivalente en tu versión).

**Prometheus listo**  
`curl -s http://localhost:9090/-/ready`  
→ Texto que indica que Prometheus está ready.

**Tablas demo**  
`\dt` en PostgreSQL del lab  
→ Al menos `daily_sales`, `sensor_readings`, `http_events`.

---

## Reto

### 1 — Registro de usuarios desactivado

<details>
<summary>Ver solución</summary>

En `infra/docker-compose.yml`, servicio `grafana`, variable de entorno **`GF_USERS_ALLOW_SIGN_UP: "false"`**. Impide que visitantes creen cuentas en la instancia de lab.

</details>

### 2 — Logs continuos hacia Loki

<details>
<summary>Ver solución</summary>

El contenedor **`loggen-lab`** genera archivos de log de demo; **`promtail-lab`** los envía a **Loki** (`loki-lab`). No hay puerto publicado al host: la ingesta es interna a la red Docker del compose.

</details>

### 3 — Tabla PostgreSQL y perfil del curso

<details>
<summary>Ver solución</summary>

Ejemplos del init SQL:

- **`daily_sales`** + **`regions`** — perfil **negocio / BI** (ventas por región).
- **`sensor_readings`** — perfil **IoT / industrial**.
- **`http_events`** — perfil **IT / ciberseguridad** (eventos HTTP simulados).

</details>
