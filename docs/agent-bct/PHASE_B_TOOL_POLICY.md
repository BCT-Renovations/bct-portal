# Phase B Model Tool Policy

Status: model-directed live tools remain OFF.

When Phase B begins in non-production preview, tool exposure must be staged rather than exposing every readable tool at once.

## Ordinary read stage
Default model schema exposure is capped at medium risk. This includes authorized project, notification, schedule, estimate, contract-summary, service-catalog, and contractor-dashboard reads where role permits.

High-risk financing, escrow, and payment reads are not present in the model schema during the ordinary read stage.

## High-risk read stage
High-risk schemas require an explicit activation choice after ordinary read tests pass. Their tools remain read-only and continue to use the same authenticated user bearer, RLS, role re-resolution, projection, untrusted-data labeling, bounded rows, and audit requirements.

## Loop controls
- maximum three tool steps;
- duplicate calls in one sequence are rejected before execution;
- unknown tools and roles fail closed;
- malformed arguments fail closed;
- no broader retry after RLS/role denial;
- no service-role fallback;
- no write tools;
- no estimator live tools until backend reconciliation is complete.

This code boundary does not itself activate Phase B. Activation still requires the preview gates and evidence defined elsewhere.
