-- K197: Trail Map — Seed trail stop count into platform_canonical
-- Trail marker preferences use existing user_preferences table (key: trail_marker_icon)

INSERT INTO platform_canonical (key, value, updated_at)
VALUES ('trail_stop_count', 12, now())
ON CONFLICT (key) DO UPDATE SET value = 12, updated_at = now();
