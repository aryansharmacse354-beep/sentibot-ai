# Contributing Guidelines

Thank you for helping improve SentiBot AI!

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/aryansharmacse354-beep/sentibot-ai.git
   cd sentibot-ai
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run linting & TypeScript typecheck before submitting PRs:
   ```bash
   npm run lint
   npx tsc --noEmit
   ```

## Commit Message Formatting

Please use Conventional Commits:
- `feat: add new voice HUD visualizer`
- `fix: resolve Dexie DB offline sync queue issue`
- `docs: update AGENTS.md entry point`
