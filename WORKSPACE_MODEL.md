# Workspace Model - Zero Cruft in Your Repo

## The Problem (Before)

Running `hal init ~/my-project` would create files IN your project:

```
~/my-project/
├── WORKPLAN.md           ❌ HAL cruft
├── PROGRESS.md           ❌ HAL cruft
├── INTEGRATION_REPORT.md ❌ HAL cruft
├── backend/              ✅ Your code
└── frontend/             ✅ Your code
```

This pollutes your git repo with orchestration files.

## The Solution (Now)

HAL keeps ALL orchestration files in its own directory:

```
agent-team/
└── workspaces/
    └── my-project/
        ├── WORKPLAN.md
        ├── PROGRESS.md
        └── INTEGRATION_REPORT.md

~/my-project/              ✅ 100% clean!
├── backend/
└── frontend/
```

## Usage

### Stay in agent-team Directory

```bash
cd /path/to/agent-team

# All commands run from here
./hal init ~/my-project
./hal start ~/my-project
./hal status
```

### No Installation Required

HAL runs directly from its directory:
- No `./INSTALL.sh` needed
- No adding to PATH
- Just `cd` to agent-team and run `./hal`

### Commands

```bash
# Initialize workspace
./hal init ~/my-project
# Creates: workspaces/my-project/WORKPLAN.md

# Edit workplan
vim workspaces/my-project/WORKPLAN.md

# Start agents
./hal start ~/my-project
# Agents work in ~/my-project/, read/write to workspaces/my-project/

# Check status
./hal status
# Reads: workspaces/my-project/PROGRESS.md

# View results
cat workspaces/my-project/INTEGRATION_REPORT.md
```

## File Locations

| File Type | Location | Purpose |
|-----------|----------|---------|
| Agent specs (`*.md`) | `agent-team/` | Agent definitions |
| Workplans | `agent-team/workspaces/PROJECT/` | What to build |
| Progress | `agent-team/workspaces/PROJECT/` | Agent status |
| Reports | `agent-team/workspaces/PROJECT/` | Integration results |
| **Your code** | `~/your-project/` | **Stays clean!** |

## Agent Execution

When you run `./hal start ~/my-project`:

1. Agents `cd` into `~/my-project/` (where your code lives)
2. Agents read WORKPLAN.md from `workspaces/my-project/`
3. Agents modify files in `~/my-project/backend/`, `frontend/`, etc.
4. Agents write PROGRESS.md to `workspaces/my-project/`

**Result**: Code changes in your project, orchestration files in agent-team.

## Multiple Projects

Each project gets its own workspace:

```
agent-team/workspaces/
├── ecommerce-app/
│   └── WORKPLAN.md
├── customer-portal/
│   └── WORKPLAN.md
└── analytics-dashboard/
    └── WORKPLAN.md
```

Projects are separate:

```bash
./hal start ~/projects/ecommerce-app      # Works on ecommerce
./hal stop
./hal start ~/work/customer-portal        # Switch to customer portal
```

## Git Ignore

`workspaces/` is gitignored in agent-team repo.

Your workspaces are local to your machine. Each developer has their own workspaces.

## Benefits

1. **Zero repo pollution** - Your project stays pristine
2. **Centralized management** - All orchestration in one place
3. **Easy cleanup** - Delete workspace, project untouched
4. **Clear separation** - System vs. project files
5. **Simple model** - Stay in agent-team, point at projects

## Example Workflow

```bash
# Day 1: New feature
cd ~/agent-team
./hal init ~/projects/my-app
vim workspaces/my-app/WORKPLAN.md    # Define "user authentication"
./hal start ~/projects/my-app
# ... agents work ...
./hal stop

# Day 2: Different feature, same project
vim workspaces/my-app/WORKPLAN.md    # Update to "add payments"
./hal start ~/projects/my-app
# ... agents work ...

# Day 3: Different project
./hal init ~/work/other-app
vim workspaces/other-app/WORKPLAN.md
./hal start ~/work/other-app
```

## Migration from Old Model

If you have WORKPLAN.md in your project from old usage:

```bash
# Move to workspace
mv ~/my-project/WORKPLAN.md agent-team/workspaces/my-project/

# Clean up your project
rm ~/my-project/PROGRESS.md
rm ~/my-project/INTEGRATION_REPORT.md

# Add to .gitignore (if they were committed)
echo "WORKPLAN.md" >> ~/my-project/.gitignore
echo "PROGRESS.md" >> ~/my-project/.gitignore
echo "INTEGRATION_REPORT.md" >> ~/my-project/.gitignore
```

## Summary

**Old**: HAL files mixed with your project
**New**: HAL files in agent-team/workspaces/, project stays clean

**Usage**: Stay in agent-team, run `./hal <command> <project-path>`
