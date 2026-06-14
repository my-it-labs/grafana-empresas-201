# M01-02 — Casos de uso

[← Página anterior](M01-01-que-es-grafana.md) · [Siguiente página →](M01-03-instalacion-configuracion.md)

Un mismo Grafana en empresa puede servir a **operaciones**, **seguridad**, **datos**, **planta** o **negocio** si las fuentes, permisos y dashboards están alineados con la pregunta que cada perfil necesita responder.

En esta unidad sigues sin configurar datasources en la UI. Tras leer **Conceptos**, valida con **Comprueba tu entendimiento**; el taller sobre el stack es [M01-03](M01-03-instalacion-configuracion.md).

### Objetivos

Al cerrar la unidad deberías:

- Asociar al menos un escenario concreto a cada perfil del curso (DevOps, IT, datos, IoT, negocio).
- Describir el flujo Fuente → Grafana → Usuario → Acción usando componentes del lab.
- Identificar dos usos inadecuados de Grafana.

---

## Conceptos

Un **caso de uso** en Grafana se define por:

1. **Pregunta** — qué decisión habilita (¿CPU alta?, ¿ventas por región?, ¿sensor fuera de rango?).
2. **Datasource** — de dónde salen los datos en el lab: **Prometheus**, **Loki**, **PostgreSQL** o **TestData**.
3. **Audiencia** — quién consume o edita el dashboard (roles **Viewer** / **Editor** — M08).
4. **Acción** — alerta en Grafana, revisión en **Explore** o consulta del dashboard.

Ejemplos alineados con el **lab del curso**:

| Perfil | Pregunta típica | Fuente y dato de ejemplo |
|--------|-----------------|---------------------------|
| DevOps / infra | ¿Uso de CPU del host dentro de lo esperado? | **Prometheus** — métricas de `node-exporter-lab` |
| IT / tráfico | ¿Picos de respuestas HTTP 5xx? | **PostgreSQL** — tabla `http_events`; logs vía **Loki** |
| Datos / SQL | ¿Ventas agregadas por día? | **PostgreSQL** — `daily_sales`, `regions` |
| IoT / industrial | ¿Lectura de sensor fuera de rango? | **PostgreSQL** — `sensor_readings` |
| Negocio | ¿Ingresos por región en el periodo? | **PostgreSQL** — `daily_sales` + `regions` |

**Flujo integrado (lab):** **Prometheus** expone métricas → **Grafana** muestra un dashboard → un operador detecta anomalía (panel o alerta en **Alerting**, módulos posteriores) → revisa detalle en **Explore** o ajusta el tablero.

**Anti-patrones:** usar Grafana como base de datos de negocio; guardar la única copia de un dashboard sin **Save** ni provisioning (M09); tableros sin dueño ni permisos definidos (M08).

---

## En Grafana

En el lab, PostgreSQL incluye tablas de demo (`daily_sales`, `sensor_readings`, `http_events`); Prometheus recoge métricas del host; Loki recibe logs de **loggen-lab** vía Promtail. En **M03** registrarás esas fuentes en **Connections → Data sources**; aquí basta con saber qué pregunta responde cada una.

---

## Conclusiones

- El mismo Grafana sirve perfiles distintos si **fuentes**, **refresh** y **permisos** están bien diseñados.
- Caso de uso = pregunta + datasource del lab + audiencia + acción en Grafana.
- Métricas (**Prometheus**) y logs (**Loki**) requieren datasources distintas; SQL de demo vive en **PostgreSQL**.
- Separar **Editor** y **Viewer** evita cambios accidentales en dashboards compartidos (M08).

---

## Comprueba tu entendimiento

**Datasource por tipo de dato**  
¿Qué fuente del lab usarías para CPU del host vs logs de aplicación?  
→ **Prometheus** (métricas) y **Loki** (logs); **PostgreSQL** para consultas SQL de demo.

**Perfil negocio**  
¿Qué tabla PostgreSQL encaja con ventas por región?  
→ `daily_sales` (regiones en `regions`).

**Permisos**  
¿Quién debería **editar** un dashboard compartido y quién solo **verlo**?  
→ **Editor** (o Admin) define paneles; **Viewer** solo consume (M08).

---

## Reto

### 1 — Logs vs métricas de CPU

<details>
<summary>Ver solución</summary>

**Métricas de CPU:** **Prometheus** en el lab (p. ej. series del **node-exporter**). Consultas PromQL en paneles o **Explore** (M03 en adelante).

**Logs de aplicación:** **Loki**, alimentado por **loggen-lab** y **promtail-lab**. Prometheus no sustituye logs; Loki no sustituye métricas de CPU. Grafana puede mostrar ambos en el mismo dashboard con **paneles distintos**, cada uno con su datasource.

</details>

### 2 — Editor vs Viewer

<details>
<summary>Ver solución</summary>

**Editor / Admin:** crea y modifica dashboards, consultas y variables.

**Viewer:** abre dashboards y explora según permisos, sin cambiar definiciones de paneles ni datasources.

En Grafana 11 los roles se asignan por organización y carpeta (M08). En el lab trabajas como **Admin**; en producción muchos usuarios finales son **Viewer**.

</details>
