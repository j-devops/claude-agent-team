# Quick Usage Guide - Fixed Orchestrator

## TL;DR

The agent team now delivers **working features**, not just code.

## IMPORTANT: Two Separate Directories

- **`agent-team/`** - Installed ONCE globally (contains HAL + agent specs)
- **`your-project/`** - YOUR project (where agents work)

HAL is like `git` or `docker` - installed once, works anywhere.

## How to Use

### 1. Create Your Workplan (in YOUR project)

```bash
# Go to YOUR existing project
cd ~/my-existing-project

# Create WORKPLAN.md here (not in agent-team/)
hal init .
```

Edit `WORKPLAN.md`:
- Update project overview
- Customize Phase 1 tasks for your feature
- Keep Phase 2 (integration) as-is
- Remove agents you don't need

### 2. Run the Orchestrator

```bash
cd /path/to/agent-team
./bin/agent-team /path/to/your-project
```

This opens a tmux session with one pane per agent.

### 3. Monitor Progress

Watch the tmux panes or check `PROGRESS.md`:

```bash
# In another terminal
watch -n 5 cat /path/to/your-project/PROGRESS.md
```

### 4. Wait for Integration

**Phase 1** (Development):
- Agents write code in parallel
- Each marks COMPLETE in PROGRESS.md when done

**Phase 2** (Integration):
- delivery-lead detects Phase 1 complete
- Installs dependencies
- Starts services
- Verifies everything works
- Creates INTEGRATION_REPORT.md

### 5. Test Your Feature

```bash
cd your-project
cat INTEGRATION_REPORT.md
```

Follow the instructions to test your working feature.

---

## File Structure

After orchestrator runs:

```
your-project/
├── WORKPLAN.md              # What to build (you created this)
├── PROGRESS.md              # Current status (agents update this)
├── INTEGRATION_REPORT.md    # How to test (delivery-lead creates this)
├── backend/                 # Code written by @backend-architect
├── frontend/                # Code written by @frontend-architect
└── shared/types/            # Shared interfaces
```

---

## Success Indicators

### ✅ Everything Worked
```markdown
# In PROGRESS.md
## Phase 2: Integration
- [x] @delivery-lead - COMPLETE
  - All services running
  - Tests passing
  - Feature verified working
```

### ❌ Integration Failed
```markdown
# In PROGRESS.md
## Blockers
- Backend fails to start: Port 3000 in use
- E2E tests failing: Login form not responding

## Files to Check
- INTEGRATION_FAILURES.md (detailed error report)
```

If integration fails:
1. Read INTEGRATION_FAILURES.md
2. Fix the issues it lists
3. Re-run orchestrator

---

## Key Concepts

### Phase-Based Execution
1. **Phase 1**: Agents write code in parallel
2. **Phase 2**: delivery-lead integrates sequentially

### File-Based Coordination
- Agents communicate via PROGRESS.md
- delivery-lead polls PROGRESS.md to know when to start
- No manual intervention needed

### Definition of Done
- Not "code written"
- But "feature works end-to-end"

---

## Common Workflows

### New Project from Scratch
```bash
# 1. Copy template
cp WORKPLAN.template.md my-project/WORKPLAN.md

# 2. Edit to define your features
vim my-project/WORKPLAN.md

# 3. Run orchestrator
./bin/agent-team my-project

# 4. Wait for completion
# 5. Test via INTEGRATION_REPORT.md
```

### Add Feature to Existing Project
```bash
# 1. Create feature WORKPLAN
cat > my-project/FEATURE_WORKPLAN.md <<EOF
# Phase 1: Development
## @backend-architect Tasks
- [ ] Add POST /api/payments endpoint
## @frontend-architect Tasks
- [ ] Add payment form component

# Phase 2: Integration
## @delivery-lead Tasks
- [ ] Verify payment flow works end-to-end
EOF

# 2. Run orchestrator
./bin/agent-team my-project

# Agents read WORKPLAN.md or FEATURE_WORKPLAN.md
```

### Debug Integration Issues
```bash
# 1. Read the failure report
cat my-project/INTEGRATION_FAILURES.md

# 2. Identify which agent's code has issues
# 3. Fix manually OR re-run that agent

# 4. Re-run delivery-lead manually (or full orchestrator)
```

---

## Tmux Commands Reference

While orchestrator is running:

| Command | Description |
|---------|-------------|
| `Ctrl+B` then `D` | Detach (agents keep running) |
| `tmux attach -t agent-team` | Reattach to session |
| `Ctrl+B` then arrow key | Navigate between panes |
| `Ctrl+B` then `Z` | Zoom current pane (fullscreen) |
| `Ctrl+B` then `Z` again | Unzoom |
| `tmux kill-session -t agent-team` | Stop all agents |

---

## Troubleshooting

### "Nothing is happening"
- Check `PROGRESS.md` - agents might be blocked
- Look for "Blockers" section
- Check individual tmux panes for errors

### "delivery-lead never starts"
- Check Phase 1 agents all marked COMPLETE
- Look at PROGRESS.md Phase 1 section
- delivery-lead waits for all agents to finish

### "Integration fails every time"
- Read INTEGRATION_FAILURES.md carefully
- Fix the specific issues listed
- Re-run orchestrator or fix manually

### "Agents are stuck"
- Check PROGRESS.md Blockers section
- Agents document what they're waiting for
- Provide what they need or remove blocker

---

## Example Session

```bash
$ cd agent-team
$ ./bin/agent-team ~/projects/my-saas

# Tmux opens with 6 panes:
# - backend-architect (writing API code)
# - frontend-architect (writing UI code)
# - devops-engineer (creating Dockerfiles)
# - test-architect (writing tests)
# - qa-engineer (writing E2E tests)
# - delivery-lead (waiting for Phase 1)

# ... wait 10-15 minutes ...

# Agents finish, mark COMPLETE in PROGRESS.md
# delivery-lead detects completion
# delivery-lead installs, starts, verifies

# ... wait 5 minutes ...

# delivery-lead creates INTEGRATION_REPORT.md
# You test the feature

$ cd ~/projects/my-saas
$ cat INTEGRATION_REPORT.md
# Follow instructions to test your working feature
```

---

## What Changed vs. Old System

| Old System | New System |
|------------|------------|
| Agents write code and stop | Agents write code, delivery-lead integrates |
| No integration phase | Phase 2: Integration is mandatory |
| User gets code files | User gets working feature |
| No coordination | File-based coordination via PROGRESS.md |
| Unclear "done" | Clear: feature works end-to-end |

---

## Questions?

Read:
- `COORDINATION_FIX.md` - Detailed explanation of changes
- `WORKPLAN.template.md` - Full template with examples
- `delivery-lead.md` - What the integration agent does
- `CLAUDE.md` - Orchestration patterns

For real project usage:
1. Start with sample project to see it work
2. Adapt WORKPLAN template to your needs
3. Run orchestrator
4. Test the delivered feature
