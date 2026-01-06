# Multi-Agent Team Orchestrator

Launch a team of Claude Code agents in tmux to work on your project in parallel.

## Overview

This orchestration system:
- **Reads** your project's `WORKPLAN.md` and `CLAUDE.md`
- **Analyzes** which agents are needed (dynamic, not fixed count)
- **Creates** a tmux session with a pane for each agent
- **Launches** Claude Code agents with appropriate context
- **Displays** real-time activity from all agents

## Quick Start

```bash
# From this directory
./bin/agent-team /path/to/your/project

# Or with explicit agent directory
./bin/agent-team /path/to/project --agent-dir ~/custom-agents

# Dry run (see what would happen without launching)
./orchestrator.py /path/to/project --no-attach
```

## Prerequisites

- **tmux**: `sudo apt install tmux` (or `brew install tmux`)
- **Python 3**: Version 3.8+
- **Claude Code CLI**: Installed and configured
- **Agent specifications**: Either in this directory or `~/.claude/agents/`

## How It Works

### 1. Project Structure

Your project should have:

```
your-project/
├── WORKPLAN.md          # Task breakdown with @agent sections
├── CLAUDE.md            # Project context and coordination rules
└── [your code]
```

### 2. WORKPLAN.md Format

Define tasks for each agent:

```markdown
## @frontend-architect Tasks

### Phase 1: Setup
- [ ] Initialize React project
- [ ] Set up routing
- [ ] Configure Tailwind

### Phase 2: Features
- [ ] Build dashboard
- [ ] Create login page

## @backend-architect Tasks

### Phase 1: Setup
- [ ] Initialize Express API
- [ ] Set up database
...
```

### 3. Agent Discovery

The orchestrator loads agents from:

1. **`~/.claude/agents/`** (priority - your custom agents)
2. **This directory** (bundled agent specs)

Available bundled agents:
- `frontend-architect` - React, Vue, Svelte, UI/UX
- `backend-architect` - APIs, databases, auth
- `devops-engineer` - Docker, K8s, CI/CD
- `test-architect` - Unit tests, mocking, TDD
- `qa-engineer` - E2E tests, integration tests
- `security-auditor` - Security review, vulnerabilities
- `database-architect` - Schema design, optimization
- `api-designer` - OpenAPI, GraphQL specs
- `documentation-writer` - READMEs, guides

Your custom agents (from `~/.claude/agents/`):
- `code-nitpicker-9000` - Code quality review
- `frontend-qa-enforcer` - Frontend QA and acceptance testing

### 4. Tmux Layouts

The system creates intelligent layouts based on agent count:

- **1 agent**: Full window
- **2 agents**: Horizontal split
- **3-4 agents**: 2×2 grid
- **5-6 agents**: 2×3 grid
- **7+ agents**: Dynamic tiling

## Usage Examples

### Example 1: Full-Stack Project

```bash
cd agent-team
./bin/agent-team ~/projects/my-saas-app
```

If `my-saas-app/WORKPLAN.md` has:
- `@frontend-architect` tasks
- `@backend-architect` tasks
- `@devops-engineer` tasks

Result: 3 tmux panes, one agent per pane

### Example 2: Frontend-Only Project

```bash
./bin/agent-team ~/projects/react-dashboard
```

If only frontend code detected:
Result: 1 pane with `frontend-architect`

### Example 3: No WORKPLAN.md

```bash
./bin/agent-team ~/projects/legacy-app
```

The system analyzes directory structure:
- Has `frontend/` and `backend/` → spawns both agents
- Has `Dockerfile` → adds devops-engineer
- Has `tests/` → adds test-architect

## Tmux Commands

Once running, useful tmux shortcuts:

- **Detach**: `Ctrl+B` then `D` (keep agents running in background)
- **Reattach**: `tmux attach-session -t agent-team`
- **Navigate panes**: `Ctrl+B` then arrow keys
- **Zoom pane**: `Ctrl+B` then `Z` (toggle fullscreen)
- **Kill session**: `tmux kill-session -t agent-team`

## Architecture

```
orchestrator.py           # Main entry point
├── lib/
│   ├── spec_parser.py   # Parse WORKPLAN.md & CLAUDE.md
│   ├── task_analyzer.py # Determine which agents to spawn
│   ├── tmux_manager.py  # Create tmux layouts
│   └── agent_spawner.py # Launch Claude Code agents
├── bin/
│   └── agent-team       # CLI wrapper script
└── examples/
    └── sample-project/  # Example WORKPLAN.md
```

## Advanced Usage

### Custom Agent Directory

```bash
./bin/agent-team ~/project --agent-dir ~/my-custom-agents
```

### Test with Sample Project

```bash
./bin/agent-team examples/sample-project
```

This will spawn 5+ agents for the sample SaaS project.

### Manual Agent Selection

Edit `WORKPLAN.md` to add/remove `@agent-name` sections.

## Monitoring

Each tmux pane shows:
- Agent name in the pane title
- Real-time output from Claude Code
- Progress as the agent works

You can:
- Watch all agents simultaneously
- Focus on one by zooming its pane
- Detach and let them work in background

## Troubleshooting

**Error: "tmux not found"**
```bash
sudo apt install tmux  # Ubuntu/Debian
brew install tmux      # macOS
```

**Error: "claude not found"**
- Install Claude Code CLI from: https://github.com/anthropics/claude-code

**Error: "No agents found"**
- Make sure agent `.md` files exist in this directory or `~/.claude/agents/`
- Check file permissions

**Agents not working as expected**
- Ensure `WORKPLAN.md` has clear `@agent-name` sections
- Check that task descriptions are clear
- Make sure shared types/contracts are defined first

## Creating Custom Agents

Add a new agent to `~/.claude/agents/my-agent.md`:

```markdown
---
name: my-agent
description: What this agent does
tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
permissionMode: bypassPermissions
---

# My Custom Agent

Instructions for the agent...
```

Then reference it in `WORKPLAN.md`:

```markdown
## @my-agent Tasks
- [ ] Task 1
- [ ] Task 2
```

## Best Practices

1. **Define shared types first** in `docs/contracts/` or `shared/types/`
2. **Keep agents focused** - each works in its domain
3. **Clear task descriptions** - be specific in WORKPLAN.md
4. **Monitor progress** - watch the tmux panes periodically
5. **Coordinate carefully** - use CLAUDE.md for coordination rules

## Examples

See `examples/sample-project/` for a complete example with:
- WORKPLAN.md with 6 agents
- CLAUDE.md with project context
- Shared type definitions
- Phase-based task breakdown

## Contributing

To add bundled agents:
1. Create `agent-name.md` in this directory
2. Follow the agent spec format
3. Test with `python3 lib/agent_spawner.py`

## License

MIT
