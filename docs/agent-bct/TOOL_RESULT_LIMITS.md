# Agent BCT Tool Result Limits

Agent BCT live reads must be useful without allowing unbounded backend data into the model or browser.

Current branch rules:
- row-returning tools project at most 50 rows per invocation;
- each row is field-allowlisted before return;
- live model context separately limits the number and serialized size of tool-result envelopes;
- schedule notes, storage paths, uploader identity, financial external/application references and other excluded fields remain out;
- a row cap is not authorization: existing RPC/RLS and Agent role checks still apply first.

## Future pagination

If customers need more than the initial bounded result set, add explicit cursor/page semantics per tool after verifying the underlying RPC supports deterministic safe ordering. Do not solve pagination by removing caps or dumping entire tables.

## Model behavior

The model must not describe a capped list as exhaustive unless the tool contract confirms completeness. UI/model should use language such as “Here are the available recent/returned items” where completeness is unknown.
