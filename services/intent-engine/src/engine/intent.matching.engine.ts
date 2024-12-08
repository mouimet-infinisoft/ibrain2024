import natural from "natural";
import { Inject } from "@brainstack/inject";
import { LogLevel } from "@brainstack/log";
import { AiService } from "../../../ai/ai.service";
import { LoggerService } from "../../../logger/logger.service";
import { intentAnalysisSchema } from "../schemas/intent.schema";
import { CoreMessage } from "ai";
import dotenv from "dotenv";
import { IntentClassification } from "../types";
import {WorkflowRegistryService} from "../../../workflow-registry/src/index";
import { WorkflowDefinition } from "../../../workflow-registry/src/types";

dotenv.config();

// Advanced Intent Classification System
export class IntentMatchingEngine {
    private intentClassifier: any;

    constructor(
        @Inject private aiService: AiService,
        @Inject private logger: LoggerService,
        @Inject private workflowRegistryService: WorkflowRegistryService
    ) {
        this.logger.seLogLevel(LogLevel.VERBOSE);
        this.logger.verbose("Initializing IntentMatchingEngine: ", this.workflowRegistryService.getAllWorkflows());
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
          Provide a JSON response with maximum token 8000:
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
                8000
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
        conversationContext: any
    ): Promise<WorkflowDefinition | null> {
        this.logger.info("Finding Most Appropriate Workflow", {
            userInput,
            workflowCount: this.workflowRegistryService.getAllWorkflows().length
        });

        try {
            // Classify intent
            const intentClassification = await this.classifyIntent(
                userInput,
                conversationContext
            );

            // Multi-Dimensional Workflow Matching
            const scoredWorkflows = this.workflowRegistryService.getAllWorkflows().map((workflow) => {
                this.logger.verbose(`Evaluating Workflow: ${workflow.name}`);

                // 1. Semantic Similarity
                const semanticSimilarity = workflow.semanticVector
                    ? this.calculateSemanticSimilarity(
                        intentClassification.embedding,
                        workflow.semanticVector
                    )
                    : 0;

                // 2. Domain Similarity
                const domainSimilarity = this.calculateDomainSimilarity(
                    workflow.intentSignature.primaryDomains,
                    [intentClassification.primaryDomain]
                );

                // 3. Context Alignment
                const contextAlignment =
                    workflow.intentSignature.secondaryContexts.includes(
                        intentClassification.secondaryContext
                    )
                        ? 1
                        : 0;

                // 4. Capability Alignment
                const capabilityAlignment = this.calculateCapabilityAlignment(
                    intentClassification.requiredCapabilities,
                    workflow.intentSignature.requiredCapabilities
                );

                // Weighted Scoring Algorithm
                const score = (semanticSimilarity * 0.5) + 
                    (domainSimilarity * 0.2) +
                    (contextAlignment * 0.15) +
                    (capabilityAlignment * 0.15);

                this.logger.verbose(`Workflow Scoring for ${workflow.name}`, {
                    semanticSimilarity,
                    domainSimilarity,
                    contextAlignment,
                    capabilityAlignment,
                    totalScore: score,
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

            return sortedWorkflows.length > 0
                ? sortedWorkflows[0].workflow
                : null;
        } catch (error) {
            this.logger.error("Error in findMostAppropriateWorkflow", error);
            return null;
        }
    }
}

export default IntentMatchingEngine;