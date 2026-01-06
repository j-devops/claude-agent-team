#!/bin/bash

echo "=================================================="
echo "  MULTI-AGENT ORCHESTRATOR - FIRST RUN"
echo "=================================================="
echo ""
echo "Let's test the system with the sample project..."
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v tmux &> /dev/null; then
    echo "❌ tmux not found. Install with: sudo apt install tmux"
    exit 1
fi
echo "✅ tmux found"

if ! command -v python3 &> /dev/null; then
    echo "❌ python3 not found. Please install Python 3.8+"
    exit 1
fi
echo "✅ python3 found"

if ! command -v claude &> /dev/null; then
    echo "❌ claude CLI not found. Please install Claude Code."
    exit 1
fi
echo "✅ claude found"

echo ""
echo "All prerequisites met!"
echo ""
echo "Launching demo with sample project..."
echo ""
echo "This will:"
echo "  1. Parse examples/sample-project/WORKPLAN.md"
echo "  2. Identify required agents (6 total)"
echo "  3. Create tmux session with 6 panes"
echo "  4. Launch agents in each pane"
echo "  5. Attach you to the session"
echo ""
echo "Press Ctrl+B then D to detach from tmux"
echo "Use 'tmux attach -t agent-team' to reattach"
echo ""
read -p "Press Enter to continue..."

# Run the orchestrator
./bin/agent-team examples/sample-project
