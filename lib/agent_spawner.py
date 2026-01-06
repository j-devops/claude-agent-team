#!/usr/bin/env python3
"""
Agent spawner - launches Claude Code agents with appropriate context.
"""
import os
import json
from typing import Dict, List, Optional
from pathlib import Path


class AgentSpawner:
    """Spawn Claude Code agents with context from spec files."""

    def __init__(self, agent_team_dir: str, include_claude_agents: bool = True):
        """
        Initialize the agent spawner.

        Args:
            agent_team_dir: Path to the agent-team directory containing agent specs
            include_claude_agents: Whether to also load agents from ~/.claude/agents/
        """
        self.agent_team_dir = agent_team_dir
        self.include_claude_agents = include_claude_agents
        self.agent_specs = self._load_agent_specs()

    def _load_agent_specs(self) -> Dict[str, str]:
        """
        Load all agent specification files from multiple directories.

        Priority:
        1. ~/.claude/agents/ (user's custom agents)
        2. agent-team directory (bundled agents)

        Returns a dict mapping agent_name -> agent_spec_path
        """
        agent_specs = {}

        # First load from agent-team directory (lower priority)
        agent_dir = Path(self.agent_team_dir)
        agent_specs.update(self._load_from_directory(agent_dir))

        # Then load from ~/.claude/agents/ (higher priority, will override)
        if self.include_claude_agents:
            claude_agents_dir = Path.home() / '.claude' / 'agents'
            if claude_agents_dir.exists():
                agent_specs.update(self._load_from_directory(claude_agents_dir))

        return agent_specs

    def _load_from_directory(self, directory: Path) -> Dict[str, str]:
        """Load agent specs from a specific directory."""
        agents = {}

        if not directory.exists():
            return agents

        # Look for all .md files that aren't README, CLAUDE, or WORKPLAN
        for md_file in directory.glob("*.md"):
            filename = md_file.name.lower()

            if filename in ["readme.md", "claude.md", "workplan.template.md"]:
                continue

            # Extract agent name from filename (e.g., "frontend-architect.md" -> "frontend-architect")
            agent_name = md_file.stem

            agents[agent_name] = str(md_file)

        return agents

    def get_available_agents(self) -> List[str]:
        """Get list of available agent names."""
        return list(self.agent_specs.keys())

    def generate_agent_command(
        self,
        agent_name: str,
        project_dir: str,
        workspace_dir: Optional[str] = None,
        task_context: Optional[str] = None,
        workplan_section: Optional[str] = None
    ) -> str:
        """
        Generate the command to launch a Claude Code agent.

        Args:
            agent_name: Name of the agent to spawn
            project_dir: Project directory to work in (where code lives)
            workspace_dir: Workspace directory (where WORKPLAN.md, PROGRESS.md live)
            task_context: Optional additional context for the agent
            workplan_section: Optional section from WORKPLAN.md for this agent

        Returns:
            Shell command to launch the agent
        """
        if agent_name not in self.agent_specs:
            raise ValueError(f"Unknown agent: {agent_name}")

        agent_spec_path = self.agent_specs[agent_name]

        # Default workspace to project dir if not specified
        if workspace_dir is None:
            workspace_dir = project_dir

        # Build the initial prompt for the agent
        prompt_parts = [
            f"You are the {agent_name} agent.",
            f"\n## Working Directories",
            f"- **Project directory** (where you modify code): {project_dir}",
            f"- **Workspace directory** (where orchestration files live): {workspace_dir}",
            f"\nYou execute in the project directory. All code changes happen there.",
            f"Read WORKPLAN.md and write PROGRESS.md to the workspace directory.",
        ]

        if workplan_section:
            prompt_parts.append("\n## Your Assigned Tasks\n")
            prompt_parts.append(workplan_section)

        if task_context:
            prompt_parts.append("\n## Additional Context\n")
            prompt_parts.append(task_context)

        prompt_parts.append(f"\n\n## File Locations")
        prompt_parts.append(f"- Read: {workspace_dir}/WORKPLAN.md")
        prompt_parts.append(f"- Read: {workspace_dir}/CLAUDE.md (if exists)")
        prompt_parts.append(f"- Write: {workspace_dir}/PROGRESS.md")
        prompt_parts.append(f"- Modify code in: {project_dir}/")
        prompt_parts.append("\nStart working on your assigned tasks. Report progress as you go.")

        initial_prompt = "\n\n".join(prompt_parts)

        # Construct the Claude Code command
        # Use a heredoc to safely pass the initial prompt without shell interpretation
        command = f'''cd "{project_dir}" && \\
echo "=== Starting {agent_name.upper()} ===" && \\
echo && \\
cat <<'AGENT_PROMPT_EOF' | claude --agent "{agent_spec_path}" --dangerously-skip-permissions
{initial_prompt}
AGENT_PROMPT_EOF
'''

        return command

    def generate_interactive_command(
        self,
        agent_name: str,
        project_dir: str,
    ) -> str:
        """
        Generate command for interactive agent session.

        This keeps the agent running in an interactive mode where it can be
        given additional instructions.
        """
        if agent_name not in self.agent_specs:
            raise ValueError(f"Unknown agent: {agent_name}")

        agent_spec_path = self.agent_specs[agent_name]

        command = f'''cd "{project_dir}" && \\
echo "=== {agent_name.upper()} READY ===" && \\
echo "Working directory: {project_dir}" && \\
echo "Agent spec: {agent_spec_path}" && \\
echo && \\
claude --agent "{agent_spec_path}" --dangerously-skip-permissions
'''
        return command

    def create_agent_workspace(
        self,
        agent_name: str,
        project_dir: str,
        workplan_section: Optional[str] = None
    ) -> str:
        """
        Create a workspace file for the agent with its instructions.

        This creates a temporary file that the agent can reference.

        Returns:
            Path to the workspace file
        """
        workspace_dir = os.path.join(project_dir, ".agent-team")
        os.makedirs(workspace_dir, exist_ok=True)

        workspace_file = os.path.join(workspace_dir, f"{agent_name}-workspace.md")

        content = f"""# {agent_name.replace('-', ' ').title()} Workspace

## Project Directory
{project_dir}

## Agent Specification
{self.agent_specs[agent_name]}

## Your Tasks
"""

        if workplan_section:
            content += workplan_section
        else:
            content += "See WORKPLAN.md in the project directory for your tasks.\n"

        content += """

## Instructions

1. Read the WORKPLAN.md in the project directory
2. Read the CLAUDE.md for coordination rules
3. Execute your assigned tasks
4. Create/modify files only in your designated domain
5. Import shared types from the contracts directory
6. Report progress and blockers

## Progress Log

Add notes here as you work:

"""

        with open(workspace_file, 'w') as f:
            f.write(content)

        return workspace_file


if __name__ == "__main__":
    # Test the agent spawner
    import sys

    agent_team_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    spawner = AgentSpawner(agent_team_dir)

    print("Available agents:")
    for agent in spawner.get_available_agents():
        print(f"  - {agent}")

    print("\nExample command for frontend-architect:")
    cmd = spawner.generate_agent_command(
        "frontend-architect",
        "/tmp/test-project",
        workplan_section="- Build the dashboard\n- Create login page"
    )
    print(cmd)
