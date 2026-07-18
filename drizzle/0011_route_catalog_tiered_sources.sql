ALTER TABLE route_versions
  ALTER COLUMN distance_km DROP NOT NULL,
  ALTER COLUMN duration_minutes DROP NOT NULL,
  ALTER COLUMN difficulty DROP NOT NULL;
