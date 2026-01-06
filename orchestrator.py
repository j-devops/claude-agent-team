#!/usr/bin/env python3
"""
Multi-Agent Team Orchestrator

Launches a team of Claude Code agents in tmux panes to work on a project.
"""
import os
import sys
import argparse
import time
from pathlib import Path
from typing import List, Optional

# Add lib directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'lib'))

from spec_parser import SpecParser, ProjectSpec
from task_analyzer import TaskAnalyzer
from tmux_manager import TmuxManager
from agent_spawner import AgentSpawner


class AgentOrchestrator:
    """Main orchestrator for the multi-agent system."""

    def __init__(self, project_dir: str, agent_team_dir: Optional[str] = None, workspace_dir: Optional[str] = None):
        """
        Initialize the orchestrator.

        Args:
            project_dir: Directory of the project to work on
            agent_team_dir: Directory containing agent specifications
                          (defaults to directory containing this script)
            workspace_dir: Directory containing WORKPLAN.md and orchestration files
                         (defaults to project_dir for backward compatibility)
        """
        self.project_dir = os.path.abspath(project_dir)

        if agent_team_dir is None:
            agent_team_dir = os.path.dirname(os.path.abspath(__file__))

        self.agent_team_dir = agent_team_dir

        # Workspace directory (where WORKPLAN.md, PROGRESS.md live)
        if workspace_dir is None:
            workspace_dir = self.project_dir  # Backward compatibility
        self.workspace_dir = os.path.abspath(workspace_dir)

        # Initialize components (use workspace_dir for spec parser)
        self.spec_parser = SpecParser(self.workspace_dir)
        self.agent_spawner = AgentSpawner(self.agent_team_dir)
        self.task_analyzer = TaskAnalyzer(self.agent_spawner.get_available_agents())
        self.tmux_manager = TmuxManager("agent-team")

    def analyze_project(self) -> tuple[ProjectSpec, List[str]]:
        """
        Analyze the project and determine which agents to spawn.

        Returns:
            Tuple of (project_spec, required_agents)
        """
        print("Analyzing project...")

        # Try to parse spec
        try:
            spec = self.spec_parser.parse()
            print(f"  Project: {spec.project_name}")
            print(f"  Description: {spec.description}")

            # Get agents from workplan
            required_agents = list(spec.agent_tasks.keys())

            if required_agents:
                print(f"  Found {len(required_agents)} agents in WORKPLAN.md")
            else:
                print("  No agents explicitly defined in WORKPLAN.md")
                print("  Analyzing project structure...")

                # Fall back to structure analysis
                required_agents = self.task_analyzer.determine_agents(
                    project_dir=self.project_dir
                )

        except FileNotFoundError:
            print("  No WORKPLAN.md found - analyzing project structure...")
            spec = None
            required_agents = self.task_analyzer.determine_agents(
                project_dir=self.project_dir
            )

        if not required_agents:
            print("\n  Warning: Could not determine required agents.")
            print("  Please create a WORKPLAN.md or specify agents manually.")
            sys.exit(1)

        print(f"\n  Required agents ({len(required_agents)}):")
        for agent in required_agents:
            print(f"    - {agent}")

        return spec, required_agents

    def setup_tmux_session(self, agents: List[str]) -> None:
        """
        Set up the tmux session with panes for each agent.

        Args:
            agents: List of agent names to create panes for
        """
        print(f"\nSetting up tmux session with {len(agents)} panes...")
        self.tmux_manager.create_session(agents, self.project_dir)

    def spawn_agents(self, spec: Optional[ProjectSpec], agents: List[str]) -> None:
        """
        Spawn agents in their respective tmux panes.

        Args:
            spec: Project specification (if available)
            agents: List of agents to spawn
        """
        print("\nSpawning agents...")

        for idx, agent_name in enumerate(agents):
            print(f"  [{idx + 1}/{len(agents)}] Starting {agent_name}...")

            # Get workplan section for this agent if available
            workplan_section = None
            if spec and agent_name in spec.agent_tasks:
                workplan_section = spec.agent_tasks[agent_name].section_content

            # Generate the agent command with workplan tasks
            command = self.agent_spawner.generate_agent_command(
                agent_name=agent_name,
                project_dir=self.project_dir,
                workspace_dir=self.workspace_dir,
                workplan_section=workplan_section
            )

            # Send command to the tmux pane
            self.tmux_manager.send_command(idx, command)

            # Small delay to avoid overwhelming the system
            time.sleep(0.5)

    def run(self, auto_attach: bool = True) -> None:
        """
        Run the full orchestration process.

        Args:
            auto_attach: Whether to automatically attach to the tmux session
        """
        print("=" * 60)
        print("MULTI-AGENT ORCHESTRATOR")
        print("=" * 60)
        print(f"Project: {self.project_dir}\n")

        # Analyze project and determine agents
        spec, agents = self.analyze_project()

        # Set up tmux session
        self.setup_tmux_session(agents)

        # Spawn agents in tmux panes
        self.spawn_agents(spec, agents)

        print("\n" + "=" * 60)
        print("ORCHESTRATION COMPLETE")
        print("=" * 60)
        print(f"\nAll {len(agents)} agents are now running in tmux.")
        print(f"Session name: {self.tmux_manager.session_name}")
        print("\nCommands:")
        print(f"  Attach:  tmux attach-session -t {self.tmux_manager.session_name}")
        print(f"  Detach:  Press Ctrl+B then D")
        print(f"  Kill:    tmux kill-session -t {self.tmux_manager.session_name}")

        # Attach to session
        if auto_attach:
            print("\nAttaching to tmux session in 2 seconds...")
            print("(Press Ctrl+C to cancel)")
            try:
                time.sleep(2)
                self.tmux_manager.attach()
            except KeyboardInterrupt:
                print("\n\nCanceled. Use the commands above to attach manually.")


def main():
    """CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Launch a multi-agent development team in tmux",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Launch agents for a project (auto-detect from WORKPLAN.md)
  %(prog)s /path/to/project

  # Specify custom agent-team directory
  %(prog)s /path/to/project --agent-dir ~/my-agents

  # Don't auto-attach to tmux
  %(prog)s /path/to/project --no-attach
        """
    )

    parser.add_argument(
        'project_dir',
        help='Path to the project directory'
    )

    parser.add_argument(
        '--agent-dir',
        help='Path to agent specifications directory (default: script directory)',
        default=None
    )

    parser.add_argument(
        '--no-attach',
        action='store_true',
        help="Don't automatically attach to tmux session"
    )

    parser.add_argument(
        '--workspace',
        help='Path to workspace directory containing WORKPLAN.md and other orchestration files',
        default=None
    )

    args = parser.parse_args()

    # Validate project directory
    if not os.path.isdir(args.project_dir):
        print(f"Error: Project directory not found: {args.project_dir}")
        sys.exit(1)

    # Run orchestrator
    orchestrator = AgentOrchestrator(
        project_dir=args.project_dir,
        agent_team_dir=args.agent_dir,
        workspace_dir=args.workspace
    )

    orchestrator.run(auto_attach=not args.no_attach)


if __name__ == "__main__":
    main()
