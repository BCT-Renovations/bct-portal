# Agent BCT Model Runtime Decision

Decision status: architecture selected; production model connection not enabled.

## Verified current platform facts

Current Vercel documentation (checked 2026-10-01) provides:
- AI Gateway model discovery at `GET https://ai-gateway.vercel.sh/v1/models`;
- AI SDK generation using `provider/model` IDs;
- current examples include `openai/gpt-5.6-sol`;
- tool-use capable models are discoverable from the Gateway model list;
- Vercel deployments can authenticate to AI Gateway using OIDC;
- Gateway provides usage/cost/latency observability and per-user tagging/rate-limit support.

## BCT choice

Use Vercel AI Gateway for Agent BCT rather than hard-wiring the app to one provider API.

Reasons:
- BCT already deploys on Vercel;
- model/provider can change without redesigning BCT portals;
- server-only authentication;
- usage/cost observability;
- future failover;
- per-user attribution/rate controls;
- no AI credential in browser.

## Model selection rule

Do not permanently hardcode a model from memory. At integration time:
1. query current Gateway models;
2. require language model + tool-use capability;
3. choose a production model based on capability, latency and cost;
4. pin the chosen model ID in server configuration;
5. record it in the Integration Contract;
6. retest before changing it.

The current docs show `openai/gpt-5.6-sol` as an available example, but Agent BCT production selection remains configuration until preview verification.

## Package rule

The repository currently has no package manifest. Do not casually convert the static V46 app into a framework. When generation is enabled, add only the minimal pinned server dependency set and lockfile required for the chosen Gateway integration, after preview deployment linkage is verified.

## Runtime controls

- generation server-side only
- user-specific conversations: no shared response cache
- Gateway user tag uses a non-sensitive stable internal identifier/hash
- tags: `feature:agent-bct`, environment
- cap input/history/context size before provider call
- cap output tokens
- handle 402 budget, 429 rate limit, provider timeout/5xx
- normal BCT portals continue when AI is unavailable
- tool calls remain BCT's own fixed registry; provider never gets arbitrary SQL/RPC
- model output never becomes authorization
