import simpleGit from 'simple-git';
import fs from 'fs';
import path from 'path';

export interface UpdateInfo {
    hasUpdates: boolean;
    currentVersion: string;
    latestVersion: string;
    commits: Array<{
        hash: string;
        message: string;
        date: string;
        author: string;
    }>;
    updateUrl?: string;
}

class GitHubService {
    private git = simpleGit();
    private repoUrl = process.env.GITHUB_REPO_URL || 'https://github.com/yourusername/hotel-management-system.git';
    private currentBranch = 'main';

    async checkForUpdates(): Promise<UpdateInfo> {
        try {
            // Fetch latest changes from remote
            await this.git.fetch(['origin', this.currentBranch]);

            // Get current commit hash
            const currentCommit = await this.git.revparse(['HEAD']);

            // Get latest remote commit hash
            const latestCommit = await this.git.revparse([`origin/${this.currentBranch}`]);

            const hasUpdates = currentCommit !== latestCommit;

            let commits: any[] = [];
            if (hasUpdates) {
                // Get commits between current and latest
                const log = await this.git.log({
                    from: currentCommit,
                    to: latestCommit,
                });

                commits = log.all.map(commit => ({
                    hash: commit.hash.substring(0, 8),
                    message: commit.message,
                    date: commit.date,
                    author: commit.author_name,
                }));
            }

            return {
                hasUpdates,
                currentVersion: currentCommit.substring(0, 8),
                latestVersion: latestCommit.substring(0, 8),
                commits,
                updateUrl: `${this.repoUrl}/compare/${currentCommit}...${latestCommit}`,
            };
        } catch (error) {
            console.error('Failed to check for updates:', error);
            return {
                hasUpdates: false,
                currentVersion: 'unknown',
                latestVersion: 'unknown',
                commits: [],
            };
        }
    }

    async getCurrentVersion(): Promise<string> {
        try {
            const packageJson = JSON.parse(
                fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
            );
            return packageJson.version || '1.0.0';
        } catch (error) {
            return '1.0.0';
        }
    }

    async getRepositoryInfo(): Promise<{
        url: string;
        branch: string;
        lastCommit: {
            hash: string;
            message: string;
            author: string;
            date: string;
        } | null;
    }> {
        try {
            const remotes = await this.git.getRemotes(true);
            const currentBranch = await this.git.branch();
            const log = await this.git.log({ maxCount: 1 });

            const lastCommit = log.latest ? {
                hash: log.latest.hash.substring(0, 8),
                message: log.latest.message,
                author: log.latest.author_name,
                date: log.latest.date,
            } : null;

            return {
                url: remotes[0]?.refs?.fetch || this.repoUrl,
                branch: currentBranch.current || this.currentBranch,
                lastCommit,
            };
        } catch (error) {
            console.error('Failed to get repository info:', error);
            return {
                url: this.repoUrl,
                branch: this.currentBranch,
                lastCommit: null,
            };
        }
    }

    async pullUpdates(): Promise<{ success: boolean; message: string }> {
        try {
            // Stash any local changes
            try {
                await this.git.stash();
            } catch (e) {
                // No changes to stash
            }

            // Pull latest changes
            const pullResult = await this.git.pull('origin', this.currentBranch);

            return {
                success: true,
                message: `Successfully updated. Summary: ${pullResult.summary.changes} changes, ${pullResult.summary.insertions} insertions, ${pullResult.summary.deletions} deletions.`,
            };
        } catch (error) {
            console.error('Failed to pull updates:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to pull updates',
            };
        }
    }

    async getChangeLog(limit: number = 10): Promise<Array<{
        hash: string;
        message: string;
        author: string;
        date: string;
        filesChanged: number;
    }>> {
        try {
            const log = await this.git.log({ maxCount: limit });

            const commits = await Promise.all(
                log.all.map(async (commit) => {
                    try {
                        const diff = await this.git.show(['--stat', '--format=', commit.hash]);
                        const filesChanged = (diff.match(/\|\s*\d+/g) || []).length;

                        return {
                            hash: commit.hash.substring(0, 8),
                            message: commit.message,
                            author: commit.author_name,
                            date: commit.date,
                            filesChanged,
                        };
                    } catch (e) {
                        return {
                            hash: commit.hash.substring(0, 8),
                            message: commit.message,
                            author: commit.author_name,
                            date: commit.date,
                            filesChanged: 0,
                        };
                    }
                })
            );

            return commits;
        } catch (error) {
            console.error('Failed to get changelog:', error);
            return [];
        }
    }

    async createBackupBranch(): Promise<{ success: boolean; branchName?: string; message: string }> {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const branchName = `backup-before-update-${timestamp}`;

            await this.git.checkoutLocalBranch(branchName);
            await this.git.checkout(this.currentBranch);

            return {
                success: true,
                branchName,
                message: `Backup branch '${branchName}' created successfully`,
            };
        } catch (error) {
            console.error('Failed to create backup branch:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to create backup branch',
            };
        }
    }

    async getSystemInfo(): Promise<{
        nodeVersion: string;
        npmVersion: string;
        gitVersion: string;
        platform: string;
        architecture: string;
    }> {
        return {
            nodeVersion: process.version,
            npmVersion: process.env.npm_version || 'unknown',
            gitVersion: await this.git.version().catch(() => ({ major: 0, minor: 0, patch: 0, agent: 'unknown' })).then(v => v.agent),
            platform: process.platform,
            architecture: process.arch,
        };
    }
}

export const githubService = new GitHubService();
