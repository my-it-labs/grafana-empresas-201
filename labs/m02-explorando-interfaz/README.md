# M02 — Explorando la interfaz

[← Página anterior](../m01-introduccion-grafana/M01-03-instalacion-configuracion.md) · [Siguiente página →](M02-01-navegacion-estructura.md)

## Qué aprenderás

- Orientarte en la interfaz de Grafana (menús, búsqueda, organización).
- Relacionar cada zona de la UI con tareas habituales (explorar, conectar datos, administrar).
- Crear paneles básicos, ajustar visualizaciones y parametrizar dashboards con variables.

## Contexto

- Antes de conectar fuentes (M03) o diseñar tableros complejos (M07), necesitas **saber dónde está cada cosa** en Grafana 11.
- En empresa la UI es compartida por perfiles distintos (ops, datos, negocio); los permisos limitan lo que ves, pero la estructura es la misma.
- El lab usa la instancia del repo (`http://localhost:3000` o puerto reenviado en Codespace).

## Cómo está organizado este módulo

Cada unidad incluye:

1. **Entradilla y Objetivos** — contexto y metas de la unidad  
2. **Conceptos** — ideas y vocabulario del tema  
3. **En Grafana** — la interfaz en el entorno del lab  
4. **Laboratorio** — **Objetivo**, **En qué consiste**, pasos **Acción**, **Por qué**, **Resultado esperado**  
5. **Conclusiones**, **Comprueba tu entendimiento** y **Reto** (solución en desplegable)

Empieza por [M02-01 — Navegación y estructura](M02-01-navegacion-estructura.md).

Todas las unidades de este módulo son **talleres** sobre Grafana en marcha. Índice: [Laboratorios del curso](../LABORATORIOS.md).

## Unidades

| ID | Unidad | Objetivo |
|----|--------|----------|
| M02-01 | [Navegación y estructura](M02-01-navegacion-estructura.md) | Dominar menú lateral, barra superior y búsqueda global |
| M02-02 | [Paneles y gráficos](M02-02-paneles-graficos.md) | Crear primer panel con TestData y time series |
| M02-03 | [Configuración básica de paneles](M02-03-configuracion-paneles.md) | Ajustar leyendas, unidades y tipo de visualización |
| M02-04 | [Variables de dashboard](M02-04-variables-dashboard.md) | Custom, interval y repeat por variable |

## Antes de empezar

- Grafana accesible según [infra/README.md](../../infra/README.md).
- Haber completado [M01-03](../m01-introduccion-grafana/M01-03-instalacion-configuracion.md) o equivalente (entorno en marcha).
