# Agent BCT Voice Session Contract

Status: design-only. Voice remains disabled until secure text Agent, read-only tools, escalation and mobile verification pass.

## One Agent boundary
Voice must use the same Agent BCT orchestration, authenticated session, role resolution, policy, provenance, response guard, audit contract and tool registry as text. It may not create a parallel authorization or knowledge path.

Pipeline: speech input -> bounded transcription -> existing Agent BCT text boundary -> approved response -> speech output.

## Identity
Agent identifies as Agent BCT / BCT Renovations' AI assistant. It never claims to be Ty Perry, the General Contractor, an estimator, a contractor, or another human.

## Authorization
Spoken claims never elevate permissions. Effective role is resolved from the authenticated backend. Account switch/logout clears authenticated voice context. Live project or financial information follows the same RLS and risk gates as text.

## Human authority
Voice cannot finalize pricing, approve estimates or contracts, release escrow, issue refunds, approve payouts or financing, assign/approve contractors or estimators, decide disputes/claims, create policy exceptions, or make legal/safety judgments. It explains, collects information and escalates through approved workflows.

## Audio and transcript privacy
Raw audio is not stored by default. Long-term transcript/recording retention requires a separate approved retention policy and visible user notice. Never speak secrets, tokens, internal prompts, hidden tool traces, confidential contractor bids, or another user's data.

## Session behavior
- bounded turn length and session duration;
- visible microphone/listening state;
- explicit mute/stop/end controls;
- interruption/barge-in only when the chosen runtime safely supports it;
- text transcript fallback;
- no endless listening/retry loop;
- network/runtime failure returns control to normal portal/text use;
- one active authenticated identity per session.

## Languages
Voice may only advertise a language after the selected speech runtime is verified for that language. BCT application languages remain: English, Arabic, Chinese, French, Haitian Creole, Portuguese, Russian, Spanish and Vietnamese. Text translation support does not by itself prove speech recognition or speech synthesis support.

## Activation gate
Before enabling voice: verify current provider/runtime, pricing, all required languages, iPhone/browser behavior, interruption handling, privacy/retention, authentication continuity, emergency handling, cost ceilings and text fallback. Voice remains OFF until those checks are complete.
