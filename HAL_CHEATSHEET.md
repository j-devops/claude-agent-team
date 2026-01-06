# HAL Command Cheat Sheet

## Two Directories - Critical Concept

- **`agent-team/`** - System install (once), like `/usr/bin`
- **`~/your-project/`** - YOUR project (agents work here)

Agents **execute in your project**, not in agent-team directory.

## Installation (Once)

```bash
cd /path/to/agent-team
./INSTALL.sh
```

Now HAL works from anywhere, on any project.

## Common Commands

```bash
# List available agents
hal agents

# Initialize new project
hal init ~/my-project

# Validate workplan
hal validate ~/my-project

# Start agent team
hal start ~/my-project

# Check status
hal status

# Attach to watch agents work
hal attach

# Detach from tmux (agents keep running)
# Press: Ctrl+B then D

# Stop agents
hal stop

# Force kill everything
hal kill
```

## Typical Workflow

```bash
# 1. Setup
hal init ~/my-feature
vim ~/my-feature/WORKPLAN.md
hal validate ~/my-feature

# 2. Execute
hal start ~/my-feature

# 3. Monitor (optional)
hal status
# or
hal attach

# 4. Results
cat ~/my-feature/INTEGRATION_REPORT.md

# 5. Cleanup
hal stop
```

## File-Based Coordination

Agents communicate via files in your project:

| File | Purpose |
|------|---------|
| `WORKPLAN.md` | What to build (you write this) |
| `PROGRESS.md` | Current status (agents write this) |
| `INTEGRATION_REPORT.md` | How to test (delivery-lead writes this) |
| `INTEGRATION_FAILURES.md` | Issues found (if integration fails) |

## Quick Status Check

```bash
# While agents are running, check progress:
watch -n 5 'cat ~/my-project/PROGRESS.md'

# Or in another terminal:
tail -f ~/my-project/PROGRESS.md
```

## Tmux Navigation (when attached)

| Keys | Action |
|------|--------|
| `Ctrl+B` then `D` | Detach (agents keep running) |
| `Ctrl+B` then arrow | Navigate panes |
| `Ctrl+B` then `Z` | Zoom pane (fullscreen) |
| `Ctrl+B` then `Z` again | Unzoom |
| `Ctrl+B` then `[` | Scroll mode (q to exit) |

## Troubleshooting

```bash
# Agent team won't start?
hal kill                    # Force kill any stuck sessions
hal start ~/my-project      # Try again

# Want to see what went wrong?
hal attach                  # View live output
# or
cat ~/my-project/INTEGRATION_FAILURES.md

# Check if tmux is installed
which tmux

# List all tmux sessions
hal list
```

## Environment Setup

```bash
# Make sure you have:
# 1. tmux installed
sudo apt install tmux       # Ubuntu/Debian
brew install tmux           # macOS

# 2. Python 3 installed
python3 --version

# 3. HAL in PATH or symlinked
which hal
```

## Pro Tips

1. **Run in background**: Use `--no-attach` flag
   ```bash
   hal start ~/my-project --no-attach
   ```

2. **Monitor from another terminal**:
   ```bash
   watch -n 5 hal status
   ```

3. **Quick validation before starting**:
   ```bash
   hal validate && hal start .
   ```

4. **Chain commands**:
   ```bash
   hal stop && hal start ~/my-project
   ```

## Example: Full Feature Development

```bash
# Day 1: Setup
cd ~/projects
mkdir my-saas-app && cd my-saas-app
hal init .
vim WORKPLAN.md             # Define "user authentication" feature
hal validate
hal start . --no-attach     # Start in background
# ... go do other work ...

# Day 1: End of day check
hal status                  # See progress

# Day 2: Check if done
hal status
cat INTEGRATION_REPORT.md  # If Phase 2 complete
# Test the feature locally
hal stop
```
