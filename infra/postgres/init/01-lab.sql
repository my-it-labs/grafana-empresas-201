CREATE TABLE regions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(8) NOT NULL UNIQUE,
  name VARCHAR(64) NOT NULL
);

INSERT INTO regions (code, name) VALUES
  ('EMEA', 'Europe Middle East Africa'),
  ('APAC', 'Asia Pacific'),
  ('AMER', 'Americas');

CREATE TABLE daily_sales (
  day DATE NOT NULL,
  region_id INT NOT NULL REFERENCES regions(id),
  orders INT NOT NULL,
  revenue NUMERIC(12, 2) NOT NULL,
  PRIMARY KEY (day, region_id)
);

INSERT INTO daily_sales (day, region_id, orders, revenue)
SELECT
  (CURRENT_DATE - ((g.n % 30) || ' days')::INTERVAL)::DATE AS day,
  r.id,
  40 + ((g.n + r.id * 7) % 120) AS orders,
  (800 + ((g.n + r.id * 11) % 400))::NUMERIC(12, 2) AS revenue
FROM generate_series(0, 29) AS g(n)
CROSS JOIN regions r;

CREATE TABLE sensor_readings (
  ts TIMESTAMPTZ NOT NULL,
  site VARCHAR(32) NOT NULL,
  temperature_c NUMERIC(5, 2) NOT NULL,
  humidity_pct NUMERIC(5, 2) NOT NULL
);

INSERT INTO sensor_readings (ts, site, temperature_c, humidity_pct)
SELECT
  NOW() - ((g.n * 5) || ' minutes')::INTERVAL,
  sites.site,
  18 + ((g.n + LENGTH(sites.site)) % 12)::NUMERIC(5, 2),
  35 + ((g.n * 3 + LENGTH(sites.site)) % 40)::NUMERIC(5, 2)
FROM generate_series(0, 71) AS g(n)
CROSS JOIN (VALUES ('plant-a'), ('plant-b'), ('warehouse-1')) AS sites(site);

CREATE TABLE http_events (
  ts TIMESTAMPTZ NOT NULL,
  service VARCHAR(32) NOT NULL,
  method VARCHAR(8) NOT NULL,
  path VARCHAR(64) NOT NULL,
  status INT NOT NULL,
  latency_ms INT NOT NULL
);

INSERT INTO http_events (ts, service, method, path, status, latency_ms)
SELECT
  NOW() - ((g.n * 2) || ' minutes')::INTERVAL,
  svc.service,
  'GET',
  svc.path,
  svc.status,
  20 + ((g.n * 17) % 480)
FROM generate_series(0, 119) AS g(n)
CROSS JOIN (
  VALUES
    ('checkout', '/api/checkout', 500),
    ('orders', '/api/orders', 404),
    ('health', '/api/health', 200)
) AS svc(service, path, status);
