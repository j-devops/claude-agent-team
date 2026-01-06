# 🚀 Multi-Agent Team Orchestrator - START HERE

## What This Is

A **tmux-based orchestration system** that launches multiple Claude Code agents to work on your project simultaneously. Each agent appears in its own tmux pane, and you can watch them all work in real-time.

## Quick Demo (30 seconds)

```bash
cd /home/jason/Desktop/adcl/agent-team
./RUN_ME_FIRST.sh
```

This launches 6 agents working on a sample SaaS project in tmux.

## The Basics

### 1. How Many Agents?

**Dynamic!** Not fixed to 4. The system analyzes your WORKPLAN.md and spawns exactly what you need:

- 1 agent in WORKPLAN → 1 tmux pane
- 3 agents in WORKPLAN → 3 panes (2×2 grid)
- 6 agents in WORKPLAN → 6 panes (2×3 grid)
- 10 agents in WORKPLAN → 10 panes (tiled layout)

### 2. Which Agents?

**Your choice!** The system uses:

**Priority 1**: Your custom agents from `~/.claude/agents/`
- ✅ code-nitpicker-9000
- ✅ frontend-qa-enforcer
- ✅ frontend-architect
- ... any .md files you add

**Priority 2**: Bundled agents from this directory
- frontend-architect, backend-architect, devops-engineer
- test-architect, qa-engineer, security-auditor
- database-architect, api-designer, documentation-writer

### 3. What Does It Need?

**Minimum**: A WORKPLAN.md in your project:

```markdown
## @frontend-architect Tasks
- [ ] Build homepage
- [ ] Create navigation

## @backend-architect Tasks
- [ ] Create API
- [ ] Set up database
```

**Recommended**: Also add CLAUDE.md with project context

## Getting Started

### Option 1: Try the Demo
```bash
./RUN_ME_FIRST.sh
```

### Option 2: Use With Your Project

**Step 1**: Create WORKPLAN.md in your project
```bash
cp WORKPLAN.template.md ~/my-project/WORKPLAN.md
# Edit to list your agents and tasks
```

**Step 2**: Run orchestrator
```bash
./bin/agent-team ~/my-project
```

**Step 3**: Watch agents work in tmux!

## Tmux Survival Guide

Once agents are running:

| Action | Keys |
|--------|------|
| Detach (leave running) | `Ctrl+B` then `D` |
| Reattach | `tmux attach -t agent-team` |
| Navigate panes | `Ctrl+B` then arrows |
| Zoom pane fullscreen | `Ctrl+B` then `Z` |
| Kill everything | `tmux kill-session -t agent-team` |

## File Guide

| File | What It Is |
|------|------------|
| `START_HERE.md` | This file - read first |
| `QUICK_START.md` | 1-minute getting started |
| `ORCHESTRATOR_README.md` | Complete documentation |
| `SYSTEM_OVERVIEW.md` | Architecture and features |
| `examples/DEMO.md` | Interactive demo guide |
| `RUN_ME_FIRST.sh` | Demo launcher script |
| `bin/agent-team` | CLI entry point |
| `orchestrator.py` | Main orchestration logic |
| `lib/` | Core components (parser, spawner, etc.) |

## Example Use Cases

### Full-Stack Development
```bash
# Your WORKPLAN.md has:
# @frontend-architect, @backend-architect,
# @devops-engineer, @test-architect

./bin/agent-team ~/my-saas-app
# Result: 4 agents, 2×2 grid
```

### Frontend-Only Project
```bash
# Your WORKPLAN.md has:
# @frontend-architect, @code-nitpicker-9000

./bin/agent-team ~/my-react-app
# Result: 2 agents, side-by-side
```

### Large Team
```bash
# Your WORKPLAN.md has:
# @frontend-architect, @backend-architect, @database-architect,
# @devops-engineer, @test-architect, @qa-engineer,
# @security-auditor, @api-designer

./bin/agent-team ~/enterprise-app
# Result: 8 agents, tiled layout
```

## How It Works

```
┌─────────────────────────────────────────┐
│  1. Read WORKPLAN.md from your project  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  2. Parse @agent-name sections         │
│     → List of required agents           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  3. Create tmux session                 │
│     → N panes (one per agent)           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  4. Launch Claude Code in each pane     │
│     → With agent spec + task context    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  5. Attach to tmux session              │
│     → Watch all agents work live        │
└─────────────────────────────────────────┘
```

## Advanced Features

### Use Custom Agents
Your agents in `~/.claude/agents/` are automatically detected:
```bash
# If you have ~/.claude/agents/my-specialist.md
# Just reference it in WORKPLAN.md:
## @my-specialist Tasks
- [ ] Custom task
```

### Point at Any Directory
```bash
./bin/agent-team /any/path/to/project
```

### Run Without Auto-Attach
```bash
./bin/agent-team ~/project --no-attach
# Agents run in background
# Attach later with: tmux attach -t agent-team
```

## What You'll See

When you attach to the tmux session:

```
┌──────────────────────┬──────────────────────┬──────────────────────┐
│ === FRONTEND-        │ === BACKEND-         │ === DEVOPS-          │
│ ARCHITECT ===        │ ARCHITECT ===        │ ENGINEER ===         │
│                      │                      │                      │
│ Reading WORKPLAN.md  │ Analyzing project... │ Creating Dockerfile  │
│ Creating components/ │ Setting up Express   │ Writing compose.yml  │
│ ...                  │ ...                  │ ...                  │
├──────────────────────┼──────────────────────┼──────────────────────┤
│ === TEST-ARCHITECT   │ === NITPICKER ===    │ === QA-ENFORCER ===  │
│ ===                  │                      │                      │
│                      │ Checking types...    │ Setting up           │
│ Writing unit tests   │ Reviewing imports    │ Playwright tests     │
│ ...                  │ ...                  │ ...                  │
└──────────────────────┴──────────────────────┴──────────────────────┘
```

Each pane shows real-time output from that agent.

## Prerequisites

- ✅ tmux: `sudo apt install tmux`
- ✅ Python 3.8+
- ✅ Claude Code CLI

## Troubleshooting

**"tmux not found"**
```bash
sudo apt install tmux  # Ubuntu/Debian
brew install tmux      # macOS
```

**"claude not found"**
Install Claude Code CLI first

**"No agents spawn"**
Check that WORKPLAN.md has `@agent-name` sections

## Next Steps

1. ✅ Run demo: `./RUN_ME_FIRST.sh`
2. ✅ Read full docs: `ORCHESTRATOR_README.md`
3. ✅ Try with your project: `./bin/agent-team ~/your-project`
4. ✅ Customize agents: Add to `~/.claude/agents/`

## Files to Read (in order)

1. **This file** (START_HERE.md) ← You are here
2. `QUICK_START.md` - Fast reference
3. `ORCHESTRATOR_README.md` - Complete docs
4. `SYSTEM_OVERVIEW.md` - Architecture deep-dive
5. `examples/DEMO.md` - Interactive demo guide

---

**Ready? Run `./RUN_ME_FIRST.sh` to see it in action!** 🎯
