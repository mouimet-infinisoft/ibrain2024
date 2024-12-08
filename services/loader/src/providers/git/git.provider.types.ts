
export type GitProviderLoadInput = {
    repo: string;  // E.g., "https://github.com/owner/repo.git"
    branch?: string; // Optional branch name
    path?: string;   // Optional path within the repo
};

export type GitProviderLoadOutput = {
    files: Array<{
        path: string;
        content: string;
    }>;
    commits: Array<{
        hash: string;
        message: string;
        author: string;
        date: string;
    }>;
};
