import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = "gemini-2.5-flash-lite";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_KEY || ""
);

// User's goal is passed in directly from the request
const CACHE_TTL_MINUTES = 30;

function generateActivityHash(events) {
    const activityString = events
        .slice(0, 10)
        .map(e => `${e.type}:${e.repo.name}:${e.created_at}`)
        .join("|");
    return crypto.createHash("sha256").update(activityString).digest("hex");
}

async function fetchTrackedProfile(userId, targetUser) {
    try {
        const { data, error } = await supabase
            .from("tracked_profiles")
            .select("*")
            .eq("user_id", userId)
            .eq("target_username", targetUser)
            .single();

        if (error && error.code !== "PGRST116") throw error;
        return data || null;
    } catch (error) {
        console.error("Supabase fetch error, skipping cache:", error.message);
        return null; // No cache available, will run fresh analysis
    }
}

async function updateTrackedProfile(userId, targetUser, data) {
    try {
        const { error } = await supabase
            .from("tracked_profiles")
            .upsert(
                {
                    user_id: userId,
                    target_username: targetUser,
                    ...data,
                    last_checked_at: new Date().toISOString()
                },
                { onConflict: ["user_id", "target_username"] }
            );
        if (error) throw error;
        console.log('Successfully cached analysis result');
    } catch (error) {
        console.error("Supabase update error, skipping cache:", error.message);
        // Continue without caching - analysis still works
    }
}

async function insertAnalysisHistory(userId, targetUser, analysisData) {
    try {
        const { error } = await supabase
            .from("analysis_history")
            .insert({
                user_id: userId,
                timestamp: new Date().toISOString(),
                readiness_score: analysisData.readiness_score,
                decision: analysisData.decision,
                reasoning: analysisData.reasoning,
                bridge: analysisData.bridge,
                raw_trace_json: analysisData.trace
            });
        if (error) throw error;
        console.log('Successfully logged analysis to history');
    } catch (error) {
        console.error("Supabase history insert error, skipping history:", error.message);
        // Continue without history logging - analysis still works
    }
}

function isCacheValid(lastCheckedAt) {
    if (!lastCheckedAt) return false;
    const lastCheckTime = new Date(lastCheckedAt);
    const minutesAgo = (new Date() - lastCheckTime) / (1000 * 60);
    return minutesAgo < CACHE_TTL_MINUTES;
}

function safeJsonParse(text) {
    try {
        return JSON.parse(text);
    } catch {
        const cleaned = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        return JSON.parse(cleaned);
    }
}

async function fetchGitHubEvents(username) {
    // Check if it's a repo (contains /)
    if (username.includes('/')) {
        // For repos, fetch commit activity instead
        const response = await fetch(`https://api.github.com/repos/${username}/commits?per_page=30`, {
            headers: { 'User-Agent': 'Signal-Now-Hackathon' },
            cache: 'no-store'
        });
        if (!response.ok) throw new Error(`Repository ${username} not found`);
        const commits = await response.json();

        // Convert commits to event-like format
        const events = commits.slice(0, 30).map(commit => ({
            type: 'PushEvent',
            repo: { name: username },
            created_at: commit.commit.author.date,
            payload: { commits: [commit] }
        }));

        console.log(`Events for repo ${username} are: ${events.length} commits`);
        return events;
    }

    // For users/orgs, fetch events normally
    const response = await fetch(`https://api.github.com/users/${username}/events`, {
        headers: { 'User-Agent': 'Signal-Now-Hackathon' },
        cache: 'no-store'
    });
    if (!response.ok) throw new Error(`User ${username} not found`);
    const res = await response.json();
    console.log(`Events for ${username} are: ${res}`);
    return res;
}

function getRelativeTime(timestamp) {
    const minutes = Math.floor((new Date() - new Date(timestamp)) / 60000);
    if (minutes < 60) return `${minutes} minutes ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hours ago`;
    return `${Math.floor(minutes / 1440)} days ago`;
}

async function getUserGitHubUsername(userId) {
    try {
        const { data, error } = await supabase
            .from("profiles")
            .select("github_username")
            .eq("id", userId)
            .single();

        if (error) throw error;
        if (!data?.github_username) {
            throw new Error("GitHub username not set in user profile");
        }
        return data.github_username;
    } catch (error) {
        console.error("Failed to fetch GitHub username:", error.message);
        throw new Error("User GitHub username not configured. Please set it in your profile.");
    }
}

