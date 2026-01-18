
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

// Helper: Extract keywords from goal text
function extractKeywords(text) {
    if (!text) return [];
    const stopWords = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'developer', 'engineer', 'looking', 'find', 'want', 'need']);
    return text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopWords.has(w));
}

// Helper: Calculate Heuristic Score (0-100) based on Goal Alignment
function calculateHeuristicScore(user, goalKeywords) {
    let score = 0;
    const bio = (user.bio || '').toLowerCase();
    const commitMsg = (user.last_commit_msg || '').toLowerCase();

    // 1. Bio Match (Max 40)
    // If bio contains specific goal keywords
    let bioHits = 0;
    for (const kw of goalKeywords) {
        if (bio.includes(kw)) bioHits++;
    }
    score += Math.min(bioHits * 10, 40);

    // 2. Commit Context Match (Max 30)
    let commitHits = 0;
    for (const kw of goalKeywords) {
        if (commitMsg.includes(kw)) commitHits++;
    }
    score += Math.min(commitHits * 10, 30);

    // 3. Social Proof (Max 20)
    // 1 point per 10 followers, cap at 20
    const followers = user.followers || 0;
    score += Math.min(Math.floor(followers / 10), 20);

    // 4. Contactability (Max 10)
    if (user.email) score += 5;
    if (user.blog || user.twitter_username) score += 5;

    return score;
}

// Fetch full user details (bio, followers, etc.)
async function getUserDetails(username) {
    try {
        return await githubFetch(`${GITHUB_API_BASE}/users/${username}`);
    } catch (e) {
        return null; // Fail silent
    }
}

// 1. Get recent contributors from a specific Repo with Heuristic Filtering
export async function getRepoContributors(repoFullName, goal = "", limit = 3) {
    try {
        const goalKeywords = extractKeywords(goal);
        console.log(`[Discovery] Goal Keywords for ${repoFullName}:`, goalKeywords);

        // Fetch more initially (e.g., 15) to filter down to top {limit}
        const fetchCount = 15;
        const commits = await githubFetch(`${GITHUB_API_BASE}/repos/${repoFullName}/commits?per_page=${fetchCount}`);

        if (!commits || !Array.isArray(commits)) return [];

        const uniqueAuthors = new Map();

        // 1. Extract candidates from commits
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
        }

        const candidates = Array.from(uniqueAuthors.values());

        // 2. Enrich with User Details (Bio, Followers) in parallel
        // We need this for the heuristic score
        const detailedCandidates = await Promise.all(candidates.map(async (c) => {
            const details = await getUserDetails(c.username);
            return { ...c, ...details }; // Merge commit info with profile info
        }));

        // 3. Score candidates
        const scoredCandidates = detailedCandidates.map(c => {
            const score = calculateHeuristicScore(c, goalKeywords);
            return { ...c, heuristic_score: score };
        });

        // 4. Sort by Score DESC
        scoredCandidates.sort((a, b) => b.heuristic_score - a.heuristic_score);

        // 5. Return top N
        console.log(`[Discovery] Scored ${scoredCandidates.length} candidates. Top scores:`, scoredCandidates.slice(0, 3).map(c => `${c.username}(${c.heuristic_score})`));

        return scoredCandidates.slice(0, limit);

    } catch (error) {
        console.error(`Error fetching contributors for ${repoFullName}:`, error);
        return [];
    }
}

// 2. Get contributors from an Organization
export async function getOrgContributors(orgName, goal = "", limit = 5) {
    try {
        // Get top 3 most recently active repos
        const repos = await githubFetch(`${GITHUB_API_BASE}/orgs/${orgName}/repos?sort=pushed&direction=desc&per_page=3`);

        if (!repos || !Array.isArray(repos)) return [];

        let allContributors = [];

        // Parallel fetch for speed
        // We ask for 'limit' from each repo, then we'll merge and re-sort
        const promises = repos.map(repo => getRepoContributors(repo.full_name, goal, limit));
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

        // Re-sort the combined list by heuristic score
        allContributors.sort((a, b) => (b.heuristic_score || 0) - (a.heuristic_score || 0));

        return allContributors.slice(0, limit);
    } catch (error) {
        console.error(`Error fetching contributors for org ${orgName}:`, error);
        return [];
    }
}
