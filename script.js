/* ========================================
   ZAKATFLOW - ENHANCED JAVASCRIPT
   ======================================== */

// Global Configuration
const CONFIG = {
  // AI API Keys - Add your own keys here
  GEMINI_API_KEY: 'AIzaSyCUCMsd8L1Uy-NblGNdB1sLisPKB8TU17U',
  HUGGINGFACE_API_KEY: '', // Free alternative
  OPENAI_API_KEY: '', // If you have one
  
  // API Endpoints
  GEMINI_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  HUGGINGFACE_ENDPOINT: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large',
  
  // Currency Exchange API
  EXCHANGE_API: 'https://api.exchangerate-api.com/v4/latest/USD',
  GOLD_SILVER_API: 'https://api.metals.live/v1/spot',
  
  // Islamic Content Keywords for filtering
  ISLAMIC_KEYWORDS: [
    'islam', 'islamic', 'muslim', 'allah', 'quran', 'hadith', 'prophet', 'muhammad',
    'zakat', 'salah', 'hajj', 'fasting', 'ramadan', 'eid', 'halal', 'haram',
    'fiqh', 'shariah', 'sunnah', 'masjid', 'mosque', 'imam', 'dua', 'prayer',
    'اسلام', 'مسلم', 'اللہ', 'قرآن', 'حدیث', 'نبی', 'زکات', 'نماز', 'حج',
    'روزہ', 'رمضان', 'عید', 'حلال', 'حرام', 'فقہ', 'شریعت', 'سنت', 'مسجد'
  ]
};

// Global Variables
let exchangeRates = {};
let goldPrice = 0;
let silverPrice = 0;
let currentAI = 'gemini'; // Default AI provider

// ============== INITIALIZATION ==============
document.addEventListener('DOMContentLoaded', function() {
  // Initialize all components
  initializeZakatCalculator();
  initializeAIAssistant();
  initializeMobileMenu();
  initializeCurrencyData();
  initializeScrollEffects();
  initializeFormAnimations();
  
  console.log('ZakatFlow initialized successfully! 🚀');
});

// ============== MOBILE NAVIGATION ==============
function initializeMobileMenu() {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', function() {
      navLinks.classList.toggle('active');
      mobileMenuBtn.classList.toggle('active');
    });
    
    // Close menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
      });
    });
  }
}

// ============== SMOOTH SCROLLING & EFFECTS ==============
function initializeScrollEffects() {
  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Intersection Observer for animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  // Observe elements for animation
  document.querySelectorAll('.feature-card, .floating-card, .story-card, .stat-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// ============== FORM ANIMATIONS ==============
function initializeFormAnimations() {
  const inputs = document.querySelectorAll('.form-input, .form-select, .chat-input');
  
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
      if (!this.value) {
        this.parentElement.classList.remove('focused');
      }
    });
  });
}

// ============== CURRENCY DATA INITIALIZATION ==============
async function initializeCurrencyData() {
  try {
    // Fetch exchange rates
    const exchangeResponse = await fetch(CONFIG.EXCHANGE_API);
    const exchangeData = await exchangeResponse.json();
    exchangeRates = exchangeData.rates;
    
    // Fetch gold and silver prices
    try {
      const metalResponse = await fetch(CONFIG.GOLD_SILVER_API);
      const metalData = await metalResponse.json();
      goldPrice = metalData.gold || 65; // Fallback price per gram in USD
      silverPrice = metalData.silver || 0.8; // Fallback price per gram in USD
    } catch (error) {
      console.warn('Using fallback metal prices');
      goldPrice = 65;
      silverPrice = 0.8;
    }
    
    populateCurrencyDropdown();
    updateNisabInfo();
    
  } catch (error) {
    console.error('Error fetching currency data:', error);
    // Use fallback data
    exchangeRates = {
      USD: 1, EUR: 0.85, GBP: 0.73, PKR: 280, INR: 83,
      SAR: 3.75, AED: 3.67, CAD: 1.35, AUD: 1.52, JPY: 150
    };
    goldPrice = 65;
    silverPrice = 0.8;
    populateCurrencyDropdown();
    updateNisabInfo();
  }
}

