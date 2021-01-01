"use strict"
let fileInput = document.getElementById("saveFile");
let out = document.getElementById("output");
let locationSelect = document.getElementById("locationSelect");
let dayInput = document.getElementById("dayInput");
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let seed = false;
let day = false;
let selectedLocation = false;
let selectedLocationImg = false;
fileInput.addEventListener("change", () => {
    if ("files" in fileInput) {
        const fileReader = new FileReader();
        fileReader.onload = (file) => {
            let contents = file.target.result;

            let daysPlayedStartTagIndex = contents.indexOf("<daysPlayed>") + 12;
            let daysPlayedEndTagIndex = contents.indexOf("</daysPlayed>", daysPlayedStartTagIndex);
            setDay(parseInt(contents.substring(daysPlayedStartTagIndex, daysPlayedEndTagIndex)));

            let seedStartTagIndex = contents.lastIndexOf("<uniqueIDForThisGame>") + 21;
            let seedEndTagIndex = contents.indexOf("</uniqueIDForThisGame>", seedStartTagIndex);
            seed = parseInt(contents.substring(seedStartTagIndex, seedEndTagIndex));

            if (daysPlayedStartTagIndex === -1 || seedStartTagIndex == -1) {
                alert("Failed to read nr of days played or seed from save file")
            }

            setLocation(locationSelect.value);
            doIt();
        }
        fileReader.readAsText(fileInput.files[0]);
    }
});

function setDay(newDay) {
    if (typeof newDay === "number" && Math.floor(newDay) === newDay && newDay > 0) {
        day = newDay;
        dayInput.value = newDay;
    }
}

function setLocation (newLocation) {
    if (newLocation in Locations) {
        selectedLocation = newLocation;
        selectedLocationImg = document.getElementById(`${selectedLocation}Img`);
    }
}

locationSelect.addEventListener("change", () => {
    setLocation(locationSelect.value);
    doIt();
})

dayInput.addEventListener("change", () => {
    setDay(parseInt(dayInput.value));
    doIt();
})

function doIt() {
    if (!seed || !day || typeof seed !== "number" || typeof day !== "number" || selectedLocation in Locations === false || !selectedLocation || !selectedLocationImg) return;
    out.innerHTML = "";
    canvas.setAttribute("width", 4 * Locations[selectedLocation].width);
    canvas.setAttribute("height", 4 * Locations[selectedLocation].height);
    ctx.drawImage(selectedLocationImg, 0, 0);

    let bubbleArray = findBubbles(seed, day, Locations[selectedLocation]);
    let listHTML = document.createElement("ol");
    for (let i = 0; i < bubbleArray.length; i++) {
        const bubble = bubbleArray[i];
        let li = document.createElement("li");
        li.appendChild(document.createTextNode(`${bubble.start} to ${bubble.end} (${bubble.h}h ${bubble.m}m) at (${bubble.x}, ${bubble.y})`));
        li.addEventListener("mouseover", () => {
            ctx.lineWidth = 1;
            ctx.strokeRect(4 * bubble.x, 4 * bubble.y, 4, 4);
        })
        li.addEventListener("mouseout", () => {
            ctx.drawImage(selectedLocationImg, 0, 0);
        })
        listHTML.appendChild(li);
    }
    out.appendChild(listHTML);
}

/**
 * A function that returns an array with all bubbles on a given day in a given location.
 * @param {Number} seed The worldseed.
 * @param {Number} day In-game day to search for bubbles.
 * @param {Object} location Location object, see locations.js.
 * @returns {Object[]} An array of bubble objects.
 */
function findBubbles(seed, day, location) {
    let bubblesArray = [];
    let bubbles = false;
    for (let time = 610; time < 2600; time += 10) {
        time += time % 100 == 60 ? 40 : 0;

        let r = new CSRandom(time + Math.floor(seed / 2) + day);
        if (!bubbles && r.NextDouble() < 0.5) {
            for (let i = 0; i < 2; i++) {
                let x = r.Next(0, location.width);
                let y = r.Next(0, location.height);
                if (location.tiles[y][x] === 1) {
                    bubbles = { x, y, "start": time, "h": 0, "m": 0, "duration": 0 };
                    break;
                }
            }
        } else if (bubbles !== false) {
            bubbles.duration++;
            bubbles.m += 10;
            if (bubbles.m == 60) {
                bubbles.h++;
                bubbles.m = 0;
            }
            if (r.NextDouble() < 0.1) {
                bubbles.end = time;
                bubblesArray.push(bubbles);
                bubbles = false;
            }
        }
    }
    return bubblesArray;
}