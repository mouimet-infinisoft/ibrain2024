interface Reference {
    description: string;
    link: string;
  }
  
  interface Task {
    title: string;
    description: string;
    tasks: string[];  // Array of task items in markdown checkbox format
    references: Reference[];
  }
  
  interface Issue {
    title: string;
    description: string;
    due_date: string | null;
    last_updated?: string;
    tasks: string[];
    references: Reference[];
  }
  
  interface Milestone {
    title: string;
    description: string;
    due_date: string | null;
    last_updated: string;
    issues: Issue[];
  }
  
  interface Project {
    milestones: Milestone[];
  }
  
  interface RootObject {
    project: Project;
  }
  
  // Example structure of the data:
//   const data: RootObject = {
//     project: {
//       milestones: [
//         {
//           title: string;           // e.g., "Feature Release Rollout"
//           description: string;     // Detailed description of the milestone
//           due_date: string | null; // ISO date string or null
//           last_updated: string;    // ISO date string
//           issues: [               // Array of related issues/tasks
//             {
//               title: string;      // e.g., "Core Feature Launch - Contacts Microapp"
//               description: string; // Detailed description of the issue
//               tasks: string[];    // Array of markdown-style task items
//               references: [       // Array of related documentation
//                 {
//                   description: string; // Description of the reference
//                   link: string;       // Path to reference document
//                 }
//               ]
//             }
//           ]
//         }
//       ]
//     }
//   }