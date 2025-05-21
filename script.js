const form = document.getElementById('search-form');
const cityInput = document.getElementById('city');
const weatherOutput = document.getElementById('weather-output');
const tipsList = document.getElementById('tips-list');
const tickerText = document.getElementById('ticker-text');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const rawInput = cityInput.value.trim();
  if (!rawInput) return;

  weatherOutput.innerHTML = '<p class="loading">Scanning... Stand by.</p>';

  try {
    const location = await fetchCoordinates(rawInput);
    const { lat, lon, name, country, state } = location;

    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    if (!weatherRes.ok) throw new Error('Weather fetch failed');
    const weatherData = await weatherRes.json();

    displayWeather(weatherData, name, state, country);
  } catch (error) {
    weatherOutput.innerHTML = `<p class="error">⚠️ Signal lost. Could not retrieve data for "${rawInput}".</p>`;
    console.error(error);
  }
});

async function fetchCoordinates(query) {
  const geoResponse = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${API_KEY}`
  );
  if (!geoResponse.ok) throw new Error('Geo fetch failed');
  const locations = await geoResponse.json();
  if (!locations.length) throw new Error('No location match found');
  return locations[0];
}

function displayWeather(data, name, state, country) {
  const apocalypseWeather = reinterpretWeather(data.weather[0].main);
  const temperature = Math.round(data.main.temp);
  const locationLabel = `${name}${state ? ', ' + state : ''}, ${country}`;

  weatherOutput.innerHTML = `
    <h3>${locationLabel}</h3>
    <p><strong>Status:</strong> ${apocalypseWeather}</p>
    <p><strong>Temp:</strong> ${temperature}°C</p>
  `;

  updateSurvivalTips(apocalypseWeather);
  updateTicker(locationLabel, apocalypseWeather);
}

function reinterpretWeather(original) {
  const mapping = {
    Clear: 'Toxic Sunlight',
    Clouds: 'Ash Clouds',
    Rain: 'Acid Rain',
    Drizzle: 'Light Acid Mist',
    Thunderstorm: 'Electrostatic Disturbance',
    Snow: 'Ashfall',
    Mist: 'Spore Fog',
    Smoke: 'Burning Fields',
    Haze: 'Post-Combustion Air',
    Dust: 'Particle Storm',
    Fog: 'Unknown Obscuration',
    Sand: 'Skin-Flaying Wind',
    Ash: 'Volcanic Fallout',
    Squall: 'Wind Shear Event',
    Tornado: 'Vortex Protocol'
  };

  return mapping[original] || `Unclassified Anomaly (${original})`;
}

function updateSurvivalTips(status) {
  const tips = {
    'Toxic Sunlight': ["Avoid surface exposure."],
    'Acid Rain': ["Seek shelter immediately in reinforced zones."],
    'Ashfall': ["Wear respiratory filters."]
  };

  const advice = tips[status] || ["Remain indoors where possible."];
  tipsList.innerHTML = advice.map(tip => `<li>${tip}</li>`).join('');
}

function updateTicker(location, status) {
  tickerText.textContent = `⚠️ ${location.toUpperCase()}: ${status} detected. Avoid exposure zones.`;
}