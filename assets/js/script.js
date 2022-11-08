var APIKey = "09c0c1e1b3ef3cc1f2300edb683beb82"

var historyList = document.querySelector('#history-list')
var forcastCardArr = document.querySelectorAll('#forcasts div[class~="card"]')

async function onSearch(cityName, addToHistory=true) {
    const weatherObj = await geocode(cityName)
    document.querySelector('#city-name').innerText = weatherObj.name
    displayWeather(weatherObj.lat, weatherObj.lon)
    if (addToHistory) {
        addLocalHistory(weatherObj.name)
        appendHistoryList(weatherObj.name)
    }
}

async function geocode(cityName) {
    data = await $.get(`https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${APIKey}`)
    return data[0]
}

function displayWeather(lat, lon) {
    $.get(`https://api.openweathermap.org/data/2.5/forecast?units=imperial&lat=${lat}&lon=${lon}&appid=${APIKey}`, function(data) {
        dataList = filterData(data)
        
        for (let i = 0; i < forcastCardArr.length; i++) {
            var dayData = dataList[i];
            var card = forcastCardArr[i];
            
            dateEl = card.querySelector('.forcast-date')
            if (i === 0) {
                dateEl.innerText = 'Today'
            }
            else {
                dateEl.innerText = formatDate(dayData.dt_txt.split(" ")[0])
            }
            dateEl.innerText += '\n'
            
            var iconCode = dayData.weather[0].icon
            var iconURL = `https://openweathermap.org/img/wn/${iconCode}@2x.png`
            iconEl = card.querySelector('img')
            iconEl.setAttribute("src",iconURL)
            
            forcastDesc = card.querySelector('.forcast-description')
            forcastDesc.innerText = dayData.weather[0].description
            
            temperatureEl = card.querySelector('ul .temperature-field')
            temperatureEl.innerText = 'Temperature: ' + dayData.main.temp + ' °F'
            
            windEl = card.querySelector('ul .wind-field')
            windEl.innerText = "Wind: " + dayData.wind.speed +' MPH'
            
            humidityEl = card.querySelector('ul .humidity-field')
            humidityEl.innerText = "Humidity: " + dayData.main.humidity + '%'
        }
        document.querySelector('#forcasts').style.display = 'flex'
    })
}

function filterData(data) {
    var today = data.list[0].dt_txt.split(" ")
    var dataList = [data.list[0]]
    for (let i = 1; i < data.list.length; i++) {
        var dayObj = data.list[i];
        var [date,time] = dayObj.dt_txt.split(" ")
        if (today !== date && time === '12:00:00') {
            dataList.push(dayObj)
        }
    }
    return dataList
}

function formatDate(dateStr) {
    var ymdArr = dateStr.split('-')
    var mdyArr = [ymdArr[1], ymdArr[2], ymdArr[0]]
    return mdyArr.join('/')
}

function getLocalHistory() {
    var searchHistory
    if (!localStorage.getItem('search-history')) {
        searchHistory = []
    }
    else {
        searchHistory = localStorage.getItem('search-history')
        searchHistory = JSON.parse(searchHistory)
    }
    return searchHistory
}

function addLocalHistory(str) {
    var searchHistory = getLocalHistory()
    searchHistory.push(str)
    localStorage.setItem('search-history', JSON.stringify(searchHistory))
}

function appendHistoryList(cityName) {
    var li = document.createElement('li')
    li.innerHTML = `<a class="dropdown-item" onclick="onSearch('${cityName}', false)" href="#">${cityName}</a>`
    historyList.insertBefore(li, historyList.firstChild)
}

function clearHistoryList() {
    while (historyList.children.length > 0) {
        historyList.firstChild.remove()
    }
}

function loadHistoryList() {
    clearHistoryList()
    var history = getLocalHistory()
    for (let i = 0; i < history.length; i++) {
        appendHistoryList(history[i])
    }
    var seperator = document.createElement('div')
    seperator.className = "dropdown-divider"
    historyList.appendChild(seperator)
    var li = document.createElement('li')
    li.innerHTML = `<a class="dropdown-item" onclick="localStorage.clear(); loadHistoryList()" href="#">Clear History</a>`
    historyList.appendChild(li)
}

citySearchInput = document.querySelector('#city-search-input')
citySearchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault()
        onSearch(citySearchInput.value)
        citySearchInput.value = ''
    }
})

loadHistoryList()