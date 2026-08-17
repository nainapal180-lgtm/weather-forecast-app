const state = {
    weather: null,
    unit: "C",
    recentCities: JSON.parse(
        localStorage.getItem("skycastRecentCities") || "[]"
    )
};


// ===============================
// HTML ELEMENTS
// ===============================

const form = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const recentWrap = document.getElementById("recentWrap");
const recentCities = document.getElementById("recentCities");

const loadingState = document.getElementById("loadingState");
const weatherContent = document.getElementById("weatherContent");

const locationName = document.getElementById("locationName");
const todayDate = document.getElementById("todayDate");
const weatherDescription =
    document.getElementById("weatherDescription");

const weatherIcon = document.getElementById("weatherIcon");

const todayTemp = document.getElementById("todayTemp");
const todayUnit = document.getElementById("todayUnit");

const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const feelsLike = document.getElementById("feelsLike");
const daylight = document.getElementById("daylight");

const unitToggle = document.getElementById("unitToggle");

const forecastGrid =
    document.getElementById("forecastGrid");

const errorBox =
    document.getElementById("errorBox");

const errorTitle =
    document.getElementById("errorTitle");

const errorMessage =
    document.getElementById("errorMessage");

const closeError =
    document.getElementById("closeError");


// ===============================
// API URLs
// ===============================

const WEATHER_API =
    "https://api.open-meteo.com/v1/forecast";

const GEOCODING_API =
    "https://geocoding-api.open-meteo.com/v1/search";


// ===============================
// WEATHER CODES
// ===============================

const weatherCodes = {

    0: ["Clear Sky", "☀️", "sunny"],

    1: ["Mainly Clear", "🌤️", "sunny"],

    2: ["Partly Cloudy", "⛅", "cloudy"],

    3: ["Overcast", "☁️", "cloudy"],

    45: ["Fog", "🌫️", "cloudy"],

    48: ["Fog", "🌫️", "cloudy"],

    51: ["Light Drizzle", "🌦️", "rainy"],

    53: ["Drizzle", "🌦️", "rainy"],

    55: ["Heavy Drizzle", "🌧️", "rainy"],

    61: ["Light Rain", "🌦️", "rainy"],

    63: ["Rain", "🌧️", "rainy"],

    65: ["Heavy Rain", "🌧️", "rainy"],

    66: ["Freezing Rain", "🌧️", "rainy"],

    67: ["Heavy Freezing Rain", "🌧️", "rainy"],

    71: ["Light Snow", "🌨️", "cloudy"],

    73: ["Snow", "❄️", "cloudy"],

    75: ["Heavy Snow", "❄️", "cloudy"],

    77: ["Snow Grains", "❄️", "cloudy"],

    80: ["Rain Showers", "🌦️", "rainy"],

    81: ["Rain Showers", "🌧️", "rainy"],

    82: ["Heavy Rain Showers", "🌧️", "rainy"],

    85: ["Snow Showers", "🌨️", "cloudy"],

    86: ["Heavy Snow Showers", "🌨️", "cloudy"],

    95: ["Thunderstorm", "⛈️", "rainy"],

    96: ["Thunderstorm with Hail", "⛈️", "rainy"],

    99: ["Severe Thunderstorm", "⛈️", "rainy"]
};


// ===============================
// GET WEATHER INFORMATION
// ===============================

function getWeatherMeta(code) {

    return (
        weatherCodes[code] ||
        ["Unknown", "🌡️", "cloudy"]
    );

}


// ===============================
// ERROR MESSAGE
// ===============================

function showError(title, message) {

    errorTitle.textContent = title;

    errorMessage.textContent = message;

    errorBox.classList.remove("hidden");

}


function hideError() {

    errorBox.classList.add("hidden");

}


// ===============================
// LOADING
// ===============================

function setLoading(isLoading) {

    if (isLoading) {

        loadingState.classList.remove("hidden");

        weatherContent.classList.add("hidden");

        searchBtn.disabled = true;

        searchBtn.textContent = "Searching...";

        locationBtn.disabled = true;

    } else {

        loadingState.classList.add("hidden");

        weatherContent.classList.remove("hidden");

        searchBtn.disabled = false;
        searchBtn.textContent = "Search";

        locationBtn.disabled = false;

    }

}


// ===============================
// TEMPERATURE CONVERSION
// ===============================

function celsiusToFahrenheit(celsius) {

    return (
        (celsius * 9) / 5 + 32
    );

}


function displayTemperature(celsius) {

    if (state.unit === "C") {

        return Math.round(celsius);

    }

    return Math.round(
        celsiusToFahrenheit(celsius)
    );

}


