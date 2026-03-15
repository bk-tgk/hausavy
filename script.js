const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');
if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => mainNav.classList.toggle('open'));
}

const propertySeeds = [
  { address: '123 Main St, Los Angeles, CA', value: 1450000, lat: 34.0522, lng: -118.2437 },
  { address: '485 Ocean Ave, Santa Monica, CA', value: 2895000, lat: 34.0195, lng: -118.4912 },
  { address: '82 Lincoln Ave, San Jose, CA', value: 1240000, lat: 37.3382, lng: -121.8863 },
  { address: '19 Willow Glen Dr, San Jose, CA', value: 1680000, lat: 37.3008, lng: -121.8947 },
  { address: '310 Park Place, Irvine, CA', value: 1785000, lat: 33.6846, lng: -117.8265 },
  { address: '27 Flower St, Newport Beach, CA', value: 3250000, lat: 33.6189, lng: -117.9298 },
  { address: '78 Palm Ct, Dallas, TX', value: 760000, lat: 32.7767, lng: -96.797 },
  { address: '900 Maple Ave, Austin, TX', value: 925000, lat: 30.2672, lng: -97.7431 }
];

const formatMoney = value => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
}).format(value);

function updateMap(lat, lng) {
  const mapFrame = document.getElementById('mapFrame');
  if (!mapFrame) return;
  const url = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.02}%2C${lat - 0.02}%2C${lng + 0.02}%2C${lat + 0.02}&layer=mapnik&marker=${lat}%2C${lng}`;
  mapFrame.innerHTML = `<iframe title="Property map" src="${url}" loading="lazy"></iframe>`;
}

function updateSavings(value, rate, valueTargetId = 'estimatedValue', savingsTargetId = 'savingsValue') {
  const valueNode = document.getElementById(valueTargetId);
  const savingsNode = document.getElementById(savingsTargetId);
  if (valueNode) valueNode.textContent = formatMoney(value);
  if (savingsNode) savingsNode.textContent = formatMoney(value * rate);
}

const addressInput = document.getElementById('addressInput');
const suggestions = document.getElementById('suggestions');
const estimateButton = document.getElementById('estimateButton');
const commissionRate = document.getElementById('commissionRate');
let selectedProperty = propertySeeds[2];

function renderSuggestions(list) {
  if (!suggestions) return;
  suggestions.innerHTML = '';
  list.forEach(item => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'suggestion-item';
    button.textContent = item.address;
    button.addEventListener('click', () => {
      selectedProperty = item;
      addressInput.value = item.address;
      suggestions.innerHTML = '';
      const rate = commissionRate ? Number(commissionRate.value) : 0.055;
      updateSavings(item.value, rate);
      updateMap(item.lat, item.lng);
    });
    suggestions.appendChild(button);
  });
}

if (addressInput) {
  addressInput.addEventListener('input', event => {
    const query = event.target.value.toLowerCase().trim();
    if (query.length < 2) {
      suggestions.innerHTML = '';
      return;
    }
    const matches = propertySeeds.filter(item => item.address.toLowerCase().includes(query)).slice(0, 5);
    renderSuggestions(matches);
  });
}

if (estimateButton) {
  estimateButton.addEventListener('click', () => {
    const typed = addressInput && addressInput.value.trim();
    const match = propertySeeds.find(item => item.address.toLowerCase() === typed.toLowerCase());
    if (match) selectedProperty = match;
    const rate = commissionRate ? Number(commissionRate.value) : 0.055;
    updateSavings(selectedProperty.value, rate);
    updateMap(selectedProperty.lat, selectedProperty.lng);
  });
}

if (commissionRate) {
  commissionRate.addEventListener('change', event => updateSavings(selectedProperty.value, Number(event.target.value)));
}

if (document.body.dataset.page === 'home') {
  updateSavings(selectedProperty.value, Number(commissionRate?.value || 0.055));
  updateMap(selectedProperty.lat, selectedProperty.lng);
}

const homeValueInput = document.getElementById('homeValueInput');
const planCommission = document.getElementById('planCommission');
const fullCommissionCost = document.getElementById('fullCommissionCost');
const guidedSavings = document.getElementById('guidedSavings');
const premiumSavings = document.getElementById('premiumSavings');

function updatePricingCalculator() {
  if (!homeValueInput || !planCommission) return;
  const salePrice = Number(homeValueInput.value || 0);
  const rate = Number(planCommission.value);
  const commissionCost = salePrice * rate;
  fullCommissionCost.textContent = formatMoney(commissionCost);
  guidedSavings.textContent = formatMoney(Math.max(0, commissionCost - 149));
  premiumSavings.textContent = formatMoney(Math.max(0, commissionCost - 349));
}

[homeValueInput, planCommission].forEach(node => node && node.addEventListener('input', updatePricingCalculator));
updatePricingCalculator();

const steps = [
  {
    title: 'Set your sale strategy',
    summary: 'Clarify your timing, goals, and constraints before you start making tactical decisions.',
    body: 'Choose your ideal closing window, your walk-away number, whether you need a rent-back, and how much work you want to handle personally.',
    tasks: ['Set a target move date', 'Write down your minimum acceptable outcome', 'Decide whether speed or price matters more']
  },
  {
    title: 'Estimate value and review comps',
    summary: 'Use comparable homes and market context to avoid pricing too high or too low.',
    body: 'Look at recently sold homes, active competition, and condition differences. A price that is reasonable on day one can improve interest and negotiating power.',
    tasks: ['Review three to five close comps', 'Note size, condition, lot, and upgrades', 'Set a target price range']
  },
  {
    title: 'Prepare the home',
    summary: 'Remove distractions and finish high-impact work before taking photos.',
    body: 'Complete repairs, touch-up paint, declutter surfaces, and make the property feel bright, clean, and easy to picture living in.',
    tasks: ['Fix obvious defects', 'Declutter and depersonalize', 'Decide if staging is worth it']
  },
  {
    title: 'Build the listing package',
    summary: 'Your photos, description, disclosures, and features need to feel complete and trustworthy.',
    body: 'Strong listing assets set the tone. Buyers need clean visuals, a compelling description, and the right factual information up front.',
    tasks: ['Capture high-quality photos', 'Write the description', 'Gather property facts and disclosures']
  },
  {
    title: 'Launch the listing',
    summary: 'Go live with a coordinated launch, not a scattered one.',
    body: 'Make sure the listing is published correctly, your response process is ready, and your first week creates momentum instead of confusion.',
    tasks: ['Publish the listing', 'Share through your chosen channels', 'Prepare standard inquiry replies']
  },
  {
    title: 'Manage showings',
    summary: 'Keep showings organized, safe, and professional.',
    body: 'Create a showing window strategy, decide how access works, and keep the home consistently ready for buyer visits.',
    tasks: ['Set showing rules', 'Create a prep routine', 'Track feedback after tours']
  },
  {
    title: 'Review offers',
    summary: 'The best offer is not always the highest number.',
    body: 'Compare financing, contingencies, timeline, earnest money, and the buyer’s overall strength before choosing your next move.',
    tasks: ['Compare all economic terms', 'Review contingencies', 'Evaluate financing quality']
  },
  {
    title: 'Negotiate terms',
    summary: 'Negotiate with intention and document each change clearly.',
    body: 'Use counters to protect your priorities, whether that is price, speed, flexibility, repairs, or certainty of closing.',
    tasks: ['Decide your counter strategy', 'Clarify terms in writing', 'Confirm final accepted contract details']
  },
  {
    title: 'Track escrow and contingencies',
    summary: 'Once under contract, timing matters.',
    body: 'Stay on top of inspections, appraisal, disclosures, document requests, and contingency removal dates so the transaction stays on track.',
    tasks: ['Track milestone deadlines', 'Prepare for inspection and appraisal', 'Document buyer requests and responses']
  },
  {
    title: 'Close and hand off',
    summary: 'Finish strong with the right final checks.',
    body: 'Confirm closing documents, transfer details, utilities, keys, and possession terms so the final handoff feels smooth and complete.',
    tasks: ['Confirm final settlement details', 'Plan utilities and move-out', 'Prepare keys, access items, and final handoff']
  }
];

const stepCounter = document.getElementById('stepCounter');
const stepTitle = document.getElementById('stepTitle');
const stepTitleSide = document.getElementById('stepTitleSide');
const stepSummarySide = document.getElementById('stepSummarySide');
const stepEyebrow = document.getElementById('stepEyebrow');
const stepBody = document.getElementById('stepBody');
const taskList = document.getElementById('taskList');
const prevStep = document.getElementById('prevStep');
const nextStep = document.getElementById('nextStep');
const progressRing = document.querySelector('.progress-ring');
let currentStep = 0;

function renderStep() {
  if (!stepTitle || !taskList) return;
  const step = steps[currentStep];
  stepCounter.textContent = `${currentStep + 1} / ${steps.length}`;
  stepTitle.textContent = step.title;
  stepTitleSide.textContent = step.title;
  stepSummarySide.textContent = step.summary;
  stepEyebrow.textContent = `Step ${currentStep + 1}`;
  stepBody.textContent = step.body;
  taskList.innerHTML = step.tasks.map(task => `<li>${task}</li>`).join('');
  prevStep.disabled = currentStep === 0;
  nextStep.textContent = currentStep === steps.length - 1 ? 'Start over' : 'Next step';
  if (progressRing) {
    const degrees = ((currentStep + 1) / steps.length) * 360;
    progressRing.style.background = `conic-gradient(var(--primary) ${degrees}deg, rgba(19,33,29,0.08) 0)`;
  }
}

if (prevStep && nextStep) {
  prevStep.addEventListener('click', () => {
    currentStep = Math.max(0, currentStep - 1);
    renderStep();
  });
  nextStep.addEventListener('click', () => {
    currentStep = currentStep === steps.length - 1 ? 0 : currentStep + 1;
    renderStep();
  });
  renderStep();
}
