# Directory Model - How HAL Works with Your Project

## Visual Overview

```
┌─────────────────────────────────────────────────────────────┐
│ SYSTEM INSTALL (once)                                       │
│ /home/jason/Desktop/adcl/agent-team/                        │
│                                                              │
│ ├── bin/hal                    ← CLI tool                   │
│ ├── lib/                       ← Python orchestration       │
│ ├── backend-architect.md       ← Agent specs                │
│ ├── frontend-architect.md                                   │
│ ├── delivery-lead.md                                        │
│ ├── CLAUDE.md                  ← System orchestration rules │
│ │                                                            │
│ └── workspaces/                ← Orchestration files        │
│     ├── my-saas-app/                                        │
│     │   ├── WORKPLAN.md        ← What to build             │
│     │   ├── PROGRESS.md        ← Agent status               │
│     │   └── INTEGRATION_REPORT.md                           │
│     └── customer-portal/                                    │
│         └── WORKPLAN.md                                     │
│                                                              │
│ ⚠️  You NEVER leave this directory when using HAL           │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HAL reads agent specs from here
                            ↓
                    ┌───────────────┐
                    │   hal start   │
                    │  ~/my-project │
                    └───────────────┘
                            │
                            │ Spawns agents with cd ~/my-project
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ YOUR PROJECT (stays 100% clean!)                            │
│ /home/user/projects/my-project/                             │
│                                                              │
│ ├── backend/                  ← Modified by agents          │
│ │   ├── src/                                                │
│ │   ├── package.json                                        │
│ │   └── ...                                                 │
│ │                                                            │
│ ├── frontend/                 ← Modified by agents          │
│ │   ├── src/                                                │
│ │   ├── package.json                                        │
│ │   └── ...                                                 │
│ │                                                            │
│ ├── shared/types/             ← Modified by agents          │
│ └── .git/                     ← No HAL cruft!               │
│                                                              │
│ ✅ Agents execute HERE and modify YOUR code                 │
│ ⚠️  NO orchestration files pollute your repo                │
└─────────────────────────────────────────────────────────────┘
```

## Command Flow

```
$ cd /path/to/agent-team
$ ./hal start ~/my-project

1. HAL binary executes
   Location: agent-team/bin/hal

2. HAL checks workspace exists
   Looking for: agent-team/workspaces/my-project/WORKPLAN.md
   (If not found: "Run: hal init ~/my-project")

3. HAL reads agent specs
   From: agent-team/backend-architect.md
         agent-team/frontend-architect.md
         etc.

4. HAL reads workplan
   From: agent-team/workspaces/my-project/WORKPLAN.md

5. HAL creates tmux session with:
   - Working directory: ~/my-project (where code lives)
   - Each pane runs: cd ~/my-project && claude --agent ...

6. Agents execute in ~/my-project
   - Read: agent-team/workspaces/my-project/WORKPLAN.md
   - Read: agent-team/workspaces/my-project/CLAUDE.md (if exists)
   - Modify code in: ~/my-project/backend/*, frontend/*, etc.
   - Write: agent-team/workspaces/my-project/PROGRESS.md

7. Results:
   - Code changes: ~/my-project/ (your repo)
   - Orchestration files: agent-team/workspaces/my-project/
```

## Analogy: Git

HAL works like `git`:

| Git | HAL |
|-----|-----|
| Git installed in `/usr/bin/git` | HAL installed in `agent-team/bin/hal` |
| Git config in `~/.gitconfig` | Agent specs in `agent-team/*.md` |
| Each project has `.git/` directory | Each project has `WORKPLAN.md` |
| `git` works in any project directory | `hal start` works in any project directory |
| Git modifies files in project | Agents modify files in project |
| You don't copy git to each project | You don't copy HAL to each project |

## Multiple Projects Example

```bash
# Terminal 1: Working on Project A
cd ~/projects/ecommerce-app
hal init .                          # Creates WORKPLAN.md here
vim WORKPLAN.md                     # Add "shopping cart" feature
hal start .                         # Agents work in ~/projects/ecommerce-app
# ... agents running ...
cat INTEGRATION_REPORT.md          # Results in this project

# Stop agents
hal stop

# Terminal 2: Different day, different project
cd ~/work/customer-portal
hal init .                          # Creates WORKPLAN.md here
vim WORKPLAN.md                     # Add "user dashboard" feature
hal start .                         # Agents work in ~/work/customer-portal
# ... agents running ...
cat INTEGRATION_REPORT.md          # Results in this project
```

## What Goes Where

### In `agent-team/` (install once, never touch)

```
agent-team/
├── bin/hal                    # CLI tool
├── lib/                       # Orchestration Python code
├── *.md                       # Agent specifications
├── CLAUDE.md                  # System orchestration rules
├── WORKPLAN.template.md       # Template to copy
└── docs/                      # Documentation
```

**You install this once and it stays there.**

### In `~/your-project/` (your actual work)

```
your-project/
├── WORKPLAN.md                # Copied from template, customized
├── CLAUDE.md                  # Optional project-specific context
├── PROGRESS.md                # Created during execution
├── INTEGRATION_REPORT.md      # Created by delivery-lead
├── backend/                   # Your code (modified by agents)
├── frontend/                  # Your code (modified by agents)
└── ... rest of your project
```

**This is where actual development happens.**

## Common Questions

### Q: Do I copy agent-team to each project?
**A: No!** HAL is installed once globally and works with any project.

### Q: Where do agents write code?
**A: In YOUR project directory**, wherever you run `hal start`.

### Q: Can I modify agent specs for my project?
**A: Yes, two ways:**
1. Create project-specific `CLAUDE.md` with additional rules
2. Edit agent specs in `agent-team/` (affects all projects)

### Q: Where is PROGRESS.md created?
**A: In your project directory**, not in agent-team.

### Q: Can I run multiple projects simultaneously?
**A: Not yet.** Currently limited to one tmux session ("agent-team") at a time.

### Q: How do agents know what to build?
**A: They read `WORKPLAN.md` from your project directory.**

### Q: Do I need CLAUDE.md in my project?
**A: Optional.** Useful for project-specific architecture rules.

## Real-World Example

```bash
# Day 1: Install HAL (once)
cd ~/Downloads/agent-team
./INSTALL.sh
# HAL is now in PATH, available everywhere

# Day 2: Work on existing project
cd ~/work/acme-crm
hal init .
vim WORKPLAN.md                     # Add: "Build customer search feature"
hal start .
# ... agents work for 20 minutes ...
cat INTEGRATION_REPORT.md
# Feature done!
hal stop

# Day 3: Different project
cd ~/projects/my-blog
hal init .
vim WORKPLAN.md                     # Add: "Add comment system"
hal start .
# ... agents work ...
cat INTEGRATION_REPORT.md
hal stop

# Day 4: Back to acme-crm
cd ~/work/acme-crm
vim WORKPLAN.md                     # Add: "Build reporting dashboard"
hal start .
# Same project, new feature
```

## Summary

- **agent-team/** = System (like `/usr/bin/docker`)
- **your-project/** = Your work (like `~/myapp`)
- HAL bridges them: Reads specs from agent-team, executes in your-project
- Agents work IN your project, modifying YOUR files
- You install agent-team once, use it forever across all projects