async function runResearcher(targetActivity) {
    const researcherPrompt = `You are Agent 1: The Researcher.

        Your job is to analyze raw GitHub activity and extract factual, evidence-based signals.

        You do NOT speculate.
        You do NOT infer personality.
        You do NOT write opinions.
        You do NOT use marketing language.

        You ONLY extract what is clearly observable from the data.

        INPUT:
        A list of recent GitHub events including:
        - event type
        - repository name
        - commit messages (if any)
        - timestamps

        YOUR TASK:
        Return a clean JSON object with the following fields:

        {
        "recent_activity_summary": "1–2 sentence factual summary of what the user has been doing",
        "primary_technologies": ["tech1", "tech2"],
        "activity_pattern": "one of: idle | active | highly_active",
        "notable_signals": [
            "short factual observation",
            "short factual observation"
        ]
        }

        RULES:
        - Do NOT guess intent or emotion
        - Do NOT use adjectives like 'exciting', 'interesting', or 'impressive'
        - Base everything strictly on the input data
        - If information is unclear, say 'insufficient data'
        - Keep output concise and machine-readable
`;

    const researcherResult = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [{
            role: "user",
            parts: [{ text: researcherPrompt + "\n\nDATA:\n" + JSON.stringify(targetActivity) }]
        }],
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2
        }
    });
    return safeJsonParse(researcherResult.text);
}

async function runStrategist(vibe, myActivity, myGoal, previousState, sourceContext) {
    const strategistPrompt = `
        You are Agent 2: The Strategist.

        Your job is to decide:
        1. Whether this is a good moment to contact this developer.
        2. CRITICAL: Does their recent work ALIGN with the User's Goal?
        3. What the strongest connection point is.

        INPUT:
        Target profile:
        ${JSON.stringify(vibe, null, 2)}
        Target Source: ${sourceContext || "Direct Watchlist"}
        
        Current Time: ${new Date().toISOString()}

        My User's Goal: "${myGoal}"
        
        My recent activity:
        ${JSON.stringify(myActivity, null, 2)}

        ${previousState ? `PREVIOUS ANALYSIS:
        - Last readiness score: ${previousState.last_readiness_score}
        - Last decision: ${previousState.last_decision}
        - Last checked: ${previousState.last_checked_at}
        - Last bridge: ${previousState.last_bridge}` : 'No previous analysis available (first check).'}

        Calculate a Readiness Score (0-100) based on:
        1. GOAL ALIGNMENT (50%): Does their work relate to "${myGoal}"? If goal is "Find AI engineers" and they are doing CSS, score MUST be low (<40).
        2. TIMING (30%): Are they active RIGHT NOW?
        3. MOMENTUM (20%): Are they building something new?

        OUTPUT FORMAT (STRICT JSON):

        {
        "readiness_score": 0-100,
        "readiness_level": "low | medium | high",
        "timing_analysis": "Contextual comment on their activity window",
        "bridge": "One specific shared topic, repo, or technical overlap",
        "the_hook": "The specific technical detail to mention (e.g. 'Their recent migration to Bun')",
        "reasoning": "Explain why they fit (or don't fit) the User's Goal.",
        "confidence": "low | medium | high",
        "score_delta": "Compared to previous (if available): 'increased | decreased | stable'",
        "momentum_shift": "Did activity patterns change meaningfully? 'yes | no'"
        }

        RULES:
        - **PRIMARY FILTER**: If they are Active but IRRELEVANT to the Goal, score them LOW (below 50) and decision IGNORE.
        - If they are working on the Source Repo (${sourceContext}) in a way that matches the goal, boost the score.
        - Avoid generic praise. Focus on specific commits/actions.
        - If information is unclear, say 'insufficient data'
        ${previousState ? `- Consider momentum: Has score changed significantly (±5 or more)?` : ''}

        `;
    const strategistResult = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [{
            role: "user",
            parts: [{ text: strategistPrompt }]
        }],
        generationConfig: {
            responseMimeType: "application/json"
        }
    });
    return safeJsonParse(strategistResult.text);
}

// ... runGhostwriter ...

async function decideStatus(strategy, previousState) {
    // ... same logic ...
    const score = strategy.readiness_score;
    const prevScore = previousState?.last_readiness_score || 0;
    const scoreDelta = Math.abs(score - prevScore);
    const prevDecision = previousState?.last_decision;

    if (score >= 70) {
        if (prevScore < 70 && score >= 70) {
            return "ENGAGE";
        }
        return "ENGAGE";
    }

    if (scoreDelta < 5 && prevDecision && isCacheValid(previousState.last_checked_at)) {
        return "NO_CHANGE";
    }

    if (score >= 40) { // Lowered wait threshold slightly
        return "WAIT";
    }

    return "IGNORE";
}

