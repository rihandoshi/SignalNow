import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = "gemini-2.5-flash";

const myUser = "rihandoshi";

async function fetchGitHubEvents(username) {
    const response = await fetch(`https://api.github.com/users/${username}/events`, {
        headers: { 'User-Agent': 'Signal-Now-Hackathon' },
        cache: 'no-store'
    });
    if (!response.ok) throw new Error(`User ${username} not found`);
    const res = await response.json();
    console.log(`Events for ${username} are: ${res}`);
    return res;
}

export async function analyzeProfile(username) {
    console.log(`⚡ Agentic Pipeline: Connecting ${myUser} -> ${username}`);

    /// Get user activity data. Both ours and the target
    const [targetEvents, myEvents] = await Promise.all([
        fetchGitHubEvents(username),
        fetchGitHubEvents(myUser)
    ]);

    // Clean the data slightly for the prompts
    const targetActivity = targetEvents.slice(0, 15).map(e => ({
        type: e.type,
        repo: e.repo.name,
        msg: e.payload.commits ? e.payload.commits[0]?.message : "Action: " + e.type,
        time: e.created_at
    }));

    const myActivity = myEvents.slice(0, 10).map(e => ({
        repo: e.repo.name,
        msg: e.payload.commits ? e.payload.commits[0]?.message : e.type
    }));

    // --- AGENT 1: THE RESEARCHER ---
    // Goal: Clean noise and identify Target's vibe

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
        contents: [
            {
                role: "user",
                parts: [
                    { text: researcherPrompt },
                    { text: "\n\nDATA:\n" + JSON.stringify(targetActivity, null, 2) }
                ]
            }
        ],

        Data: `${JSON.stringify(targetActivity)}`,
        config: { responseMimeType: "application/json" }
    });
    const vibe = JSON.parse(researcherResult.text);

    // --- AGENT 2: THE STRATEGIST ---
    // Goal: Compare Target's vibe with MY raw activity to find the bridge
    const strategistPrompt = `
        You are Agent 2: The Strategist.

        Your job is to decide:
        1. Whether this is a good moment to contact the target
        2. Why (based on evidence)
        3. What the strongest connection point is

        INPUT:
        Target profile:
        ${JSON.stringify(vibe, null, 2)}

        My recent activity:
        ${JSON.stringify(myActivity, null, 2)}

        OUTPUT FORMAT (STRICT JSON):

        {
        "readiness_score": 0-100,
        "readiness_level": "low | medium | high",
        "timing_reason": "One concrete reason based on activity timing",
        "bridge": "One specific shared topic, repo, or technical overlap",
        "confidence": "low | medium | high"
        }

        RULES:
        - Readiness must depend heavily on recency of activity
        - Do NOT inflate scores without evidence
        - Bridge must be concrete (repo, tool, stack, problem)
        - Avoid vague phrases like 'shared interests'
        - If no good bridge exists, say so explicitly

        `;
    const strategistResult = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: strategistPrompt,
        config: { responseMimeType: "application/json" }
    });
    const strategy = JSON.parse(strategistResult.text);

    // --- AGENT 3: THE GHOSTWRITER ---
    // Goal: Generate the final peer-to-peer message
    const ghostwriterPrompt = `
        You are Agent 3: The Ghostwriter.

        You write short, casual, human DMs between developers.

        INPUT:
        ${JSON.stringify(strategy, null, 2)}

        RULES:
        - Max 2 sentences
        - No corporate language
        - No buzzwords
        - No emojis
        - No greetings like "Hope you're doing well"
        - Can reference something specific they have worked on or shown interest in or just some bridge in general.
        - Must sound like a real person, not a pitch

        STYLE:
        Casual, curious, low-pressure.
        Like a smart dev reaching out to another smart dev.

        OUTPUT:
        Plain text only.

    `;
    const ghostwriterResult = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: ghostwriterPrompt
    });
    const dm = ghostwriterResult.text;

    return {
        score: strategy.score || strategy.ReadinessScore || strategy.readiness_score,
        focus: vibe.TechnicalFocus || vibe.focus,
        icebreaker: dm,
        trace: {
            researcher: vibe,
            strategist: strategy,
            ghostwriter: "Optimizing message for human response... Ready."
        }
    };
}