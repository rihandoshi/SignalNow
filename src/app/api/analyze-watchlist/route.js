import { NextResponse } from 'next/server';
import { getWatchlist } from '../../../lib/watchlist.js';
import { analyzeProfile } from '../../../lib/agent.js';
import { verifyAuth, createAuthenticatedClient } from '../../../lib/auth-utils.js';
import { getRepoContributors, getOrgContributors } from '../../../lib/github-api.js';

export async function GET(request) {
    try {
        const { user, token, error: authError } = await verifyAuth(request);

        if (authError || !user) {
            return NextResponse.json(
                { error: authError || 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get user's watchlist from Supabase
        const supabase = createAuthenticatedClient(token);
        const watchlist = await getWatchlist(supabase, user.id);

        if (watchlist.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'Watchlist is empty',
                results: []
            });
        }

        // Analyze each target in parallel
        // 1. Discovery Phase: Find people from the watchlist
        const candidates = [];
        const seenCandidates = new Set(); // Deduplication

        console.log(`Starting discovery for ${watchlist.length} sources...`);

        await Promise.all(watchlist.slice(0, 5).map(async (item) => {
            try {
                let discoveredPeople = [];
                let sourceType = "";

                if (item.target_type === 'repo') {
                    // It's a repo, find contributors
                    const contributors = await getRepoContributors(item.target_value);
                    discoveredPeople = contributors.map(c => ({
                        username: c.username,
                        source: `Contributor to ${item.target_value}`,
                        context: `Recent commit in ${item.target_value}: "${c.last_commit_msg}"`
                    }));
                    sourceType = "Repo Contributor";
                } else if (item.target_type === 'org') {
                    // It's an org, find contributors from top repos
                    const contributors = await getOrgContributors(item.target_value);
                    discoveredPeople = contributors.map(c => ({
                        username: c.username,
                        source: `Contributor to ${item.target_value} (Org)`,
                        context: `Active in ${c.source_repo}: "${c.last_commit_msg}"`
                    }));
                    sourceType = "Org Contributor";
                } else {
                    // It's a direct username
                    discoveredPeople = [{
                        username: item.target_value,
                        source: "Direct Watchlist",
                        context: "User manually added to watchlist"
                    }];
                    sourceType = "Direct";
                }

                // Add to candidates list (deduplicated)
                for (const person of discoveredPeople) {
                    if (!seenCandidates.has(person.username)) {
                        seenCandidates.add(person.username);
                        candidates.push(person);
                    }
                }
            } catch (err) {
                console.error(`Discovery failed for ${item.target_value}:`, err);
            }
        }));

        console.log(`Discovered ${candidates.length} unique candidates for analysis.`);

        if (candidates.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No active candidates found from watchlist sources',
                results: []
            });
        }

        // 2. Analysis Phase: Analyze the discovered people
        // 2. Analysis Phase: Analyze the discovered people
        // Limit to very small batch size to avoid timeout (Vercel limit/Browser timeout)
        // Initial limit: 3 candidates max per run
        const batchSize = 3;
        const candidatesToAnalyze = candidates.slice(0, batchSize);

        const analysisPromises = candidatesToAnalyze.map(person =>
            analyzeProfile(user.id, person.username, person.source, person.context)
                .then(result => ({
                    target: person.username,
                    type: "User", // The result is always a User now
                    source: person.source,
                    ...result
                }))
                .catch(error => ({
                    target: person.username,
                    type: "User",
                    error: error.message,
                    timestamp: new Date().toISOString()
                }))
        );

        const results = await Promise.all(analysisPromises);

        // Sort by decision priority
        const decisionPriority = { 'ENGAGE': 0, 'WAIT': 1, 'IGNORE': 2, 'NO_CHANGE': 3 };
        const sorted = results.sort((a, b) => {
            const aPriority = decisionPriority[a.decision] ?? 99;
            const bPriority = decisionPriority[b.decision] ?? 99;
            return aPriority - bPriority;
        });

        return NextResponse.json({
            success: true,
            count: results.length,
            results: sorted
        });
    } catch (error) {
        console.error('Batch analysis error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
