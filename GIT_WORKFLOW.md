# Git Workflow & Branching Strategy

## Branch Structure

- `main`: Production-ready, locked branch. All changes land via Pull Request.
- `feature/*`: New UI features, emotion models, or RAG enhancements.
- `fix/*`: Bug fixes and edge-case resilience patches.
- `release/*`: Release candidate branches prior to Vercel deployment.

## Mandatory PR Quality Gates

1. Successful passing of `.github/workflows/deploy-check.yml`.
2. Developer Certificate of Origin (DCO) `Signed-off-by` commit check.
3. Codeowner approval for sensitive `/api/middleware/guardrails.py` changes.
