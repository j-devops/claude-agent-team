# HAL - Multi-Agent Team Manager

**HAL** is a command-line interface for managing Claude Code agent teams. It provides a simple, Linux-like interface for starting, stopping, and monitoring agent teams.

## How It Works

HAL is installed **once globally**, then works with **any project**:

- **`agent-team/`** - System directory (installed once, like `/usr/bin`)
  - Contains HAL CLI, agent specs, orchestration code
  - You never modify this when working on projects

- **`~/your-project/`** - Your actual project (anywhere on your system)
  - Your code, WORKPLAN.md, CLAUDE.md live here
  - **Agents execute here** and modify YOUR files

When you run `hal start ~/your-project`:
1. HAL reads agent specs from `agent-team/`
2. HAL reads `WORKPLAN.md` from `~/your-project/`
3. Agents spawn and **cd into `~/your-project/`**
4. Agents work on YOUR project files
5. Results written to `~/your-project/PROGRESS.md`, etc.

## Installation

### Quick Setup

```bash
# 1. Add bin directory to PATH
echo 'export PATH="$PATH:/home/jason/Desktop/adcl/agent-team/bin"' >> ~/.bashrc
source ~/.bashrc

# 2. Verify installation
hal --version
```

### System Link (Alternative)

```bash
# Create symlink in /usr/local/bin
sudo ln -s /home/jason/Desktop/adcl/agent-team/bin/hal /usr/local/bin/hal

# Verify
hal --version
```

## Quick Start

```bash
# 1. Create a new project workplan
hal init ~/my-project

# 2. Edit the workplan
vim ~/my-project/WORKPLAN.md

# 3. Start the agent team
hal start ~/my-project

# 4. Check status
hal status

# 5. Stop when done
hal stop
```

## Commands

### `hal start <project>`

Start an agent team for a project.

```bash
hal start ~/my-project              # Start and auto-attach to tmux
hal start ~/my-project --no-attach  # Start in background
```

**What it does**:
- Reads `WORKPLAN.md` in the project directory
- Launches agents in tmux panes
- Each agent works on their section
- Creates `PROGRESS.md` to track status

**Requirements**:
- Project must have `WORKPLAN.md`
- tmux must be installed

---

### `hal stop`

Stop the currently running agent team gracefully.

```bash
hal stop
```

**What it does**:
- Sends termination signal to all agents
- Kills tmux session
- Agents get chance to finish current task

---

### `hal kill`

Force kill the agent team immediately.

```bash
hal kill
```

**What it does**:
- Force kills tmux session
- No graceful shutdown
- Use when `hal stop` hangs

---

### `hal status`

Show the status of the running agent team.

```bash
hal status
```

**Output**:
- Whether team is running
- Contents of `PROGRESS.md`
- List of active panes
- Project directory

**Example output**:
```
Status: Agent team running (session: agent-team)

Progress: /home/user/my-project/PROGRESS.md
------------------------------------------------------------
## Phase 1: Development
- [x] @backend-architect - COMPLETE (2024-01-06 14:23)
- [x] @frontend-architect - COMPLETE (2024-01-06 14:25)
- [in_progress] @delivery-lead - Installing dependencies

Panes:
0: claude (80x24)
1: claude (80x24)
2: claude (80x24)
```

---

### `hal list`

List all tmux sessions (not just agent-team).

```bash
hal list
```

**Output**:
```
Tmux sessions:
agent-team: 1 windows (created Mon Jan  6 14:20:00 2026)
my-other-session: 1 windows (created Mon Jan  6 10:00:00 2026)
```

---

### `hal attach`

Attach to the running agent team tmux session.

```bash
hal attach
```

**What it does**:
- Connects to the tmux session
- Shows all agent panes
- You can watch agents work in real-time

**Tmux shortcuts**:
- `Ctrl+B` then `D` - Detach (agents keep running)
- `Ctrl+B` then arrow keys - Navigate panes
- `Ctrl+B` then `Z` - Zoom current pane

---

### `hal logs [agent]`

Show logs for specific agent or all agents.

```bash
hal logs                    # All agents (not yet implemented)
hal logs backend-architect  # Specific agent (not yet implemented)
```

**Note**: Currently use `hal attach` to view agent output.

---

### `hal init <project>`

Initialize a project with the WORKPLAN template.

```bash
hal init ~/my-new-project
```

**What it does**:
- Copies `WORKPLAN.template.md` to project as `WORKPLAN.md`
- Prompts before overwriting existing file
- Shows next steps

**Example**:
```bash
$ hal init ~/my-saas-app
Created: /home/user/my-saas-app/WORKPLAN.md

Next steps:
1. Edit WORKPLAN.md to define your project tasks
2. Run: hal start /home/user/my-saas-app
```

---

### `hal validate [project]`

Validate a project's WORKPLAN.md.

```bash
hal validate ~/my-project  # Validate specific project
hal validate               # Validate current directory
```

**What it checks**:
- File exists
- Has Phase 1 section
- Has Phase 2 section (warning if missing)
- Has @delivery-lead tasks (warning if missing)
- Has at least one agent section

**Example output**:
```bash
$ hal validate ~/my-project
Validating: /home/user/my-project/WORKPLAN.md

⚠️  Warnings:
  - No @delivery-lead tasks defined (integration may not happen)

✅ WORKPLAN.md looks good!
   Found 5 agent sections
```

---

### `hal agents`

List all available agents and their descriptions.

```bash
hal agents
```

**Output**:
```
Available agents:

  @backend-architect         Backend specialist for APIs, databases...
  @frontend-architect        Frontend specialist for React, Vue...
  @delivery-lead             Integration, deployment, and verification
  @devops-engineer           Infrastructure, CI/CD, deployment...
  ...

Use these in WORKPLAN.md as section headers (e.g., '## @backend-architect Tasks')
```

