# Workspaces Directory

This directory contains orchestration files for each project you manage with HAL.

## Structure

```
workspaces/
├── my-saas-app/
│   ├── WORKPLAN.md          # What agents should build
│   ├── PROGRESS.md          # Created by agents during execution
│   └── INTEGRATION_REPORT.md # Created by delivery-lead
├── customer-portal/
│   ├── WORKPLAN.md
│   └── ...
└── another-project/
    └── ...
```

## Why Separate Workspaces?

Your actual project directories stay **100% clean** - no HAL cruft in your repos.

```
~/projects/my-saas-app/          # Your actual project
├── backend/                     # Pure project code
├── frontend/                    # No WORKPLAN.md here!
└── .git/                        # Clean git history
```

Orchestration files live here instead:

```
agent-team/workspaces/my-saas-app/
├── WORKPLAN.md                  # What to build
├── PROGRESS.md                  # Agent status
└── INTEGRATION_REPORT.md        # How to test
```

## How It Works

1. **Create workspace**:
   ```bash
   cd /path/to/agent-team
   ./hal init ~/projects/my-saas-app
   ```
   Creates: `workspaces/my-saas-app/WORKPLAN.md`

2. **Edit workplan**:
   ```bash
   vim workspaces/my-saas-app/WORKPLAN.md
   ```

3. **Start agents**:
   ```bash
   ./hal start ~/projects/my-saas-app
   ```
   - Agents read from: `workspaces/my-saas-app/`
   - Agents execute in: `~/projects/my-saas-app/`
   - Agents modify code in: `~/projects/my-saas-app/`

4. **Check progress**:
   ```bash
   ./hal status
   # or
   cat workspaces/my-saas-app/PROGRESS.md
   ```

## Git Ignore

This directory is gitignored (except this README and .gitignore).

Your workspaces are local to your machine. If you want to share workplans with your team, commit them to your actual project repo as needed.

## Workspace Naming

Workspaces are named after the project directory name:
- `/home/user/projects/my-app` → `workspaces/my-app/`
- `/home/user/work/acme-crm` → `workspaces/acme-crm/`

If you have multiple projects with the same name in different locations, the workspace will be shared (usually fine).
