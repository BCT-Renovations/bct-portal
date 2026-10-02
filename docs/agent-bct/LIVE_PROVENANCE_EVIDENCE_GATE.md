# Live Provenance Evidence Gate

`live_confirmed` must never be awarded because the model says information is live.

Before Phase B activation, provenance logic must require evidence produced by the fixed Agent tool executor:
- successful tool execution;
- projected result only;
- result marked as untrusted retrieved data;
- role/RLS checks completed through the normal authenticated path.

A failed or denied tool call cannot create live-confirmed provenance. A user statement, knowledge seed, retrieved instruction, model assertion, or cached text cannot create live-confirmed provenance.

If live retrieval fails and no general guidance can safely answer the question, the answer should be unavailable rather than fabricated. Human-authority signals continue to override live provenance and require human review.

This is a required code/test gate before model-directed reads are enabled; documentation alone does not satisfy it.
