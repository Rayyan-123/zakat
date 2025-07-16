# 🔑 API Setup Instructions for Website Owner

**For Rayyan Ahmed - MyZakat Guide Website Owner**

## 📍 Where to Add Your OpenAI API Key

### Step 1: Get Your OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in with your OpenAI account (create one if needed)
3. Click "Create new secret key"
4. Copy the API key (it will look like: `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

### Step 2: Add the API Key to Your Code

**File**: `script.js`  
**Line Number**: `161`

Find this line:
```javascript
this.defaultApiKey = 'YOUR_OPENAI_API_KEY_HERE'; // Replace with your actual OpenAI API key
```

Replace `'YOUR_OPENAI_API_KEY_HERE'` with your actual API key:
```javascript
this.defaultApiKey = 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // Your real API key here
```

### Example:
```javascript
// Before (line 161):
this.defaultApiKey = 'YOUR_OPENAI_API_KEY_HERE';

// After (with your real API key):
this.defaultApiKey = 'sk-1234567890abcdefghijklmnopqrstuvwxyz123456';
```

## ✅ That's It!

Once you add your API key:
- Users can immediately use the AI assistant
- No setup required for users
- The AI will only answer Islamic questions
- The website will work perfectly

## 🔒 Security Note

- Keep your API key private and secure
- Don't share the API key with anyone
- OpenAI API has a free tier, then pay-as-you-use pricing (using gpt-4o-mini model - cost-effective)
- The AI assistant will only respond to Islamic topics
- Monitor your API usage on OpenAI dashboard to track costs

## 📞 Need Help?

If you have any issues, contact the developer who set this up for you.

---

**May Allah bless this effort! آمین** 🤲