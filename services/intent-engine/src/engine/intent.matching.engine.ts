import natural from "natural";
import { Inject } from "@brainstack/inject";
import { LogLevel } from "@brainstack/log";
import { AiService } from "../../../ai/ai.service";
import { LoggerService } from "../../../logger/logger.service";
import { intentAnalysisSchema } from "../schemas/intent.schema";
import { CoreMessage } from "ai";
import dotenv from "dotenv";

dotenv.config();

// Multi-Dimensional Intent Representation
interface WorkflowDefinition {
    id: string;
    name: string;
    description: string;
    intentSignature: {
        primaryDomains: string[];
        secondaryContexts: string[];
        complexityLevel: number;
        requiredCapabilities: string[];
    };
    triggerKeywords: string[];
    semanticVector?: number[];
}

// Type definition for Intent Classification
interface IntentClassification {
    embedding: number[];
    primaryDomain: string;
    secondaryContext: string;
    intentStrength: number;
    requiredCapabilities: string[];
}

// Advanced Intent Classification System
export class IntentMatchingEngine {
    private embeddings: Map<string, number[]>;
    private intentClassifier: any;
    private workflows: WorkflowDefinition[];

    constructor(
        @Inject private aiService: AiService,
        @Inject private logger: LoggerService,
    ) {
        // this.logger.seLogLevel(LogLevel.VERBOSE);
        this.logger.verbose("Initializing IntentMatchingEngine");

        this.embeddings = new Map();
        this.workflows = [];

        // Initialize NLP tools
        this.intentClassifier = new natural.BayesClassifier();
    }

    // Semantic Similarity Calculation
    private calculateSemanticSimilarity(
        vector1: number[],
        vector2: number[],
    ): number {
        this.logger.verbose("Calculating Semantic Similarity", {
            vector1Length: vector1.length,
            vector2Length: vector2.length,
        });

        try {
            const dotProduct = vector1.reduce(
                (sum, val, i) => sum + val * vector2[i],
                0,
            );
            const magnitude1 = Math.sqrt(
                vector1.reduce((sum, val) => sum + val * val, 0),
            );
            const magnitude2 = Math.sqrt(
                vector2.reduce((sum, val) => sum + val * val, 0),
            );

            const similarity = dotProduct / (magnitude1 * magnitude2);

            this.logger.verbose("Semantic Similarity Calculation", {
                dotProduct,
                magnitude1,
                magnitude2,
                similarity,
            });

            return similarity;
        } catch (error) {
            this.logger.error(
                "Error in semantic similarity calculation",
                error,
            );
            return 0;
        }
    }

    private calculateDomainSimilarity(
        inputDomains: string[],
        workflowDomains: string[],
    ): number {
        // Ensure both inputs are valid arrays
        const safeInputDomains = inputDomains || [];
        const safeWorkflowDomains = workflowDomains || [];

        const matches = safeInputDomains.filter((domain) =>
            safeWorkflowDomains.some((wDomain) =>
                wDomain.toLowerCase().includes(domain.toLowerCase())
            )
        );
        return matches.length /
            Math.max(safeInputDomains.length, safeWorkflowDomains.length);
    }

    private calculateCapabilityAlignment(
        requiredCapabilities: string[],
        workflowCapabilities: string[],
    ): number {
        const matches = requiredCapabilities.filter((cap) =>
            workflowCapabilities.some((wCap) =>
                wCap.toLowerCase().includes(cap.toLowerCase()) ||
                cap.toLowerCase().includes(wCap.toLowerCase())
            )
        );
        return matches.length /
            Math.max(requiredCapabilities.length, workflowCapabilities.length);
    }

