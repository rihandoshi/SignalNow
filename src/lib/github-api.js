
const GITHUB_API_BASE = "https://api.github.com";

// Helper for authorized fetch if token exists, or public fetch if not
async function githubFetch(url) {
    const headers = {
        'User-Agent': 'Signal-Now-Hackathon',
        'Accept': 'application/vnd.github.v3+json'
    };

    // If we have a token, use it to get higher rate limits
    if (process.env.NEXT_PUBLIC_GITHUB_TOKEN) {
        headers['Authorization'] = `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`;
    }

    const response = await fetch(url, { headers, next: { revalidate: 3600 } });

    if (!response.ok) {
        if (response.status === 403) {
            console.warn(`Rate limit hit or forbidden: ${url}`);
            return null;
        }
        if (response.status === 404) return null;
        throw new Error(`GitHub API Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
}

// 1. Get recent contributors from a specific Repo
// We use /commits to find who is ACTIVE NOW, rather than all-time contributors
export async function getRepoContributors(repoFullName, limit = 5) {
    try {
        const commits = await githubFetch(`${GITHUB_API_BASE}/repos/${repoFullName}/commits?per_page=30`);

        if (!commits || !Array.isArray(commits)) return [];

        const uniqueAuthors = new Map();

        for (const commit of commits) {
            const author = commit.author; // The GitHub user object
            if (author && author.login && author.type === 'User') {
                if (!uniqueAuthors.has(author.login)) {
                    uniqueAuthors.set(author.login, {
                        username: author.login,
                        avatar_url: author.avatar_url,
                        profile_url: author.html_url,
                        last_commit_msg: commit.commit.message,
                        last_commit_date: commit.commit.author.date,
                        source_repo: repoFullName
                    });
                }
            }
            if (uniqueAuthors.size >= limit) break;
        }

        return Array.from(uniqueAuthors.values());
    } catch (error) {
        console.error(`Error fetching contributors for ${repoFullName}:`, error);
        return [];
    }
}

// 2. Get contributors from an Organization
// We fetch the org's most recently updated repos, then get contributors from them
export async function getOrgContributors(orgName, limit = 10) {
    try {
        // Get top 3 most recently active repos
        const repos = await githubFetch(`${GITHUB_API_BASE}/orgs/${orgName}/repos?sort=pushed&direction=desc&per_page=3`);

        if (!repos || !Array.isArray(repos)) return [];

        let allContributors = [];

        // Parallel fetch for speed
        const promises = repos.map(repo => getRepoContributors(repo.full_name, 3));
        const results = await Promise.all(promises);

        // Flatten and deduplicate
        const seen = new Set();
        for (const list of results) {
            for (const contributor of list) {
                if (!seen.has(contributor.username)) {
                    allContributors.push(contributor);
                    seen.add(contributor.username);
                }
            }
        }

        return allContributors.slice(0, limit);
    } catch (error) {
        console.error(`Error fetching contributors for org ${orgName}:`, error);
        return [];
    }
}
