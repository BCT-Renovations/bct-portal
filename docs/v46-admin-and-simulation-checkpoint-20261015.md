# Admin and simulation follow-up — October 15, 2026

Parent: bdf943db. Same isolated branch, current Live 6c90eb9a unchanged.

- Corrected four urgent fronts to the approved three: JOBS, CONTRACTORS, CLIENTS/HOMEOWNERS. Handyman alerts remain accessible under Contractors; its separate functional Admin section remains available.
- Core Admin data load now signals loading/ready/error. Unknown/loading/error counts use a dash or a lower bound for already-known alerts, rather than claiming zero/all-clear. Successful empty data still shows zero. Static estimator metrics show unknown, not invented zero records. This is partial task 70: independent queue health and real backend acceptance remain pending.
- Simulated photo recommendations now say metadata only, use an explicit Simulator model identity/reason and identify their fixture score. Existing saved test rows receive honest labels too. Labels/reasons update in nine languages without another provider call or duplicate save. They cannot establish image quality, workmanship, consent or marketing suitability.
- Added an exact source-derived map of all 14 Agent positions, authenticated role pools, RPCs, risk ceilings, disabled writes and operational gaps. Role-specific business acceptance remains open; choosing a catalog role grants no database authority.
- Current Live preservation tests permit only the documented insurance preview, profession-heading fix and three Admin load-state signals. All other homepage content still hashes to the verified Live blob after those narrow changes are removed.

Fresh local suite: 59/59 commands, 183 unit checks, 14 staged migrations/75 SQL assertions, existing mocked insurance regression, and 21 estimator/21 Agent/10 gallery/39 contractor/15 Admin/18 simulation browser assertions. No Supabase project, provider, paid service, real account or production deployment was used.

See the explicit 242-item progress register: 23 local tasks closed; 219 open, including 40 partial. All starred hosted tasks remain open. This replaces the ambiguous earlier 16-items-addressed count; it does not claim 100 completed items.