    // Advanced Intent Classification
    private async classifyIntent(
        userInput: string,
        conversationContext: any,
    ): Promise<IntentClassification> {
        try {
            this.logger.info("Classifying Intent", {
                userInput,
                contextAvailable: !!conversationContext,
            });

            // Multi-modal intent classification
            const inputEmbedding = await this.aiService.createEmbedding(
                userInput,
            );

            this.logger.verbose("Input Embedding Generated", {
                embeddingDimensions: inputEmbedding.length,
            });

            const messages: CoreMessage[] = [
                {
                    role: "system",
                    content:
                        `Perform advanced intent classification with multi-dimensional analysis.
          Provide a JSON response with:
          - primaryDomain: Broad category of intent
          - secondaryContext: Specific nuanced context
          - intentStrength: Confidence level of intent
          - requiredCapabilities: Specific capabilities needed`,
                },
                {
                    role: "user",
                    content: JSON.stringify({
                        userInput,
                        conversationContext,
                    }),
                },
            ];

            // LLM-Enhanced Intent Analysis
            const intentAnalysis = await this.aiService.generateObject(
                messages,
                intentAnalysisSchema,
            );

            this.logger.verbose("Intent Classification Result", intentAnalysis);

            return {
                embedding: inputEmbedding,
                primaryDomain: intentAnalysis.primaryDomains?.[0] || "general",
                secondaryContext: intentAnalysis.secondaryContexts?.[0] ||
                    "undefined",
                intentStrength: intentAnalysis.complexityLevel || 0.7,
                requiredCapabilities: intentAnalysis.requiredCapabilities || [],
            };
        } catch (error) {
            this.logger.error("Intent classification failed", error);
            return {
                embedding: new Array(1536).fill(0),
                primaryDomain: "general",
                secondaryContext: "undefined",
                intentStrength: 0.5,
                requiredCapabilities: [],
            };
        }
    }

    // Comprehensive Workflow Matching Algorithm
    public async findMostAppropriateWorkflow(
        userInput: string,
        conversationContext: any,
    ): Promise<WorkflowDefinition | null> {
        this.logger.info("Finding Most Appropriate Workflow", {
            userInput,
            workflowCount: this.workflows.length,
        });

        try {
            // Classify intent
            const intentClassification = await this.classifyIntent(
                userInput,
                conversationContext,
            );

            // Multi-Dimensional Workflow Matching
            const scoredWorkflows = this.workflows.map((workflow) => {
                this.logger.verbose(`Evaluating Workflow: ${workflow.name}`);

                // 1. Semantic Similarity
                const semanticSimilarity = workflow.semanticVector
                    ? this.calculateSemanticSimilarity(
                        intentClassification.embedding,
                        workflow.semanticVector,
                    )
                    : 0;

                // 2. Domain Matching
                const domainMatch =
                    workflow.intentSignature.primaryDomains.includes(
                            intentClassification.primaryDomain,
                        )
                        ? 1
                        : 0;

                const domainSimilarity = this.calculateDomainSimilarity(
                    workflow.intentSignature.primaryDomains,
                    [intentClassification.primaryDomain],
                );

                // 3. Context Alignment
                const contextAlignment =
                    workflow.intentSignature.secondaryContexts.includes(
                            intentClassification.secondaryContext,
                        )
                        ? 1
                        : 0;

                // 4. Capability Matching
                const capabilityMatch =
                    intentClassification.requiredCapabilities.some(
                            (capability) =>
                                workflow.intentSignature.requiredCapabilities
                                    .includes(capability),
                        )
                        ? 1
                        : 0;

                const capabilityAlignment = this.calculateCapabilityAlignment(
                    intentClassification.requiredCapabilities,
                    workflow.intentSignature.requiredCapabilities,
                );

                // 5. Keyword Matching
                const keywordMatch = workflow.triggerKeywords.some(
                        (keyword) =>
                            userInput.toLowerCase().includes(
                                keyword.toLowerCase(),
                            ),
                    )
                    ? 1
                    : 0;

                // Weighted Scoring Algorithm
                // const score = (semanticSimilarity * 0.4) +
                //     (domainMatch * 0.2) +
                //     (contextAlignment * 0.15) +
                //     (capabilityMatch * 0.15) +
                //     (keywordMatch * 0.1);

                const score = (semanticSimilarity * 0.5) + // Increased weight
                    (domainSimilarity * 0.2) +
                    (contextAlignment * 0.15) +
                    (capabilityAlignment * 0.15); // More flexible matching

                this.logger.verbose(`Workflow Scoring for ${workflow.name}`, {
                    semanticSimilarity,
                    domainMatch,
                    contextAlignment,
                    capabilityMatch,
                    keywordMatch,
                    totalScore: score,
                });

                this.logger.verbose(`Workflow Matching Details`, {
                    inputDomains: intentClassification.primaryDomain,
                    workflowDomains: workflow.intentSignature.primaryDomains,
                    domainSimilarity,
                    semanticSimilarity,
                    capabilityAlignment,
                });

                return {
                    workflow,
                    score,
                };
            });

            // Sort and select top workflow
            const sortedWorkflows = scoredWorkflows
                .sort((a, b) => b.score - a.score)
                .filter((item) => item.score > 0.5); // Confidence threshold

            this.logger.info("Workflow Matching Results", {
                totalWorkflows: scoredWorkflows.length,
                qualifiedWorkflows: sortedWorkflows.length,
                topWorkflow: sortedWorkflows.length > 0
                    ? sortedWorkflows[0].workflow.name
                    : "No matching workflow",
            });

            if (sortedWorkflows.length === 0) {
                // Fallback to most semantically similar workflow
                const fallbackWorkflow = this.workflows.reduce((
                    best,
                    current,
                ) => this.calculateSemanticSimilarity(
                        intentClassification.embedding,
                        current.semanticVector || [],
                    ) > this.calculateSemanticSimilarity(
                        intentClassification.embedding,
                        best.semanticVector || [],
                    )
                    ? current
                    : best
                );
                return fallbackWorkflow;
            }

            return sortedWorkflows.length > 0
                ? sortedWorkflows[0].workflow
                : null;
        } catch (error) {
            this.logger.error("Error in findMostAppropriateWorkflow", error);
            return null;
        }
    }

