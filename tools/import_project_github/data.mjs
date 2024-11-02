export const data = {
  project: {
    milestones: [
      {
        title: "Foundation and Core Integration",
        description: "Establish core system components including database setup, LLM integration, and basic authentication",
        due_date: null,
        last_updated: "2024-11-01",
        issues: [
          {
            title: "Database & Supabase Setup",
            description: "Define and implement database schema, relationships, and core functions",
            due_date: null,
            tasks: [
              "- [ ] Define schema for task, user, memory, and trust levels",
              "- [ ] Implement tables and relationships",
              "- [ ] Set up Supabase functions for data manipulation"
            ],
            references: [
              {
                description: "Supabase Documentation",
                link: "docs/supabase/setup.md"
              }
            ]
          },
          {
            title: "LLM & API Integration",
            description: "Implement core LLM functionality and API integration",
            due_date: null,
            tasks: [
              "- [ ] Select appropriate LLM API",
              "- [ ] Implement core task introspection",
              "- [ ] Build prompt templates"
            ],
            references: [
              {
                description: "LLM Integration Guide",
                link: "docs/llm/integration.md"
              }
            ]
          },
          {
            title: "Authentication Setup",
            description: "Implement basic authentication and authorization system",
            due_date: null,
            tasks: [
              "- [ ] Establish authentication layer",
              "- [ ] Configure role-based permissions",
              "- [ ] Set up initial testing environment"
            ],
            references: [
              {
                description: "Auth Configuration Guide",
                link: "docs/auth/setup.md"
              }
            ]
          }
        ]
      },
      {
        title: "Conversation Interface Development",
        description: "Develop the user interface for voice and text interactions",
        due_date: null,
        last_updated: "2024-11-01",
        issues: [
          {
            title: "Voice and Text Interface Implementation",
            description: "Create the primary user interaction interface",
            due_date: null,
            tasks: [
              "- [ ] Set up Next.js and React interface",
              "- [ ] Integrate Web Speech API",
              "- [ ] Design UI/UX for input switching"
            ],
            references: [
              {
                description: "Interface Design Specs",
                link: "docs/ui/interface-specs.md"
              }
            ]
          },
          {
            title: "Conversation History System",
            description: "Implement conversation tracking and storage",
            due_date: null,
            tasks: [
              "- [ ] Create interaction history logging",
              "- [ ] Implement context continuity",
              "- [ ] Design history retrieval system"
            ],
            references: [
              {
                description: "History Tracking Guide",
                link: "docs/conversation/history.md"
              }
            ]
          }
        ]
      },
      {
        title: "Task Management and Execution",
        description: "Build core task management system with pipeline structure",
        due_date: null,
        last_updated: "2024-11-01",
        issues: [
          {
            title: "Pipeline Structure Implementation",
            description: "Develop the task management pipeline",
            due_date: null,
            tasks: [
              "- [ ] Implement task categorization",
              "- [ ] Design queue system",
              "- [ ] Set up dependency handling"
            ],
            references: [
              {
                description: "Pipeline Architecture",
                link: "docs/pipeline/architecture.md"
              }
            ]
          },
          {
            title: "Trust and Approval System",
            description: "Implement trust levels and approval workflows",
            due_date: null,
            tasks: [
              "- [ ] Define trust levels",
              "- [ ] Implement approval workflows",
              "- [ ] Create trust adjustment system"
            ],
            references: [
              {
                description: "Trust System Design",
                link: "docs/trust/system-design.md"
              }
            ]
          }
        ]
      },
      {
        title: "Context and Autonomous Execution",
        description: "Implement context gathering and autonomous execution capabilities",
        due_date: null,
        last_updated: "2024-11-01",
        issues: [
          {
            title: "System Access Module Development",
            description: "Create secure system access interfaces",
            due_date: null,
            tasks: [
              "- [ ] Implement filesystem access",
              "- [ ] Set up Git integration",
              "- [ ] Create database access layer"
            ],
            references: [
              {
                description: "System Access Documentation",
                link: "docs/system/access.md"
              }
            ]
          }
        ]
      },
      {
        title: "Memory and Knowledge Graph",
        description: "Develop knowledge storage and retrieval system",
        due_date: null,
        last_updated: "2024-11-01",
        issues: [
          {
            title: "Knowledge Graph Implementation",
            description: "Design and implement the knowledge graph structure",
            due_date: null,
            tasks: [
              "- [ ] Design graph structure",
              "- [ ] Implement storage system",
              "- [ ] Create retrieval interface"
            ],
            references: [
              {
                description: "Knowledge Graph Design",
                link: "docs/knowledge/graph-design.md"
              }
            ]
          }
        ]
      },
      {
        title: "Testing and Deployment",
        description: "Comprehensive testing and production deployment",
        due_date: null,
        last_updated: "2024-11-01",
        issues: [
          {
            title: "Testing Implementation",
            description: "Perform comprehensive system testing",
            due_date: null,
            tasks: [
              "- [ ] Implement unit tests",
              "- [ ] Perform integration testing",
              "- [ ] Conduct security audits"
            ],
            references: [
              {
                description: "Testing Strategy",
                link: "docs/testing/strategy.md"
              }
            ]
          },
          {
            title: "Production Deployment",
            description: "Deploy system to production environment",
            due_date: null,
            tasks: [
              "- [ ] Set up production environment",
              "- [ ] Implement monitoring",
              "- [ ] Configure analytics"
            ],
            references: [
              {
                description: "Deployment Guide",
                link: "docs/deployment/guide.md"
              }
            ]
          }
        ]
      }
    ]
  }
};