// Run the established round-2 guard against the current public-entry implementation.
// The base round-2 guard now directly checks the current data-entry-login controls,
// so this compatibility entry point simply executes the maintained 200-check suite.
await import(new URL('./v46-production-200-checks-round2.mjs', import.meta.url).href + `?run=${Date.now()}`);
