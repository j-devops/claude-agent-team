#!/usr/bin/env python3
"""
Parse WORKPLAN.md and CLAUDE.md to extract task assignments and agent requirements.
"""
import os
import re
from typing import Dict, List, Optional
from dataclasses import dataclass


@dataclass
class AgentTask:
    """Represents a task assigned to a specific agent."""
    agent: str
    phase: str
    tasks: List[str]
    section_content: str


@dataclass
class ProjectSpec:
    """Parsed project specification."""
    project_name: str
    description: str
    tech_stack: Dict[str, str]
    agent_tasks: Dict[str, AgentTask]  # agent_name -> AgentTask
    shared_contracts: Optional[str]


class SpecParser:
    """Parse project specifications from WORKPLAN.md and CLAUDE.md."""

    AGENT_PATTERN = r'##\s+@([\w-]+)\s+Tasks'

    def __init__(self, project_dir: str):
        self.project_dir = project_dir
        self.workplan_path = os.path.join(project_dir, 'WORKPLAN.md')
        self.claude_md_path = os.path.join(project_dir, 'CLAUDE.md')

    def parse(self) -> ProjectSpec:
        """Parse the project specification."""
        workplan_exists = os.path.exists(self.workplan_path)
        claude_md_exists = os.path.exists(self.claude_md_path)

        if not workplan_exists and not claude_md_exists:
            raise FileNotFoundError(
                f"Neither WORKPLAN.md nor CLAUDE.md found in {self.project_dir}"
            )

        # Parse WORKPLAN.md for task breakdown
        agent_tasks = {}
        project_name = "Unknown Project"
        description = ""
        tech_stack = {}
        shared_contracts = None

        if workplan_exists:
            with open(self.workplan_path, 'r') as f:
                content = f.read()

            # Extract project overview
            project_name = self._extract_field(content, r'\*\*Name\*\*:\s*(.+)')
            description = self._extract_field(content, r'\*\*Description\*\*:\s*(.+)')
            tech_stack = self._extract_tech_stack(content)
            shared_contracts = self._extract_shared_contracts(content)

            # Extract agent tasks
            agent_tasks = self._extract_agent_tasks(content)

        return ProjectSpec(
            project_name=project_name or "Unknown Project",
            description=description or "",
            tech_stack=tech_stack,
            agent_tasks=agent_tasks,
            shared_contracts=shared_contracts
        )

    def _extract_field(self, content: str, pattern: str) -> Optional[str]:
        """Extract a single field using regex."""
        match = re.search(pattern, content)
        return match.group(1).strip() if match else None

    def _extract_tech_stack(self, content: str) -> Dict[str, str]:
        """Extract technology stack information."""
        tech_stack = {}
        tech_section = re.search(
            r'\*\*Tech Stack\*\*:\s*\n((?:- .+\n)+)',
            content
        )

        if tech_section:
            for line in tech_section.group(1).split('\n'):
                if ':' in line:
                    key, value = line.replace('- ', '').split(':', 1)
                    tech_stack[key.strip()] = value.strip()

        return tech_stack

    def _extract_shared_contracts(self, content: str) -> Optional[str]:
        """Extract shared contracts section."""
        contracts_match = re.search(
            r'## Shared Contracts\n\n.+?Location:\s*`([^`]+)`',
            content,
            re.DOTALL
        )
        return contracts_match.group(1) if contracts_match else None

    def _extract_agent_tasks(self, content: str) -> Dict[str, AgentTask]:
        """Extract tasks for each agent from WORKPLAN.md."""
        agent_tasks = {}

        # Find all agent sections
        sections = re.split(r'\n##\s+@([\w-]+)\s+Tasks\s*\n', content)

        # sections will be: [preamble, agent1, content1, agent2, content2, ...]
        for i in range(1, len(sections), 2):
            if i + 1 >= len(sections):
                break

            agent_name = sections[i].strip()
            section_content = sections[i + 1]

            # Extract phases and tasks
            tasks = self._parse_task_section(section_content)

            # Get first phase name if available
            phase_match = re.search(r'###\s+(.+)', section_content)
            phase = phase_match.group(1).strip() if phase_match else "Main"

            agent_tasks[agent_name] = AgentTask(
                agent=agent_name,
                phase=phase,
                tasks=tasks,
                section_content=section_content
            )

        return agent_tasks

    def _parse_task_section(self, content: str) -> List[str]:
        """Parse individual tasks from a section."""
        tasks = []
        # Find all checkbox items
        task_matches = re.finditer(r'- \[[ x]\]\s+(.+)', content)
        for match in task_matches:
            tasks.append(match.group(1).strip())
        return tasks

    def get_required_agents(self) -> List[str]:
        """Get list of agent names that have assigned tasks."""
        spec = self.parse()
        return list(spec.agent_tasks.keys())

    def get_agent_context(self, agent_name: str) -> Optional[str]:
        """Get the full context for a specific agent."""
        spec = self.parse()

        if agent_name not in spec.agent_tasks:
            return None

        agent_task = spec.agent_tasks[agent_name]

        context = f"""# Project Context

**Project**: {spec.project_name}
**Description**: {spec.description}

## Tech Stack
"""

        for key, value in spec.tech_stack.items():
            context += f"- **{key}**: {value}\n"

        if spec.shared_contracts:
            context += f"\n**Shared Contracts Location**: `{spec.shared_contracts}`\n"

        context += f"\n## Your Tasks\n\n{agent_task.section_content}\n"

        return context


if __name__ == "__main__":
    # Test the parser
    import sys

    if len(sys.argv) < 2:
        print("Usage: spec_parser.py <project_dir>")
        sys.exit(1)

    parser = SpecParser(sys.argv[1])
    spec = parser.parse()

    print(f"Project: {spec.project_name}")
    print(f"Description: {spec.description}")
    print(f"\nRequired agents: {list(spec.agent_tasks.keys())}")
    print(f"\nTech Stack: {spec.tech_stack}")
