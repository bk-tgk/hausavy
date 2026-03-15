function renderSharedNav(activePage) {
  const nav = document.getElementById('site-header');
  if (!nav) return;
  nav.innerHTML = `
    <div class="container nav-shell" id="navShell">
      <a class="brand" href="index.html" aria-label="Hausavy home">
        <span class="brand-mark">H</span>
        <span>hausavy</span>
      </a>

      <nav class="nav-links" aria-label="Primary">
        <a href="index.html" ${activePage === 'home' ? 'aria-current="page"' : ''}>Home</a>
        <a href="about.html" ${activePage === 'about' ? 'aria-current="page"' : ''}>About</a>
        <a href="how-it-works.html" ${activePage === 'how' ? 'aria-current="page"' : ''}>How It Works</a>
        <a href="pricing.html" ${activePage === 'pricing' ? 'aria-current="page"' : ''}>Pricing</a>
        <a href="contact.html" ${activePage === 'contact' ? 'aria-current="page"' : ''}>Contact</a>
      </nav>

      <div class="header-actions">
        <a class="btn btn-secondary" href="about.html">Why Hausavy</a>
        <a class="btn btn-primary" href="get-started.html">Let's Get Started</a>
      </div>

      <button class="mobile-menu-btn" type="button" aria-label="Open navigation" id="mobileMenuBtn">☰</button>
    </div>
  `;

  const shell = document.getElementById('navShell');
  const menuBtn = document.getElementById('mobileMenuBtn');
  if (shell && menuBtn) {
    menuBtn.addEventListener('click', () => shell.classList.toggle('is-open'));
  }
}

function renderSharedFooter() {
  const footer = document.getElementById('site-footer');
  if (!footer) return;
  const year = new Date().getFullYear();
  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div>
          <a class="brand" href="index.html">
            <span class="brand-mark">H</span>
            <span>hausavy</span>
          </a>
          <p class="footer-copy" style="max-width: 30rem; margin-top: 1rem;">
            A premium self-guided home-selling experience for modern homeowners who want more control, better visibility, and more equity left at closing.
          </p>
        </div>

        <div class="footer-links">
          <a href="index.html">Home</a>
          <a href="about.html">About Us</a>
          <a href="how-it-works.html">How It Works</a>
          <a href="pricing.html">Pricing</a>
          <a href="contact.html">Contact</a>
          <a href="get-started.html">Get Started</a>
        </div>
      </div>

      <div class="footer-bottom">
        <span>© ${year} Hausavy. All rights reserved.</span>
        <span>Designed for a multi-page static site structure.</span>
      </div>
    </div>
  `;
}

async function geocodeAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(address)}`;
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'en' }
  });
  if (!res.ok) throw new Error('Could not geocode address');
  const data = await res.json();
  if (!data.length) throw new Error('No match found for that address');
  return { lat: data[0].lat, lon: data[0].lon, displayName: data[0].display_name };
}

async function getNearbyRecommendations(lat, lon) {
  const query = `
    [out:json][timeout:25];
    (
      node(around:3500,${lat},${lon})[amenity=school];
      node(around:4000,${lat},${lon})[shop=supermarket];
      node(around:4000,${lat},${lon})[shop=convenience];
      node(around:4500,${lat},${lon})[tourism=attraction];
      node(around:4500,${lat},${lon})[leisure=park];
    );
    out tags center 30;
  `;

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' }
  });

  if (!res.ok) throw new Error('Could not pull local recommendations');
  const data = await res.json();
  return data.elements || [];
}

