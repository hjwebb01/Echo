// When launching the .html file, use it via VSCode's Live Server extension
import { Player } from './Player.js';
import { Raycast } from './Raycast.js';
import { Level } from './Level.js';

document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    canvas.style.backgroundColor = '#000'; // Background color

    let raycastBellUsageCount = 0;
    const maxRaycastBellUsage = 3;

    // Better intro text stuff
    let textFadeInStarted = false;

    // Sounds (More to come)
    var soundBell = new Audio('Bell.mp3')
    function playBell() {
        soundBell.play();
    }

    var soundRadar = new Audio('Radar.mp3')
    soundRadar.loop = true;
    function playRadar() {
        soundRadar.play();
    }

    var soundAirhorn = new Audio('Airhorn.mp3')
    function playAirhorn() {
        soundAirhorn.play();
    }

    // Player
    const player = new Player(650, 380, 10, 10, 2, canvas, false);
    
    // Walls
    const level1Walls = [
        { x: 500, y: 100, width: 100, height: 300 },
        { x: 750, y: 100, width: 150, height: 450 },
        { x: 0, y: 510, width: 600, height: 210 },
        { x: 700, y: 180, width: 300, height: 100},
        { x: 1100, y: 100, width: 100, height: 515 },
        { x: 600, y: 510, width: 300, height: 105},
        { x: 500, y: 100, width: 600, height: 0 },
        { x: 100, y: 180, width: 400, height: 100},
        { x: 1300, y: 100, width: 100, height: 515 },
        { x: 1200, y: 615, width: 100, height: 0 },
        { x: 1400, y: 350, width: 300, height: 100},
    ];

    const level2Walls = [
        { x: 500, y: 100, width: 100, height: 300 },
        { x: 750, y: 100, width: 150, height: 450 }
    ];

    // Listen I know I know I should (probably) make a class for this stuff
    // but I will when I got more time alright leave me alone
    // End point stuff 
    const endPoint = { x: 950, y: 400, width: 50, height: 50 };
    const level2endPoint = { x: 400, y: 400, width: 50, height: 50 };

    // Monsters
    const monsters = [{x: 650, y: 500, width: 50, height: 50},
        {x: 1000, y: 200, width: 50, height: 50},
        {x: 100, y: 300, width: 50, height: 50},
        {x: 1300, y: 500, width: 50, height: 50},
        {x: 100, y: 500, width: 50, height: 50},
        {x: 100, y: 500, width: 50, height: 50},
    ];
    const monsterslvl2 = [
    ];

    let endpointActive = false; // To check if the endpoint was activated

    let startgameTexts = [
        { text: "Navigate your vehicle with the arrow keys.", opacity: 0, y: canvas.height / 2 - 20 },
        { text: "Produce radars by clicking your controls at the top, you've been delegated 3 sonar blasts.", opacity: 0, y: canvas.height / 2 + 20 },
        { text: "Look for the exit, it will ping green, the walls white.", opacity: 0, y: canvas.height / 2 + 60  },
        { text: "Start your sonar at the top right to begin.", opacity: 0, y: canvas.height / 2 + 100 }
    ];

    let level2Texts = [
        { text: "If the radar blips red...", opacity: 0, y: canvas.height / 2 - 20 }
    ]

    // Level builders
    const levels = [
        new Level(player, { x: 360, y: 380}, level1Walls, endPoint, startgameTexts, canvas, ctx, monsters),
        new Level(player, { x: 600, y: 380}, level2Walls, level2endPoint, level2Texts, canvas, ctx, monsterslvl2)
    ]

    let currentLevel = 0;

    // Raycaster instances
    const raycastBell = new Raycast(canvas, player, levels[currentLevel].walls, 180, 12, 400, 90, false, false, false, playBell, false, 1000, false, levels[currentLevel].endPoint, levels[currentLevel].monsters);
    const raycastRadar = new Raycast(canvas, player, levels[currentLevel].walls, 720, 30, 150, 100, true, true, true, false, false, 1000, true, levels[currentLevel].endPoint, levels[currentLevel].monsters);
    const raycastNone = { // instance of 'none selected'
        visibility: false,
        triggerPing: function() {}, // No operation functions to replace the class ones
        expandRays: function() {},
        castRays: function() {},
        drawRays: function() {},
      };

    // Array of sound types
    const soundTypes = [raycastBell, raycastRadar, raycastNone];
    let currentType = 2; // Start with the first type (raycastNone)

    // Sound select buttons (assuming we add more in the html)
    document.getElementById('buttonContainer').addEventListener('click', function(event) {
        const typeIndex = event.target.getAttribute('data-type');
        if (typeIndex !== null) {
            let newIndex = parseInt(typeIndex, 10); // Convert the data-type value to an integer

            if (newIndex !== 2) {
                levels[currentLevel].textsShown = true;  // Hide texts once any active raycaster is selected
            }

            if (newIndex !== 2 && currentType === 2 && !levels[currentLevel].endpointFadeInitiated) {  // Check if changing from 'none'
                levels[currentLevel].activateEndpoint(); // Activate endpoint showing
            }

            // Check if the radar is active and the radar button is clicked again
            if (newIndex === 1) {
                if (currentType === 1) {
                    // Radar is already active, switching it off
                    newIndex = 2; // Set to 'none' (assuming index 2 is raycastNone in your array)
                    document.querySelector('#radarButton').style.backgroundImage = 'url("Radar_Echo_Button.png")';
                } else {
                    // Activating radar
                    document.querySelector('#radarButton').style.backgroundImage = 'url("Radar_Echo_Button_Lit.png")';
                }
            } else if (currentType === 1) {
                // Deactivating radar due to switching to another type
                document.querySelector('#radarButton').style.backgroundImage = 'url("Radar_Echo_Button.png")';
            }

            // If raycastBell is selected and usage limit is reached, do nothing
            if (newIndex === 0 && raycastBellUsageCount >= maxRaycastBellUsage) {
                return;
            }

            currentType = newIndex;
            soundTypes[currentType].triggerPing(); // Trigger the ping for the selected sound type

            // Only count usages for raycastBell
            if (currentType === 0) { 
                raycastBellUsageCount++;
            }

            updateButtonSelection(); // Call a function to update the button visuals
        }
    });
    
    function updateButtonSelection() {
        // Get all buttons within the container
        const buttons = document.querySelectorAll('#buttonContainer button');
        // Iterate over each button and update its class and background based on whether it's the selected type
        buttons.forEach((button, index) => {
            if (index === 0) { // RaycastBell button specific logic
                // Update the button's background image according to the usage count
                button.style.backgroundImage = `url('Bell_Echo_Button_${raycastBellUsageCount}.png')`;
                
                // Disable the button if the usage limit is reached
                if (raycastBellUsageCount >= maxRaycastBellUsage) {
                    button.disabled = true;
                    button.classList.add('disabled'); // Assuming a CSS class for disabled appearance
                } else {
                    button.disabled = false;
                    button.classList.remove('disabled');
                }
            }
    
            // Add or remove 'selected' class based on the active type
            if (index === currentType) {
                button.classList.add('selected'); // Add 'selected' class to the active type
            } else {
                button.classList.remove('selected'); // Remove 'selected' class from other types
            }
        });
    }

    function resetButtons() {
    // Reset the raycastBell usage count and update its button
    raycastBellUsageCount = 0;
    const bellButton = document.querySelector('#bellButton'); // Corrected ID reference
    if (bellButton) {
        bellButton.style.backgroundImage = 'url("Bell_Echo_Button_0.png")';
        bellButton.disabled = false;
        bellButton.classList.remove('disabled');
    }

    // Reset the raycastRadar button to its default state
    const radarButton = document.querySelector('#radarButton'); // Corrected ID reference
    if (radarButton) {
        radarButton.style.backgroundImage = 'url("Radar_Echo_Button.png")';
    }

    // Update all buttons to unselected
    const buttons = document.querySelectorAll('#buttonContainer button');
    buttons.forEach(button => {
        button.classList.remove('selected');
    });

    // Optionally, set the first raycaster as selected or none if you want to start with a specific one
    if (buttons.length > 0) {
        buttons[0].classList.add('selected');
    }
}

    // Event listeners for keyups and keydowns (smoother movement)
    window.addEventListener('keydown', function(event) {
        switch (event.key) {
            case "ArrowUp":    player.activeDirections.up = true; break;
            case "ArrowDown":  player.activeDirections.down = true; break;
            case "ArrowLeft":  player.activeDirections.left = true; break;
            case "ArrowRight": player.activeDirections.right = true; break;
            
            // dev tools
            case 'r':
                soundTypes[currentType].visibility = !soundTypes[currentType].visibility;
                break;
            case 'n':
                nextLevel();
                break;
        }
    });

    window.addEventListener('keyup', function(event) {
        switch (event.key) {
            case "ArrowUp":    player.activeDirections.up = false; break;
            case "ArrowDown":  player.activeDirections.down = false; break;
            case "ArrowLeft":  player.activeDirections.left = false; break;
            case "ArrowRight": player.activeDirections.right = false; break;
        }
    });
    
    function checkLevelCompletion() {
        if (
            player.x < levels[currentLevel].endPoint.x + levels[currentLevel].endPoint.width &&
            player.x + player.width > levels[currentLevel].endPoint.x &&
            player.y < levels[currentLevel].endPoint.y + levels[currentLevel].endPoint.height &&
            player.y + player.height > levels[currentLevel].endPoint.y
        ) {
            nextLevel();  // Use nextLevel function to handle level transition
        }
    }
    
    function nextLevel() {
        if (currentLevel < levels.length - 1) {
            currentLevel++;
            levels[currentLevel].activate();
            resetButtons();
            updateRaycasters();  // Update raycasters with new level walls
            currentType = 2; // Reset raycaster to none
        } else {
            congratulatePlayer();  // End game logic if no more levels
        }
    }

    function updateRaycasters() {
        // Update the walls and goal for each raycaster upon level transition
        raycastBell.walls = levels[currentLevel].walls;
        raycastRadar.walls = levels[currentLevel].walls;
        raycastBell.endPoint = levels[currentLevel].endPoint;
        raycastRadar.endPoint = levels[currentLevel].endPoint;
        raycastBell.monsters = levels[currentLevel].monsters;
        raycastRadar.monsters = levels[currentLevel].monsters;
    }

    function congratulatePlayer() {
        // Display a congratulatory message
        const congratsMessage = document.createElement('h1');
        congratsMessage.textContent = 'Congratulations!';
        congratsMessage.style.color = '#fff';
        congratsMessage.style.position = 'absolute';
        congratsMessage.style.top = '50%';
        congratsMessage.style.left = '50%';
        congratsMessage.style.transform = 'translate(-50%, -50%)';
        document.body.appendChild(congratsMessage);
    }

    function checkMonsterCollision() {
        levels[currentLevel].monsters.forEach((monsters) => {
            if (
                player.x < monsters.x + monsters.width &&
                player.x + player.width > monsters.x &&
                player.y < monsters.y + monsters.height &&
                player.y + player.height > monsters.y
            ) {
                gameEnd();
            }
        });
    }

    function gameEnd() {
        // Death logic
        const congratsMessage = document.createElement('h1');
        congratsMessage.textContent = 'You touched a monster!';
        congratsMessage.style.color = '#fff';
        congratsMessage.style.position = 'absolute';
        congratsMessage.style.top = '50%';
        congratsMessage.style.left = '50%';
        congratsMessage.style.transform = 'translate(-50%, -50%)';
        document.body.appendChild(congratsMessage);
    }

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        player.update(levels[currentLevel].walls);
        player.draw(ctx);

        if (levels[currentLevel]) {
            levels[currentLevel].update();
            levels[currentLevel].draw();
        }

        requestAnimationFrame(gameLoop);
        
        // Manage raycast expansions and drawing
        if (soundTypes[currentType] !== raycastNone) {
            if (soundTypes[currentType].pingActive) {
                soundTypes[currentType].expandRays();
            }
            soundTypes[currentType].castRays();
            soundTypes[currentType].drawRays(ctx);
        }

        // Special sound feature for Radar
        if (currentType === 1) { // Radar is selected
            if (soundRadar.paused) {
                soundRadar.play();
            }
        } else {
            soundRadar.pause(); // Pause if Radar is not selected
            soundRadar.currentTime = 0; // Optionally reset the playback position
        }

        checkLevelCompletion();
        checkMonsterCollision();
    }

    gameLoop();
});