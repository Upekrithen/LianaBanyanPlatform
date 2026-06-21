-- Mountain 1b · Domain Classifier Audit
-- KNIGHT MARATHON 7 · BP089 · 2026-06-21
-- Bishop applies · do not run directly
-- §15 BLOOD: Knight ships · Bishop applies

CREATE TABLE IF NOT EXISTS domain_classifier_audit (
  id                  TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  created_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  query_hash          TEXT NOT NULL,
  prompt_excerpt      TEXT,            -- first 300 chars
  classified_domain   TEXT NOT NULL,   -- DomainTag value returned
  model_used          TEXT NOT NULL,   -- e.g. "qwen2.5:0.5b" | "gemma2:2b" | "fallback_general"
  fallback_reason     TEXT,            -- null unless fallback fired
  latency_ms          INTEGER,
  status              TEXT NOT NULL    -- 'ok' | 'model_unavailable' | 'fallback_general'
);

CREATE INDEX IF NOT EXISTS idx_domain_classifier_audit_created_at
  ON domain_classifier_audit(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_domain_classifier_audit_classified_domain
  ON domain_classifier_audit(classified_domain);

CREATE INDEX IF NOT EXISTS idx_domain_classifier_audit_model_used
  ON domain_classifier_audit(model_used);
