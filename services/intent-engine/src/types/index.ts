// Type definition for Intent Classification
export interface IntentClassification {
    embedding: number[];
    primaryDomain: string;
    secondaryContext: string;
    intentStrength: number;
    requiredCapabilities: string[];
}
