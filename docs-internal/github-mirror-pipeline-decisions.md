# Decisions for the GitHub mirror pipeline

This document explains the safety controls added to the GitHub mirror pipeline on 2026-08-20. It gives the reason for each control and its exact behavior in GitLab CI.

## Background

The `mirror-github` job in `.gitlab-ci.yml` pushes the content of the `main` branch to the public repository `github.com/ONSAA-Website/ONSAA-Website`. The job builds an orphan commit and force pushes it. GitHub never receives the full GitLab commit history, only this one commit each time.

## Secret scan gate

The pipeline now runs a `secret-scan` job before the mirror job. This job runs gitleaks version 8.30.1 against the repository content. If gitleaks finds a likely secret, the job fails, and the mirror job does not run.

We added this gate because the earlier pipeline had no check for secrets before the public push. A committed key or token would reach GitHub with no warning.

## Build check gate

The pipeline also runs a `verify-main` job before the mirror job. This job runs `npm run check` and `npm run build`, the same commands the site build already uses. If either command fails, the mirror job does not run.

We added this gate because the mirror job had no link to build success. A broken commit on `main` could reach GitHub even if the site itself would fail to build.

## Stage order

Both new jobs run in a `test` stage. The mirror job runs in the existing `deploy` stage. GitLab does not start a later stage until every job in the earlier stage passes. This stage order blocks the mirror push when a scan or build check fails.

## Delay before sync

The mirror job now waits 15 minutes after the `test` stage passes, before it runs. During this wait, a person can open the pipeline in GitLab. The person can start the job now, which skips the rest of the wait. The person can also cancel the job, which stops the sync for that pipeline run.

If nobody acts, the job runs on its own once the 15 minutes pass. This gives a human operator a window to review or stop a sync. It does not force a review before every push.

## Internal docs folder

The `docs-internal` folder holds team notes that must not appear in the public mirror. The mirror job removes this folder from its working copy before it builds the commit it pushes to GitHub. This removal step runs as `rm -rf docs-internal`, right after the orphan checkout and before `git add -A`.

The GitLab repository still tracks this folder in full. Only the GitHub copy excludes it.

## What these controls do not cover

These controls scan only the current tree at push time, not the full commit history on GitLab. A secret committed in the past and later removed could still exist in GitLab history.

These controls also do not replace token scope limits. Keep the `GITHUB_MIRROR_PAT` variable scoped to the smallest access GitHub allows, limited to this one repository. Keep it marked Protected and Masked in GitLab CI/CD settings.
