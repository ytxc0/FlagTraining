let iteration = getIteration();
let flagStats = getFlagStats();
let currentFlag;
let isAnswerSubmitted = true;
let isMapGuessSubmitted = false;
let answerMode = "map";
let soundCorrect = new Audio("sounds/correct.wav");
let soundIncorrect = new Audio("sounds/incorrect.wav");
soundCorrect.volume = 0.25;

/**
 * Load the current game number to calculate flag recencies
 * @returns The iteration value
 */
function getIteration()
{
    let iteration = localStorage.getItem("iteration");
    iteration = iteration ?? 0;
    iteration = Number(iteration);
    return iteration;
}

/**
 * Gets the flagStats from the localStorage and initializes flagStats if necessary
 * @returns flagStats from the localStorage
 */
function getFlagStats()
{
    let flagStats = localStorage.getItem("flagStats");
    iteration = getIteration();

    // Initialize flagStats with default values
    if (!flagStats)
    {
        flagStats = {};
    }
    else
    {
        flagStats = JSON.parse(flagStats);

        Object.keys(flagStats).forEach(flag =>
        {
            if (!Object.keys(flagData).includes(flag))
            {
                delete flagStats[flag];
            }
        });
    }

    Object.keys(flagData).forEach(flag =>
    {
        if (!Object.keys(flagStats).includes(flag))
        {
            flagStats[flag] = [
                iteration, 0, 0
            ];
        }
    });
    writeFlagStats(flagStats);

    return flagStats;
}

/**
 * Write flag stats to localStorage
 * @param {{}} flagStats associative flag stats array, storing the success of the player
 */
function writeFlagStats(flagStats)
{
    localStorage.setItem("flagStats", JSON.stringify(flagStats));
}

/**
 * Increments the current iteration value in localStorage. Necessary to calculate recencies
 */
function incrementIteration()
{
    iteration += 1;
    localStorage.setItem("iteration", iteration);
}


/**
 * Generates a pseudo random number between 0 and 1 from a given integer seed by creating chaos using calculations
 * @param {number} seed The seed can be any float greater than 1
 * @returns a pseudo random number between 0 and 1
 */
function randomFromSeed(seed)
{
    let prime1 = 42394160293;
    let prime2 = 12941604139;
    let limitingNumber = 16777215;

    // Limit max seed to prevent lag
    seed %= prime1;

    return ((seed * prime1) % limitingNumber ^ (seed * prime2) % limitingNumber) * prime1 % prime2 / prime2;
}


/**
 * Displays the 'hardest' flag by rating. 
 * The difficulty of the flag is calculated like this:
 * 
 *                     /    loses + 1     \²
 * Rating = recency * |  ----------------  |
 *                     \ loses + wins + 1 /
 * 
 * The flag with the highest Rating is used as the 'hardest'.
 */
function showHardestFlag()
{
    let highestRating = 0;
    let flagWithHighestRating = "";

    // TODO remove
    let debugRec = 0;
    let debugWins = 0;
    let debugLoses = 0;

    Object.keys(flagData).forEach(flag => 
    {
        let recency = iteration - flagStats[flag][0];
        let wins = flagStats[flag][1];
        let loses = flagStats[flag][2];

        let rndDeviation = randomFromSeed(recency * wins + recency * loses + iteration) / 1000;

        let rating = recency * Math.pow((loses + 1) / (loses + wins + 1), 2) + rndDeviation;
        if (highestRating <= rating)
        {
            highestRating = rating;
            flagWithHighestRating = flag;

            // TODO remove
            debugRec = recency;
            debugWins = wins;
            debugLoses = loses;
        }
    });

    showFlag(flagWithHighestRating);
    console.log(`Showing flag with these stats:\nRecency: ${debugRec} (Iteration: ${iteration})\nWins: ${debugWins}\nLoses: ${debugLoses}\nRating: ${highestRating}`);
}

/**
 * Displays a new random flag with a low display count
 */
