// copilot-metrics.js - GitHub Copilot Value Demonstration Metrics

const express = require('express');
const { Octokit } = require('@octokit/rest');

// Initialize GitHub API client
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN || 'your-github-token'
});

class CopilotMetrics {
    constructor(owner, repo) {
        this.owner = owner;
        this.repo = repo;
    }

    /**
     * Get development velocity metrics
     */
    async getDevelopmentVelocity() {
        try {
            // Get recent PRs created by Copilot
            const copilotPRs = await octokit.rest.pulls.list({
                owner: this.owner,
                repo: this.repo,
                state: 'closed',
                per_page: 50,
                sort: 'created',
                direction: 'desc'
            });

            // Filter for Copilot-created PRs
            const copilotCreatedPRs = copilotPRs.data.filter(pr => 
                pr.user.login.includes('copilot') || 
                pr.title.toLowerCase().includes('copilot') ||
                pr.head.ref.includes('copilot/')
            );

            // Calculate metrics
            const metrics = {
                totalCopilotPRs: copilotCreatedPRs.length,
                averageTimeToMerge: this.calculateAverageTimeToMerge(copilotCreatedPRs),
                copilotPRsLastWeek: this.filterLastWeek(copilotCreatedPRs).length,
                successRate: this.calculateSuccessRate(copilotCreatedPRs)
            };

            return metrics;
        } catch (error) {
            console.error('Error fetching development velocity:', error);
            return null;
        }
    }

    /**
     * Get issue resolution metrics
     */
    async getIssueResolutionMetrics() {
        try {
            // Get issues resolved by Copilot
            const issues = await octokit.rest.issues.listForRepo({
                owner: this.owner,
                repo: this.repo,
                state: 'closed',
                per_page: 100,
                sort: 'updated',
                direction: 'desc'
            });

            // Analyze issues
            const copilotIssues = issues.data.filter(issue => 
                issue.body && issue.body.includes('@copilot') ||
                issue.assignee && issue.assignee.login.includes('copilot')
            );

            return {
                totalIssuesResolved: copilotIssues.length,
                averageResolutionTime: this.calculateAverageResolutionTime(copilotIssues),
                issuesByLabel: this.categorizeIssues(copilotIssues),
                recentResolutions: copilotIssues.slice(0, 10).map(issue => ({
                    title: issue.title,
                    created: issue.created_at,
                    closed: issue.closed_at,
                    labels: issue.labels.map(l => l.name)
                }))
            };
        } catch (error) {
            console.error('Error fetching issue metrics:', error);
            return null;
        }
    }

    /**
     * Get code quality improvements
     */
    async getCodeQualityMetrics() {
        try {
            // Get commits to analyze code changes
            const commits = await octokit.rest.repos.listCommits({
                owner: this.owner,
                repo: this.repo,
                per_page: 100
            });

            // Filter Copilot commits
            const copilotCommits = commits.data.filter(commit => 
                commit.author && (
                    commit.author.login.includes('copilot') ||
                    commit.commit.message.toLowerCase().includes('copilot')
                )
            );

            // Analyze commit patterns
            return {
                totalCopilotCommits: copilotCommits.length,
                recentActivity: copilotCommits.slice(0, 10).map(commit => ({
                    message: commit.commit.message,
                    date: commit.commit.author.date,
                    author: commit.author?.login || 'copilot',
                    additions: commit.stats?.additions || 0,
                    deletions: commit.stats?.deletions || 0
                })),
                commitFrequency: this.calculateCommitFrequency(copilotCommits)
            };
        } catch (error) {
            console.error('Error fetching code quality metrics:', error);
            return null;
        }
    }

    /**
     * Helper methods
     */
    calculateAverageTimeToMerge(prs) {
        if (prs.length === 0) return 0;
        
        const totalTime = prs.reduce((sum, pr) => {
            const created = new Date(pr.created_at);
            const merged = new Date(pr.merged_at);
            return sum + (merged - created);
        }, 0);
        
        return Math.round(totalTime / prs.length / (1000 * 60 * 60)); // Hours
    }

    calculateAverageResolutionTime(issues) {
        if (issues.length === 0) return 0;
        
        const totalTime = issues.reduce((sum, issue) => {
            const created = new Date(issue.created_at);
            const closed = new Date(issue.closed_at);
            return sum + (closed - created);
        }, 0);
        
        return Math.round(totalTime / issues.length / (1000 * 60 * 60 * 24)); // Days
    }

    filterLastWeek(items) {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        return items.filter(item => 
            new Date(item.created_at) > oneWeekAgo
        );
    }

    calculateSuccessRate(prs) {
        const merged = prs.filter(pr => pr.merged_at).length;
        return prs.length > 0 ? Math.round((merged / prs.length) * 100) : 0;
    }

    categorizeIssues(issues) {
        const categories = {};
        issues.forEach(issue => {
            issue.labels.forEach(label => {
                categories[label.name] = (categories[label.name] || 0) + 1;
            });
        });
        return categories;
    }

    calculateCommitFrequency(commits) {
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        
        const recentCommits = commits.filter(commit => 
            new Date(commit.commit.author.date) > thirtyDaysAgo
        );
        
        return {
            last30Days: recentCommits.length,
            averagePerWeek: Math.round((recentCommits.length / 30) * 7)
        };
    }
}

/**
 * Express route handlers for metrics API
 */
function setupMetricsRoutes(app, owner, repo) {
    const metrics = new CopilotMetrics(owner, repo);

    // Get comprehensive Copilot metrics
    app.get('/api/copilot-metrics', async (req, res) => {
        try {
            const [velocity, issues, codeQuality] = await Promise.all([
                metrics.getDevelopmentVelocity(),
                metrics.getIssueResolutionMetrics(),
                metrics.getCodeQualityMetrics()
            ]);

            const response = {
                timestamp: new Date().toISOString(),
                repository: `${owner}/${repo}`,
                metrics: {
                    developmentVelocity: velocity,
                    issueResolution: issues,
                    codeQuality: codeQuality
                },
                summary: {
                    totalCopilotPRs: velocity?.totalCopilotPRs || 0,
                    averageTimeToMerge: `${velocity?.averageTimeToMerge || 0} hours`,
                    totalIssuesResolved: issues?.totalIssuesResolved || 0,
                    averageResolutionTime: `${issues?.averageResolutionTime || 0} days`,
                    commitFrequency: codeQuality?.commitFrequency?.averagePerWeek || 0
                }
            };

            res.json(response);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch Copilot metrics' });
        }
    });

    // Get specific metric type
    app.get('/api/copilot-metrics/:type', async (req, res) => {
        const { type } = req.params;
        
        try {
            let result;
            switch (type) {
                case 'velocity':
                    result = await metrics.getDevelopmentVelocity();
                    break;
                case 'issues':
                    result = await metrics.getIssueResolutionMetrics();
                    break;
                case 'quality':
                    result = await metrics.getCodeQualityMetrics();
                    break;
                default:
                    return res.status(400).json({ error: 'Invalid metric type' });
            }
            
            res.json({ type, data: result });
        } catch (error) {
            res.status(500).json({ error: `Failed to fetch ${type} metrics` });
        }
    });
}

module.exports = { CopilotMetrics, setupMetricsRoutes };