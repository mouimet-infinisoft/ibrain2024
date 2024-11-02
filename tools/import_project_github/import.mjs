import { config } from 'dotenv';
import { Octokit } from '@octokit/rest';
import { data } from './rqrsda.mjs'; // Ensure this path points to your actual data file

config();

// Use environment variables
const authToken = process.env.AUTH_TOKEN;
const owner = process.env.OWNER;
const repo = process.env.REPO;

if (!authToken || !owner || !repo) {
    console.error('Error: Missing required environment variables.');
    process.exit(1);
}

const octokit = new Octokit({ auth: authToken });

// Helper function to prepare the issue body
const prepareIssueBody = (issue) => `## Description:
${issue.description}

## References:
${issue.references?.length ? issue.references.map(r => `[${r?.description}](${r?.link})`).join('\n').trim() : 'No references provided'}

## Tasks:
${issue.tasks.join('\n').trim()}`;

// Retrieve or create the project
const getOrCreateProject = async (projectTitle) => {
    const projects = await octokit.projects.listForRepo({ owner, repo });
    const existingProject = projects.data.find(p => p.name === projectTitle);
    
    if (existingProject) {
        return existingProject.id;
    }

    const newProject = await octokit.projects.createForRepo({
        owner,
        repo,
        name: projectTitle,
        body: `Project for ${projectTitle}`
    });

    return newProject.data.id;
};

// Main function to handle project, milestones, and issues
const run = async () => {
    try {
        // Step 1: Create or retrieve the project
        const projectId = await getOrCreateProject(data.project.title);
        console.log(`Project "${data.project.title}" is ready with ID ${projectId}`);

        // Step 2: Create or update milestones
        for (const milestone of data.project.milestones) {
            let milestoneNumber;

            // Check if the milestone already exists
            const existingMilestones = await octokit.issues.listMilestones({
                owner,
                repo,
            });

            const foundMilestone = existingMilestones.data.find(m => m.title === milestone.title);
            if (foundMilestone) {
                milestoneNumber = foundMilestone.number;
                console.log(`Milestone "${milestone.title}" already exists with number ${milestoneNumber}`);
            } else {
                const milestoneResponse = await octokit.issues.createMilestone({
                    owner,
                    repo,
                    title: milestone.title,
                    state: "open"
                });
                milestoneNumber = milestoneResponse.data.number;
                console.log(`Created milestone "${milestone.title}" with number ${milestoneNumber}`);
            }

            // Create issues for the milestone
            if (milestone.issues) {
                for (const issue of milestone.issues) {
                    const issueResponse = await octokit.issues.create({
                        owner,
                        repo,
                        title: issue.title,
                        body: prepareIssueBody(issue),
                        labels: issue.labels || [],
                        milestone: milestoneNumber
                    });

                    // Assign the issue to the project
                    const columns = await octokit.projects.listColumns({ project_id: projectId });
                    if (columns.data.length > 0) {
                        const columnId = columns.data[0].id; // Use the first column as an example
                        await octokit.projects.createCard({
                            column_id: columnId,
                            content_id: issueResponse.data.id,
                            content_type: 'Issue'
                        });
                        console.log(`Assigned issue "${issue.title}" to project "${data.project.title}"`);
                    } else {
                        console.warn(`No columns found for project "${data.project.title}". Skipping issue assignment.`);
                    }
                    
                    console.log(`Created issue "${issue.title}" under milestone "${milestone.title}"`);
                }
            }
        }
        console.log('Success! All milestones and issues created or updated');
    } catch (err) {
        console.error("Failed! ", err);
    }
};

run();
