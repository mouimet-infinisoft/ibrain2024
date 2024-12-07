import { jsonSchema } from 'ai';

export type TIntentAnalysisSchema = typeof intentAnalysisSchema['_type'] ;

export const intentAnalysisSchema = jsonSchema<{
    primaryDomains: string[];
    secondaryContexts: string[];
    complexityLevel: number;
    requiredCapabilities: string[];
}>({
    type: 'object',
    properties: {
        primaryDomains: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of primary domains the project belongs to (e.g., e-commerce, finance, healthcare)'
        },
        secondaryContexts: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of secondary contexts relevant to the project (e.g., mobile, web, backend)'
        },
        complexityLevel: {
            type: 'number',
            description: 'Complexity level of the project (e.g., 1-5, with 5 being the most complex)'
        },
        requiredCapabilities: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of required capabilities for the project (e.g., AI/ML, cloud computing, database management)'
        }
    },
    required: ['primaryDomains', 'secondaryContexts', 'complexityLevel', 'requiredCapabilities']
});
