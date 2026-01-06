#!/usr/bin/env python3
"""
Tmux session and layout manager for multi-agent orchestration.
"""
import subprocess
import time
from typing import List, Optional


class TmuxManager:
    """Manage tmux sessions and panes for agent visualization."""

    def __init__(self, session_name: str = "agent-team"):
        self.session_name = session_name

    def session_exists(self) -> bool:
        """Check if the tmux session already exists."""
        result = subprocess.run(
            ["tmux", "has-session", "-t", self.session_name],
            capture_output=True,
            text=True
        )
        return result.returncode == 0

    def create_session(self, agents: List[str], project_dir: str) -> None:
        """
        Create a tmux session with panes for each agent.

        Layout strategy:
        - 1 agent: Full window
        - 2 agents: Horizontal split
        - 3-4 agents: 2x2 grid
        - 5-6 agents: 2x3 grid
        - 7+ agents: Dynamic tiling
        """
        if self.session_exists():
            print(f"Tmux session '{self.session_name}' already exists.")
            user_input = input("Kill and recreate? (y/n): ")
            if user_input.lower() == 'y':
                self.kill_session()
            else:
                print("Attaching to existing session...")
                self.attach()
                return

        num_agents = len(agents)

        if num_agents == 0:
            raise ValueError("No agents to spawn")

        # Create initial session with first agent pane
        subprocess.run([
            "tmux", "new-session",
            "-d",  # detached
            "-s", self.session_name,
            "-n", "agents",  # window name
            "-c", project_dir  # working directory
        ])

        # Set status bar to show agent info
        subprocess.run([
            "tmux", "set-option",
            "-t", self.session_name,
            "status-right",
            f"#[fg=green]Agents: {num_agents} #[fg=cyan]| %H:%M"
        ])

        # Create layout based on number of agents
        if num_agents == 1:
            # Single pane, already created
            self._set_pane_title(0, agents[0])

        elif num_agents == 2:
            # Horizontal split
            self._split_window("h")  # horizontal split
            self._set_pane_title(0, agents[0])
            self._set_pane_title(1, agents[1])

        elif num_agents <= 4:
            # 2x2 grid
            self._create_grid_layout(agents, rows=2, cols=2)

        elif num_agents <= 6:
            # 2x3 grid
            self._create_grid_layout(agents, rows=2, cols=3)

        else:
            # Dynamic tiling
            self._create_tiled_layout(agents)

        # Set synchronize-panes off (we want independent agents)
        subprocess.run([
            "tmux", "set-window-option",
            "-t", self.session_name,
            "synchronize-panes", "off"
        ])

        print(f"Created tmux session '{self.session_name}' with {num_agents} panes")

    def _split_window(self, direction: str, target: Optional[int] = None) -> None:
        """Split a tmux pane (h=horizontal, v=vertical)."""
        cmd = ["tmux", "split-window", f"-{direction}", "-t", self.session_name]
        if target is not None:
            cmd.extend(["-t", f"{self.session_name}:{target}"])
        subprocess.run(cmd)

    def _set_pane_title(self, pane_index: int, title: str) -> None:
        """Set the title for a specific pane."""
        # Send command to display agent name at top of pane
        cmd = f"printf '\\033]2;{title}\\033\\\\'; echo '=== {title.upper()} ==='"
        subprocess.run([
            "tmux", "send-keys",
            "-t", f"{self.session_name}:{pane_index}",
            cmd,
            "C-m"  # Enter
        ])

    def _create_grid_layout(self, agents: List[str], rows: int, cols: int) -> None:
        """Create a grid layout for agents."""
        # Create first row
        for i in range(1, cols):
            self._split_window("h")

        # Create additional rows
        for row in range(1, rows):
            for col in range(cols):
                pane_idx = (row - 1) * cols + col
                self._select_pane(pane_idx)
                self._split_window("v")

        # Set pane titles
        for idx, agent in enumerate(agents):
            if idx < rows * cols:
                self._set_pane_title(idx, agent)

        # Balance the layout
        subprocess.run([
            "tmux", "select-layout",
            "-t", self.session_name,
            "tiled"
        ])

    def _create_tiled_layout(self, agents: List[str]) -> None:
        """Create a tiled layout for many agents."""
        # Create all panes
        for i in range(1, len(agents)):
            self._split_window("h" if i % 2 == 0 else "v")

        # Use tmux's tiled layout
        subprocess.run([
            "tmux", "select-layout",
            "-t", self.session_name,
            "tiled"
        ])

        # Set titles
        for idx, agent in enumerate(agents):
            self._set_pane_title(idx, agent)

    def _select_pane(self, pane_index: int) -> None:
        """Select a specific pane."""
        subprocess.run([
            "tmux", "select-pane",
            "-t", f"{self.session_name}.{pane_index}"
        ])

    def send_command(self, pane_index: int, command: str) -> None:
        """Send a command to a specific pane."""
        subprocess.run([
            "tmux", "send-keys",
            "-t", f"{self.session_name}.{pane_index}",
            command,
            "C-m"
        ])

    def attach(self) -> None:
        """Attach to the tmux session."""
        subprocess.run(["tmux", "attach-session", "-t", self.session_name])

    def kill_session(self) -> None:
        """Kill the tmux session."""
        if self.session_exists():
            subprocess.run(["tmux", "kill-session", "-t", self.session_name])
            print(f"Killed tmux session '{self.session_name}'")

    def get_pane_count(self) -> int:
        """Get the number of panes in the session."""
        if not self.session_exists():
            return 0

        result = subprocess.run([
            "tmux", "list-panes",
            "-t", self.session_name,
            "-F", "#{pane_index}"
        ], capture_output=True, text=True)

        return len(result.stdout.strip().split('\n'))


if __name__ == "__main__":
    # Test the tmux manager
    manager = TmuxManager("test-session")
    agents = ["frontend-architect", "backend-architect", "test-architect", "qa-engineer"]

    manager.create_session(agents, "/tmp")

    for idx, agent in enumerate(agents):
        manager.send_command(idx, f"echo 'Starting {agent}...'")

    print("Session created. Run: tmux attach-session -t test-session")
