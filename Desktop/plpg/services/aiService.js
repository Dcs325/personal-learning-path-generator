export const generateLearningPath = async (skill, proficiency, learningStyle, timePerWeek, targetCompletion, difficultyLevel, learningPreference) => {
    const prompt = `Generate a personalized learning path for someone who wants to learn "${skill}".
    
    User Profile:
    - Current proficiency: "${proficiency}"
    - Preferred learning style: ${learningStyle.length > 0 ? learningStyle.join(', ') : 'any'}
    - Learning preference: "${learningPreference}" (visual, auditory, hands-on, or reading)
    - Available time per week: "${timePerWeek}" hours
    - Target completion: "${targetCompletion}"
    - Difficulty level: "${difficultyLevel}" (gentle, moderate, or intensive)
    
    Provide the output as a JSON array of objects. Each object should represent a module and have the following properties:
    - "moduleTitle": (string) The title of the learning module.
    - "description": (string) A brief description of what the module covers.
    - "subTopics": (array of strings) A list of key sub-topics within this module.
    - "suggestedResourceType": (string) The type of resource best suited for this module.
    - "recommendedBooks": (array of objects) 2-3 specific book recommendations with title and author.
    - "recommendedCourses": (array of objects) 2-3 online course recommendations with title and platform.
    - "recommendedYouTubeVideos": (array of objects) 2-3 YouTube video recommendations with title, channel name, and brief description.
    - "estimatedHours": (number) Estimated hours needed to complete this module.
    - "weeklySchedule": (string) Suggested weekly study schedule for this module.
    - "difficultyRating": (number) Difficulty rating from 1-5 based on user's proficiency and chosen difficulty level.
    - "learningTips": (array of strings) 2-3 specific tips tailored to the user's learning preference.
    
    For book recommendations, provide objects with:
    - "title": (string) The book title
    - "author": (string) The author name
    
    For course recommendations, provide objects with:
    - "title": (string) The course title
    - "platform": (string) The platform (e.g., "Coursera", "Udemy", "edX", "YouTube", "Khan Academy")
    
    For YouTube video recommendations, provide objects with:
    - "title": (string) The video title or type of content
    - "channel": (string) The channel name
    - "description": (string) Brief description of the video content
    
    Focus on real educational content creators, tutorials, and explanatory videos that would be helpful for learning this skill at the specified level.
    
    Tailor the content complexity, pacing, and resource recommendations based on:
    - The user's proficiency level and chosen difficulty setting
    - Their available time and target completion timeline
    - Their learning preference (emphasize visual aids, audio content, hands-on practice, or reading materials)
    
    Ensure the path is comprehensive, progressive, and realistic for the given timeframe. Aim for 5-8 modules.`;

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
                        "suggestedResourceType": { "type": "STRING" },
                        "estimatedHours": { "type": "NUMBER" },
                        "weeklySchedule": { "type": "STRING" },
                        "difficultyRating": { "type": "NUMBER" },
                        "recommendedBooks": {
                            "type": "ARRAY",
                            "items": {
                                "type": "OBJECT",
                                "properties": {
                                    "title": { "type": "STRING" },
                                    "author": { "type": "STRING" }
                                },
                                "required": ["title", "author"]
                            }
                        },
                        "recommendedCourses": {
                            "type": "ARRAY",
                            "items": {
                                "type": "OBJECT",
                                "properties": {
                                    "title": { "type": "STRING" },
                                    "platform": { "type": "STRING" }
                                },
                                "required": ["title", "platform"]
                            }
                        },
                        "recommendedYouTubeVideos": {
                            "type": "ARRAY",
                            "items": {
                                "type": "OBJECT",
                                "properties": {
                                    "title": { "type": "STRING" },
                                    "channel": { "type": "STRING" },
                                    "description": { "type": "STRING" }
                                },
                                "required": ["title", "channel", "description"]
                            }
                        },
                        "learningTips": {
                            "type": "ARRAY",
                            "items": { "type": "STRING" }
                        }
                    },
                    required: ["moduleTitle", "description", "subTopics", "suggestedResourceType", "recommendedBooks", "recommendedCourses", "recommendedYouTubeVideos", "estimatedHours", "weeklySchedule", "difficultyRating", "learningTips"]
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