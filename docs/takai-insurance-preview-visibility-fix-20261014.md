# TAKAI isolated preview visibility regression

Browser testing of deployment `277be85d` found the insurance section had its hidden class removed, but computed display remained `none`. TAKAI's signed-out exclusion selectors outranked the preview shell's ordinary stylesheet rule.

Fixed only the isolated insurance preview shell: set important inline display while its own section is open, synchronize it with its hidden class through an observer scoped to that section, and apply a temporary preview-only body class to hide the forced-visible Home section. Closing or navigating away clears that state. No index, authentication, router, service-worker, or production source changed.

Verification: expanded mocked Chromium tests include the actual TAKAI signed-out CSS selectors. All insurance browser/static suites and source-integrity checks passed. A browser check against the deployed page with this one replacement script injected observed the insurance section visible at 390px width and Home hidden. Supabase requests were blocked. This replacement-script check is not a hosted backend test.
