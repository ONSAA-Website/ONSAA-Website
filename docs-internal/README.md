# Internal documentation

This folder holds notes for the ONSAA site team. It covers deployment details, operational runbooks, and other content that must stay off the public GitHub mirror.

The `mirror-github` CI job excludes this folder. See `.gitlab-ci.yml` for the exact step. Content here stays on GitLab only.

This folder is not a secret store. Keep credentials in Vault or in masked CI/CD variables, not in files here.

## Contents

- [github-mirror-pipeline-decisions.md](github-mirror-pipeline-decisions.md): the reasons behind the GitHub mirror pipeline safety controls added on 2026-08-20.