// ============== ZAKAT CALCULATOR ==============
function initializeZakatCalculator() {
  const zakatForm = document.getElementById('zakatForm');
  const zakatTypeSelect = document.getElementById('zakatType');
  const currencySelect = document.getElementById('currency');
  
  if (zakatForm) {
    zakatForm.addEventListener('submit', calculateZakat);
  }
  
  if (zakatTypeSelect) {
    zakatTypeSelect.addEventListener('change', updateNisabInfo);
  }
  
  if (currencySelect) {
    currencySelect.addEventListener('change', updateNisabInfo);
  }
}

function populateCurrencyDropdown() {
  const currencySelect = document.getElementById('currency');
  if (!currencySelect) return;
  
  const currencies = [
    { code: 'USD', name: '🇺🇸 US Dollar', symbol: '$' },
    { code: 'EUR', name: '🇪🇺 Euro', symbol: '€' },
    { code: 'GBP', name: '🇬🇧 British Pound', symbol: '£' },
    { code: 'PKR', name: '🇵🇰 Pakistani Rupee', symbol: '₨' },
    { code: 'INR', name: '🇮🇳 Indian Rupee', symbol: '₹' },
    { code: 'SAR', name: '🇸🇦 Saudi Riyal', symbol: 'ر.س' },
    { code: 'AED', name: '🇦🇪 UAE Dirham', symbol: 'د.إ' },
    { code: 'CAD', name: '🇨🇦 Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: '🇦🇺 Australian Dollar', symbol: 'A$' },
    { code: 'JPY', name: '🇯🇵 Japanese Yen', symbol: '¥' },
    { code: 'TRY', name: '🇹🇷 Turkish Lira', symbol: '₺' },
    { code: 'MYR', name: '🇲🇾 Malaysian Ringgit', symbol: 'RM' },
    { code: 'IDR', name: '🇮🇩 Indonesian Rupiah', symbol: 'Rp' },
    { code: 'BDT', name: '🇧🇩 Bangladeshi Taka', symbol: '৳' },
    { code: 'EGP', name: '🇪🇬 Egyptian Pound', symbol: 'ج.م' }
  ];
  
  currencySelect.innerHTML = '';
  currencies.forEach(currency => {
    const option = document.createElement('option');
    option.value = currency.code;
    option.textContent = currency.name;
    currencySelect.appendChild(option);
  });
}

function updateNisabInfo() {
  const zakatType = document.getElementById('zakatType')?.value;
  const currency = document.getElementById('currency')?.value || 'USD';
  const nisabInfoElement = document.getElementById('nisabInfo');
  
  if (!nisabInfoElement || !zakatType) return;
  
  const rate = exchangeRates[currency] || 1;
  const currencySymbol = getCurrencySymbol(currency);
  
  let nisabValue = 0;
  let nisabText = '';
  
  switch (zakatType) {
    case 'gold':
      nisabValue = (goldPrice * 87.48 * rate).toFixed(2); // 87.48 grams of gold
      nisabText = `Gold Nisab: ${currencySymbol}${nisabValue} (87.48g of gold)`;
      break;
    case 'silver':
      nisabValue = (silverPrice * 612.36 * rate).toFixed(2); // 612.36 grams of silver
      nisabText = `Silver Nisab: ${currencySymbol}${nisabValue} (612.36g of silver)`;
      break;
    case 'cash':
      nisabValue = (goldPrice * 87.48 * rate).toFixed(2); // Use gold standard for cash
      nisabText = `Cash Nisab: ${currencySymbol}${nisabValue} (equivalent to 87.48g of gold)`;
      break;
    case 'business':
      nisabValue = (goldPrice * 87.48 * rate).toFixed(2);
      nisabText = `Business Nisab: ${currencySymbol}${nisabValue} (total business assets)`;
      break;
    case 'agriculture':
      nisabText = `Agriculture: 300 Saa (approx. 612kg) for crops. Zakat varies: 10% for rain-fed, 5% for irrigated crops.`;
      break;
  }
  
  nisabInfoElement.innerHTML = `
    <div class="nisab-content">
      <i class="fas fa-info-circle"></i>
      <span>${nisabText}</span>
    </div>
  `;
}

function calculateZakat(event) {
  event.preventDefault();
  
  const zakatType = document.getElementById('zakatType').value;
  const currency = document.getElementById('currency').value;
  const assets = parseFloat(document.getElementById('assets').value) || 0;
  const liabilities = parseFloat(document.getElementById('liabilities').value) || 0;
  const percentage = parseFloat(document.getElementById('percentage').value) || 2.5;
  
  const netAssets = assets - liabilities;
  const zakatAmount = (netAssets * percentage) / 100;
  
  const currencySymbol = getCurrencySymbol(currency);
  const rate = exchangeRates[currency] || 1;
  const nisabThreshold = getNisabThreshold(zakatType, rate);
  
  const resultElement = document.getElementById('result');
  const explanationElement = document.getElementById('explanation');
  
  if (netAssets >= nisabThreshold) {
    resultElement.innerHTML = `
      <div class="result-success">
        <div class="result-header">
          <i class="fas fa-check-circle"></i>
          <h3>Zakat Calculation Result</h3>
        </div>
        <div class="result-body">
          <div class="amount-display">
            <span class="currency">${currencySymbol}</span>
            <span class="amount">${zakatAmount.toFixed(2)}</span>
          </div>
          <p class="result-description">
            Your Zakat obligation for ${zakatType} assets
          </p>
          <div class="result-breakdown">
            <div class="breakdown-item">
              <span class="label">Net Assets:</span>
              <span class="value">${currencySymbol}${netAssets.toFixed(2)}</span>
            </div>
            <div class="breakdown-item">
              <span class="label">Zakat Rate:</span>
              <span class="value">${percentage}%</span>
            </div>
            <div class="breakdown-item">
              <span class="label">Nisab Threshold:</span>
              <span class="value">${currencySymbol}${nisabThreshold.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    explanationElement.innerHTML = getZakatExplanation(zakatType, zakatAmount, currencySymbol);
    
  } else {
    resultElement.innerHTML = `
      <div class="result-info">
        <div class="result-header">
          <i class="fas fa-info-circle"></i>
          <h3>No Zakat Due</h3>
        </div>
        <div class="result-body">
          <p>Your net assets (${currencySymbol}${netAssets.toFixed(2)}) are below the Nisab threshold (${currencySymbol}${nisabThreshold.toFixed(2)}).</p>
          <p>Zakat is not obligatory, but voluntary charity (Sadaqah) is always encouraged.</p>
        </div>
      </div>
    `;
    
    explanationElement.innerHTML = `
      <div class="explanation-content">
        <h4><i class="fas fa-book"></i> Understanding Nisab</h4>
        <p>Nisab is the minimum threshold for Zakat obligation. When your wealth exceeds this amount for a full lunar year, Zakat becomes due.</p>
        <p>Even if Zakat isn't required, remember that any form of charity (Sadaqah) brings great reward from Allah.</p>
      </div>
    `;
  }
  
  // Show results with animation
  resultElement.classList.add('show');
  explanationElement.classList.add('show');
  
  // Scroll to results
  resultElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  
  // Send calculation to AI for additional insights
  sendCalculationToAI(zakatType, zakatAmount, currencySymbol, netAssets);
}

function getNisabThreshold(zakatType, rate) {
  switch (zakatType) {
    case 'gold':
      return goldPrice * 87.48 * rate;
    case 'silver':
      return silverPrice * 612.36 * rate;
    case 'cash':
    case 'business':
      return goldPrice * 87.48 * rate;
    case 'agriculture':
      return 0; // Special calculation for agriculture
    default:
      return goldPrice * 87.48 * rate;
  }
}

function getCurrencySymbol(currency) {
  const symbols = {
    USD: '$', EUR: '€', GBP: '£', PKR: '₨', INR: '₹',
    SAR: 'ر.س', AED: 'د.إ', CAD: 'C$', AUD: 'A$', JPY: '¥',
    TRY: '₺', MYR: 'RM', IDR: 'Rp', BDT: '৳', EGP: 'ج.م'
  };
  return symbols[currency] || currency;
}

function getZakatExplanation(zakatType, amount, symbol) {
  const explanations = {
    gold: `
      <div class="explanation-content">
        <h4><i class="fas fa-coins"></i> Gold Zakat Explanation</h4>
        <p><strong>Your Zakat Amount: ${symbol}${amount.toFixed(2)}</strong></p>
        <p>Gold Zakat is calculated at 2.5% of the value of gold owned for a full lunar year, provided it exceeds the Nisab (87.48 grams).</p>
        <div class="hadith-quote">
          <i class="fas fa-quote-left"></i>
          <p>"The Prophet (ﷺ) said: 'On silver which is one hundred dirhams, two and a half dirhams are due, and nothing is due on it until it reaches this amount.'" - Abu Dawud</p>
        </div>
        <div class="next-steps">
          <h5>How to Pay:</h5>
          <ul>
            <li>Pay in cash equivalent to local currency</li>
            <li>Distribute to the eight categories of Zakat recipients</li>
            <li>Pay before the end of the lunar year</li>
          </ul>
        </div>
      </div>
    `,
    silver: `
      <div class="explanation-content">
        <h4><i class="fas fa-gem"></i> Silver Zakat Explanation</h4>
        <p><strong>Your Zakat Amount: ${symbol}${amount.toFixed(2)}</strong></p>
        <p>Silver Zakat is 2.5% of silver owned for a full lunar year, with Nisab at 612.36 grams (equivalent to 200 dirhams).</p>
        <div class="hadith-quote">
          <i class="fas fa-quote-left"></i>
          <p>"When you have two hundred dirhams and one full year passes on them, then five dirhams are due on them." - Abu Dawud</p>
        </div>
      </div>
    `,
    cash: `
      <div class="explanation-content">
        <h4><i class="fas fa-money-bill-wave"></i> Cash Zakat Explanation</h4>
        <p><strong>Your Zakat Amount: ${symbol}${amount.toFixed(2)}</strong></p>
        <p>Cash and savings that exceed Nisab for a full year are subject to 2.5% Zakat. This includes bank savings, investments, and cash holdings.</p>
        <div class="recipients-info">
          <h5><i class="fas fa-users"></i> Zakat Recipients (8 Categories):</h5>
          <ul>
            <li>The poor (Al-Fuqara)</li>
            <li>The needy (Al-Masakin)</li>
            <li>Zakat collectors (Al-Amilina Alaiha)</li>
            <li>Those whose hearts are to be reconciled (Al-Muallafatu Qulubuhum)</li>
            <li>To free slaves (Ar-Riqab)</li>
            <li>The debt-ridden (Al-Gharimin)</li>
            <li>In the path of Allah (Fi Sabilillah)</li>
            <li>The traveler (Ibn As-Sabil)</li>
          </ul>
        </div>
      </div>
    `,
    business: `
      <div class="explanation-content">
        <h4><i class="fas fa-building"></i> Business Zakat Explanation</h4>
        <p><strong>Your Zakat Amount: ${symbol}${amount.toFixed(2)}</strong></p>
        <p>Business Zakat is calculated on trade goods, inventory, and business assets at 2.5% annually.</p>
        <div class="calculation-note">
          <h5>What to Include:</h5>
          <ul>
            <li>Inventory and stock</li>
            <li>Accounts receivable</li>
            <li>Cash and bank balances</li>
            <li>Exclude: Fixed assets, equipment, debts owed</li>
          </ul>
        </div>
      </div>
    `,
    agriculture: `
      <div class="explanation-content">
        <h4><i class="fas fa-seedling"></i> Agricultural Zakat Explanation</h4>
        <p>Agricultural Zakat varies based on irrigation method:</p>
        <ul>
          <li><strong>10% (Ushr):</strong> Rain-fed or natural irrigation</li>
          <li><strong>5%:</strong> Artificial irrigation with effort and cost</li>
        </ul>
        <p>Nisab: 300 Saa (approximately 612 kg) of crops</p>
        <div class="hadith-quote">
          <i class="fas fa-quote-left"></i>
          <p>"On what is watered by rain or springs, one-tenth (10%), and on what is watered by irrigation, one-twentieth (5%)." - Bukhari</p>
        </div>
      </div>
    `
  };
  
  return explanations[zakatType] || explanations.cash;
}

async function sendCalculationToAI(zakatType, amount, symbol, netAssets) {
  const prompt = `I just calculated my Zakat: Type: ${zakatType}, Amount: ${symbol}${amount.toFixed(2)}, Net Assets: ${symbol}${netAssets.toFixed(2)}. Can you provide brief Islamic guidance about paying Zakat and its spiritual significance?`;
  
  try {
    const response = await sendToAI(prompt);
    if (response) {
      addMessageToChat('ZakatFlow AI', response, 'assistant');
    }
  } catch (error) {
    console.error('Error sending calculation to AI:', error);
  }
}

// ============== AI ASSISTANT ==============
class IslamicAIAssistant {
  constructor() {
    this.chatHistory = document.getElementById('chatHistory');
    this.userInput = document.getElementById('userInput');
    this.sendBtn = document.getElementById('sendBtn');
    this.sendText = document.getElementById('sendText');
    this.loadingText = document.getElementById('loadingText');
    
    this.isLoading = false;
    
    this.setupEventListeners();
    this.setupAIProviders();
  }
  
  setupEventListeners() {
    if (this.sendBtn) {
      this.sendBtn.addEventListener('click', () => this.sendMessage());
    }
    
    if (this.userInput) {
      this.userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
      
      // Auto-resize textarea
      this.userInput.addEventListener('input', this.autoResize);
    }
  }
  
  setupAIProviders() {
    // Check which AI providers are available
    if (CONFIG.GEMINI_API_KEY) {
      currentAI = 'gemini';
    } else if (CONFIG.HUGGINGFACE_API_KEY) {
      currentAI = 'huggingface';
    } else {
      currentAI = 'fallback';
    }
    
    console.log(`Using AI provider: ${currentAI}`);
  }
  
  autoResize(e) {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  }
  
  async sendMessage() {
    const message = this.userInput.value.trim();
    if (!message || this.isLoading) return;
    
    // Check if message is Islamic-related
    if (!this.isIslamicContent(message)) {
      this.showNonIslamicWarning();
      return;
    }
    
    // Add user message to chat
    this.addUserMessage(message);
    this.userInput.value = '';
    this.userInput.style.height = 'auto';
    
    // Set loading state
    this.setLoading(true);
    
    try {
      const response = await sendToAI(message);
      
      if (response) {
        this.addAssistantMessage(response);
      } else {
        this.addAssistantMessage("I apologize, but I'm having trouble connecting to the AI service. Please try again in a moment.");
      }
      
    } catch (error) {
      console.error('AI Error:', error);
      this.addAssistantMessage("I apologize for the technical difficulty. Please try asking your question again.");
    } finally {
      this.setLoading(false);
    }
  }
  
  isIslamicContent(message) {
    const messageWords = message.toLowerCase().split(/\s+/);
    return CONFIG.ISLAMIC_KEYWORDS.some(keyword => 
      messageWords.some(word => word.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(word))
    );
  }
  
  showNonIslamicWarning() {
    const warningHTML = `
      <div class="assistant-message">
        <div class="message-avatar">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="message-content warning-message">
          <div class="message-header">
            <span class="assistant-name">ZakatFlow AI</span>
            <span class="message-time">${this.getCurrentTime()}</span>
          </div>
          <p><strong>Islamic Content Only</strong></p>
          <p>I can only answer questions related to Islam, Zakat, Islamic finance, and Islamic practices. Please ask me about:</p>
          <ul class="feature-list">
            <li><i class="fas fa-check"></i> Zakat calculations and rules</li>
            <li><i class="fas fa-check"></i> Islamic jurisprudence (Fiqh)</li>
            <li><i class="fas fa-check"></i> Quran and Hadith guidance</li>
            <li><i class="fas fa-check"></i> Islamic finance principles</li>
            <li><i class="fas fa-check"></i> Halal and Haram matters</li>
          </ul>
        </div>
      </div>
    `;
    
    this.chatHistory.innerHTML += warningHTML;
    this.scrollToBottom();
  }
  
  addUserMessage(message) {
    const messageHTML = `
      <div class="user-message">
        <div class="message-avatar">
          <i class="fas fa-user"></i>
        </div>
        <div class="message-content">
          <div class="message-header">
            <span class="message-time">${this.getCurrentTime()}</span>
          </div>
          <p>${this.formatMessage(message)}</p>
        </div>
      </div>
    `;
    
    this.chatHistory.innerHTML += messageHTML;
    this.scrollToBottom();
  }
  
  addAssistantMessage(message) {
    const messageHTML = `
      <div class="assistant-message">
        <div class="message-avatar">
          <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
          <div class="message-header">
            <span class="assistant-name">ZakatFlow AI</span>
            <span class="message-time">${this.getCurrentTime()}</span>
          </div>
          ${this.formatMessage(message)}
        </div>
      </div>
    `;
    
    this.chatHistory.innerHTML += messageHTML;
    this.scrollToBottom();
  }
  
  formatMessage(message) {
    // Convert newlines to paragraphs
    const paragraphs = message.split('\n').filter(p => p.trim());
    return paragraphs.map(p => `<p>${p}</p>`).join('');
  }
  
  getCurrentTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  setLoading(loading) {
    this.isLoading = loading;
    
    if (loading) {
      this.sendText.style.display = 'none';
      this.loadingText.style.display = 'inline';
      this.sendBtn.disabled = true;
      
      // Add typing indicator
      const typingHTML = `
        <div class="assistant-message typing-message">
          <div class="message-avatar">
            <i class="fas fa-robot"></i>
          </div>
          <div class="message-content">
            <div class="typing-indicator">
              <span>ZakatFlow AI is typing</span>
              <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      `;
      
      this.chatHistory.innerHTML += typingHTML;
      this.scrollToBottom();
      
    } else {
      this.sendText.style.display = 'inline';
      this.loadingText.style.display = 'none';
      this.sendBtn.disabled = false;
      
      // Remove typing indicator
      const typingMessage = this.chatHistory.querySelector('.typing-message');
      if (typingMessage) {
        typingMessage.remove();
      }
    }
  }
  
  scrollToBottom() {
    this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
  }
}

// ============== AI API FUNCTIONS ==============
async function sendToAI(message) {
  switch (currentAI) {
    case 'gemini':
      return await sendToGemini(message);
    case 'huggingface':
      return await sendToHuggingFace(message);
    default:
      return await sendToFallbackAI(message);
  }
}

async function sendToGemini(message) {
  if (!CONFIG.GEMINI_API_KEY || CONFIG.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    throw new Error('Gemini API key not configured');
  }
  
  const prompt = `You are an Islamic AI assistant for ZakatFlow. You only answer questions about Islam, Zakat, Islamic finance, Quran, Hadith, and Islamic practices. Be concise but informative. Question: ${message}`;
  
  const response = await fetch(`${CONFIG.GEMINI_ENDPOINT}?key=${CONFIG.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    })
  });
  
  if (!response.ok) {
    throw new Error('Gemini API request failed');
  }
  
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
}

