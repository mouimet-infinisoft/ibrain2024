import { featureDevelopmentWorkflow } from "./feature.development.workflow";
import { legacyCodeRefactoringWorkflow } from "./legacy.code.refactoring.workflow";
import { projectManagementWorkflow } from "./project.management.workflow";
import { technicalSupportWorkflow } from "./technical.support.workflow";

export const workflowDefinitions = [
    projectManagementWorkflow,
    technicalSupportWorkflow,
    legacyCodeRefactoringWorkflow,
    featureDevelopmentWorkflow,
];
