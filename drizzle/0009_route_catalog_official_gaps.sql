ALTER TABLE route_versions
  ALTER COLUMN start_latitude DROP NOT NULL,
  ALTER COLUMN start_longitude DROP NOT NULL,
  ALTER COLUMN permit_notes DROP NOT NULL;