function scoreDistance(lat1, lon1, lat2, lon2) {
  const toRad = deg => deg * Math.PI / 180;
  const R = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function buildRecommendationBuckets(home, items) {
  const normalized = items
    .map(item => ({
      name: item.tags?.name || 'Nearby place',
      category: item.tags?.amenity || item.tags?.shop || item.tags?.tourism || item.tags?.leisure || 'local',
      lat: Number(item.lat || item.center?.lat),
      lon: Number(item.lon || item.center?.lon)
    }))
    .filter(item => item.name && item.lat && item.lon)
    .map(item => ({ ...item, distance: scoreDistance(Number(home.lat), Number(home.lon), item.lat, item.lon) }))
    .sort((a, b) => a.distance - b.distance);

  const pick = (predicate, limit = 4) => normalized.filter(predicate).slice(0, limit);
  const groceries = pick(item => item.category === 'supermarket' || item.category === 'convenience');
  const schools = pick(item => item.category === 'school');
  const lifestyle = pick(item => item.category === 'park' || item.category === 'attraction');

  const specialGrocers = groceries.filter(g => /costco|whole foods|trader joe/i.test(g.name));

  return {
    groceries: specialGrocers.length ? [...specialGrocers, ...groceries.filter(g => !specialGrocers.includes(g))].slice(0, 4) : groceries,
    schools,
    lifestyle
  };
}

function renderRecommendations(container, home, buckets) {
  const sections = [
    { title: 'Nearby schools', items: buckets.schools },
    { title: 'Nearby grocery options', items: buckets.groceries },
    { title: 'Parks & landmarks', items: buckets.lifestyle }
  ];

  const cards = sections.map(section => `
    <article class="recommendation-card fade-up">
      <h4>${section.title}</h4>
      ${section.items.length ? `
        <ul class="clean-list">
          ${section.items.map(item => `
            <li>
              <span class="check">•</span>
              <span>${item.name} <span class="small">(${item.distance.toFixed(1)} mi)</span></span>
            </li>
          `).join('')}
        </ul>
      ` : `<p class="small">No nearby matches were returned from the demo map query.</p>`}
    </article>
  `).join('');

  container.innerHTML = `
    <div class="inline-note fade-up">
      Address match found: ${home.displayName}. These local highlights can be appended to your property narrative automatically after the backend is connected.
    </div>
    <div class="recommendations-grid">${cards}</div>
  `;
}

function initWizard() {
  const form = document.getElementById('signupWizard');
  if (!form) return;

  const steps = Array.from(form.querySelectorAll('.form-step'));
  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.getElementById('prevBtn');
  const progressBar = document.getElementById('progressBar');
  const status = document.getElementById('wizardStatus');
  const submitBtn = document.getElementById('submitBtn');
  const recommendationsEl = document.getElementById('recommendations');
  const addressNote = document.getElementById('addressNote');
  const confirmation = document.getElementById('confirmation');

  let current = 0;
  let cachedRecommendations = null;

  function showStep(index) {
    steps.forEach((step, i) => step.classList.toggle('active', i === index));
    current = index;
    const progress = Math.round(((index + 1) / steps.length) * 100);
    progressBar.style.width = `${progress}%`;
    status.textContent = `Step ${index + 1}`;
    prevBtn.classList.toggle('hidden', index === 0);
    nextBtn.classList.toggle('hidden', index === steps.length - 1);
    submitBtn.classList.toggle('hidden', index !== steps.length - 1);
  }

  function validateCurrentStep() {
    const active = steps[current];
    const requiredFields = Array.from(active.querySelectorAll('[required]'));
    for (const field of requiredFields) {
      if (!field.value.trim()) {
        field.reportValidity();
        return false;
      }
      if (field.type === 'email' && !field.checkValidity()) {
        field.reportValidity();
        return false;
      }
    }
    return true;
  }

  async function maybeBuildRecommendations() {
    const address = form.querySelector('[name="address"]').value.trim();
    if (!address || cachedRecommendations) return;

    addressNote.textContent = 'Building local recommendations from the property address…';
    addressNote.classList.remove('hidden');

    try {
      const home = await geocodeAddress(address);
      const items = await getNearbyRecommendations(home.lat, home.lon);
      cachedRecommendations = buildRecommendationBuckets(home, items);
      renderRecommendations(recommendationsEl, home, cachedRecommendations);
      addressNote.classList.add('hidden');
    } catch (error) {
      addressNote.textContent = error.message + '. The rest of the signup flow still works.';
      recommendationsEl.innerHTML = '';
    }
  }

  nextBtn.addEventListener('click', async () => {
    if (!validateCurrentStep()) return;
    if (current === 1) {
      await maybeBuildRecommendations();
    }
    showStep(Math.min(current + 1, steps.length - 1));
  });

  prevBtn.addEventListener('click', () => showStep(Math.max(current - 1, 0)));

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!validateCurrentStep()) return;

    const formData = Object.fromEntries(new FormData(form).entries());
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, recommendations: cachedRecommendations })
      });

      if (!res.ok) {
        throw new Error('Backend not connected yet. Update /api/signup to store leads and send email.');
      }

      confirmation.classList.remove('hidden');
      confirmation.innerHTML = '<div class="inline-note">Thanks. Your details were submitted successfully and routed to the admin inbox.</div>';
      form.reset();
      cachedRecommendations = null;
      recommendationsEl.innerHTML = '';
      showStep(0);
    } catch (error) {
      confirmation.classList.remove('hidden');
      confirmation.innerHTML = `<div class="notice">${error.message}</div>`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Complete signup';
    }
  });

  showStep(0);
}