// ===============================
// DATE FORMAT
// ===============================

function formatDate(dateString) {

    return new Intl.DateTimeFormat(
        "en-IN",
        {
            weekday: "short",
            month: "short",
            day: "numeric"
        }
    ).format(
        new Date(`${dateString}T12:00:00`)
    );

}


// ===============================
// TIME FORMAT
// ===============================

function formatTime(dateTime) {

    return new Intl.DateTimeFormat(
        "en-IN",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    ).format(
        new Date(dateTime)
    );

}


// ===============================
// RECENT SEARCHES
// ===============================

function renderRecentCities() {

    recentCities.innerHTML =
        '<option value="">Recent Searches</option>';

    state.recentCities.forEach(
        (city) => {

            const option =
                document.createElement("option");

            option.value = city;

            option.textContent = city;

            recentCities.appendChild(option);

        }
    );

    if (state.recentCities.length > 0) {

        recentWrap.classList.remove("hidden");

    } else {

        recentWrap.classList.add("hidden");

    }

}


function saveRecentCity(city) {

    state.recentCities = [

        city,

        ...state.recentCities.filter(
            (item) =>
                item.toLowerCase() !==
                city.toLowerCase()
        )

    ].slice(0, 5);


    localStorage.setItem(
        "skycastRecentCities",
        JSON.stringify(state.recentCities)
    );


    renderRecentCities();

}


// ===============================
// DYNAMIC BACKGROUND
// ===============================

function updateBackground(weatherCode) {

    document.body.classList.remove(
        "sunny",
        "cloudy",
        "rainy"
    );

    const weather =
        getWeatherMeta(weatherCode);

    document.body.classList.add(
        weather[2]
    );

}


// ===============================
// DISPLAY TODAY WEATHER
// ===============================

function renderTodayWeather() {

    const current =
        state.weather.current;

    const location =
        state.weather.location;


    const weather =
        getWeatherMeta(
            current.weather_code
        );


    locationName.textContent =
        `${location.name}, ${location.country_code}`;


    todayDate.textContent =
        new Intl.DateTimeFormat(
            "en-IN",
            {
                weekday: "long",
                month: "long",
                day: "numeric"
            }
        ).format(new Date());


    weatherDescription.textContent =
        weather[0];


    weatherIcon.textContent =
        weather[1];


    todayTemp.textContent =
        displayTemperature(
            current.temperature_2m
        );


    todayUnit.textContent =
        `°${state.unit}`;


    humidity.textContent =
        `${Math.round(
            current.relative_humidity_2m
        )}%`;


    wind.textContent =
        `${Math.round(
            current.wind_speed_10m
        )} km/h`;


    feelsLike.textContent =
        `${displayTemperature(
            current.apparent_temperature
        )}°${state.unit}`;


    const sunrise =
        state.weather.daily.sunrise[0];

    const sunset =
        state.weather.daily.sunset[0];


    daylight.textContent =
        `${formatTime(
            sunrise
        )} - ${formatTime(
            sunset
        )}`;


    updateBackground(
        current.weather_code
    );


    renderForecast();


    // Extreme temperature alert
    if (current.temperature_2m > 40) {

        showError(
            "Extreme Temperature Alert",
            "Today's temperature is above 40°C. Stay hydrated and avoid prolonged exposure to direct heat."
        );

    }

}


// ===============================
// 5 DAY FORECAST
// ===============================

function renderForecast() {

    const daily =
        state.weather.daily;


    forecastGrid.innerHTML = "";


    for (let i = 1; i <= 5; i++) {

        const weather =
            getWeatherMeta(
                daily.weather_code[i]
            );


        const card =
            document.createElement("article");


        card.className =
            "forecast-card";


        card.innerHTML = `

            <div class="forecast-date">

                ${formatDate(
                    daily.time[i]
                )}

            </div>


            <div
                class="forecast-icon"
                title="${weather[0]}"
            >

                ${weather[1]}

            </div>


            <div class="forecast-temp">

                ${displayTemperature(
                    daily.temperature_2m_max[i]
                )}°${state.unit}

                <span
                    style="
                    color:#94a3b8;
                    font-size:14px;
                    "
                >

                    /
                    ${displayTemperature(
                        daily.temperature_2m_min[i]
                    )}°

                </span>

            </div>


            <p
                style="
                color:#64748b;
                font-size:12px;
                margin-top:5px;
                "
            >

                ${weather[0]}

            </p>


            <div class="forecast-metric">

                <span>💨 Wind</span>

                <strong>
                    ${Math.round(
                        daily.wind_speed_10m_max[i]
                    )} km/h
                </strong>

            </div>


            <div class="forecast-metric">

                <span>💧 Humidity</span>

                <strong>
                    ${Math.round(
                        daily.relative_humidity_2m_max[i]
                    )}%
                </strong>

            </div>

        `;


        forecastGrid.appendChild(card);

    }

}


