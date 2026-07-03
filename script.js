let filter = "all"

function getPlants() {
    return JSON.parse(localStorage.getItem("plants")) || []
}

function savePlants(data) {
    localStorage.setItem("plants", JSON.stringify(data))
}

function getRooms() {
    let rooms = JSON.parse(localStorage.getItem("rooms"))

    if (!rooms || rooms.length === 0) {
        rooms = ["Wohnzimmer"]
        saveRooms(rooms)
    }

    return rooms
}

function saveRooms(data) {
    localStorage.setItem("rooms", JSON.stringify(data))
}

/* ---------------- STATUS ---------------- */

function getDays(plant) {
    if (!plant.watered) return null
    let diff = (Date.now() - new Date(plant.watered)) / 86400000
    return Math.floor(diff)
}

function getStatus(plant) {
    let d = getDays(plant)
    let i = Number(plant.interval)

    if (d === null || d >= i) {
        return "red"
    }

    if (i > 1 && d === i - 1) {
        return "yellow"
    }

    return "green"
}

/* ---------------- LEDS ---------------- */

function updateLeds(plants) {
    let red = document.getElementById("redLed")
    let green = document.getElementById("greenLed")

    let hasRed = false
    let hasYellow = false

    plants.forEach(p => {
        let s = getStatus(p)
        if (s === "red") hasRed = true
        if (s === "yellow") hasYellow = true
    })

    red.classList.add("off")
    green.classList.add("off")

    if (plants.length === 0) return

    if (hasRed) {
        red.classList.remove("off")
        red.style.background = "red"
        return
    }

    if (hasYellow) {
        red.classList.remove("off")
        red.style.background = "yellow"
        return
    }

    green.classList.remove("off")
}

/* ---------------- RENDER ZIMMER ---------------- */

function renderRooms() {
    let container = document.getElementById("roomContainer")
    let rooms = getRooms()
    let plants = getPlants()

    container.innerHTML = ""

    rooms.forEach(room => {

        let list = plants.filter(p => p.location === room)

        let red = 0, yellow = 0, green = 0

        list.forEach(p => {
            let s = getStatus(p)
            if (s === "red") red++
            if (s === "yellow") yellow++
            if (s === "green") green++
        })

        let htmlPlants = list.map(p => {
            let s = getStatus(p)

            let cls =
                s === "red" ? "redStatus" :
                s === "yellow" ? "yellowStatus" :
                "greenStatus"

            return `
                <div class="plant ${cls}">
                    ${p.name}
                </div>
            `
        }).join("")

        container.innerHTML += `
            <div class="room">
                <div class="room-title">
                    ${room} (${list.length})
                    🔴${red} 🟡${yellow} 🟢${green}
                </div>
                ${htmlPlants}
            </div>
        `
    })
}

/* ---------------- RENDER PFLANZEN ---------------- */

function renderPlants() {
    let list = document.getElementById("plantList")
    let plants = getPlants()

    let q = document.getElementById("searchInput").value.toLowerCase()

    let filtered = plants.filter(p => {
        let matchSearch = p.name.toLowerCase().includes(q)

        let status = getStatus(p)
        let matchFilter = filter === "all" || filter === status

        return matchSearch && matchFilter
    })

    filtered.sort((a, b) => {
        let order = { red: 0, yellow: 1, green: 2 }
        return order[getStatus(a)] - order[getStatus(b)]
    })

    list.innerHTML = ""

    filtered.forEach((p, i) => {

        let s = getStatus(p)

        list.innerHTML += `
            <div class="plant ${s === "red" ? "redStatus" : s === "yellow" ? "yellowStatus" : "greenStatus"}">
                <b>${p.name}</b><br>
                Zimmer: ${p.location}<br>
                Intervall: ${p.interval} Tage<br>
                Status: ${s}
                <button onclick="water(${i})">gegossen</button>
                <button onclick="remove(${i})">löschen</button>
            </div>
        `
    })

    updateLeds(plants)
    renderRooms()
}

/* ---------------- ACTIONS ---------------- */

function addPlant() {
    let name = document.getElementById("plantName").value
    let interval = document.getElementById("plantInterval").value
    let room = document.getElementById("plantRoom").value

    if (!name || !interval || !room) return

    let plants = getPlants()

    plants.push({
        name,
        interval: Number(interval),
        location: room,
        watered: Date.now()
    })

    savePlants(plants)

    renderPlants()
}

function water(index) {
    let plants = getPlants()
    plants[index].watered = Date.now()
    savePlants(plants)
    renderPlants()
}

function remove(index) {
    let plants = getPlants()
    plants.splice(index, 1)
    savePlants(plants)
    renderPlants()
}

/* ---------------- ROOMS ---------------- */

function addRoom() {
    let input = document.getElementById("roomName")
    let rooms = getRooms()

    if (!input.value) return

    rooms.push(input.value)
    saveRooms(rooms)

    input.value = ""
    loadRooms()
}

function deleteRoom() {
    let select = document.getElementById("deleteRoom")
    let rooms = getRooms()

    rooms = rooms.filter(r => r !== select.value)

    saveRooms(rooms)
    loadRooms()
}

/* ---------------- UI ---------------- */

function setFilter(f) {
    filter = f
    renderPlants()
}

function loadRooms() {
    let rooms = getRooms()

    let sel1 = document.getElementById("plantRoom")
    let sel2 = document.getElementById("deleteRoom")

    sel1.innerHTML = ""
    sel2.innerHTML = ""

    rooms.forEach(r => {
        sel1.innerHTML += `<option value="${r}">${r}</option>`
        sel2.innerHTML += `<option value="${r}">${r}</option>`
    })

    renderRooms()
    renderPlants()
}

/* ---------------- INIT ---------------- */

loadRooms()
renderPlants()
