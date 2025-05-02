const weatherDescriptions = {
  0: { description: "Clear sky", icon: "☀️" },
  1: { description: "Mainly clear", icon: "🌤️" },
  2: { description: "Partly cloudy", icon: "⛅" },
  3: { description: "Overcast", icon: "☁️" },
  45: { description: "Fog", icon: "🌫️" },
  48: { description: "Depositing rime fog", icon: "🌫️" },
  51: { description: "Light drizzle", icon: "🌦️" },
  53: { description: "Moderate drizzle", icon: "🌧️" },
  55: { description: "Dense drizzle", icon: "🌧️" },
  56: { description: "Light freezing drizzle", icon: "🌨️" },
  57: { description: "Dense freezing drizzle", icon: "🌨️" },
  61: { description: "Slight rain", icon: "🌧️" },
  63: { description: "Moderate rain", icon: "🌧️" },
  65: { description: "Heavy rain", icon: "🌧️" },
  66: { description: "Light freezing rain", icon: "🌨️" },
  67: { description: "Heavy freezing rain", icon: "🌨️" },
  71: { description: "Slight snow fall", icon: "❄️" },
  73: { description: "Moderate snow fall", icon: "❄️" },
  75: { description: "Heavy snow fall", icon: "❄️" },
  77: { description: "Snow grains", icon: "🌨️" },
  80: { description: "Slight rain showers", icon: "🌦️" },
  81: { description: "Moderate rain showers", icon: "🌧️" },
  82: { description: "Violent rain showers", icon: "🌧️" },
  85: { description: "Slight snow showers", icon: "🌨️" },
  86: { description: "Heavy snow showers", icon: "🌨️" },
  95: { description: "Thunderstorm", icon: "🌩️" },
  96: { description: "Thunderstorm with slight hail", icon: "⛈️" },
  99: { description: "Thunderstorm with heavy hail", icon: "⛈️" },
};

const cityField = document.getElementById("cityField");
const suggestionsList = document.getElementById("suggestionsList");

cityField.addEventListener("input", async () => {
  const query = cityField.value.trim();
  if (query.length < 1) {
    suggestionsList.innerHTML = "";
    return;
  }

  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${query}`
    );
    const data = await response.json();
    suggestionsList.innerHTML = "";

    if (data.results) {
      data.results.forEach((result) => {
        const li = document.createElement("li");
        li.textContent = `${result.name}, ${result.country}`;
        li.addEventListener("click", () => {
          cityField.value = result.name;
          suggestionsList.innerHTML = "";
          getCoordinates(li.textContent);
        });
        suggestionsList.appendChild(li);
      });
    }
  } catch (err) {
    console.error("Error fetching suggestions:", err);
  }
});

// Optional: close suggestion list when clicking outside
document.addEventListener("click", (e) => {
  if (!document.querySelector(".searchContainer").contains(e.target)) {
    suggestionsList.innerHTML = "";
  }
});

document.getElementById("searchBtn").addEventListener("click", () => {
    const city = document.getElementById("cityField").value.trim();
    if (city) {
      getCoordinates(city);
    } else {
      showError("Please enter a city name");
    }
  });

  async function getCoordinates(city) {
    showLoading();
    showError("");
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
      );
  
      if (!response.ok) {
        throw new Error("City not found");
      }
  
      const data = await response.json();
      if (!data.results || data.results.length === 0) {
        throw new Error("Location not found");
      }
  
      const { latitude, longitude, name, country } = data.results[0];
      getWeather(latitude, longitude, name, country);
    } catch (error) {
      showError(error.message);
    }
  }
  async function getWeather(latitude, longitude, city, country) {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
  
      if (!response.ok) {
        throw new Error("Weather data not available");
      }
  
      const data = await response.json();
      displayWeather(data.current_weather, city, country);
    } catch (error) {
      showError(error.message);
    }
  }

  function displayWeather(weather, city, country) {
    const code = weather.weathercode;
    const weatherCondition = weatherDescriptions[code]?.description || "Unknown Condition";
    const weatherIcon = weatherDescriptions[code]?.icon || "❓";
    const cityHeader = document.getElementById("cityName");
    const temp = document.getElementById("temperature");
    const condition = document.getElementById("condition");
    const windSpeed = document.getElementById("windSpeed");
    
    weatherContainer.style.display = "block";
    cityHeader.textContent = `${city}, ${country}`;
    temp.textContent = `Temperature: ${weather.temperature}°C`;
    condition.textContent = `Condition: ${weatherIcon} ${weatherCondition}`;
    windSpeed.textContent = `Wind Speed: ${weather.windspeed} km/h`;
    hideLoading();
  }

  function showError(message) {
    const weatherContainer = document.getElementById("weatherContainer");
    weatherContainer.style.display = "none";
    const errorPara = document.getElementById("errorMessage");
    errorPara.textContent = message;
    hideLoading();
  }

  function showLoading() {
    document.getElementById("loadingMessage").style.display = "block";
  }
  
  function hideLoading() {
    document.getElementById("loadingMessage").style.display = "none";
  }
  
  document.getElementById("toggleThemeBtn").addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });
  
  