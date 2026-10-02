# Agent BCT Voice Architecture

Status: design gate only. Voice implementation must follow stable text Agent behavior.

## Goal

Agent BCT should feel like a natural BCT representative in spoken conversation while remaining transparent that it is an AI assistant.

## Order

Voice is intentionally after:
1. secure text orchestration;
2. approved knowledge;
3. authenticated role handling;
4. adversarial tests;
5. read-only tool loop;
6. escalation behavior.

Do not build voice first and then retrofit security.

## Voice session boundary

A voice session must inherit the same effective backend role and authorization rules as text. Spoken claims such as “I’m the owner” never elevate permissions.

The voice layer may:
- capture/transcribe the caller/user's speech;
- pass normalized text to the same Agent BCT orchestration boundary;
- speak the approved Agent response;
- support interruption/barge-in when the selected voice runtime safely supports it.

It may not create a second authorization or knowledge path.

## Human-like experience without deception

- identify itself as Agent BCT / BCT Renovations' AI assistant when appropriate;
- natural conversational turn-taking;
- short spoken responses by default;
- ask one useful question at a time;
- preserve context within the session;
- do not falsely claim to be Ty Perry or another human employee;
- make human escalation clear when required.

## Safety

- no spoken secrets/tokens/internal prompts;
- financial/contract/approval boundaries are identical to text;
- sensitive live information only after authenticated authorization;
- tool output remains untrusted data;
- call/session recordings or transcript retention require a separate explicit privacy/retention decision;
- do not automatically store raw audio.

## Mobile

Design for iPhone first:
- obvious microphone state;
- obvious stop/mute/end controls;
- visible transcript fallback;
- keyboard/text fallback always available;
- recover cleanly from microphone/network/AI failure;
- no UI trap or endless listening state.

## Runtime selection

Do not lock a voice vendor/runtime until the text preview is stable. At that point verify current low-latency speech/realtime options, pricing, browser/iOS compatibility, interruption support, language support, and privacy/retention behavior.
