// --- Currency and Nisab Data ---
const currencySelect = document.getElementById('currency');
const zakatTypeSelect = document.getElementById('zakatType');
const nisabInfo = document.getElementById('nisabInfo');
const zakatForm = document.getElementById('zakatForm');
const resultDiv = document.getElementById('result');
const explanationDiv = document.getElementById('explanation');

// List of world currencies (ISO 4217)
const currencies = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'PKR', name: 'Pakistani Rupee' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'SAR', name: 'Saudi Riyal' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'TRY', name: 'Turkish Lira' },
  { code: 'MYR', name: 'Malaysian Ringgit' },
  { code: 'IDR', name: 'Indonesian Rupiah' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'ZAR', name: 'South African Rand' },
  // ... add more as needed
];

// Nisab thresholds (in grams)
const nisabThresholds = {
  gold: 87.48, // grams
  silver: 612.36 // grams
};

// Default gold/silver prices (per gram, in USD)
let goldPriceUSD = 75; // fallback
let silverPriceUSD = 1; // fallback

// --- Fetch Live Prices ---
async function fetchLivePrices() {
  try {
    // Use a free API for gold/silver and currency rates (e.g., metals-api.com, exchangerate-api.com)
    // Replace 'YOUR_API_KEY' with your real API key
    // Gold/Silver price in USD per gram
    const metalsRes = await fetch('https://api.metals.live/v1/spot');
    const metals = await metalsRes.json();
    // metals = [{ gold: price_per_oz }, { silver: price_per_oz }, ...]
    goldPriceUSD = metals[0].gold / 31.1035; // 1 troy oz = 31.1035g
    silverPriceUSD = metals[1].silver / 31.1035;
  } catch (e) {
    // fallback to default
  }
  try {
    // Currency rates (USD to others)
    const fxRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const fx = await fxRes.json();
    window.fxRates = fx.rates;
  } catch (e) {
    window.fxRates = { USD: 1, PKR: 280, EUR: 0.92, GBP: 0.78, INR: 83, SAR: 3.75, AED: 3.67 };
  }
}

// --- Populate Currency Dropdown ---
function populateCurrencies() {
  currencySelect.innerHTML = '';
  currencies.forEach(cur => {
    const opt = document.createElement('option');
    opt.value = cur.code;
    opt.textContent = `${cur.name} (${cur.code})`;
    currencySelect.appendChild(opt);
  });
}

// --- Update Nisab Info ---
function updateNisabInfo() {
  const type = zakatTypeSelect.value;
  const currency = currencySelect.value;
  let nisab = 0, nisabText = '';
  let pricePerGramUSD = type === 'silver' ? silverPriceUSD : goldPriceUSD;
  let nisabGrams = nisabThresholds[type] || nisabThresholds['gold'];
  if (type === 'cash' || type === 'business') nisabGrams = nisabThresholds['gold'];
  if (type === 'agriculture') nisabGrams = 0; // handled separately
  nisab = pricePerGramUSD * nisabGrams;
  // Convert to selected currency
  const fx = window.fxRates || { USD: 1 };
  const rate = fx[currency] || 1;
  const nisabInCurrency = nisab * rate;
  if (type === 'agriculture') {
    nisabText = 'Nisab for agriculture: 653 kg of wheat or equivalent.';
  } else {
    nisabText = `Nisab: ${nisabGrams.toFixed(2)}g × ${pricePerGramUSD.toFixed(2)} USD/g = $${nisab.toFixed(2)} USD ≈ ${nisabInCurrency.toLocaleString(undefined, { style: 'currency', currency })} (${currency})`;
  }
  nisabInfo.textContent = nisabText;
  zakatForm.dataset.nisab = nisabInCurrency;
}

