"use strict"
let fileInput = document.getElementById("saveFile");
fileInput.addEventListener("change", () => {
    if ("files" in fileInput) {
        const fileReader = new FileReader();
        fileReader.onload = (file) => {
            let contents = file.target.result;

            let daysPlayedStartTagIndex = contents.indexOf("<daysPlayed>") + 12;
            let daysPlayedEndTagIndex = contents.indexOf("</daysPlayed>", daysPlayedStartTagIndex);
            let daysPlayed = parseInt(contents.substring(daysPlayedStartTagIndex, daysPlayedEndTagIndex));

            let seedStartTagIndex = contents.lastIndexOf("<uniqueIDForThisGame>") + 21;
            let seedEndTagIndex = contents.indexOf("</uniqueIDForThisGame>", seedStartTagIndex);
            let seed = parseInt(contents.substring(seedStartTagIndex, seedEndTagIndex));
            
            console.log(findBubbles(seed, daysPlayed, Forest));
        }
        fileReader.readAsText(fileInput.files[0]);
    }
});

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
                    bubbles = {x, y, "start": time, "h": 0, "m": 0};
                    break;
                }
            }
        } else if (bubbles !== false) {
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