async function sendToHuggingFace(message) {
  if (!CONFIG.HUGGINGFACE_API_KEY) {
    throw new Error('HuggingFace API key not configured');
  }
  
  const response = await fetch(CONFIG.HUGGINGFACE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.HUGGINGFACE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: message,
      parameters: {
        max_length: 200,
        temperature: 0.7
      }
    })
  });
  
  if (!response.ok) {
    throw new Error('HuggingFace API request failed');
  }
  
  const data = await response.json();
  return data.generated_text || 'Sorry, I could not generate a response.';
}

async function sendToFallbackAI(message) {
  // Fallback responses for common Islamic questions
  const fallbackResponses = {
    'zakat': 'Zakat is the third pillar of Islam, requiring Muslims to give 2.5% of their eligible wealth annually to those in need. It purifies wealth and helps the community.',
    'prayer': 'Prayer (Salah) is the second pillar of Islam. Muslims pray five times daily: Fajr, Dhuhr, Asr, Maghrib, and Isha.',
    'nisab': 'Nisab is the minimum threshold of wealth that makes Zakat obligatory. It\'s equivalent to 87.48 grams of gold or 612.36 grams of silver.',
    'halal': 'Halal means permissible in Islam. It applies to food, business practices, and all aspects of life according to Islamic law.',
    'haram': 'Haram means forbidden in Islam. Muslims must avoid haram acts to maintain their spiritual purity and obedience to Allah.',
    'default': 'I apologize, but I need an active internet connection to provide detailed Islamic guidance. Please ensure you have internet access and try again.'
  };
  
  const messageLower = message.toLowerCase();
  
  for (const [key, response] of Object.entries(fallbackResponses)) {
    if (messageLower.includes(key)) {
      return response;
    }
  }
  
  return fallbackResponses.default;
}

