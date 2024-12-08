import { getInstance, Inject, Service } from "@brainstack/inject";
import { WorkflowRegistry } from "./registry";
import { WorkflowDefinition } from "./types"; // Assuming you have types defined

@Service
export class WorkflowRegistryService {
    private registry: WorkflowRegistry;

    constructor() {
        this.registry = getInstance(WorkflowRegistry);
    }

    async registerWorkflow(workflowDefinition: WorkflowDefinition) {
        return this.registry.registerWorkflow(workflowDefinition);
    }

    getWorkflowById(id: string): WorkflowDefinition | undefined {
        return this.registry.getWorkflowById(id);
    }

    getAllWorkflows(): WorkflowDefinition[] {
        return this.registry.getAllWorkflows();
    }

    public static createWorkflow(
        config: Omit<WorkflowDefinition, 'id'|'start'>,
    ): WorkflowDefinition {
        return WorkflowRegistry.createWorkflow(config);
    }
}
