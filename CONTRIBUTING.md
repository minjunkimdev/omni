# Contributing to OMNI

We love your contributions! OMNI is built on a mission to make context usage as efficient as possible. Here’s how you can help:

## Getting Started

1. **Fork the repo** and clone it locally.
2. **Install dependencies**:
   - Zig 0.15.2 (Critical for the core engine)
   - Node.js 18+ (For the MCP gateway)
3. **Explore the codebase**:
   - `core/src/filters/`: Join the mission by adding specialized semantic filters.
   - `src/`: Refine the MCP server or caching logic.

## Contribution Workflow

1. **Bug Reports & Feature Requests**: Open an issue describing the context and the problem/idea.
2. **Pull Requests**:
   - Fork and Clone the repository locally.
   - Create a fresh branch from `main`.
   - Run `make clean` to ensure a fresh environment.
   - Run `make verify` to ensure system integrity and version consistency.

## Development Core

Before modifying the core, please read:
- [DEVELOPMENT.md](docs/DEVELOPMENT.md)
- [ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [ROADMAP.md](docs/ROADMAP.md)

## Code of Conduct

Be kind, respect the semantic integrity of the project, and help us build the most efficient engine for the AI era.

Thank you for contributing! 
