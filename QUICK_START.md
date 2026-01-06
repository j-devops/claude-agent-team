# Quick Start Guide

## 1-Minute Setup

```bash
# Navigate to agent-team directory
cd /home/jason/Desktop/adcl/agent-team

# Test with the sample project
./bin/agent-team examples/sample-project
```

That's it! Watch your agents work in tmux.

## Your First Project

### Step 1: Create WORKPLAN.md in your project

```markdown
# My Project

## @frontend-architect Tasks
- [ ] Build homepage
- [ ] Create navigation

## @backend-architect Tasks
- [ ] Create REST API
- [ ] Set up database
```

### Step 2: Run the orchestrator

```bash
./bin/agent-team /path/to/your/project
```

### Step 3: Watch the magic

Each agent appears in its own tmux pane, working on its tasks.

## Tmux Basics

- **Detach** (leave agents running): `Ctrl+B` then `D`
- **Reattach**: `tmux attach -t agent-team`
- **Navigate panes**: `Ctrl+B` then arrows
- **Zoom pane**: `Ctrl+B` then `Z`
- **Kill all**: `tmux kill-session -t agent-team`

## Agent Count

The system is **dynamic** - it spawns exactly as many agents as needed:

- **1 task section** → 1 agent
- **3 task sections** → 3 agents
- **10 task sections** → 10 agents

No fixed limit!

## Available Agents

From this directory:
- `frontend-architect`, `backend-architect`, `devops-engineer`
- `test-architect`, `qa-engineer`, `security-auditor`
- `database-architect`, `api-designer`, `documentation-writer`

From `~/.claude/agents/` (your custom ones):
- `code-nitpicker-9000`, `frontend-qa-enforcer`
- Any other `.md` files you've added

## Files You Need

**Minimum:**
- `WORKPLAN.md` with `@agent` sections

**Recommended:**
- `CLAUDE.md` with project context
- `shared/types/` for shared interfaces

**Optional:**
- `PROGRESS.md` for tracking
- `BLOCKERS.md` for issues

## Common Patterns

### Full-Stack App
```markdown
## @frontend-architect Tasks
...

## @backend-architect Tasks
...

## @devops-engineer Tasks
...

## @test-architect Tasks
...
```

### Frontend Only
```markdown
## @frontend-architect Tasks
...

## @code-nitpicker-9000 Tasks
...
```

### Quick Prototype
```markdown
## @fullstack-dev Tasks
...
```

## What Happens

1. **Parse**: Reads your WORKPLAN.md and CLAUDE.md
2. **Analyze**: Determines which agents are needed
3. **Create**: Sets up tmux session with N panes
4. **Launch**: Starts Claude Code in each pane
5. **Attach**: Shows you the live session

## Troubleshooting

**"tmux not found"**
```bash
sudo apt install tmux
```

**"claude not found"**
```bash
# Install Claude Code CLI
# See: https://github.com/anthropics/claude-code
```

**No agents spawn**
- Check WORKPLAN.md has `@agent-name` sections
- Verify agent `.md` files exist

**Agents not doing anything**
- Make sure tasks are clear and specific
- Check CLAUDE.md provides good context

## Next Steps

1. ✅ Run demo: `./bin/agent-team examples/sample-project`
2. ✅ Create WORKPLAN.md for your project
3. ✅ Launch: `./bin/agent-team your-project/`
4. ✅ Watch the agents work
5. ✅ Customize agent specs as needed

## Pro Tips

- **Be specific** in task descriptions
- **Define types first** in shared/types/
- **Monitor periodically** - detach and reattach
- **One domain per agent** - don't cross boundaries
- **Clear contracts** - define APIs before implementation

---

**Questions?** See `ORCHESTRATOR_README.md` for full documentation.
