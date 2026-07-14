ALTER TABLE route_versions
  ADD COLUMN source_references jsonb NOT NULL DEFAULT '[]'::jsonb;
