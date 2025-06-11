// Weather API configuration
const API_KEY = '14a425f3384254d46af6e475ed98648d'; // Replace with your actual API key
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

// Function to fetch current weather data
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

// Function to fetch 5-day forecast data
async function getForecastData(city) {
    try {
        const response = await fetch(`${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching forecast data:', error);
        return null;
    }
}

// Function to fetch weather data for a specific date
async function getWeatherDataForDate(city, date) {
    try {
        const response = await fetch(`${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        
        // Convert the selected date to a timestamp
        const targetDate = new Date(date);
        targetDate.setHours(12, 0, 0, 0);
        
        // Get all forecasts and convert their timestamps
        const forecasts = data.list.map(item => ({
            ...item,
            timestamp: new Date(item.dt * 1000)
        }));

        // Find the forecast closest to the target date
        const closestForecast = forecasts.reduce((closest, current) => {
            const currentDiff = Math.abs(current.timestamp - targetDate);
            const closestDiff = Math.abs(closest.timestamp - targetDate);
            return currentDiff < closestDiff ? current : closest;
        });

        // Check if the closest forecast is within 24 hours of the target date
        const timeDiff = Math.abs(closestForecast.timestamp - targetDate);
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        if (hoursDiff <= 24) {
            return {
                ...closestForecast,
                name: data.city.name,
                sys: { country: data.city.country }
            };
        } else {
            throw new Error('No data available for the selected date');
        }
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
    document.querySelector('.stat-item:nth-child(1) .stat-value').textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    document.querySelector('.stat-item:nth-child(2) .stat-value').textContent = `${data.main.humidity}%`;
    document.querySelector('.stat-item:nth-child(3) .stat-value').textContent = `${data.rain ? data.rain['1h'] : 0}%`;

    // Update date
    const date = new Date(data.dt * 1000);
    document.querySelector('.day').textContent = date.toLocaleDateString('en-US', { weekday: 'long' });
    document.querySelector('.date').textContent = date.toLocaleDateString('en-US', { 
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Function to update forecast UI
function updateForecastUI(data) {
    if (!data) return;

    const forecastDays = document.querySelectorAll('.forecast-day');
    const dailyData = processForecastData(data);

    dailyData.forEach((day, index) => {
        if (index < forecastDays.length) {
            const forecastDay = forecastDays[index];
            forecastDay.querySelector('.forecast-date').textContent = day.date;
            forecastDay.querySelector('.forecast-icon i').className = `fas ${weatherIcons[day.weather] || 'fa-sun'}`;
            forecastDay.querySelector('.forecast-temp').textContent = `${Math.round(day.temp)}°C`;
        }
    });
}

// Function to process forecast data and get daily averages
function processForecastData(data) {
    const dailyData = {};
    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateStr = date.toLocaleDateString('en-US', { 
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
        
        if (!dailyData[dateStr]) {
            dailyData[dateStr] = {
                date: dateStr,
                temp: item.main.temp,
                weather: item.weather[0].main,
                count: 1
            };
        } else {
            dailyData[dateStr].temp += item.main.temp;
            dailyData[dateStr].count++;
        }
    });

    return Object.values(dailyData).map(day => ({
        ...day,
        temp: day.temp / day.count
    }));
}

// Function to update weather data
async function updateWeatherData(city) {
    try {
        const dateSelector = document.querySelector('.date-selector');
        const selectedDate = dateSelector.value || new Date().toISOString().split('T')[0];
        
        const weatherData = await getWeatherDataForDate(city, selectedDate);
        if (weatherData) {
            updateWeatherUI(weatherData);
            return true;
        } else {
            throw new Error('No data available');
        }
    } catch (error) {
        console.error('Error updating weather data:', error);
        alert('Unable to fetch weather data. Please try again.');
        return false;
    }
}

// Event listeners
document.querySelector('.location-selector').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const city = e.target.value;
        if (city) {
            await updateWeatherData(city);
        }
    }
});

// Fix the change location button
document.querySelector('.change-location').addEventListener('click', async () => {
    const locationInput = document.querySelector('.location-selector');
    const city = locationInput.value;
    if (city) {
        await updateWeatherData(city);
    } else {
        locationInput.focus();
    }
});

// Fix the refresh button
document.querySelector('.refresh-weather').addEventListener('click', async () => {
    const city = document.querySelector('.location').textContent.split(',')[0];
    if (city) {
        await updateWeatherData(city);
    }
});

// Date selector event listener
document.querySelector('.date-selector').addEventListener('change', async (e) => {
    const selectedDate = e.target.value;
    const city = document.querySelector('.location').textContent.split(',')[0];
    
    if (city) {
        try {
            const weatherData = await getWeatherDataForDate(city, selectedDate);
            if (weatherData) {
                updateWeatherUI(weatherData);
            } else {
                throw new Error('No data available');
            }
        } catch (error) {
            alert('Weather data is not available for the selected date. Please try a date within the next 5 days.');
        }
    }
});