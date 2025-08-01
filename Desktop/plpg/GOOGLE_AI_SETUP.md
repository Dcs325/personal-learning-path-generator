# Google AI API Setup Guide

The learning path generation feature requires a Google AI API key. Follow these steps to get your free API key and configure it:

## 1. Get Your Google AI API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Choose **"Create API key in new project"** (recommended) or select an existing project
5. Copy the generated API key

## 2. Add API Key to Your Environment

1. Open the `.env.local` file in your project root
2. Replace `your_google_ai_api_key_here` with your actual API key:

```env
# Google AI Configuration
VITE_GOOGLE_AI_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz
```

3. Save the file
4. Restart your development server:
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

## 3. Test the Setup

1. Open your app at http://localhost:5173/
2. Sign in to your account
3. Fill out the learning path form:
   - Target Skill: "JavaScript"
   - Proficiency: "Beginner"
   - Select learning styles
4. Click **"Generate Learning Path"**
5. You should see a generated learning path instead of the API error

## 4. API Usage & Limits

- **Free Tier**: Google AI Studio provides generous free usage
- **Rate Limits**: 15 requests per minute for free tier
- **Model Used**: Gemini 2.0 Flash (fast and efficient)
- **Cost**: Free for most personal use cases

## 5. Troubleshooting

### Error: "API key is not configured"
- Make sure you added the API key to `.env.local`
- Restart the development server after adding the key
- Check that the key starts with `AIza`

### Error: "403 - Method doesn't allow unregistered callers"
- Your API key might be invalid or expired
- Generate a new API key from Google AI Studio
- Make sure you're using the correct key format

### Error: "429 - Too Many Requests"
- You've hit the rate limit (15 requests/minute)
- Wait a minute before trying again
- Consider upgrading to a paid plan for higher limits

## 6. Security Notes

- ✅ API key is stored in `.env.local` (not committed to git)
- ✅ Key is only used client-side for this demo app
- ⚠️ For production apps, use server-side API calls to protect your key
- 🔒 Never share your API key publicly

## 7. Alternative: Use Your Own AI Service

If you prefer not to use Google AI, you can modify `services/aiService.js` to use:
- OpenAI GPT API
- Anthropic Claude API
- Local AI models
- Any other text generation service

The service expects a JSON response with learning modules in the specified format.