// ===============================
// CITY SEARCH / GEOCODING
// ===============================

async function findCity(city) {

    const url =
        `${GEOCODING_API}?name=${encodeURIComponent(
            city
        )}&count=1&language=en&format=json`;


    const response =
        await fetch(url);


    if (!response.ok) {

        throw new Error(
            "Location service is unavailable."
        );

    }


    const data =
        await response.json();


    if (
        !data.results ||
        data.results.length === 0
    ) {

        throw new Error(
            `We couldn't find "${city}". Please check the city name.`
        );

    }


    return data.results[0];

}


// ===============================
// WEATHER API
// ===============================

async function getWeather(
    latitude,
    longitude,
    location
) {

    const params = new URLSearchParams({

        latitude,

        longitude,

        current:
            "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day",

        daily:
            "weather_code,temperature_2m_max,temperature_2m_min,relative_humidity_2m_max,wind_speed_10m_max,sunrise,sunset",

        forecast_days: "6",

        timezone: "auto"

    });


    const response =
        await fetch(
            `${WEATHER_API}?${params}`
        );


    if (!response.ok) {

        throw new Error(
            "Weather service is temporarily unavailable."
        );

    }


    const data =
        await response.json();


    return {
        ...data,
        location
    };

}


// ===============================
// SEARCH CITY
// ===============================

async function searchCity(city) {

    const cleanCity =
        city.trim();


    // Empty search validation
    if (!cleanCity) {

        showError(
            "City Name Required",
            "Please enter a city name before searching."
        );

        cityInput.focus();

        return;

    }


    hideError();

    setLoading(true);


    try {

        const location =
            await findCity(
                cleanCity
            );


        state.weather =
            await getWeather(
                location.latitude,
                location.longitude,
                location
            );


        saveRecentCity(
            location.name
        );


        renderTodayWeather();


    } catch (error) {

        showError(
            "Unable to Load Weather",
            error.message ||
            "Something went wrong. Please try again."
        );


    } finally {

        setLoading(false);

    }

}


// ===============================
// CURRENT LOCATION
// ===============================

function useCurrentLocation() {

    hideError();


    if (!navigator.geolocation) {

        showError(
            "Location Not Supported",
            "Your browser does not support location services."
        );

        return;

    }


    setLoading(true);


    navigator.geolocation.getCurrentPosition(

        async (position) => {

            try {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;


                state.weather =
                    await getWeather(
                        latitude,
                        longitude,
                        {
                            name: "Current Location",
                            country_code: ""
                        }
                    );


                renderTodayWeather();


            } catch (error) {

                showError(
                    "Location Weather Failed",
                    error.message ||
                    "Unable to load weather."
                );

            } finally {

                setLoading(false);

            }

        },


        (error) => {

            setLoading(false);


            if (error.code === 1) {

                showError(
                    "Location Permission Denied",
                    "Please allow location access or search by city."
                );

            } else {

                showError(
                    "Unable to Get Location",
                    "Please search for a city instead."
                );

            }

        },

        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        }

    );

}


// ===============================
// TEMPERATURE TOGGLE
// ===============================

unitToggle.addEventListener(
    "click",
    () => {

        state.unit =
            state.unit === "C"
                ? "F"
                : "C";


        if (state.weather) {

            renderTodayWeather();

        }

    }
);


// ===============================
// SEARCH EVENT
// ===============================

form.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();

        searchCity(
            cityInput.value
        );

    }
);


// ===============================
// CURRENT LOCATION EVENT
// ===============================

locationBtn.addEventListener(
    "click",
    useCurrentLocation
);


// ===============================
// RECENT CITY EVENT
// ===============================

recentCities.addEventListener(
    "change",
    (event) => {

        const city =
            event.target.value;


        if (city) {

            cityInput.value =
                city;


            searchCity(city);


            event.target.value =
                "";

        }

    }
);


// ===============================
// CLOSE ERROR
// ===============================

closeError.addEventListener(
    "click",
    hideError
);


// ===============================
// INPUT EVENT
// ===============================

cityInput.addEventListener(
    "input",
    () => {

        if (
            cityInput.value.trim()
        ) {

            hideError();

        }

    }
);


// ===============================
// INITIAL LOAD
// ===============================

renderRecentCities();


// Default city
searchCity("Ludhiana");