function showRandomFlag()
{
    // Find available flags
    let availableFlags = [];
    let flags = Object.keys(flagData);
    while (availableFlags.length == 0)
    {
        flags.forEach(flag =>
        {
            // Allow only the least recently played flags ( -10 to allow some variation)
            if (iteration - flagStats[flag][0] > flags.length - 10)
            {
                availableFlags.push(flag);
            }
        });
    }

    // Select flag randomly
    let rndFlag = availableFlags[Math.floor(Math.random() * availableFlags.length)];

    if (rndFlag == undefined)
    {
        console.error("showRandomFlag() could not choice a flag");
        return;
    }

    showFlag(rndFlag);
}

/**
 * Display the given flag
 * @param {string} flag Name of the flag
 */
function showFlag(flag)
{
    let imageElement = document.querySelector(".flag-image");
    imageElement.src = flagData[flag]["url"];

    // Handle anti-aliasing disabling for small images
    imageElement.classList.remove("anti-aliasing-disabled");
    imageElement.onload = () =>
    {
        if (imageElement.naturalWidth < 80 && imageElement.naturalHeight < 50)
        {
            imageElement.classList.add("anti-aliasing-disabled");
        }
    };

    currentFlag = flag;
    isAnswerSubmitted = false;
    isMapGuessSubmitted = false;

    showAnswerOptions(flag);
}

/**
 * Displays the answer options for the currently shown flag
 * @param {string} flag The correct answer
 */
function showAnswerOptions(flag)
{
    let answerOptions = [];
    let flags = Object.keys(flagData);
    let optionDuplicates = 0;
    while (answerOptions.length < 11)
    {
        let option = flags[Math.floor(randomFromSeed((iteration + 1) * (answerOptions.length + optionDuplicates + 1)) * flags.length)];
        if (!answerOptions.includes(option) && option != flag)
        {
            answerOptions.push(option);
        }
        else
        {
            optionDuplicates += 1;
        }
    }
    // Insert correct answer at a random index
    answerOptions.splice(Math.floor(randomFromSeed(iteration) * (answerOptions.length + 1)), 0, flag);

    let optionContainer = document.querySelector(".answer-option-button-container");
    optionContainer.innerHTML = "";
    answerOptions.forEach(option =>
    {
        optionContainer.innerHTML += `<button class="answer-option">${displayNames[option]}</button>`;
    });


    let buttons = document.querySelectorAll(".answer-option");
    buttons.forEach(button =>
    {
        button.onclick = (event) =>
        {
            submitAnswer(event.target);
        };
    });
}

/**
 * Handles answer submit
 * @param {string} answer The clicked button
 */
function submitAnswer(target)
{
    isAnswerSubmitted = true;

    let answer = target.innerHTML;
    let buttons = document.querySelectorAll(".answer-option");

    buttons.forEach(button =>
    {
        button.disabled = true;
    });

    if (answer == displayNames[currentFlag])
    {
        target.classList.add("answer-correct");

        flagStats[currentFlag][1] += 1;
    }
    else
    {
        target.classList.add("answer-wrong");
        for (let i = 0; i < buttons.length; i++)
        {
            let button = buttons[i];
            if (button.innerHTML == displayNames[currentFlag])
            {
                button.classList.add("answer-correct");
                break;
            }
        }

        flagStats[currentFlag][2] += 1;
    }

    // Alter iteration value slightly to prevent repeating loops
    let rndDeviation = Math.floor(randomFromSeed(iteration) * 6);
    flagStats[currentFlag][0] = iteration + rndDeviation;
    writeFlagStats(flagStats);
    incrementIteration();
}

/**
 * Handles the submit of the map guess
 * @param {string} clickedCountry Name of the clicked country
 */
function submitMapGuess(clickedCountry)
{
    highlightCorrectCountry();

    if (clickedCountry == currentFlag || (Object.keys(adminCountries).includes(currentFlag) && adminCountries[currentFlag] == clickedCountry))
    {
        flagStats[currentFlag][1] += 1;
        document.querySelector(".map-container").classList.add("guess-correct");
        soundCorrect.play();
    }
    else
    {
        flagStats[currentFlag][2] += 1;
        highlightWrongCountry();
        document.querySelector(".map-container").classList.add("guess-wrong");
        soundIncorrect.play();
    }
    isMapGuessSubmitted = true;
    isAnswerSubmitted = true;
    clickedCountryLayer = undefined;

    // Alter iteration value slightly to prevent repeating loops
    let rndDeviation = Math.floor(randomFromSeed(iteration) * 6);
    flagStats[currentFlag][0] = iteration + rndDeviation;
    writeFlagStats(flagStats);
    incrementIteration();
}


