import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({});

async function fetchGitHubEvents(username) {
    const response = await fetch(`https://api.github.com/users/${username}/events`, {
        headers: { 'User-Agent': 'Signal-Now-Hackathon' },
        cache: 'no-store'
    });

    if (!response.ok) throw new Error("User not found or API limit hit");
    return response.json();
}

export async function analyzeProfile(username) {
    console.log(`⚡ Scanning live frequency for: ${username}...`);
    const events = await fetchGitHubEvents(username);

    const relevantActivity = events.slice(0, 15).map(e => ({
        type: e.type,
        repo: e.repo.name,
        payload: e.payload.commits ? e.payload.commits[0]?.message : "No commit msg",
        time: e.created_at
    }));

    const prompt = `
    You are a "Networking Tactician". Analyze this raw GitHub activity stream for user '${username}'.
    
    Raw Data: ${JSON.stringify(relevantActivity)}

    Task:
    1. Identify their "Current Focus" (e.g., "Deep in a Rust migration", "Learning AI", "Maintenance mode").
    2. Calculate a "Readiness Score" (0-100) based on recency. (10 mins ago = 90+, 2 days ago = <30).
    3. Find a "Technical Hook" I can use to start a conversation.

    Return ONLY a JSON object:
    {
      "focus": "string",
      "score": number,
      "reason": "string",
      "icebreaker": "string"
    }
  `;

    const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Explain how AI works in a few words",
        config: {
            responseMimeType: "application/json", // Force JSON mode
        }
    });
    const responseText = result.text;
    const cleanJson = responseText.replace(/```json|```/g, "").trim();

    return JSON.parse(cleanJson);
}