    // Workflow Registration with Enhanced Preprocessing
    public async registerWorkflow(workflow: WorkflowDefinition) {
        this.logger.info(`Registering Workflow: ${workflow.name}`);

        try {
            // Generate semantic vector for workflow
            const combinedText = [
                workflow.name,
                workflow.description,
                ...workflow.triggerKeywords,
            ].join(" ");

            workflow.semanticVector = await this.aiService.createEmbedding(
                combinedText,
            );

            this.logger.verbose(
                `Semantic Vector Generated for ${workflow.name}`,
                {
                    vectorDimensions: workflow.semanticVector.length,
                    triggerKeywords: workflow.triggerKeywords,
                },
            );

            // Train intent classifier
            workflow.triggerKeywords.forEach((keyword) => {
                this.intentClassifier.addDocument(keyword, workflow.id);
            });

            this.workflows.push(workflow);
            this.intentClassifier.train();

            this.logger.info(
                `Workflow ${workflow.name} Successfully Registered`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to Register Workflow ${workflow.name}`,
                error,
            );
        }
    }

    // Continuous Learning Mechanism
    public async updateWorkflowEmbeddings(
        workflowId: string,
        newContext: string,
    ) {
        this.logger.info(`Updating Workflow Embeddings`, {
            workflowId,
            newContextLength: newContext.length,
        });

        const workflow = this.workflows.find((w) => w.id === workflowId);
        if (workflow) {
            try {
                const newEmbedding = await this.aiService.createEmbedding(
                    newContext,
                );

                // Update semantic vector with moving average
                if (workflow.semanticVector) {
                    workflow.semanticVector = workflow.semanticVector.map((
                        oldVal,
                        index,
                    ) => (oldVal + newEmbedding[index]) / 2);

                    this.logger.verbose(
                        `Workflow ${workflowId} Embedding Updated`,
                        {
                            newEmbeddingDimensions: newEmbedding.length,
                        },
                    );
                }
            } catch (error) {
                this.logger.error(
                    `Failed to Update Workflow ${workflowId} Embeddings`,
                    error,
                );
            }
        } else {
            this.logger.warn(
                `Workflow ${workflowId} Not Found for Embedding Update`,
            );
        }
    }
}

export default IntentMatchingEngine;