/**
 * Downloads the users flag stats as flag.stats file to their computer
 */
function downloadFlagStats()
{
    const downloadData = {
        "iteration": iteration,
        "flagStats": flagStats
    };

    // Create download url
    const blob = new Blob([JSON.stringify(downloadData)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // Invoke download 
    const aLinkElem = document.createElement("a");
    aLinkElem.href = url;
    aLinkElem.download = "flag.stats";
    document.body.appendChild(aLinkElem);
    aLinkElem.click();

    // Cleanup
    document.body.removeChild(aLinkElem);
    URL.revokeObjectURL(url);
}

/**
 * Opens the upload window for the user to select their flag.stats file to upload it to the browser
 */
function uploadFlagStats()
{
    const uploadElem = document.querySelector(".flag-stats-upload");
    uploadElem.click();
    uploadElem.onchange = (e) =>
    {
        const file = uploadElem.files[0];
        const reader = new FileReader();

        reader.readAsText(file);
        reader.onload = (e) =>
        {
            if (confirm("Do you really want to overwrite your current stats with the uploaded file?"))
            {
                const uploadedData = JSON.parse(reader.result);
                const uploadedIteration = uploadedData["iteration"];
                const uploadedFlagStats = uploadedData["flagStats"];

                if (uploadedIteration != undefined && uploadFlagStats != undefined)
                {
                    iteration = uploadedIteration;
                    incrementIteration();

                    flagStats = uploadedFlagStats;
                    writeFlagStats(flagStats);

                    // Account for missing or old entries in flagStats 
                    flagStats = getFlagStats();

                    showHardestFlag();
                }
                else
                {
                    alert("Your stats file could not be read. Nothing changed");
                }
            }
        };
    };
}


/**
 * Update the display according to the current answer mode
 */
function enforceAnswerMode()
{
    let mapContainer = document.querySelector(".map-container");
    let answerOptionsContainer = document.querySelector(".answer-option-container");
    let flagContainer = document.querySelector(".flag-container");

    if (answerMode == "map")
    {
        mapContainer.style.display = "block";
        answerOptionsContainer.style.display = "none";
        flagContainer.classList.add("flag-container-map-mode");
        flagContainer.classList.remove("flag-container-buttons-mode");
    }
    else
    {
        mapContainer.style.display = "none";
        answerOptionsContainer.style.display = "block";
        flagContainer.classList.add("flag-container-buttons-mode");
        flagContainer.classList.remove("flag-container-map-mode");
    }
}


// Handle keyboard presses for 'show hardest flag' (space) and 'show random flag' (r) 
document.addEventListener("keydown", (e) =>
{
    if (answerMode == "buttons")
    {
        if (!isAnswerSubmitted)
        {
            return;
        }

        if (e.key == "r")
        {
            showRandomFlag();
        }
        if (e.key == " ")
        {
            showHardestFlag();
        }
    }
    else if (answerMode == "map")
    {
        if (e.key == " ")
        {
            if (clickedCountryLayer == undefined || isMapGuessSubmitted)
            {
                resetMap();
                showHardestFlag();
            }
            else
            {
                submitMapGuess(clickedCountryLayer.feature.properties.ISO_A3);
            }
        }
    }
});

// Handle continue button press
document.querySelector(".continue-button").onclick = (e) =>
{
    showHardestFlag();
};

// Download flag stats on download button click
document.querySelector(".download-button").onclick = (e) =>
{
    downloadFlagStats();
};

// Download flag stats on download button click
document.querySelector(".upload-button").onclick = (e) =>
{
    uploadFlagStats();
};

// Toggle answer mode between button select / locate on map
document.querySelector(".toggle-mode-button").onclick = (e) =>
{
    answerMode = answerMode != "map" ? "map" : "buttons";
    enforceAnswerMode();
};


// Show the 'hardest' flag when the page loads
showHardestFlag();

// Update answer mode when the page loads
enforceAnswerMode();