import { config } from 'dotenv';
import { Octokit } from '@octokit/rest';
import { data } from './data.mjs'; // Ensure this path points to your actual data file


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
${issue.description || 'No description provided'}

## References:
${issue.references?.length ? issue.references.map(r => `[${r?.description}](${r?.link})`).join('\n').trim() : 'No references provided'}

## Tasks:
${issue.tasks?.length ? issue.tasks.join('\n').trim() : 'No tasks provided'}`;

const run = async () => {
    try {
        // Step 1: Create or update milestones
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
                        title: issue.title, // Ensure title is included
                        body: prepareIssueBody(issue),
                        labels: issue.labels || [],
                        milestone: milestoneNumber
                    });

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
