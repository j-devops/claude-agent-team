# Claude Code Agent Team

A multi-agent development framework that delivers **working features**, not just code.

Hand it a spec, it builds the feature end-to-end: code, tests, integration, and verification.

## What Is This?

This is a **multi-agent orchestration system** for Claude Code that coordinates specialized AI agents to build complete features. Instead of just writing code files, it:

- ✅ **Builds working code** - Not just files, but running services
- ✅ **Integrates everything** - Frontend talks to backend, tests pass
- ✅ **Tests thoroughly** - Unit tests, integration tests, E2E tests
- ✅ **Verifies end-to-end** - Feature actually works when done
- ✅ **Documents results** - Shows you how to test the feature

**Before**: "Here's some code files, good luck integrating them"
**After**: "Here's your working feature, test it at http://localhost:5173"

## Installation

### Prerequisites

- [Claude Code CLI](https://claude.com/claude-code) installed
- `tmux` installed (for HAL CLI mode)
- `git` installed

### Quick Setup

```bash
# 1. Clone the repository
git clone https://github.com/j-devops/claude-agent-team.git
cd claude-agent-team

# 2. Add HAL to your PATH (choose one method)

# Method A: Add to bashrc/zshrc (recommended)
echo 'export PATH="$PATH:'"$(pwd)/bin"'"' >> ~/.bashrc
source ~/.bashrc

# Method B: Create system symlink
sudo ln -s "$(pwd)/bin/hal" /usr/local/bin/hal

# 3. Verify installation
hal --version

# 4. See available commands
hal --help
```

### Install tmux (if needed)

```bash
# Ubuntu/Debian
sudo apt install tmux

# macOS
brew install tmux

# Fedora/RHEL
sudo dnf install tmux
```

## Quick Start

### Using HAL CLI (Recommended)

HAL keeps your project directory clean by managing orchestration files separately.

```bash
# 1. Initialize a workspace for your project
hal init ~/my-project

# 2. Edit the workplan to define what to build
vim ~/my-project/WORKPLAN.md

# 3. Start the agent team
hal start ~/my-project

# 4. Check progress (in another terminal)
hal status

# 5. When complete, read the integration report
cat ~/my-project/INTEGRATION_REPORT.md

# 6. Stop the team when done
hal stop
```

**Key Feature**: Your project stays clean! All orchestration files (WORKPLAN.md, PROGRESS.md) live in `agent-team/workspaces/`, not in your project.

### Using Claude Code Directly (Alternative)

For manual control, you can add CLAUDE.md to your project and invoke agents directly.

```bash
# 1. Copy CLAUDE.md to your project root
cp CLAUDE.md ~/my-project/

# 2. Open Claude Code in your project
cd ~/my-project
claude

# 3. Tell Claude what to build
> "Build a user authentication system with JWT"

# Claude orchestrates agents automatically based on CLAUDE.md
```

## Understanding HAL

HAL is a command-line tool that manages agent teams. Think of it like `docker-compose` for AI agents.

### Directory Model

```
agent-team/                    # System directory (installed once)
├── bin/hal                    # HAL CLI tool
├── *.md                       # Agent specifications
├── CLAUDE.md                  # Orchestrator instructions
└── workspaces/                # Workspace directories
    └── my-project/            # Orchestration files for your project
        ├── WORKPLAN.md        # What to build
        ├── PROGRESS.md        # Build status (auto-generated)
        └── INTEGRATION_REPORT.md  # How to test (auto-generated)

~/my-project/                  # Your actual project (stays clean!)
├── backend/                   # Modified by @backend-architect
├── frontend/                  # Modified by @frontend-architect
└── tests/                     # Modified by @qa-engineer
```

**Key Principle**: Orchestration files stay in `agent-team/workspaces/`, your project stays clean.

### How HAL Works

1. **You create a WORKPLAN.md** - Defines what to build
2. **HAL reads the workplan** - Identifies which agents are needed
3. **Agents spawn in tmux** - Each agent works in parallel
4. **Agents modify YOUR project** - They `cd` into your project and work there
5. **Integration happens** - @delivery-lead verifies everything works
6. **You get results** - INTEGRATION_REPORT.md tells you how to test

### HAL Commands Reference

| Command | What It Does |
|---------|--------------|
| `hal init <project>` | Create WORKPLAN.md template for a project |
| `hal start <project>` | Start agent team working on a project |
| `hal stop` | Stop the running agent team gracefully |
| `hal kill` | Force stop the agent team immediately |
| `hal status` | Show progress and current status |
| `hal attach` | Connect to tmux session to watch agents work |
| `hal validate <project>` | Check if WORKPLAN.md is valid |
| `hal agents` | List all available agents |
| `hal list` | List all tmux sessions |

**Full documentation**: See [HAL.md](HAL.md) for complete command reference.

## The Agent Team

### Core Development

| Agent | Specialization |
|-------|----------------|
| **@frontend-architect** | React, Vue, Svelte, TypeScript, CSS, state management, UI/UX |
| **@backend-architect** | Node, Python, Go, Rust, APIs, databases, queues, auth |
| **@fullstack-dev** | General development, smaller tasks, prototypes |
| **@devops-engineer** | Docker, Kubernetes, CI/CD, Terraform, AWS/GCP/Azure |

### Quality & Security

| Agent | Specialization |
|-------|----------------|
| **@qa-engineer** | E2E tests, integration tests, manual test plans |
| **@test-architect** | Unit tests, mocking, coverage, TDD |
| **@security-auditor** | Security review, OWASP, penetration testing, vulnerability assessment |

### Specialists

| Agent | When to Use |
|-------|-------------|
| **@database-architect** | Schema design, migrations, query optimization |
| **@api-designer** | OpenAPI specs, GraphQL schemas, API contracts |
| **@documentation-writer** | READMEs, API docs, architecture docs |
| **@delivery-lead** | **Integration & verification (critical!)** |

**The delivery-lead agent** is what makes this system special. It doesn't just write code - it installs dependencies, starts services, runs tests, and verifies everything works end-to-end.

## How It Works: 3-Phase Delivery Model

### Phase 1: Planning & Contracts

You define what to build in `WORKPLAN.md`:

```markdown
# Project: User Authentication Feature

## Shared Contracts

Define interfaces first to ensure compatibility:
- User interface
- Auth token structure
- API endpoints

## Phase 1: Development (Parallel)

### @backend-architect Tasks
- [ ] Implement JWT authentication
- [ ] Create user registration endpoint
- [ ] Create login endpoint
- [ ] Add password hashing with bcrypt

### @frontend-architect Tasks
- [ ] Build login page
- [ ] Build signup page
- [ ] Create auth state management
- [ ] Add protected route logic

### @test-architect Tasks
- [ ] Unit tests for auth endpoints
- [ ] Unit tests for auth components

## Phase 2: Integration (Sequential)

### @delivery-lead Tasks
- [ ] Wait for Phase 1 completion
- [ ] Install all dependencies
- [ ] Start backend server
- [ ] Start frontend server
- [ ] Run integration tests
- [ ] Verify login/signup flow works
- [ ] Create INTEGRATION_REPORT.md
```

### Phase 2: Development (Parallel Execution)

Agents work simultaneously:

- `@backend-architect` builds API endpoints
- `@frontend-architect` builds UI components
- `@test-architect` writes tests
- Each marks themselves COMPLETE in `PROGRESS.md`

### Phase 3: Integration (Sequential Execution)

Once Phase 1 completes, `@delivery-lead` takes over:

1. Polls `PROGRESS.md` waiting for all agents to finish
2. Installs all dependencies (`npm install`, `pip install`, etc.)
3. Starts all services (backend, frontend, database)
4. Runs integration tests
5. Runs E2E tests
6. Creates `INTEGRATION_REPORT.md` with demo instructions

**Result**: You get a working feature, not just code.

## Example Workflows

### 1. New Feature for Existing Project

```bash
# Initialize workspace
hal init ~/my-saas-app

# Edit workplan
vim ~/my-saas-app/WORKPLAN.md

# Add tasks like:
# - @backend-architect: Add payment processing
# - @frontend-architect: Build checkout UI
# - @security-auditor: Review payment flow

# Validate workplan
hal validate ~/my-saas-app

# Start agents
hal start ~/my-saas-app

# Detach and do other work (Ctrl+B then D)

# Check progress later
hal status

# When complete
cat ~/my-saas-app/INTEGRATION_REPORT.md

# Stop agents
hal stop
```

### 2. Bootstrap New Project from Scratch

```bash
# Create project directory
mkdir ~/new-app
cd ~/new-app

# Initialize HAL workspace
hal init .

# Edit workplan with project spec
vim WORKPLAN.md

# Example workplan:
## Phase 1: Development
### @backend-architect Tasks
- [ ] Set up Express server with TypeScript
- [ ] Configure PostgreSQL with Prisma
- [ ] Create REST API for tasks

### @frontend-architect Tasks
- [ ] Set up React with Vite
- [ ] Configure Tailwind CSS
- [ ] Build task list UI

### @devops-engineer Tasks
- [ ] Create Dockerfile for backend
- [ ] Create Dockerfile for frontend
- [ ] Set up docker-compose.yml

### @delivery-lead Tasks
- [ ] Install all dependencies
- [ ] Start services with docker-compose
- [ ] Verify services are healthy
- [ ] Create INTEGRATION_REPORT.md

# Start agents
hal start .

# Watch progress
hal attach
```

### 3. Bug Fix Workflow

```bash
# Edit existing WORKPLAN.md
vim ~/my-app/WORKPLAN.md

# Add fix tasks:
## Phase 1: Bug Fix
### @backend-architect Tasks
- [ ] Fix 500 error in checkout endpoint
- [ ] Add error handling for invalid payment data

### @test-architect Tasks
- [ ] Add regression test for checkout error

### @qa-engineer Tasks
- [ ] Verify fix doesn't break other flows

# Start agents
hal start ~/my-app

# Monitor
hal status
```

### 4. Using Claude Code Directly (No HAL)

```bash
# Copy CLAUDE.md to your project
cp /path/to/agent-team/CLAUDE.md ~/my-project/

# Start Claude Code in your project
cd ~/my-project
claude

# In Claude Code, describe what you want
> "Add user authentication with OAuth. Use @api-designer to create the
> spec, then @backend-architect to implement the API, @frontend-architect
> for the UI, and @security-auditor to review."

# Claude orchestrates agents automatically based on CLAUDE.md
```

## Common Use Cases

### Web Application Development

```markdown
## Phase 1: Development
### @backend-architect
- [ ] Set up Node.js/Express API
- [ ] Configure PostgreSQL database
- [ ] Implement CRUD endpoints

### @frontend-architect
- [ ] Set up React SPA
- [ ] Build component library
- [ ] Implement state management

### @devops-engineer
- [ ] Containerize services
- [ ] Set up CI/CD pipeline
```

### Microservices Architecture

```markdown
## Phase 1: Development
### @backend-architect
- [ ] Build user service (Node.js)
- [ ] Build order service (Python)
- [ ] Build payment service (Go)

### @api-designer
- [ ] Define gRPC contracts
- [ ] Create OpenAPI specs

### @devops-engineer
- [ ] Set up Kubernetes manifests
- [ ] Configure service mesh
```

### Adding Tests to Existing Code

```markdown
## Phase 1: Testing
### @test-architect
- [ ] Add unit tests for auth module
- [ ] Add unit tests for payment module
- [ ] Achieve 80% coverage

### @qa-engineer
- [ ] Write E2E tests for checkout flow
- [ ] Write E2E tests for user registration
```

## Customization

### Add Your Own Agent

Create a new agent specification:

```bash
# Create in agent-team directory
vim custom-specialist.md
```

```markdown
---
name: custom-specialist
description: What this agent does
tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
permissionMode: bypassPermissions
---

# Custom Specialist Agent

You are a specialist in [domain]. Your role is to [responsibilities].

## Guidelines

- [Guideline 1]
- [Guideline 2]

## When You're Done

Mark yourself COMPLETE in PROGRESS.md.
```

Then use it in WORKPLAN.md:

```markdown
### @custom-specialist Tasks
- [ ] Your custom tasks
```

### Modify CLAUDE.md for Your Team

Edit `CLAUDE.md` to customize the orchestration:

```markdown
# Add your own rules
- Always use TypeScript, never JavaScript
- Follow our company's naming conventions
- Run ESLint before marking complete

# Add your own agents
| Agent | Domain | Specialization |
|-------|--------|----------------|
| @mobile-dev | mobile/ | React Native, iOS, Android |
```

## Troubleshooting

### HAL Issues

**Problem**: `command not found: hal`

```bash
# Solution: Add to PATH
export PATH="$PATH:/path/to/agent-team/bin"
# Or create symlink
sudo ln -s /path/to/agent-team/bin/hal /usr/local/bin/hal
```

**Problem**: `Error: tmux not found`

```bash
# Solution: Install tmux
sudo apt install tmux      # Ubuntu/Debian
brew install tmux          # macOS
```

**Problem**: `Error: Agent team already running`

```bash
# Solution: Stop existing team
hal stop
# Or force kill
hal kill
```

**Problem**: `Error: No WORKPLAN.md found`

```bash
# Solution: Initialize the workspace
hal init ~/my-project
```

### Agent Issues

**Problem**: Agents seem stuck

```bash
# Check status
hal status

# Look for blockers in PROGRESS.md
cat ~/my-project/PROGRESS.md

# Check specific agent output
hal attach  # then navigate to the stuck agent's pane
```

**Problem**: Integration fails

```bash
# Read the failure report
cat ~/my-project/INTEGRATION_FAILURES.md

# Common issues:
# - Missing dependencies (run npm install manually)
# - Port already in use (kill process on that port)
# - Environment variables missing (check .env files)
```

**Problem**: Tests failing

```bash
# Attach to see test output
hal attach

# Navigate to @delivery-lead pane to see test results
# Fix issues and restart
hal stop
hal start ~/my-project
```

## Files & Directories

### Repository Structure

```
agent-team/
├── bin/
│   └── hal                          # HAL CLI executable
├── examples/
│   └── sample-project/              # Full example project
├── workspaces/                      # Workspace directories
│   ├── README.md                    # Workspace documentation
│   └── my-project/                  # Per-project orchestration files
│       ├── WORKPLAN.md              # What to build (you create)
│       ├── PROGRESS.md              # Build status (auto-generated)
│       └── INTEGRATION_REPORT.md    # Test instructions (auto-generated)
├── CLAUDE.md                        # Orchestrator instructions
├── HAL.md                           # HAL documentation
├── frontend-architect.md            # Agent specifications
├── backend-architect.md
├── delivery-lead.md
└── ...                              # Other agent specs
```

### Files Created by HAL

When you run `hal start`, these files are created in your workspace:

| File | Created By | Purpose |
|------|------------|---------|
| `WORKPLAN.md` | You (via `hal init`) | Defines what to build |
| `PROGRESS.md` | Agents | Tracks completion status |
| `INTEGRATION_REPORT.md` | @delivery-lead | How to test the feature |
| `INTEGRATION_FAILURES.md` | @delivery-lead | Issues found (if any) |

### Files Modified by Agents

Agents modify files in **your project directory**:

| Directory | Modified By | Contents |
|-----------|-------------|----------|
| `backend/` | @backend-architect | API code, database schemas |
| `frontend/` | @frontend-architect | UI components, pages |
| `tests/` | @qa-engineer, @test-architect | Test files |
| `infra/` | @devops-engineer | Docker, K8s configs |

## Comparison to Other Tools

### vs. Traditional Development

| Traditional | Agent Team |
|-------------|------------|
| Write code manually | Agents write code in parallel |
| Manually integrate | @delivery-lead integrates automatically |
| Hope it works | Verified working before delivery |
| Manual testing | Automated E2E testing |
| Hours/days | Minutes |

### vs. GitHub Copilot

| Copilot | Agent Team |
|---------|------------|
| Suggests code completions | Builds entire features |
| Single developer context | Multi-agent coordination |
| You integrate | Automatic integration |
| No verification | Verifies feature works |

### vs. ChatGPT Code Interpreter

| ChatGPT | Agent Team |
|---------|------------|
| Single conversation | Specialized agents |
| No project persistence | Works on real projects |
| Copy-paste code | Direct file modification |
| No integration | Full stack integration |

## Documentation

- **[HAL.md](HAL.md)** - Complete HAL command reference
- **[CLAUDE.md](CLAUDE.md)** - Orchestrator instructions and agent coordination
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design
- **[examples/sample-project/](examples/sample-project/)** - Full example implementation

## Requirements

### System Requirements

- Linux, macOS, or WSL2 on Windows
- Python 3.8+ (for orchestrator.py if not using HAL)
- tmux 2.0+ (for HAL CLI)
- git

### Claude Requirements

- Claude Code CLI installed
- API access (Sonnet or Opus recommended)

### Optional

- Docker (for containerized workflows)
- Node.js, Python, Go (depending on your project)

## Contributing

Contributions welcome! Areas we'd love help with:

- Additional agent specialists (mobile dev, ML, data engineering)
- Better error handling and recovery
- Agent coordination improvements
- More example projects
- Documentation improvements

## License

MIT License - see LICENSE file for details

## Support

- **GitHub Issues**: https://github.com/j-devops/claude-agent-team/issues
- **Documentation**: See docs in this repo
- **Examples**: Check `examples/sample-project/`

## Credits

Built with Claude Code and designed for developers who want AI agents to deliver working features, not just code files.
