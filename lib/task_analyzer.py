#!/usr/bin/env python3
"""
Task analyzer - determines which agents are needed based on project spec.
"""
import re
from typing import List, Set, Dict, Optional
from pathlib import Path


class TaskAnalyzer:
    """Analyze project requirements and determine which agents to spawn."""

    # Map of keywords to agent types
    KEYWORD_AGENT_MAP = {
        'frontend-architect': [
            'react', 'vue', 'svelte', 'component', 'ui', 'css', 'tailwind',
            'frontend', 'client', 'web', 'typescript', 'jsx', 'tsx'
        ],
        'backend-architect': [
            'api', 'backend', 'server', 'database', 'auth', 'authentication',
            'endpoint', 'rest', 'graphql', 'node', 'python', 'go', 'rust'
        ],
        'devops-engineer': [
            'docker', 'kubernetes', 'k8s', 'ci/cd', 'deployment', 'infra',
            'terraform', 'aws', 'gcp', 'azure', 'pipeline', 'github actions'
        ],
        'qa-engineer': [
            'e2e', 'integration test', 'test plan', 'playwright', 'cypress',
            'testing strategy', 'manual test', 'qa'
        ],
        'test-architect': [
            'unit test', 'jest', 'vitest', 'pytest', 'test coverage',
            'mocking', 'tdd'
        ],
        'database-architect': [
            'schema', 'migration', 'database design', 'sql', 'postgres',
            'mongodb', 'query optimization', 'index'
        ],
        'api-designer': [
            'openapi', 'api spec', 'api contract', 'graphql schema',
            'api design', 'swagger'
        ],
        'security-auditor': [
            'security', 'vulnerability', 'owasp', 'pen test', 'auth',
            'encryption', 'security review'
        ],
        'documentation-writer': [
            'readme', 'documentation', 'api docs', 'guide', 'tutorial'
        ]
    }

    # Fallback agent if nothing else matches
    FALLBACK_AGENT = 'fullstack-dev'

    def __init__(self, available_agents: List[str]):
        """
        Initialize task analyzer.

        Args:
            available_agents: List of available agent names
        """
        self.available_agents = set(available_agents)

    def analyze_workplan(self, workplan_content: str) -> List[str]:
        """
        Analyze WORKPLAN.md content and determine required agents.

        Args:
            workplan_content: Content of WORKPLAN.md

        Returns:
            List of agent names to spawn
        """
        required_agents = set()

        # First, check for explicit @agent mentions
        explicit_agents = self._find_explicit_agents(workplan_content)
        required_agents.update(explicit_agents)

        # If no explicit agents, analyze content for keywords
        if not required_agents:
            keyword_agents = self._analyze_by_keywords(workplan_content)
            required_agents.update(keyword_agents)

        # Filter to only available agents
        required_agents = required_agents.intersection(self.available_agents)

        # If still no agents found, use fallback
        if not required_agents and self.FALLBACK_AGENT in self.available_agents:
            required_agents.add(self.FALLBACK_AGENT)

        return sorted(list(required_agents))

    def analyze_project_structure(self, project_dir: str) -> List[str]:
        """
        Analyze project directory structure to determine agents.

        Args:
            project_dir: Path to project directory

        Returns:
            List of agent names to spawn
        """
        required_agents = set()
        project_path = Path(project_dir)

        # Check for frontend indicators
        if any([
            (project_path / 'frontend').exists(),
            (project_path / 'client').exists(),
            (project_path / 'web').exists(),
            (project_path / 'src' / 'components').exists(),
            (project_path / 'package.json').exists(),
        ]):
            required_agents.add('frontend-architect')

        # Check for backend indicators
        if any([
            (project_path / 'backend').exists(),
            (project_path / 'server').exists(),
            (project_path / 'api').exists(),
            (project_path / 'requirements.txt').exists(),
            (project_path / 'go.mod').exists(),
            (project_path / 'Cargo.toml').exists(),
        ]):
            required_agents.add('backend-architect')

        # Check for DevOps indicators
        if any([
            (project_path / 'Dockerfile').exists(),
            (project_path / 'docker-compose.yml').exists(),
            (project_path / '.github' / 'workflows').exists(),
            (project_path / 'infra').exists(),
            (project_path / 'terraform').exists(),
        ]):
            required_agents.add('devops-engineer')

        # Check for test indicators
        if any([
            (project_path / 'tests').exists(),
            (project_path / 'test').exists(),
            (project_path / '__tests__').exists(),
        ]):
            required_agents.add('test-architect')
            required_agents.add('qa-engineer')

        # Filter to only available agents
        required_agents = required_agents.intersection(self.available_agents)

        return sorted(list(required_agents))

    def _find_explicit_agents(self, content: str) -> Set[str]:
        """Find explicitly mentioned agents (@agent-name)."""
        agents = set()

        # Look for @agent-name patterns
        pattern = r'@([\w-]+)'
        matches = re.finditer(pattern, content)

        for match in matches:
            agent_name = match.group(1)
            if agent_name in self.available_agents:
                agents.add(agent_name)

        return agents

    def _analyze_by_keywords(self, content: str) -> Set[str]:
        """Analyze content by keywords to determine agents."""
        content_lower = content.lower()
        agents = set()

        # Score each agent based on keyword matches
        agent_scores: Dict[str, int] = {}

        for agent, keywords in self.KEYWORD_AGENT_MAP.items():
            if agent not in self.available_agents:
                continue

            score = 0
            for keyword in keywords:
                # Count occurrences of each keyword
                count = content_lower.count(keyword.lower())
                score += count

            if score > 0:
                agent_scores[agent] = score

        # Select agents with scores above threshold (or top N agents)
        threshold = 2  # At least 2 keyword matches
        for agent, score in agent_scores.items():
            if score >= threshold:
                agents.add(agent)

        return agents

    def determine_agents(
        self,
        workplan_content: Optional[str] = None,
        project_dir: Optional[str] = None
    ) -> List[str]:
        """
        Determine which agents to spawn using all available information.

        Args:
            workplan_content: Content of WORKPLAN.md (if available)
            project_dir: Project directory path (if available)

        Returns:
            List of agent names to spawn
        """
        agents = set()

        # Analyze workplan if available
        if workplan_content:
            agents.update(self.analyze_workplan(workplan_content))

        # Analyze project structure if available
        if project_dir:
            agents.update(self.analyze_project_structure(project_dir))

        # If we have no agents, use fallback
        if not agents and self.FALLBACK_AGENT in self.available_agents:
            agents.add(self.FALLBACK_AGENT)

        return sorted(list(agents))


if __name__ == "__main__":
    # Test the analyzer
    analyzer = TaskAnalyzer([
        'frontend-architect', 'backend-architect', 'devops-engineer',
        'qa-engineer', 'test-architect', 'fullstack-dev'
    ])

    sample_workplan = """
    ## @frontend-architect Tasks
    - Build the dashboard UI
    - Create React components

    ## @backend-architect Tasks
    - Create REST API
    - Set up PostgreSQL database
    """

    agents = analyzer.analyze_workplan(sample_workplan)
    print(f"Required agents: {agents}")
