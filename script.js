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

// --- Responsive Nav Smooth Scroll ---
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault();
      document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// --- Populate Currency Dropdown ---
const currencySelect = document.getElementById('currency');
const currencies = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'PKR', name: 'Pakistani Rupee' },
  { code: 'SAR', name: 'Saudi Riyal' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'EUR', name: 'Euro' },
  { code: 'TRY', name: 'Turkish Lira' },
  { code: 'MYR', name: 'Malaysian Ringgit' },
  { code: 'IDR', name: 'Indonesian Rupiah' },
  // ... add more as needed ...
];
currencies.forEach(c => {
  const opt = document.createElement('option');
  opt.value = c.code;
  opt.textContent = `${c.name} (${c.code})`;
  currencySelect.appendChild(opt);
});

// --- Zakat Calculator Logic ---
document.getElementById('zakatForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const type = document.getElementById('zakatType').value;
  const assets = parseFloat(document.getElementById('assets').value) || 0;
  const liabilities = parseFloat(document.getElementById('liabilities').value) || 0;
  const percentage = parseFloat(document.getElementById('percentage').value) || 2.5;
  const netAssets = assets - liabilities;
  let nisab = 0;
  let nisabText = '';
  if (type === 'gold') {
    nisab = 87.48 * getGoldPrice();
    nisabText = `Nisab (gold): 87.48g × gold price = ${formatCurrency(nisab)}`;
  } else if (type === 'silver') {
    nisab = 612.36 * getSilverPrice();
    nisabText = `Nisab (silver): 612.36g × silver price = ${formatCurrency(nisab)}`;
  } else {
    nisab = 87.48 * getGoldPrice();
    nisabText = `Nisab (gold): 87.48g × gold price = ${formatCurrency(nisab)}`;
  }
  document.getElementById('nisabInfo').textContent = nisabText;
  if (netAssets < nisab) {
    document.getElementById('result').textContent = 'Your assets are below the nisab threshold. Zakat is not obligatory.';
    document.getElementById('explanation').textContent = '';
    return;
  }
  const zakat = (netAssets * percentage) / 100;
  document.getElementById('result').textContent = `Zakat Due: ${formatCurrency(zakat)}`;
  document.getElementById('explanation').textContent = 'Zakat is calculated as a percentage of your net assets above the nisab.';
});

function getGoldPrice() {
  // Placeholder: Use a fixed price or fetch from an API
  return 75; // USD per gram (example)
}
function getSilverPrice() {
  // Placeholder: Use a fixed price or fetch from an API
  return 1; // USD per gram (example)
}
function formatCurrency(amount) {
  const code = document.getElementById('currency').value || 'USD';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).format(amount);
}

// --- AI Q&A Integration (Hugging Face Inference API) ---
const aiForm = document.getElementById('aiForm');
const aiQuestion = document.getElementById('aiQuestion');
const aiAnswer = document.getElementById('aiAnswer');
aiForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  aiAnswer.textContent = 'Thinking...';
  const question = aiQuestion.value.trim();
  if (!question) return;
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/google/flan-t5-base', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: question })
    });
    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    if (Array.isArray(data) && data[0]?.generated_text) {
      aiAnswer.textContent = data[0].generated_text;
    } else if (data?.generated_text) {
      aiAnswer.textContent = data.generated_text;
    } else {
      aiAnswer.textContent = 'Sorry, I could not find an answer.';
    }
  } catch (err) {
    aiAnswer.textContent = 'Error: Unable to get answer. Try again later.';
  }
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