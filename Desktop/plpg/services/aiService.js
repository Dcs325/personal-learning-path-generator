export const generateLearningPath = async (skill, proficiency, learningStyle) => {
    const prompt = `Generate a personalized learning path for someone who wants to learn "${skill}".
    The user's current proficiency is "${proficiency}".
    Their preferred learning style includes: ${learningStyle.length > 0 ? learningStyle.join(', ') : 'any'}.

    Provide the output as a JSON array of objects. Each object should represent a module and have the following properties:
    - "moduleTitle": (string) The title of the learning module.
    - "description": (string) A brief description of what the module covers.
    - "subTopics": (array of strings) A list of key sub-topics within this module.
    - "suggestedResourceType": (string) The type of resource best suited for this module (e.g., "Video Tutorials", "Text-based Articles", "Hands-on Projects", "Interactive Exercises", "Official Documentation").

    Ensure the path is comprehensive and progressive. Aim for 5-8 modules.`;

    const chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });

    const payload = {
        contents: chatHistory,
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        "moduleTitle": { "type": "STRING" },
                        "description": { "type": "STRING" },
                        "subTopics": {
                            "type": "ARRAY",
                            "items": { "type": "STRING" }
                        },
                        "suggestedResourceType": { "type": "STRING" }
                    },
                    required: ["moduleTitle", "description", "subTopics", "suggestedResourceType"]
                }
            }
        }
    };

    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    
    if (!apiKey) {
        throw new Error('Google AI API key is not configured. Please add VITE_GOOGLE_AI_API_KEY to your .env.local file.');
    }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();

    if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
        const jsonText = result.candidates[0].content.parts[0].text;
        return JSON.parse(jsonText);
    } else {
        throw new Error("No valid learning path was generated. Please try again.");
    }
};