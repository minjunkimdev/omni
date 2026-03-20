# OMNI CLI Reference

OMNI provides a unified Command Line Interface (CLI) to act as your semantic core. The CLI allows you to proxy commands, monitor savings, analyze context density, and generate MCP server integrations.

## Core Commands

### `omni -- <command>` (Agent Autopilot Alias)
The primary way to use OMNI. Appending `omni --` before any terminal command pipes its standard output and errors through OMNI's semantic distillation engine.

```bash
omni -- npm install
omni -- docker build .
omni -- git diff
```
*Effect:* OMNI intercepts the stdout, strips out noise and redundant formatting, and outputs a highly dense "pure signal". This saves 30-90% of token usage for AI agents without losing intent.

### `omni distill`
The underlying operation called by the `omni --` alias. It takes data through `stdin` and outputs distilled context to `stdout`.

```bash
cat raw_logs.txt | omni distill > clean_logs.txt
```

---

## Diagnostics & Management

### `omni monitor`
The unified dashboard for system status, displaying performance metrics spanning back through your usage history. It uses a borderless layout, braille sparklines, and hexagon indicators for maximum readability.

```bash
omni monitor
```
*Shows:* Total commands processed, input vs. saved bytes, global efficiency percentage (e.g. 99%), detailed specific filter performance, and a breakdown of savings per AI Agent.

**Monitor Flags:**
- `omni monitor --trend`: Outputs an ASCII graph (using braille `⣿`) showing your daily context savings trend.
- `omni monitor --log`: Timeline of your most recent tool calls and actual percentage reduction locally.
- `omni monitor --by day`: Tabular breakdown of saved token margins aggregated daily.
- `omni monitor --by week`: Tabular breakdown aggregated weekly.
- `omni monitor --by month`: Tabular breakdown aggregated monthly.
- `omni monitor --json`: Outputs raw telemetry data for piping into observability tools.

### `omni monitor scan`
This subcommand actively scans your `.bash_history` and `.zsh_history`. It searches for terminal habits (like `git log`, `npm install`, `docker stats`) that output high noise, and flags them as missed savings opportunities.

```bash
omni monitor scan
```
*Shows:* A list of 10 recent commands that were executed raw but should be piped into `| omni` for ~60%+ reduction.

### `omni density`
Analyzes raw text to measure its initial token weight, then processes it, and reports the resulting "Information per Token" metadata.

```bash
omni density < large_file.json
```
*Output:* Calculates the exact Context Density Gain (e.g., "4.5x improvement").

### `omni bench [iterations]`
A high-speed macro benchmark for testing semantic throughput under synthetic payload. It tests the engine's capability simulating hundreds of rapid agent requests.

```bash
omni bench 1000
```

---

## Setup & Integrations

### `omni generate <platform>`
Automatically configures OMNI into the MCP (Model Context Protocol) context of popular agentic platforms.

```bash
# Auto-configure for Google Antigravity
omni generate antigravity

# Auto-configure for Claude Code / Claude CLI
omni generate claude-code
```

### `omni setup`
An interactive configuration guide that walks you through optimal OMNI usage, setting shell aliases (e.g., alias `npm`="omni -- npm"), and installing MCP plugins.

### `omni_trust` (MCP Tool)
An MCP tool to review and trust a project's local `omni_config.json`. OMNI will not load project-local configs until explicitly trusted. The tool displays the config contents and SHA-256 hash, then registers the project in `~/.omni/trusted-projects.json`. Re-run after modifying the local config for changes to take effect.

### `omni_trust_hooks` (MCP Tool)
An MCP tool to verify and store SHA-256 hashes of hook scripts in `~/.omni/hooks/`. Run this after you manually inspect and approve new or modified hooks.

### `--test-integrity` (Flag)
A startup flag for the MCP server (`node dist/index.js --test-integrity`) that performs a one-time verification of hook scripts and exits with 0 on success, or 1 on mismatch.

### `omni update`
Connects to GitHub releases to fetch binary updates. Replaces your local binary with the requested version.

### `omni uninstall`
Removes the OMNI binary, deletes `~/.omni`, and unwires any injected MCP integrations safely.
