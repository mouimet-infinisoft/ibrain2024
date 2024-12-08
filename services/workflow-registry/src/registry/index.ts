import { Inject, Service } from "@brainstack/inject";
import { LoggerService } from "../../../logger/logger.service";
import { AiService } from "../../../ai/ai.service";
import { WorkflowDefinition } from "../types";
import { v4 as uuidv4 } from 'uuid';

export class WorkflowRegistry {
    // Store workflows in a private collection for controlled access
    private workflows: Map<string, WorkflowDefinition> = new Map();

    constructor(
        @Inject private aiService: AiService,
        @Inject private logger: LoggerService
    ) {
        this.logger.verbose("Initializing WorkflowRegistryService");
    }

    // Register a new workflow with semantic vector generation
    public async registerWorkflow(workflow: WorkflowDefinition): Promise<void> {
        this.logger.info(`Registering Workflow: ${workflow.name}`);

        try {
            // Generate semantic vector for workflow
            const combinedText = [
                workflow.name,
                workflow.description,
                ...workflow.triggerKeywords
            ].join(" ");

            workflow.semanticVector = await this.aiService.createEmbedding(combinedText);

            this.logger.verbose(
                `Semantic Vector Generated for ${workflow.name}`,
                {
                    vectorDimensions: workflow.semanticVector.length,
                    triggerKeywords: workflow.triggerKeywords,
                }
            );

            // Store workflow using its ID as the key
            this.workflows.set(workflow.id, workflow);

            this.logger.info(`Workflow ${workflow.name} Successfully Registered`);
        } catch (error) {
            this.logger.error(`Failed to Register Workflow ${workflow.name}`, error);
            throw error; // Re-throw to allow caller to handle registration failures
        }
    }

    // Retrieve a workflow by its ID
    public getWorkflowById(workflowId: string): WorkflowDefinition | undefined {
        return this.workflows.get(workflowId);
    }

    // Get all registered workflows
    public getAllWorkflows(): WorkflowDefinition[] {
        return Array.from(this.workflows.values());
    }

    // Update workflow embeddings with a continuous learning approach
    public async updateWorkflowEmbeddings(
        workflowId: string, 
        newContext: string
    ): Promise<void> {
        this.logger.info(`Updating Workflow Embeddings`, {
            workflowId,
            newContextLength: newContext.length,
        });

        const workflow = this.workflows.get(workflowId);
        if (workflow) {
            try {
                const newEmbedding = await this.aiService.createEmbedding(newContext);

                // Update semantic vector with moving average
                if (workflow.semanticVector) {
                    workflow.semanticVector = workflow.semanticVector.map((oldVal, index) => 
                        (oldVal + newEmbedding[index]) / 2
                    );

                    this.logger.verbose(
                        `Workflow ${workflowId} Embedding Updated`,
                        {
                            newEmbeddingDimensions: newEmbedding.length,
                        }
                    );

                    // Update the workflow in the registry
                    this.workflows.set(workflowId, workflow);
                }
            } catch (error) {
                this.logger.error(
                    `Failed to Update Workflow ${workflowId} Embeddings`,
                    error
                );
            }
        } else {
            this.logger.warn(
                `Workflow ${workflowId} Not Found for Embedding Update`
            );
        }
    }

    // Optional: Method to remove a workflow
    public removeWorkflow(workflowId: string): boolean {
        return this.workflows.delete(workflowId);
    }

    // Static Factory Method for Creating Workflows
    public static createWorkflow(config: Partial<WorkflowDefinition>): WorkflowDefinition {
        // Validate and set default values
        const workflow: WorkflowDefinition = {
            // Generate a unique ID if not provided
            id: config.id || uuidv4(),

            // Required properties with default fallbacks
            name: config.name || 'Unnamed Workflow',
            description: config.description || 'No description provided',
            
            // Default to empty arrays if not provided
            triggerKeywords: config.triggerKeywords || [],
            
            // Ensure intent signature has default values
            intentSignature: {
                primaryDomains: config.intentSignature?.primaryDomains || [],
                secondaryContexts: config.intentSignature?.secondaryContexts || [],
                requiredCapabilities: config.intentSignature?.requiredCapabilities || [],
                complexityLevel: config.intentSignature?.complexityLevel || 0,
            },

            // // Optional properties can be passed through
            // priority: config.priority ?? 0,
            // isEnabled: config.isEnabled ?? true,

            // // Initialize semantic vector as null
            // semanticVector: config.semanticVector || null,

            // Allow additional custom properties
            ...config
        };

        // Additional Validation
        this.validateWorkflow(workflow);

        return workflow;
    }

    // Workflow Validation Method
    private static validateWorkflow(workflow: WorkflowDefinition): void {
        // Name validation
        if (!workflow.name || workflow.name.trim().length === 0) {
            throw new Error('Workflow must have a non-empty name');
        }

        // Unique ID validation
        if (!workflow.id) {
            throw new Error('Workflow must have a unique identifier');
        }

        // Trigger keywords recommendation (not a hard requirement)
        if (!workflow.triggerKeywords || workflow.triggerKeywords.length === 0) {
            console.warn(`Workflow ${workflow.name} has no trigger keywords, which may affect intent matching`);
        }

        // Intent signature validation
        if (!workflow.intentSignature) {
            throw new Error('Workflow must have an intent signature');
        }
    }

    // Example usage method to demonstrate factory and registration
    public async registerNewWorkflow(config: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> {
        // Use the static factory method to create a validated workflow
        const workflow = WorkflowRegistry.createWorkflow(config);

        // Register the workflow
        await this.registerWorkflow(workflow);

        return workflow;
    }
}
