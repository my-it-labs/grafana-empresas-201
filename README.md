# Grafana para empresas

[Siguiente página →](labs/M01/README.md)

Formación **100 % práctica** — observabilidad y dashboards con Grafana.

Aprenderás conectando fuentes de datos del laboratorio, diseñando paneles y tableros, y aplicando administración e integraciones orientadas a equipos enterprise.

---

## Entorno de laboratorio

El repo es **autosuficiente**: incluye Grafana y las fuentes de datos del curso (Prometheus, PostgreSQL, Loki y datos de demo) en [`infra/`](infra/README.md).

**Flujo recomendado**

1. Haz **fork** de este repositorio en tu cuenta de GitHub.
2. En tu fork: **Code → Create codespace on main**.
3. Espera a que termine de crear el Codespace (el stack arranca solo).
4. Abre **Grafana** desde la notificación del puerto **3000** o desde la pestaña **Ports**.
5. Empieza por [M01 — Introducción a Grafana](labs/M01/README.md).

**También puedes usar**

- **Docker en local** — clona tu fork y ejecuta `bash infra/up.sh` ([detalle](infra/README.md)).
- **Dev Containers** — abre el repo en VS Code o Cursor y elige *Reopen in Container* (`.devcontainer/`).

Credenciales del lab: usuario `admin`, contraseña `admin` (solo formación).

---

## Cómo funciona el curso

- Sigue este README como índice y avanza **página a página** (**← Página anterior · Siguiente página →**).
- Cada unidad incluye **Conceptos**, **Conclusiones**, **Comprueba tu entendimiento** y **Reto**. Cuando la unidad es un **taller**, añade **En Grafana** y **Laboratorio** (acciones sobre el entorno). Ejemplo: [M02-01](labs/M02/M02-01-navegacion-estructura.md).
- El listado de talleres está en **[Índice de laboratorios](labs/LABORATORIOS.md)**.

---

## Laboratorios (talleres)

Práctica **solo** sobre el entorno del repo: Docker, Grafana, API o terminal.

→ **[Índice de laboratorios](labs/LABORATORIOS.md)** — orden recomendado y unidades publicadas

Primer taller: [M01-03 — Instalación](labs/M01/M01-03-instalacion-configuracion.md) (requiere `infra/up.sh`).

---

## Antes de empezar

| Requisito | Dónde |
|-----------|--------|
| Entorno listo (Grafana + fuentes de datos) | [infra/README.md](infra/README.md) |
| Validar acceso a Grafana | [M01-03 — Instalación](labs/M01/M01-03-instalacion-configuracion.md) |

---

## Módulos

| # | Módulo | Índice |
|---|--------|--------|
| **M01** | Introducción a Grafana | [labs/M01/](labs/M01/README.md) |
| **M02** | Explorando la interfaz | [labs/M02/](labs/M02/README.md) |
| **M03** | Fuentes de datos | [labs/M03/](labs/M03/README.md) |
| **M04** | Paneles y personalización | [labs/M04/](labs/M04/README.md) |
| **M05** | Visualizaciones avanzadas | [labs/M05/](labs/M05/README.md) |
| **M06** | Paneles y datasources personalizados | [labs/M06/](labs/M06/README.md) |
| **M07** | Tableros y organización | [labs/M07/](labs/M07/README.md) |
| **M08** | Administración | [labs/M08/](labs/M08/README.md) |
| **M09** | Integraciones | [labs/M09/](labs/M09/README.md) |

---

## Empieza aquí

→ **[M01 — Introducción a Grafana](labs/M01/README.md)**  
→ Primer ejercicio: [M01-01 — Qué es Grafana y ventajas](labs/M01/M01-01-que-es-grafana.md)
