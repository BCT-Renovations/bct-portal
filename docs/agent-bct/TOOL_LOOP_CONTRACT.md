# Agent BCT Tool-Loop Activation Contract

Model-directed tools remain disabled until preview generation passes adversarial tests.

## Phase A — no model tools
- model answers approved general BCT knowledge
- authenticated role may be known
- no model-selected live RPC/tool
- prove prompt/injection/authority behavior

## Phase B — read-only model tools
Only fixed registry tools may be exposed. The model sees friendly tool schemas, never RPC names.

Execution:
1. model proposes allowlisted tool + typed arguments
2. server re-resolves effective role from BCT backend
3. registry checks role/risk/schema
4. server executes fixed RPC using caller bearer session
5. RLS/RPC performs database authorization
6. server projects/redacts fields
7. result labeled untrusted data
8. model may summarize result but cannot turn it into authorization
9. audit event records metadata only

## No recursive autonomy

- maximum bounded tool steps per user turn
- no arbitrary URL fetch tool
- no shell/code/database tool
- no tool that accepts another tool/RPC name
- no Admin write tool in Phase B
- no Estimator live tool until backend reconciliation
- no financial/contract write tool
- no model-generated SQL

## High-risk reads

Financing, escrow and payment reads:
- homeowner role only under current registry
- status explanation only
- never imply financing guarantee or escrow/refund authority
- external provider references and free-form notes remain excluded

## Failure

If a tool is denied, unavailable or returns no authorized data:
- do not retry by choosing a broader tool
- do not fall back to service-role access
- do not infer the missing live state
- answer with what is known and, where appropriate, offer BCT/Admin escalation
