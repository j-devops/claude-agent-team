# Agent Team Architecture

## Directory Structure

The agent team system has **two separate directories**:

### 1. Agent Team Directory (Install Once)

Location: `/home/jason/Desktop/adcl/agent-team/` (or wherever you install it)

```
agent-team/                          # System installation directory
├── bin/
│   └── hal                          # CLI tool (in your PATH)
├── lib/                             # Python orchestration code
│   ├── orchestrator.py
│   ├── tmux_manager.py
│   ├── agent_spawner.py
│   └── ...
├── *.md                             # Agent specifications
│   ├── backend-architect.md
│   ├── frontend-architect.md
│   ├── delivery-lead.md
│   └── ...
├── CLAUDE.md                        # System orchestration rules
├── WORKPLAN.template.md             # Template for projects
└── HAL.md                           # Documentation
```

**Purpose**: Contains the HAL CLI, orchestration system, and agent specifications.

**You install this once globally** and never touch it when working on projects.

---

### 2. Your Project Directory (Where Work Happens)

Location: Anywhere you have a project (e.g., `/home/user/projects/my-app/`)

```
my-app/                              # Your actual project
├── WORKPLAN.md                      # What agents should build
├── CLAUDE.md                        # (Optional) Project-specific rules
├── PROGRESS.md                      # Created by agents
├── INTEGRATION_REPORT.md            # Created by delivery-lead
├── backend/                         # Your backend code
├── frontend/                        # Your frontend code
└── ... your actual project files
```

**Purpose**: Your actual project where agents do their work.

**This is where agents execute** - they cd into this directory and modify these files.

---

## How HAL Connects Them

When you run:

```bash
hal start /home/user/projects/my-app
```

**What happens**:

1. HAL reads agent specs from `agent-team/` directory
2. HAL reads `WORKPLAN.md` from `/home/user/projects/my-app/`
3. HAL spawns agents via tmux
4. **Each agent `cd`s into `/home/user/projects/my-app/`**
5. Agents read `my-app/WORKPLAN.md` and `my-app/CLAUDE.md`
6. **Agents modify files in `/home/user/projects/my-app/`**
7. **NOT** in `agent-team/` directory

---

## Agent Execution Flow

```
User runs: hal start ~/my-app
           ↓
    HAL (in agent-team/)
           ↓
    Reads agent specs from agent-team/*.md
           ↓
    Creates tmux session with project_dir=~/my-app
           ↓
    Spawns agents with: cd ~/my-app && claude --agent ...
           ↓
    Agent runs IN ~/my-app directory
           ↓
    Agent reads ~/my-app/WORKPLAN.md
    Agent reads ~/my-app/CLAUDE.md (if exists)
           ↓
    Agent modifies files in ~/my-app/
           ↓
    Agent writes ~/my-app/PROGRESS.md
```

---

## Key Points

### ✅ Correct Understanding

- **agent-team/** is like `/usr/bin` - system tools live here
- **your-project/** is like `~/myproject` - your work lives here
- HAL is installed globally, runs anywhere
- Agents execute in YOUR project directory

### ❌ Common Misconceptions

- ❌ Agents don't work in the agent-team directory
- ❌ You don't copy agents to each project
- ❌ WORKPLAN.md doesn't go in agent-team directory
- ❌ PROGRESS.md isn't created in agent-team directory

---

## File Locations Reference

| File | Location | Purpose |
|------|----------|---------|
| `hal` | `agent-team/bin/hal` | CLI tool (in PATH) |
| Agent specs (`.md`) | `agent-team/*.md` | Agent definitions (read-only) |
| System `CLAUDE.md` | `agent-team/CLAUDE.md` | Orchestration rules (read-only) |
| `WORKPLAN.template.md` | `agent-team/WORKPLAN.template.md` | Template (copy to projects) |
| **Your** `WORKPLAN.md` | `your-project/WORKPLAN.md` | What to build (you write this) |
| **Your** `CLAUDE.md` | `your-project/CLAUDE.md` | Optional project context |
| `PROGRESS.md` | `your-project/PROGRESS.md` | Agent progress (agents write) |
| `INTEGRATION_REPORT.md` | `your-project/INTEGRATION_REPORT.md` | Test instructions (delivery-lead writes) |
| Your code | `your-project/**/*` | Actual project files (agents modify) |

---

## Example Workflow

### Setup (Once)

```bash
# Install HAL globally
cd /home/jason/Desktop/adcl/agent-team
./INSTALL.sh

# HAL is now available everywhere
```

### Project Work (Repeatable)

```bash
# Working on project A
cd ~/projects/project-a
hal init .                    # Creates ./WORKPLAN.md from template
vim WORKPLAN.md               # Define feature to build
hal start .                   # Agents work in ~/projects/project-a

# Later, working on project B
cd ~/projects/project-b
hal init .
vim WORKPLAN.md
hal start .                   # Agents work in ~/projects/project-b

# HAL always works in the directory you specify
```

---

## Project-Specific CLAUDE.md (Optional)

You can add a `CLAUDE.md` to your project for project-specific context:

```bash
# your-project/CLAUDE.md
# My SaaS App

## Tech Stack
- Backend: FastAPI + PostgreSQL
- Frontend: Next.js + TypeScript

## Architecture Rules
- All API routes must use async/await
- Frontend components must be server components by default
- Use Prisma for database access

## Constraints
- Must support multi-tenancy
- All queries must have tenant_id filter
```

Agents will read this for project-specific context.

---

## Multiple Projects

You can manage multiple projects independently:

```bash
# Project A
hal start ~/projects/project-a     # Agents work in project-a

# (In another terminal) Project B
hal start ~/projects/project-b     # Would fail - only one team at a time

# Stop project A first
hal stop

# Then start project B
hal start ~/projects/project-b     # Now works
```

**Note**: Currently only one agent team can run at a time (single tmux session named "agent-team").

---

## Summary

**Think of it like Docker**:

- Docker CLI installed once globally → HAL installed once globally
- Dockerfile in each project → WORKPLAN.md in each project
- `docker run` works in any project → `hal start` works in any project
- Containers modify project files → Agents modify project files

**Not like**:
- ❌ Copying docker to each project
- ❌ Running docker inside docker
- ❌ Container files living in docker installation directory
