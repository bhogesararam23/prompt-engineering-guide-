# Security policy

## Data handling

- Never commit API keys, access tokens, passwords, private certificates, or production credentials.
- Browser local storage is not encrypted; treat it as convenience storage, not a secure vault.
- Do not paste private data into prompts unless you have permission and understand the processing path.
- First-time local-model installation may access a model source; inference itself is performed in the browser.
- The optional API has no authentication and should remain bound to localhost.
- Any future sync, public deployment, accounts, or privileged tools require a separate threat model.

## Incident response

If a credential has been committed, revoke or rotate it at the provider immediately. Deleting it from the latest tree does not invalidate the credential or remove historical copies from Git objects, forks, caches, or clones.

## Release checks

Run type checks, unit tests, API tests, and production builds. Inspect generated assets and network traffic for accidental secrets or unintended hosted inference requests.