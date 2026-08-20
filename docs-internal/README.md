# Internal documentation

Notes for the ONSAA site team: deployment details, operational runbooks,
anything that should not be visible in the public GitHub mirror.

This folder is excluded from the `mirror-github` CI job (see
`.gitlab-ci.yml`) — it stays on GitLab only. It is not a secrets store;
credentials still belong in Vault or masked CI/CD variables, not in files
here.