---

## Common Workflows

### Starting a New Project

```bash
# 1. Initialize workplan
hal init ~/my-new-project

# 2. Customize workplan
vim ~/my-new-project/WORKPLAN.md

# 3. Validate it
hal validate ~/my-new-project

# 4. Start agents
hal start ~/my-new-project

# 5. Detach and do other work
# (Press Ctrl+B then D in tmux)

# 6. Check status later
hal status

# 7. Attach to watch
hal attach

# 8. When complete, stop
hal stop
```

### Adding a Feature to Existing Project

```bash
# 1. Edit existing WORKPLAN.md
vim ~/my-project/WORKPLAN.md

# 2. Add new tasks under agent sections

# 3. Validate
hal validate ~/my-project

# 4. Start agents
hal start ~/my-project
```

### Debugging Integration Issues

```bash
# 1. Start agents
hal start ~/my-project

# 2. Attach and watch
hal attach

# 3. If something goes wrong, check status
# (Ctrl+B then D to detach first)
hal status

# 4. Read integration report
cat ~/my-project/INTEGRATION_REPORT.md

# 5. If broken, kill and restart
hal kill
# ... fix issues ...
hal start ~/my-project
```

### Running in Background

```bash
# 1. Start without attaching
hal start ~/my-project --no-attach

# 2. Do other work
# ...

# 3. Check status periodically
hal status

# 4. When complete, read results
cat ~/my-project/INTEGRATION_REPORT.md
```

---

## Exit Codes

HAL follows standard Unix conventions:

- `0` - Success
- `1` - General error
- `130` - Interrupted (Ctrl+C)

Example:
```bash
hal start ~/my-project
if [ $? -eq 0 ]; then
    echo "Started successfully"
fi
```

---

## Environment Variables

Currently none, but future versions may support:

- `HAL_SESSION_NAME` - Override default tmux session name
- `HAL_AGENT_DIR` - Custom agent specification directory
- `HAL_LOG_DIR` - Where to write log files

---

## Files Created by HAL

When you run `hal start`, the following files are created in your project:

| File | Created By | Purpose |
|------|------------|---------|
| `PROGRESS.md` | Agents | Track completion status |
| `INTEGRATION_REPORT.md` | @delivery-lead | How to test the feature |
| `INTEGRATION_FAILURES.md` | @delivery-lead | Issues found (if any) |
| `*.log` | Future | Agent log files |

---

## Troubleshooting

### "Error: tmux not found"

Install tmux:
```bash
sudo apt install tmux      # Ubuntu/Debian
brew install tmux          # macOS
```

### "Error: Agent team already running"

Stop the existing team first:
```bash
hal stop
# or force kill
hal kill
```

### "Error: No WORKPLAN.md found"

Initialize the project:
```bash
hal init ~/my-project
```

Or create manually from template.

### "Command not found: hal"

Add to PATH or create symlink:
```bash
# Option 1: Add to PATH
export PATH="$PATH:/path/to/agent-team/bin"

# Option 2: Symlink
sudo ln -s /path/to/agent-team/bin/hal /usr/local/bin/hal
```

### Agents seem stuck

Check status and look for blockers:
```bash
hal status
```

Look in `PROGRESS.md` for a "Blockers" section. Agents document what they're waiting for.

---

## Comparison to Other Tools

### vs. Direct Orchestrator

**Before** (orchestrator.py):
```bash
cd /path/to/agent-team
./orchestrator.py ~/my-project
```

**After** (HAL):
```bash
hal start ~/my-project
```

**Benefits**:
- Shorter commands
- Works from anywhere
- Easier to remember
- Standard CLI conventions

### vs. Docker Compose

Similar feel to `docker-compose`:

| Docker Compose | HAL |
|----------------|-----|
| `docker-compose up` | `hal start <project>` |
| `docker-compose down` | `hal stop` |
| `docker-compose ps` | `hal status` |
| `docker-compose logs` | `hal logs` |
| `docker-compose kill` | `hal kill` |

---

## Future Enhancements

Planned features:

- **`hal logs`** - Tail agent logs in real-time
- **`hal restart <agent>`** - Restart a single agent
- **`hal pause`** - Pause all agents
- **`hal resume`** - Resume paused agents
- **`hal export`** - Export session as script
- **`hal watch`** - Live dashboard mode
- **`hal rollback`** - Undo agent changes
- **`hal config`** - Configure HAL settings

---

## Examples

### Quick Feature Development

```bash
$ cd /path/to/my-project

$ hal init .
Created: /path/to/my-project/WORKPLAN.md

$ vim WORKPLAN.md
# ... edit to add "user authentication" feature ...

$ hal validate
✅ WORKPLAN.md looks good!

$ hal start . --no-attach
Starting agent team for: /path/to/my-project
...
Agent team started in background

$ # Do other work while agents build the feature
$ # ...

$ hal status
Status: Agent team running
## Phase 2: Integration
- [x] @delivery-lead - COMPLETE
  - All services running
  - E2E tests passing

$ cat INTEGRATION_REPORT.md
# Integration Report
...
## How to Test
1. Open http://localhost:5173
2. Click "Sign Up"
...

$ hal stop
Agent team stopped
```

---

## Version History

- **1.0.0** (2024-01-06)
  - Initial release
  - Commands: start, stop, kill, status, list, attach, logs, init, validate, agents
  - Tmux session management
  - WORKPLAN validation

---

## License

MIT

---

## Support

For issues or questions:
- GitHub: https://github.com/your-repo/agent-team/issues
- Docs: See `COORDINATION_FIX.md` for architecture details
