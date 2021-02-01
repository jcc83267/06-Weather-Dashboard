//query selectors
let inputEl = document.querySelector("#city-input");
let searchEl = document.querySelector("#btn-search");
let clearEl = document.querySelector("#clear-history");
let nameEl = document.querySelector("#city-name");
let currentWeatherPicEl = document.querySelector("#current-weather-pic");
let currentTempEl = document.querySelector("#temperature");
let currentHumidityEl = document.querySelector("#humidity");
let currentWindEl = document.querySelector("#wind-speed");
let currentUVEl = document.querySelector("#UV-index");
let historyEl = document.querySelector("#history");
let searchHistory = JSON.parse(localStorage.getItem("search")) || [];
const APIKey = "2e59343de613639600a4880871267c31";

//checks if box is empty
let cityCheckHandler = function (event) {
    event.preventDefault();
    let checkCity = inputEl.value
    if (checkCity) {
        getWeather(checkCity);
    } else {
        alert("Please enter a City")
    }
}

//get weather info and 5-day forecast
let getWeather = function (cityName) {
    let city = cityName.toLowerCase()
    // use city from textbox and use it in api
    let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKey}`;
    fetch(queryURL)
        .then(function (response) {
            //check if it got a response
            if (response.ok) {
                //check in history
                checkDuplicateCity(city);
                return response.json();
            } else {
                alert("Please enter a valid City")
            }
        })
        .then(function (response) {
            let currentDate = moment().format("L")
            nameEl.innerHTML = response.name + " (" + currentDate + ")";
            let weatherPic = response.weather[0].icon;
            currentWeatherPicEl.setAttribute("src", "https://openweathermap.org/img/wn/" + weatherPic + "@2x.png");
            currentWeatherPicEl.setAttribute("alt", response.weather[0].description);
            currentTempEl.innerHTML = "Temperature: " + kelvinToFahrenheit(response.main.temp) + " &#176F";
            currentHumidityEl.innerHTML = "Humidity: " + response.main.humidity + "%";
            currentWindEl.innerHTML = "Wind Speed: " + response.wind.speed + " MPH";
            let lat = response.coord.lat;
            let lon = response.coord.lon;
            //get UV index
            let UVQueryURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey + "&cnt=1";
            fetch(UVQueryURL)
                .then(function (response2) {
                    return response2.json();
                })
                .then(function (response2) {
                    let UVIndex = document.createElement("span");
                    currentUVEl.innerHTML = "UV Index: ";
                    let checkUVIndex = response2[0].value;
                    //change color for UV index based on levels
                    if (checkUVIndex < 2) {
                        UVIndex.setAttribute("class", "badge badge-success");
                    } else if (checkUVIndex < 8) {
                        UVIndex.setAttribute("class", "badge badge-warning");
                    } else {
                        UVIndex.setAttribute("class", "badge badge-danger");
                    }
                    UVIndex.innerHTML = checkUVIndex;
                    currentUVEl.append(UVIndex);
                });
            //grab city id and find the 5 day forecast
            let cityID = response.id;
            let forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&appid=" + APIKey;
            fetch(forecastQueryURL)
                .then(function (response2) {
                    return response2.json();
                })
                .then(function (response2) {
                    //  Parse response to display forecast for next 5 days underneath current conditions
                    let forecastEls = document.querySelectorAll(".forecast");
                    let varDate = moment().format("L");
                    for (i = 0; i < forecastEls.length; i++) {
                        forecastEls[i].innerHTML = "";
                        let forecastIndex = i * 8 + 4;
                        varDate = moment().add(i+1, "days").format("L");
                        let forecastDateEl = document.createElement("p");
                        forecastDateEl.setAttribute("class", "mt-3 mb-0 forecast-date");
                        forecastDateEl.innerHTML = varDate;
                        forecastEls[i].append(forecastDateEl);
                        let forecastWeatherEl = document.createElement("img");
                        forecastWeatherEl.setAttribute("src", "https://openweathermap.org/img/wn/" + response2.list[forecastIndex].weather[0].icon + "@2x.png");
                        forecastWeatherEl.setAttribute("alt", response2.list[forecastIndex].weather[0].description);
                        forecastEls[i].append(forecastWeatherEl);
                        let forecastTempEl = document.createElement("p");
                        forecastTempEl.innerHTML = "Temp: " + kelvinToFahrenheit(response2.list[forecastIndex].main.temp) + " &#176F";
                        forecastEls[i].append(forecastTempEl);
                        let forecastHumidityEl = document.createElement("p");
                        forecastHumidityEl.innerHTML = "Humidity: " + response2.list[forecastIndex].main.humidity + "%";
                        forecastEls[i].append(forecastHumidityEl);
                    }
                });
        });
}

//checks if city is already in the history
let checkDuplicateCity = function(cityName) {
    let checkTF = false;
    let yesPopUp = false;
    for (let i = 0; i < searchHistory.length; i++) {
        let historyItem = document.createElement("input");
        historyItem.setAttribute("value", searchHistory[i]);
        if (cityName === historyItem.value) {
            checkTF = true;
            yesPopUp = true;
        } else {
            if (yesPopUp === true) {
                checkTF = true;
            } else {
                checkTF = false
            }
        }
    }
    if (checkTF === false) {
        searchHistory.push(cityName);
        localStorage.setItem("search", JSON.stringify(searchHistory));
    }
    renderSearchHistory();
}

//renders search history
function renderSearchHistory() {
    historyEl.innerHTML = "";
    for (let i = 0; i < searchHistory.length; i++) {
        let historyItem = document.createElement("input");
        // <input type="text" readonly class="form-control-plaintext" id="staticEmail" value="email@example.com"></input>
        historyItem.setAttribute("type", "text");
        historyItem.setAttribute("readonly", true);
        historyItem.setAttribute("class", "form-control d-block bg-white");
        historyItem.setAttribute("value", searchHistory[i]);
        historyItem.addEventListener("click", function() {
            getWeather(historyItem.value);
        })
        historyEl.append(historyItem);
    }
}

//converts kevlin to fahrenheit
function kelvinToFahrenheit(K) {
    return Math.floor((K - 273.15) * 1.8 + 32);
}

//inital open
function init() {
    renderSearchHistory();
    if (searchHistory.length > 0) {
        getWeather(searchHistory[searchHistory.length - 1]);
    }
}

//event listeners
searchEl.addEventListener("click", cityCheckHandler);
clearEl.addEventListener("click", function() {
    searchHistory = [];
    renderSearchHistory();
    localStorage.setItem("search", JSON.stringify(searchHistory));
});

init();