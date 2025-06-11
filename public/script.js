// Weather API configuration
const API_KEY = 'YOUR_API_KEY'; // Replace with your actual API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Weather condition to icon mapping
const weatherIcons = {
    'Clear': 'fa-sun',
    'Clouds': 'fa-cloud',
    'Rain': 'fa-cloud-rain',
    'Drizzle': 'fa-cloud-rain',
    'Thunderstorm': 'fa-bolt',
    'Snow': 'fa-snowflake',
    'Mist': 'fa-smog',
    'Smoke': 'fa-smog',
    'Haze': 'fa-smog',
    'Dust': 'fa-smog',
    'Fog': 'fa-smog',
    'Sand': 'fa-smog',
    'Ash': 'fa-smog',
    'Squall': 'fa-wind',
    'Tornado': 'fa-tornado'
};

// Function to fetch weather data
async function getWeatherData(city) {
    try {
        const response = await fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}

// Function to update UI with weather data
function updateWeatherUI(data) {
    if (!data) return;

    // Update location
    document.querySelector('.location').textContent = `${data.name}, ${data.sys.country}`;

    // Update current weather
    document.querySelector('.condition').textContent = data.weather[0].main;
    document.querySelector('.temperature').textContent = `${Math.round(data.main.temp)}°C`;

    // Update weather icon
    const iconClass = weatherIcons[data.weather[0].main] || 'fa-sun';
    document.querySelector('.weather-icon i').className = `fas ${iconClass}`;

    // Update background based on weather condition
    const weatherCondition = data.weather[0].main.toLowerCase();
    document.body.className = ''; // Clear existing classes
    document.body.classList.add(`weather-bg-${weatherCondition}`);

    // Update stats
    document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = `${data.main.humidity}%`;
    document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = `${data.main.humidity}%`;
    document.querySelector('.stat-card:nth-child(3) .stat-value').textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;

    // Update date
    const now = new Date();
    document.querySelector('.day').textContent = now.toLocaleDateString('en-US', { weekday: 'long' });
    document.querySelector('.date').textContent = now.toLocaleDateString('en-US', { 
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    // Forecast updates are not needed as per the reverted HTML structure, but we need to ensure their default styles are set if they are not already in CSS
}

// Event listeners 
document.querySelector('.location-selector').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const city = e.target.value;
        const weatherData = await getWeatherData(city);
        if (weatherData) {
            updateWeatherUI(weatherData);
        } else {
            alert('Location not found. Please try again.');
        }
    }
});

document.querySelector('.change-location').addEventListener('click', () => {
    document.querySelector('.location-selector').focus();
});

// Initial load with default city
window.addEventListener('load', async () => {
    const defaultCity = 'London';
    const weatherData = await getWeatherData(defaultCity);
    updateWeatherUI(weatherData);
}); 