// --- Zakat Calculation ---
zakatForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const type = zakatTypeSelect.value;
  const currency = currencySelect.value;
  const assets = parseFloat(document.getElementById('assets').value) || 0;
  const liabilities = parseFloat(document.getElementById('liabilities').value) || 0;
  const percentage = parseFloat(document.getElementById('percentage').value) || 2.5;
  const netAssets = assets - liabilities;
  const nisab = parseFloat(zakatForm.dataset.nisab) || 0;
  let zakatDue = 0;
  let eligible = false;
  let explanation = '';
  if (type === 'agriculture') {
    // For agriculture, zakat is 5% (rain) or 10% (irrigated) of produce above 653kg
    explanation = 'For agriculture, zakat is due if produce exceeds 653kg. Standard rates: 5% (irrigated), 10% (rain-fed).';
    if (netAssets >= 653) {
      zakatDue = netAssets * (percentage / 100);
      eligible = true;
    }
  } else {
    eligible = netAssets >= nisab;
    if (eligible) {
      zakatDue = netAssets * (percentage / 100);
    }
  }
  if (!eligible) {
    resultDiv.textContent = `You are not eligible to pay zakat. Net assets are below the nisab threshold.`;
    explanationDiv.textContent = explanation;
    return;
  }
  resultDiv.textContent = `Zakat Due: ${zakatDue.toLocaleString(undefined, { style: 'currency', currency })} (${currency})`;
  explanationDiv.innerHTML = `
    <strong>Calculation:</strong><br/>
    Net Assets = Assets (${assets}) - Liabilities (${liabilities}) = ${netAssets}<br/>
    Nisab Threshold = ${nisab.toLocaleString(undefined, { style: 'currency', currency })}<br/>
    Zakat Percentage = ${percentage}%<br/>
    <strong>Zakat Due = Net Assets × Percentage = ${netAssets} × ${percentage/100} = ${zakatDue.toLocaleString(undefined, { style: 'currency', currency })}</strong>
    <br/><br/>${explanation}
  `;
});

// --- Event Listeners ---
currencySelect.addEventListener('change', updateNisabInfo);
zakatTypeSelect.addEventListener('change', updateNisabInfo);

// --- On Load ---
window.addEventListener('DOMContentLoaded', async () => {
  populateCurrencies();
  await fetchLivePrices();
  updateNisabInfo();
});

// ============== AI ASSISTANT FUNCTIONALITY ==============

class IslamicAIAssistant {
  constructor() {
    this.chatHistory = document.getElementById('chatHistory');
    this.userInput = document.getElementById('userInput');
    this.sendBtn = document.getElementById('sendBtn');
    this.sendText = document.getElementById('sendText');
    this.loadingText = document.getElementById('loadingText');
    
    this.defaultApiKey = 'AIzaSyCUCMsd8L1Uy-NblGNdB1sLisPKB8TU17U'; // Replace with your actual Gemini API key
    this.isLoading = false;
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    this.sendBtn.addEventListener('click', () => this.sendMessage());
    this.userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    // Auto-resize textarea
    this.userInput.addEventListener('input', () => {
      this.userInput.style.height = 'auto';
      this.userInput.style.height = this.userInput.scrollHeight + 'px';
    });
  }
  
  async sendMessage() {
    const message = this.userInput.value.trim();
    if (!message || this.isLoading) return;
    
    // Check if the question is Islamic/Zakat related
    if (!this.isIslamicQuestion(message)) {
      this.addMessage('user', message);
      this.addMessage('assistant', 
        "معذرت، میں صرف اسلامی اور زکات سے متعلق سوالات کا جواب دے سکتا ہوں۔ برائے کرم اسلام، زکات، اسلامی فقہ، یا اسلامی مالیات کے بارے میں سوال پوچھیں۔\n\nSorry, I can only answer questions related to Islam and Zakat. Please ask questions about Islam, Zakat, Islamic jurisprudence (Fiqh), or Islamic finance."
      );
      this.userInput.value = '';
      return;
    }
    
    this.addMessage('user', message);
    this.userInput.value = '';
    this.setLoading(true);
    
    try {
      const response = await this.callGeminiAPI(message);
      this.addMessage('assistant', response);
    } catch (error) {
      console.error('AI Assistant Error:', error);
      this.addMessage('assistant', 
        "معذرت، اس وقت کوئی تکنیکی مسئلہ ہے۔ براہ کرم تھوڑی دیر بعد دوبارہ کوشش کریں۔\n\nSorry, there's a technical issue at the moment. Please try again later.\n\nError: " + error.message
      );
    } finally {
      this.setLoading(false);
    }
  }
  
