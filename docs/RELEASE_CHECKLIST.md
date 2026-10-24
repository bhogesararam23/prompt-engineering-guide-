# Release checklist

These are release gates, not claims of completion.

## Security and privacy

- [ ] Confirm the Google provider credential referenced by the legacy implementation has been revoked. Updating or deleting source code does not revoke a credential.
- [ ] If a secret remains in reachable Git history, rotate it first and follow GitHub's sensitive-data-removal guidance; coordinate with forks and clones.
- [ ] Choose a project license and add the intended LICENSE file.
- [ ] Verify that the local-first CI guard passes against the final branch.
- [ ] Inspect browser Network tooling during prompt editing, generation, import/export, and API synchronization.
- [ ] For remote deployments, set `PROMPT_GUIDE_API_TOKEN` at minimum; complete account authentication, authorization, tenant isolation, rate limits, and monitoring before public exposure.
- [ ] Confirm remote prompt transfer only occurs after explicit user action and is HTTPS-only.
- [ ] Do not store API keys or sensitive prompts in browser local storage.

## Build and tests

- [ ] All GitHub Actions jobs pass on the exact release commit.
- [ ] Clean install succeeds with the selected Node version.
- [ ] Type checking, unit tests, production build, backend tests, and Playwright smoke tests pass.
- [ ] Test malformed imports, storage quota failure, model initialization failure, unsupported WebGPU, cancellation, and model unload.
- [ ] Complete keyboard, focus, reduced-motion, contrast, and screen-reader checks for the new knowledge-check UI.
- [ ] Review all dependencies and licenses.

## Local model and offline behavior

- [ ] Confirm the configured model ID works with the pinned WebLLM runtime.
- [ ] Test at least one supported desktop browser and document actual resource requirements observed.
- [ ] Verify model and runtime licensing for the intended distribution.
- [ ] Confirm model weights do not download until the user explicitly loads the local model.
- [ ] Test reload and repeat offline navigation after the application shell is cached.
- [ ] State prominently that first-time model assets require a network and that offline app-shell caching does not guarantee offline model availability.

## Hosting and deployment

- [ ] Decide where the frontend and optional API will be hosted.
- [ ] Configure the static host to serve the Vite production build output, not source files.
- [ ] If deploying the API remotely, configure HTTPS, authentication, allowed origins, database persistence, backups, and monitoring.
- [ ] Verify SPA fallback and base-path behavior on the actual hosting domain.
- [ ] Tag a release only after the above gates are completed or explicitly scoped out.
