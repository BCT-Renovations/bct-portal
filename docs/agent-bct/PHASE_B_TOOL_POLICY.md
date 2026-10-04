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


## Remaining execution-layer risk gate

Schema exposure already defaults to low/medium risk, but this is not sufficient by itself. Before Phase B activation, the execution function must independently enforce the same maximum-risk stage so a hallucinated or manually constructed high-risk model call cannot bypass schema exposure.

Required behavior:
- default model execution maximum is medium;
- financing, escrow and payment reads are denied before the RPC executor unless an explicit high-risk stage is active;
- invalid risk stage fails closed;
- explicit authenticated /tool endpoint behavior remains a separate boundary;
- tests must prove a denied high-risk model call never invokes the RPC executor.

This gate remains incomplete until the code and tests are committed; documentation is not a pass.


## Execution-layer risk ceiling implemented

The model execution boundary now independently defaults to `medium` risk. High-risk financing, escrow and payment calls are denied before the RPC executor unless the caller explicitly activates `maxRisk: "high"`. Invalid risk stages fail closed. The bounded sequence propagates the same ceiling.

This closes the schema-exposure bypass described above at the code level. It does not activate Phase B by itself; executed test evidence and preview/RLS gates are still required.
