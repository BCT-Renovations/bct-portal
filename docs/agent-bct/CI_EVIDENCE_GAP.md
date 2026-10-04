# Agent BCT CI Evidence Gap

Status: unresolved infrastructure/configuration gate.

The repository contains `.github/workflows/agent-bct-security.yml` and multiple commits have changed paths that match its push trigger, but GitHub reports no workflow runs for checked Agent branch SHAs.

## What this means

- The test suite definition exists.
- It is NOT valid to claim GitHub CI passed.
- The absence of runs is different from a failing test run.
- Production merge remains blocked until executable test evidence exists.

## Likely repository-level causes to verify in GitHub settings

- Actions disabled or restricted for the repository/organization.
- Workflow from a non-default branch not being scheduled under current policy.
- Organization Actions policy disallowing referenced actions.
- Other repository-level workflow permissions/settings.

Do not weaken the tests to make this disappear.

## Recovery

When Actions execution is available:
1. trigger a fresh Agent-only path change or workflow dispatch if deliberately added;
2. verify Node 20 checkout/setup executes;
3. require `npm run test:agent-bct` success;
4. inspect failed job logs rather than rerunning blindly;
5. keep Vercel preview readiness as a separate gate.
