# Demo: Multi-Agent Orchestrator

## Quick Demo

Try the orchestrator with the sample project:

```bash
# From the agent-team directory
./bin/agent-team examples/sample-project
```

This will:
1. Parse the WORKPLAN.md
2. Identify 6 agents needed:
   - frontend-architect
   - backend-architect
   - devops-engineer
   - test-architect
   - code-nitpicker-9000
   - frontend-qa-enforcer

3. Create a tmux session with 6 panes (2×3 grid)
4. Launch each agent in its pane
5. Attach to the session so you can watch

## What You'll See

Each tmux pane shows an agent working:

```
┌─────────────────────┬─────────────────────┬─────────────────────┐
│ FRONTEND-ARCHITECT  │ BACKEND-ARCHITECT   │ DEVOPS-ENGINEER     │
│                     │                     │                     │
│ Reading WORKPLAN... │ Setting up API...   │ Creating Docker...  │
│                     │                     │                     │
├─────────────────────┼─────────────────────┼─────────────────────┤
│ TEST-ARCHITECT      │ CODE-NITPICKER-9000 │ FRONTEND-QA-ENFORCER│
│                     │                     │                     │
│ Writing tests...    │ Reviewing code...   │ E2E tests setup...  │
│                     │                     │                     │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

## Interactive Demo

Try these commands while watching:

1. **Zoom into one agent**:
   - Press `Ctrl+B` then `Z`
   - Watch that agent in fullscreen
   - Press `Ctrl+B` then `Z` again to zoom out

2. **Navigate between panes**:
   - `Ctrl+B` then arrow keys

3. **Detach and let agents work**:
   - Press `Ctrl+B` then `D`
   - Agents keep running in background
   - Reattach with: `tmux attach -t agent-team`

4. **Kill the session**:
   - `tmux kill-session -t agent-team`

## Testing with Your Own Project

Create a simple WORKPLAN.md in your project:

```markdown
# My Project

## @frontend-architect Tasks
- [ ] Create homepage component
- [ ] Set up routing

## @backend-architect Tasks
- [ ] Create API endpoints
- [ ] Set up database
```

Then run:

```bash
./bin/agent-team /path/to/your/project
```

## Advanced: Custom Agents

If you have custom agents in `~/.claude/agents/`:

```bash
# The orchestrator will automatically detect and use them
./bin/agent-team examples/sample-project

# Your custom agents (like code-nitpicker-9000) will be used
# instead of bundled ones with the same name
```

## What to Watch For

As agents work, you'll see:
- File reads and explorations
- Code being written
- Commands being run
- Tests being executed
- Progress reports

Each agent works independently but follows the coordination rules in CLAUDE.md.

## Next Steps

1. Try the sample project
2. Create a WORKPLAN.md for your own project
3. Watch the agents work in real-time
4. Customize the agent specifications
5. Add your own custom agents