export async function analyzeProfile(userId, targetUser, source = "Direct", context = "", myGoal = "Find active developers working on open-source projects to collaborate with.") {
    // Fetch the user's GitHub username from profiles table
    // ...
    // Note: myGoal is passed in, but we need to fetch the REAL goal from the database if not provided correctly
    // Actually, let's fetch the real goal from the profile to be sure
    const { data: profile } = await supabase.from('profiles').select('goal').eq('id', userId).single();
    if (profile && profile.goal) {
        myGoal = profile.goal;
    }

    const sourceUserGitHub = await getUserGitHubUsername(userId);
    if (!sourceUserGitHub) {
        throw new Error("User GitHub username not found in profile");
    }

    console.log(`⚡ Agentic Pipeline: Connecting ${sourceUserGitHub} -> ${targetUser} (via ${source})`);

    const [targetEvents, myEvents] = await Promise.all([
        fetchGitHubEvents(targetUser),
        fetchGitHubEvents(sourceUserGitHub)
    ]);

    const currentActivityHash = generateActivityHash(targetEvents);
    const previousState = await fetchTrackedProfile(userId, targetUser);

    if (previousState && previousState.last_activity_hash === currentActivityHash && isCacheValid(previousState.last_checked_at)) {
        console.log(`✓ No activity change detected. Returning cached result.`);
        return {
            decision: "NO_CHANGE",
            readiness_score: previousState.last_readiness_score,
            readinessLevel: previousState.last_readiness_level || "medium",
            reasoning: previousState.last_reason,
            bridge: previousState.last_bridge,
            focus: previousState.last_focus
                ? (typeof previousState.last_focus === 'string' ? safeJsonParse(previousState.last_focus) : previousState.last_focus)
                : [],
            icebreaker: previousState.last_icebreaker || null,
            nextStep: previousState.last_next_step || "No changes detected. Monitoring continues.",
            trace: previousState.last_trace || { // Load the full trace from cache
                cached: true,
                cached_at: previousState.last_checked_at,
                researcher: "Trace data not available for this cached result.",
                strategist: "Trace data not available for this cached result.",
                ghostwriter: "Trace data not available for this cached result."
            }
        };
    }

    const targetActivity = targetEvents.slice(0, 15).map(e => ({
        type: e.type,
        repo: e.repo.name,
        msg: e.payload.commits ? e.payload.commits[0]?.message : "Action: " + e.type,
        time: e.created_at,
        time_ago: getRelativeTime(e.created_at)
    }));

    const myActivity = myEvents.slice(0, 10).map(e => ({
        repo: e.repo.name,
        msg: e.payload.commits ? e.payload.commits[0]?.message : e.type
    }));

    console.log(`🔄 Activity hash changed or cache expired. Running analysis pipeline...`);

    let vibe;
    if (targetActivity.length === 0) {
        return {
            decision: "WAIT",
            readiness_score: 0,
            reasoning: "No recent activity detected",
            bridge: null,
            focus: [],
            icebreaker: null,
            nextStep: "Monitor for new events",
            trace: { researcher: "No activity", strategist: "Skipped", ghostwriter: "Skipped" }
        };
    }

    vibe = await runResearcher(targetActivity);

    if (!vibe || vibe.activity_pattern === "idle") {
        return {
            decision: "WAIT",
            readiness_score: 0,
            reasoning: "No recent activity detected",
            bridge: null,
            focus: vibe?.primary_technologies || [],
            icebreaker: null,
            nextStep: "Monitor for new events",
            trace: { researcher: vibe, strategist: "Skipped", ghostwriter: "Skipped" }
        };
    }

    const strategy = await runStrategist(vibe, myActivity, myGoal, previousState, source + ": " + context);
    let icebreaker = null;
    let ghostwriterTrace = "Decision made based on readiness score.";

    const status = decideStatus(strategy, previousState);

    if (status === "ENGAGE") {
        icebreaker = await runGhostwriter(strategy);
        ghostwriterTrace = "Optimizing message for human response... Ready.";
    }

    const analysisResult = {
        decision: status,
        readiness_score: strategy.readiness_score,
        readinessLevel: strategy.readiness_level || "medium",
        reasoning: strategy.reasoning,
        bridge: strategy.bridge,
        focus: vibe.primary_technologies || [],
        icebreaker: icebreaker,
        nextStep: status === "ENGAGE"
            ? "Send message now"
            : status === "WAIT"
                ? "Wait for activity spike"
                : "Not a good fit for outreach",
        trace: {
            researcher: vibe,
            strategist: strategy,
            ghostwriter: ghostwriterTrace
        }
    };

    await updateTrackedProfile(userId, targetUser, {
        last_activity_hash: currentActivityHash,
        last_readiness_score: strategy.readiness_score,
        last_readiness_level: strategy.readiness_level,
        last_decision: status,
        last_bridge: strategy.bridge,
        last_reason: strategy.reasoning,
        last_focus: JSON.stringify(vibe.primary_technologies || []),
        last_icebreaker: icebreaker,
        last_next_step: analysisResult.nextStep,
        last_trace: analysisResult.trace // Save the full trace!
    });

    await insertAnalysisHistory(userId, targetUser, {
        readiness_score: strategy.readiness_score,
        decision: status,
        reasoning: strategy.reasoning,
        bridge: strategy.bridge,
        trace: analysisResult.trace // This was already here? Yes, raw_trace_json
    });

    return analysisResult;
}