# 🔑 API Setup Instructions for Website Owner

**For Rayyan Ahmed - MyZakat Guide Website Owner**

## 📍 Where to Add Your Gemini API Key

### Step 1: Get Your Free Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key (it will look like: `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

### Step 2: Add the API Key to Your Code

**File**: `script.js`  
**Line Number**: `161`

Find this line:
```javascript
this.defaultApiKey = 'YOUR_GEMINI_API_KEY_HERE'; // Replace with your actual Gemini API key
```

Replace `'YOUR_GEMINI_API_KEY_HERE'` with your actual API key:
```javascript
this.defaultApiKey = 'AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // Your real API key here
```

### Example:
```javascript
// Before (line 161):
this.defaultApiKey = 'YOUR_GEMINI_API_KEY_HERE';

// After (with your real API key):
this.defaultApiKey = 'AIzaSyBd1234567890abcdefghijklmnopqrstuvw';
```

## ✅ That's It!

Once you add your API key:
- Users can immediately use the AI assistant
- No setup required for users
- The AI will only answer Islamic questions
- The website will work perfectly

## 🔒 Security Note

- Keep your API key private
- Don't share the API key with anyone
- Google Gemini API is free for normal usage
- The AI assistant will only respond to Islamic topics

## 📞 Need Help?

If you have any issues, contact the developer who set this up for you.

---

**May Allah bless this effort! آمین** 🤲