# Multi-Agent Orchestrator - System Overview

## What You Have

A **tmux-based multi-agent orchestration system** that:

✅ Reads WORKPLAN.md from any project
✅ Analyzes which agents are needed (dynamic count)
✅ Creates tmux session with one pane per agent
✅ Launches Claude Code agents with context
✅ Shows real-time progress from all agents
✅ Works with your custom agents from `~/.claude/agents/`

## File Structure

```
agent-team/
├── bin/
│   └── agent-team              # Main CLI entry point
├── lib/
│   ├── spec_parser.py          # Parses WORKPLAN.md & CLAUDE.md
│   ├── task_analyzer.py        # Determines which agents to spawn
│   ├── tmux_manager.py         # Creates tmux layouts
│   ├── agent_spawner.py        # Launches Claude Code agents
│   └── __init__.py
├── orchestrator.py             # Main orchestration logic
├── examples/
│   ├── sample-project/
│   │   ├── WORKPLAN.md         # Sample task breakdown
│   │   └── CLAUDE.md           # Sample project context
│   └── DEMO.md                 # How to try the demo
├── QUICK_START.md              # 1-minute getting started
├── ORCHESTRATOR_README.md      # Full documentation
├── SYSTEM_OVERVIEW.md          # This file
└── [agent spec files]          # Bundled agent definitions
    ├── frontend-architect.md
    ├── backend-architect.md
    ├── devops-engineer.md
    ├── test-architect.md
    ├── qa-engineer.md
    └── ... (and more)
```

## How It Works

```
1. You run: ./bin/agent-team /path/to/project

2. System reads: WORKPLAN.md and CLAUDE.md

3. Parses agent tasks:
   ## @frontend-architect Tasks → frontend-architect
   ## @backend-architect Tasks → backend-architect
   ## @code-nitpicker-9000 Tasks → code-nitpicker-9000

4. Creates tmux session:
   ┌─────────────┬─────────────┐
   │ Agent 1     │ Agent 2     │
   ├─────────────┼─────────────┤
   │ Agent 3     │ Agent 4     │
   └─────────────┴─────────────┘

5. Launches Claude Code in each pane

6. Attaches you to the session → watch agents work!
```

## Key Features

### 1. Dynamic Agent Count
Not fixed to 4 agents! System spawns exactly what's needed:
- 1 agent in WORKPLAN → 1 pane
- 10 agents in WORKPLAN → 10 panes

### 2. Custom Agent Support
Automatically loads from:
- `~/.claude/agents/` (priority - your custom agents)
- `agent-team/` directory (bundled agents)

Your custom agents will override bundled ones with the same name.

### 3. Intelligent Layouts
- 1-2 agents: Simple split
- 3-4 agents: 2×2 grid
- 5-6 agents: 2×3 grid
- 7+ agents: Dynamic tiling

### 4. Project Agnostic
Point it at ANY project folder:
- Reads WORKPLAN.md for tasks
- Falls back to structure analysis if no WORKPLAN
- Works with any tech stack

### 5. Real-Time Visibility
Watch all agents simultaneously:
- See file operations
- View code being written
- Monitor test execution
- Track progress

## Usage Modes

### Mode 1: Explicit WORKPLAN (Recommended)

Your project has WORKPLAN.md with @agent sections:

```bash
./bin/agent-team /path/to/project
```

Spawns exact agents listed in WORKPLAN.

### Mode 2: Auto-Detection

Your project has no WORKPLAN.md:

```bash
./bin/agent-team /path/to/project
```

System analyzes directory structure:
- `frontend/` → frontend-architect
- `backend/` → backend-architect
- `Dockerfile` → devops-engineer
- `tests/` → test-architect + qa-engineer

### Mode 3: Custom Agents

Same as Mode 1/2, but system prefers agents from `~/.claude/agents/`:

```bash
# If you have ~/.claude/agents/code-nitpicker-9000.md
# it will be used instead of bundled version
./bin/agent-team /path/to/project
```

## Quick Commands

```bash
# Launch with demo project
./bin/agent-team examples/sample-project

# Launch with your project
./bin/agent-team ~/projects/my-app

# Don't auto-attach (launch in background)
./bin/agent-team ~/projects/my-app --no-attach

# Reattach to running session
tmux attach -t agent-team

# Kill all agents
tmux kill-session -t agent-team
```

## Integration with Your Workflow

### Step 1: Add to PATH (optional)
```bash
echo 'export PATH="$PATH:/home/jason/Desktop/adcl/agent-team/bin"' >> ~/.bashrc
source ~/.bashrc

# Now you can run from anywhere:
agent-team /path/to/any/project
```

### Step 2: Create WORKPLAN Template
```bash
cp agent-team/WORKPLAN.template.md ~/projects/my-project/WORKPLAN.md
# Edit to match your project
```

### Step 3: Launch
```bash
agent-team ~/projects/my-project
```

## Example: Full-Stack SaaS Project

Given this WORKPLAN.md:
```markdown
## @frontend-architect Tasks
- Build dashboard UI
- Create login page

## @backend-architect Tasks
- Create REST API
- Set up database

## @devops-engineer Tasks
- Dockerize application
- Set up CI/CD

## @test-architect Tasks
- Write unit tests

## @code-nitpicker-9000 Tasks
- Review code quality

## @frontend-qa-enforcer Tasks
- E2E tests
```

Result: **6 tmux panes**, 6 agents working in parallel

## Benefits

1. **Parallel Development**: Multiple aspects progress simultaneously
2. **Visibility**: See everything happening in real-time
3. **Isolation**: Each agent stays in its domain
4. **Scalability**: Works for 1 agent or 20 agents
5. **Flexibility**: Use bundled or custom agents
6. **Tmux Power**: Detach, reattach, monitor anytime

## Next Steps

1. **Try the demo**:
   ```bash
   ./bin/agent-team examples/sample-project
   ```

2. **Read the guides**:
   - `QUICK_START.md` - Fast intro
   - `ORCHESTRATOR_README.md` - Complete docs
   - `examples/DEMO.md` - Interactive demo

3. **Use with your project**:
   - Create WORKPLAN.md
   - Run `./bin/agent-team`
   - Watch it work!

4. **Customize**:
   - Add custom agents to `~/.claude/agents/`
   - Modify bundled agent specs
   - Adjust WORKPLAN.md format

## Architecture Highlights

### Modular Design
Each component is independent:
- `spec_parser`: Can be used standalone
- `task_analyzer`: Can be used standalone
- `tmux_manager`: Can be used standalone
- `agent_spawner`: Can be used standalone

### Extensible
Add new capabilities:
- New agent types (just add .md file)
- New layout strategies (edit tmux_manager.py)
- New analysis heuristics (edit task_analyzer.py)

### Testable
Each component has test code:
```bash
python3 lib/spec_parser.py examples/sample-project
python3 lib/agent_spawner.py
python3 lib/task_analyzer.py
```

## Support

- **Docs**: See `ORCHESTRATOR_README.md`
- **Demo**: Run `./bin/agent-team examples/sample-project`
- **Issues**: Check file permissions, tmux/claude installation
- **Customize**: All code is in `lib/` and well-commented

---

**You're ready to orchestrate multi-agent development!** 🚀