  isIslamicQuestion(question) {
    const islamicKeywords = [
      // English
      'islam', 'islamic', 'muslim', 'allah', 'prophet', 'quran', 'hadith', 'sunnah',
      'zakat', 'zakah', 'sadaqah', 'charity', 'nisab', 'fiqh', 'shariah', 'sharia',
      'halal', 'haram', 'makruh', 'mustahab', 'wajib', 'fard', 'sunnah',
      'prayer', 'salah', 'namaz', 'hajj', 'umrah', 'ramadan', 'fast', 'iftar',
      'imam', 'masjid', 'mosque', 'mecca', 'medina', 'kaaba', 'qibla',
      'jihad', 'ummah', 'iman', 'tawhid', 'shirk', 'kufr', 'munafiq',
      'islamic finance', 'riba', 'interest', 'usury', 'murabaha', 'musharaka',
      'ijarah', 'sukuk', 'takaful', 'islamic bank', 'shura', 'bay',
      
      // Urdu/Arabic
      'اسلام', 'مسلم', 'مسلمان', 'اللہ', 'رسول', 'نبی', 'قرآن', 'حدیث', 'سنت',
      'زکات', 'زکوٰة', 'صدقہ', 'خیرات', 'نصاب', 'فقہ', 'شریعت',
      'حلال', 'حرام', 'مکروہ', 'مستحب', 'واجب', 'فرض',
      'نماز', 'صلاۃ', 'حج', 'عمرہ', 'رمضان', 'روزہ', 'افطار',
      'امام', 'مسجد', 'مکہ', 'مدینہ', 'کعبہ', 'قبلہ',
      'جہاد', 'امت', 'ایمان', 'توحید', 'شرک', 'کفر', 'منافق',
      'اسلامی بینکاری', 'سود', 'ربا', 'مرابحہ', 'مشارکہ', 'اجارہ', 'صکوک'
    ];
    
    const lowerQuestion = question.toLowerCase();
    return islamicKeywords.some(keyword => 
      lowerQuestion.includes(keyword.toLowerCase())
    );
  }
  
  async callGeminiAPI(userMessage) {
    const apiKey = this.defaultApiKey;
    
    if (apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      throw new Error('API key not configured. Please contact the site administrator.');
    }
    
    const systemPrompt = `You are an Islamic AI Assistant specializing in Islamic knowledge, Zakat, and Islamic finance. 

IMPORTANT RULES:
1. ONLY answer questions related to Islam, Zakat, Islamic jurisprudence (Fiqh), Islamic finance, Quran, Hadith, and Islamic practices.
2. If asked about non-Islamic topics, politely redirect to Islamic topics.
3. Always provide authentic Islamic guidance based on Quran and Sunnah.
4. When discussing Islamic rulings, mention that users should consult qualified Islamic scholars for specific situations.
5. Be respectful and start responses with Islamic greetings when appropriate.
6. Provide practical examples when explaining Zakat calculations.
7. Support both English and Urdu languages.
8. Always emphasize the importance of seeking knowledge from qualified Islamic scholars for complex matters.

Format your responses in a clear, helpful manner. Use bullet points and examples when helpful.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    
    const requestBody = {
      contents: [{
        parts: [{
          text: `${systemPrompt}\n\nUser Question: ${userMessage}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH", 
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from AI service');
    }

    return data.candidates[0].content.parts[0].text;
  }
  
  addMessage(type, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Convert line breaks to HTML breaks and handle basic formatting
    const formattedContent = content
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    messageContent.innerHTML = formattedContent;
    messageDiv.appendChild(messageContent);
    
    this.chatHistory.appendChild(messageDiv);
    this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
  }
  
  setLoading(loading) {
    this.isLoading = loading;
    this.sendBtn.disabled = loading;
    
    if (loading) {
      this.sendText.style.display = 'none';
      this.loadingText.style.display = 'inline';
      this.addTypingIndicator();
    } else {
      this.sendText.style.display = 'inline';
      this.loadingText.style.display = 'none';
      this.removeTypingIndicator();
    }
  }
  
  addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'assistant-message typing-indicator-message';
    typingDiv.innerHTML = `
      <div class="message-content typing-indicator">
        <span>Assistant is typing</span>
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    
    this.chatHistory.appendChild(typingDiv);
    this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
  }
  
  removeTypingIndicator() {
    const typingIndicator = this.chatHistory.querySelector('.typing-indicator-message');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
}

// Initialize AI Assistant when page loads
window.addEventListener('DOMContentLoaded', () => {
  new IslamicAIAssistant();
});