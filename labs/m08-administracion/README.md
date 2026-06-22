# M08 — Administración de Grafana

[← Página anterior](../m07-tableros-organizacion/M07-03-carpetas-playlists.md) · [Siguiente página →](M08-01-usuarios-roles.md)

## Qué aprenderás

- Gestionar **usuarios** y roles Viewer / Editor / Admin.
- Aplicar **permisos** en folders y teams.
- Configurar **contact points**, políticas de notificación y **silences**.

## Contexto

- Alert rules creadas en [M05-04](../m05-visualizaciones-avanzadas/M05-04-alertas-umbrales.md).
- Folders definidos en [M07-03](../m07-tableros-organizacion/M07-03-carpetas-playlists.md).
- Automatización y Git en [M09](../m09-integraciones/README.md).

## Unidades

| ID | Unidad | Objetivo |
|----|--------|----------|
| M08-01 | [Usuarios y roles](M08-01-usuarios-roles.md) | Alta viewer/editor, RBAC org |
| M08-02 | [Permisos en carpetas](M08-02-permisos-carpetas.md) | Teams, ACL folders |
| M08-03 | [Contact points y políticas](M08-03-contact-points-politicas.md) | Routing, silences |

Todas las unidades incluyen **Laboratorio**. Índice: [Laboratorios](../LABORATORIOS.md).

## Dashboards de ejemplo

- [`lab-m08-01-usuarios-roles.json`](examples/lab-m08-01-usuarios-roles.json)
- [`lab-m08-02-permisos-carpetas.json`](examples/lab-m08-02-permisos-carpetas.json)
- [`lab-m08-03-contact-points.json`](examples/lab-m08-03-contact-points.json)

Índice global: [labs/examples/README.md](../examples/README.md).

## Antes de empezar

- Rol **Admin** (`admin` / `admin`).
- Carpetas **Lab Ops** / **Lab Business** ([M07-03](../m07-tableros-organizacion/M07-03-carpetas-playlists.md)).
- Al menos una alert rule activa ([M05-04](../m05-visualizaciones-avanzadas/M05-04-alertas-umbrales.md)).

> Si reseteaste el entorno, recrea primero las carpetas (M07-03) y la alert rule (M05-04): los permisos y las políticas de notificación operan sobre esos recursos.
