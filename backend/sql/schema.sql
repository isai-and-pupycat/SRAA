-- ============================================================
--  SRAA · Esquema de Base de Datos (PostgreSQL)
--  Universidad Politécnica de Bacalar
-- ------------------------------------------------------------
--  Cómo usarlo:
--    Opción A (recomendada):  cd backend  →  node src/setup-db.js
--    Opción B (pgAdmin):      abre la base "SRAA" → Query Tool → pega
--                             este archivo → Run.
--
--  Este script es idempotente: puedes ejecutarlo varias veces.
-- ------------------------------------------------------------
--  NOTA: La tabla `usuarios` ya existe en esta base con su propio
--  diseño (matricula, rol numérico). NO la tocamos aquí para no
--  romper el login existente. Este esquema solo crea `fichas`.
-- ============================================================

-- ------------------------------------------------------------
--  TABLA: fichas  (eventos / actividades académicas)
--  Los datos complejos se guardan como JSONB para conservar
--  exactamente la forma que usa el frontend.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fichas (
  id            SERIAL PRIMARY KEY,
  folio         VARCHAR(50),
  nombre        VARCHAR(255) NOT NULL DEFAULT 'Actividad sin nombre',
  carrera       VARCHAR(255) DEFAULT 'Sin programa',
  cuatrimestre  VARCHAR(20)  DEFAULT '2026-1',
  docente       JSONB        DEFAULT '{}'::jsonb,
  etapa1        VARCHAR(20)  DEFAULT 'pendiente',
  etapa2        JSONB        DEFAULT '{"estado":"pendiente"}'::jsonb,
  etapa3        JSONB        DEFAULT '{"estado":"pendiente"}'::jsonb,
  fecha         VARCHAR(20),
  hora          VARCHAR(50),
  tecnica       JSONB        DEFAULT '{}'::jsonb,  -- datos completos de la Etapa 1
  programa      JSONB        DEFAULT '[]'::jsonb,  -- itinerario de la Etapa 2
  creado_en     TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
--  TABLA: catalogos  (módulos de Administración)
--  Guarda de forma genérica los registros de Ciclos, Carreras,
--  Asignaturas, Cuatrimestres, etc. El campo `tipo` distingue el
--  catálogo y `datos` conserva los campos propios de cada uno.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS catalogos (
  id        SERIAL PRIMARY KEY,
  tipo      VARCHAR(40) NOT NULL,               -- ciclos | carreras | asignaturas | cuatrimestres | usuarios
  datos     JSONB       NOT NULL DEFAULT '{}'::jsonb,
  creado_en TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_catalogos_tipo ON catalogos (tipo);

-- ------------------------------------------------------------
--  TABLA: constancias  (reconocimientos emitidos a los docentes)
--  El coordinador las genera en "Crear Constancia" y aparecen
--  automáticamente en el "Mis Constancias" de cada docente.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS constancias (
  id              SERIAL PRIMARY KEY,
  titulo          VARCHAR(255) NOT NULL,               -- evento / reconocimiento
  tipo            VARCHAR(40)  DEFAULT 'Constancia',    -- Constancia | Reconocimiento | Diploma
  rol             VARCHAR(150),                         -- rol desempeñado por el docente
  fecha           VARCHAR(20),                          -- fecha de emisión (ISO aaaa-mm-dd o texto)
  descripcion     TEXT,                                 -- texto / cuerpo del documento
  destinatario    VARCHAR(255),                         -- nombre del docente
  destinatario_id INTEGER,                              -- id del usuario (opcional)
  emitida_por     VARCHAR(255),                         -- coordinador que la emitió
  creado_en       TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_constancias_dest ON constancias (destinatario_id);

-- Columnas adicionales (idempotente, por si la tabla ya existía):
--   para_profesores: 'Sí' / 'No'  ·  es_invitado: destinatario externo (visitante).
ALTER TABLE constancias ADD COLUMN IF NOT EXISTS para_profesores VARCHAR(10) DEFAULT 'No';
ALTER TABLE constancias ADD COLUMN IF NOT EXISTS es_invitado     BOOLEAN     DEFAULT FALSE;

-- ------------------------------------------------------------
--  TABLA: fichas_tecnicas  (folio correlativo por año y ciclo)
--  Genera folios del tipo UPB-CING-2026-1-001. El correlativo se
--  reinicia a 001 cada vez que cambia el año o el cuatrimestre (ciclo).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fichas_tecnicas (
  id          SERIAL PRIMARY KEY,
  folio       VARCHAR(30) UNIQUE NOT NULL,
  anio        INT  NOT NULL,
  ciclo       INT  NOT NULL,          -- viene del módulo Cuatrimestres (1, 2 o 3)
  correlativo INT  NOT NULL,
  titulo      VARCHAR(255) NOT NULL,
  descripcion TEXT,
  creado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Búsqueda rápida del último correlativo por año + ciclo.
CREATE INDEX IF NOT EXISTS idx_fichas_tecnicas_anio_ciclo
  ON fichas_tecnicas (anio, ciclo, correlativo DESC);

-- ------------------------------------------------------------
--  TABLA: configuracion  (ajustes clave/valor del sistema)
--  Ej. las firmas institucionales de los documentos (Vo.Bo., Autoriza).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS configuracion (
  clave VARCHAR(60) PRIMARY KEY,
  valor TEXT
);

-- Valores por defecto de las firmas de la Ficha Técnica.
INSERT INTO configuracion (clave, valor) VALUES
  ('autoriza_nombre', 'MTRO. JULIO MANUEL CEN CAN'),
  ('autoriza_cargo',  'Coordinador de las Ingenierías'),
  ('vobo_nombre',     'MTRA. MARÍA DE LOS ÁNGELES DÍAZ MARTÍN'),
  ('vobo_cargo',      'Secretaría Académica de la UPB'),
  ('rector_nombre',   'DRA. INGRID CITLALLI SUÁREZ MCLIBERTY'),
  ('rector_cargo',    'RECTORA DE LA UPB')
ON CONFLICT (clave) DO NOTHING;

-- ------------------------------------------------------------
--  TABLAS roles y usuarios
--  En LOCAL ya existían; en una base NUEVA (nube) se crean aquí.
--  Todo es idempotente (IF NOT EXISTS), así funciona en ambos casos.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id     SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS usuarios (
  id         SERIAL PRIMARY KEY,
  nombre     VARCHAR(150) NOT NULL,
  correo     VARCHAR(150) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  matricula  VARCHAR(50),
  rol        INTEGER,
  estatus    VARCHAR(20) NOT NULL DEFAULT 'pendiente',
  programa   VARCHAR(150),
  creado_en  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Roles base en orden (Coordinador=1, Profesor=2, Administrador=3). Idempotente.
INSERT INTO roles (nombre) SELECT 'Coordinador'
 WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'Coordinador');
INSERT INTO roles (nombre) SELECT 'Profesor'
 WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'Profesor');
INSERT INTO roles (nombre) SELECT 'Administrador'
 WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'Administrador');

-- Columnas nuevas para el sistema de Usuarios/Profesores.
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS estatus   VARCHAR(20) NOT NULL DEFAULT 'pendiente';
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS programa  VARCHAR(150);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS creado_en TIMESTAMP   NOT NULL DEFAULT NOW();
ALTER TABLE usuarios ALTER COLUMN matricula DROP NOT NULL;
ALTER TABLE usuarios ALTER COLUMN rol SET DEFAULT 2;  -- 2 = Profesor (rol por defecto)

-- Los usuarios que ya existían (base) quedan activos para poder entrar.
UPDATE usuarios SET estatus = 'activo'
 WHERE correo IN ('isai@upb.edu.mx', 'isai.test@upb.edu.mx');
