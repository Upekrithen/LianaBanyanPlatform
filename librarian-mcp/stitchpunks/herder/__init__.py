"""
Herder Scribe — KN013 / A&A #2297 Substrate-Capacity-Prediction

T-Sipping Refiner / Air-Traffic-Controller substrate.  Observes Knight bean
executions, compiles fingerprints, trains predictive models, and answers
Bishop's "will it fit?" query before the next bundle is assembled.

Composes with:
  #2290 Beans+Beanpods / #2291 Chandelier / #2293 Chronos / #2294 Colony /
  #2296 SPRINT

Exported modules:
  herder_observe      — observation-event ingestion (Stone Tablet append-only)
  herder_fingerprint  — bean-class fingerprint compiler + registry
  herder_train        — v1 linear / v2 nearest-neighbor predictive model
  herder_wrasse_register — Wrasse pre-injection at Bishop-spawn-boundary

MCP tools (herder_query.ts):
  query_will_it_fit / query_predicted_context_climb / record_observation /
  query_fingerprint / query_model_confidence / compare_vendor_predictions

Toolsmith log: TS-HERDER-SCRIBE-T-SIPPING-REFINER-KN013-BP002
"""
