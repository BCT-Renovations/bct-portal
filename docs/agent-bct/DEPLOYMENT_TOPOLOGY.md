# Agent BCT Deployment Topology

Verified: 2026-10-01

## Production lineage

Vercel team: `team_blv7d5Z9q6QXCR1YMznSaX06`

Current Git-connected BCT V46 production project:
- project id: `prj_YCigLFW7rgXaq1RvhRFWICEKsh3T`
- project name: `bct_secure_admin_v45_email_field_fixed`
- Git repository: `BCT-Renovations/bct-portal`
- production branch: `main`
- verified production baseline deployment SHA: `f442749655e12238bf86ae364f33c614c2fb2148`
- production deployment state at verification: READY

## Agent preview lineage

The `agent-bct` Git branch automatically creates non-production Vercel preview deployments in the same Git-connected project. Verified preview deployments show:
- `githubCommitRef=agent-bct`
- `target=null`
- Git org/repo = `BCT-Renovations/bct-portal`

This is the correct preview lineage for Agent BCT.

## Separate legacy/unused-for-current-lineage project

A Vercel project named `bct-portal` also exists:
- project id: `prj_vmTea2A41OXE7HgtSqor9yvVZVXF`
- only one observed deployment
- deployment metadata does not identify the current Git branch/repository lineage

Decision: do not use that project as Agent BCT's production/preview source of truth.

## Safety rules

- Agent work remains on `agent-bct`.
- Preview deployments are allowed for verification because they are non-production.
- Never promote an Agent preview or merge to `main` without Ty Perry's explicit production merge approval.
- Production baseline remains the rollback reference until a future explicitly approved production merge.
