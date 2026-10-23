# Release checklist

These are release gates, not claims of completion.

## Security and privacy

- [ ] Revoke or rotate the Google provider credential embedded in the legacy main-branch HTML. A code change is not credential revocation.
- [ ] Decide whether Git history must be rewritten to remove the exposed secret; rotate first, coordinate with forks/clones, and follow GitHub's sensitive-data guidance.
- [ ] Choose a project license and add the intended LICENSE file.
- [ ] Verify that the local-first CI guard passes against the final branch.
- [ ] Inspect browser Network tooling during prompt editing, generation, import/export, and API synchronization.
- [ ] Keep the unauthenticated API bound to localhost; implement authentication, authorization, rate limits, and tenant isolation before public exposure.
- [ ] Confirm remote prompt transfer only occurs after explicit user action and is HTTPS-only.
- [ ] Do not store API keys or sensitive prompts in browser local storage.

## Build and tests

- [ ] All GitHub Actions jobs pass on the exact release commit.
- [ ] Clean install succeeds with the selected Node version.
- [ ] Type checking, unit tests, production build, backend tests, and Playwright smoke tests pass.
- [ ] Test malformed imports, storage quota failure, model initialization failure, unsupported WebGPU, cancellation, and model unload.
- [ ] Complete keyboard, focus, reduced-motion, contrast, and screen-reader checks.
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
