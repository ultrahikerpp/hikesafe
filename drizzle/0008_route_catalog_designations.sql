ALTER TABLE route_versions
  ALTER COLUMN elevation_gain_meters DROP NOT NULL,
  ADD COLUMN elevation_difference_meters integer,
  ADD COLUMN designations jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD CONSTRAINT route_versions_elevation_difference_nonnegative
    CHECK (elevation_difference_meters IS NULL OR elevation_difference_meters >= 0);