// Helper function for adding messages to chat (used by calculator)
function addMessageToChat(sender, message, type) {
  const ai = new IslamicAIAssistant();
  if (type === 'assistant') {
    ai.addAssistantMessage(message);
  }
}

// ============== INITIALIZATION ==============
function initializeAIAssistant() {
  // Initialize AI Assistant
  const aiAssistant = new IslamicAIAssistant();
  
  // Make it globally accessible
  window.zakatFlowAI = aiAssistant;
}

// ============== ANALYTICS & TRACKING ==============
function trackEvent(eventName, eventData = {}) {
  // Basic event tracking (can be enhanced with Google Analytics, etc.)
  console.log(`Event: ${eventName}`, eventData);
  
  // You can add Google Analytics or other tracking services here
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, eventData);
  }
}

// Track calculator usage
document.addEventListener('DOMContentLoaded', function() {
  const zakatForm = document.getElementById('zakatForm');
  if (zakatForm) {
    zakatForm.addEventListener('submit', function() {
      trackEvent('zakat_calculation', {
        zakat_type: document.getElementById('zakatType')?.value,
        currency: document.getElementById('currency')?.value
      });
    });
  }
});

// ============== ERROR HANDLING ==============
window.addEventListener('error', function(event) {
  console.error('ZakatFlow Error:', event.error);
  
  // Show user-friendly error message
  const errorToast = document.createElement('div');
  errorToast.className = 'error-toast';
  errorToast.innerHTML = `
    <div class="toast-content">
      <i class="fas fa-exclamation-triangle"></i>
      <span>Something went wrong. Please refresh the page and try again.</span>
      <button onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  document.body.appendChild(errorToast);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (errorToast.parentElement) {
      errorToast.remove();
    }
  }, 5000);
});

console.log('🕌 ZakatFlow JavaScript loaded successfully!');
