DROP INDEX "alert_events_active_trip_stage_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "alert_events_active_trip_stage_unique" ON "alert_events" USING btree ("trip_id","stage") WHERE "alert_events"."status" in ('pending', 'claimed') and "alert_events"."stage" in ('due', 'overdue_60', 'overdue_120');
