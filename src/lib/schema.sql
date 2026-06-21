CREATE TABLE IF NOT EXISTS watchlists (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  nit TEXT,
  tipo TEXT CHECK (tipo IN ('empresa', 'persona', 'entidad')),
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  watchlist_id INTEGER REFERENCES watchlists(id),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  nivel TEXT CHECK (nivel IN ('alto', 'medio', 'bajo')),
  fuente TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS investigations (
  id SERIAL PRIMARY KEY,
  watchlist_id INTEGER REFERENCES watchlists(id),
  query TEXT NOT NULL,
  resultado JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
