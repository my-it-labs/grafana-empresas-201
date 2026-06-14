# M01-01 — Qué es Grafana y ventajas

[← Página anterior](README.md) · [Siguiente página →](M01-02-casos-de-uso.md)

Antes de abrir paneles o conectar Prometheus, conviene situar **qué problema resuelve Grafana** en un stack enterprise: no sustituye a las bases de series temporales ni al almacén de logs, sino que unifica cómo equipos distintos **consumen** esos datos.

En esta unidad no usarás aún la UI del lab. El contenido es de **Conceptos** y validación con **Comprueba tu entendimiento**; el primer taller sobre el entorno es [M01-03](M01-03-instalacion-configuracion.md).

### Objetivos

Al cerrar la unidad deberías:

- Definir Grafana en una frase y separar su rol del de las fuentes de datos.
- Enumerar al menos cinco ventajas relevantes en entornos enterprise.
- Reconocer dos limitaciones habituales (qué no debe hacerse solo con Grafana).

---

## Conceptos

**Grafana** es una plataforma open source de **visualización y observabilidad** que se conecta a múltiples **datasources** (métricas, logs, trazas, SQL, etc.) y permite construir **dashboards**, explorar datos (**Explore**) y definir **alertas** sobre consultas.

En el stack típico de observabilidad:

| Componente | Almacena datos | Visualiza | Alerta |
|------------|:--------------:|:---------:|:------:|
| **Grafana** | No (salvo metadatos internos) | Sí | Sí (sobre consultas) |
| **Prometheus** (lab) | Sí (series temporales) | No* | Sí |
| **Loki** (lab) | Sí (logs) | No* | Parcial |
| **PostgreSQL** (lab) | Sí (relacional) | No* | No |

\*Otras herramientas pueden visualizar; en este curso Grafana es la capa unificada de consumo.

**Ventajas enterprise habituales:**

- Un solo lugar para métricas, logs y SQL de distintos backends.
- Ecosistema de **plugins** y datasources oficiales/community.
- **Dashboards** compartibles, versionables y parametrizables (variables — M02/M07).
- **RBAC** y organizaciones (M08).
- **Alerting** integrado con contact points y políticas de notificación.
- **Anotaciones** y correlación temporal entre fuentes del mismo dashboard.
- **API HTTP** y **provisioning** de dashboards y datasources (M09).

**Limitaciones honestas:** Grafana no sustituye a **Prometheus**, **Loki** ni **PostgreSQL** como almacén de datos; tampoco es una base transaccional. Sin datasource conectada no hay series que mostrar (salvo **TestData** integrado para practicar paneles en M02).

---

## En Grafana

En [M01-03](M01-03-instalacion-configuracion.md) accederás a la instancia del lab (`http://localhost:3000`, credenciales `admin` / `admin`). Hasta entonces, la UI no es necesaria: Grafana actuará como **cliente de visualización** sobre Prometheus, PostgreSQL y Loki que ya incluye el repo.

La documentación oficial del producto está en [grafana.com/docs](https://grafana.com/docs/grafana/latest/introduction/).

---

## Conclusiones

- Grafana es la capa de **consumo y colaboración**, no el único componente de observabilidad.
- Cada datasource aporta datos; Grafana aporta consulta, visualización, permisos y alertas unificadas.
- Open source cubre la mayoría del curso; funciones avanzadas de gobierno y escala se profundizan en M08.
- Conocer limitaciones evita anti-patrones (usar Grafana como si fuera Prometheus, Loki o PostgreSQL).

---

## Comprueba tu entendimiento

**Definición en una frase**  
Resume Grafana sin nombrar solo «gráficos bonitos».  
→ Debe incluir conexión a fuentes externas y dashboards/alertas/exploración.

**Tabla de roles**  
¿Prometheus almacena series temporales en el lab? ¿Grafana las persiste como backend principal?  
→ Prometheus sí; Grafana no (usa su BD para dashboards/usuarios, no para métricas de infra).

**Ventaja vs limitación**  
Cita una ventaja enterprise y una tarea que Grafana delega en otra herramienta.  
→ Ej.: dashboards compartidos vs almacenar logs en Loki (retención en la fuente, no en Grafana).

---

## Reto

### 1 — ¿Grafana almacena las métricas de Prometheus?

<details>
<summary>Ver solución</summary>

No. En el lab, **Prometheus** (`prometheus-lab`) persiste las series temporales; Grafana las **consulta** y las dibuja en paneles. Si apagas Prometheus o borras su volumen, Grafana deja de tener datos aunque la UI siga funcionando. Lo mismo aplica a logs (**Loki**) y tablas SQL (**PostgreSQL**): Grafana visualiza; la fuente almacena.

</details>

### 2 — Protocolo hacia datasources

<details>
<summary>Ver solución</summary>

Grafana habla con casi todas las fuentes por **HTTP/HTTPS** (API REST o proxies), p. ej. Prometheus expone PromQL vía HTTP, Loki LogQL vía HTTP, PostgreSQL vía **SQL** sobre conexión TCP. El plugin de cada datasource encapsula el protocolo concreto; la UI y las alertas reutilizan la misma consulta.

</details>
