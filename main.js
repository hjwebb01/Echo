// When launching the .html file, use it via VSCode's Live Server extension
import { Player } from './Player.js';
import { Raycast } from './Raycast.js';

// You should probbably use a css style for this instead of dumping it in main
const menuContainer = document.createElement('div');
menuContainer.style.position = 'absolute';
menuContainer.style.top = '50%';
menuContainer.style.left = '38%'; // 50%
menuContainer.style.transform = 'translate(-20%, -20%)';

const playButton = document.createElement('button');

playButton.textContent = 'Use Arrow Keys to move, use Buttons above to create sound\n(Click here to Start)';
playButton.style.padding = '10px 20px';
playButton.style.whiteSpace = 'pre-line';
playButton.innerHTML = playButton.innerHTML.replace('(Click here to Start)', '<strong>(Click here to remove)</strong>');
playButton.style.fontSize = '20px';
menuContainer.style.backgroundColor = '#fff';
menuContainer.style.padding = '20px';
menuContainer.style.borderRadius = '10px';
playButton.style.backgroundColor = '#fff';
playButton.style.color = '#000';
playButton.style.border = 'none';
playButton.style.cursor = 'pointer';

playButton.addEventListener('click', () => {
    menuContainer.style.display = 'none';
    // Start the game here
});

menuContainer.appendChild(playButton);
document.body.appendChild(menuContainer);
document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    canvas.style.backgroundColor = '#000'; // Background color

    let raycastBellUsageCount = 0;
    const maxRaycastBellUsage = 3;

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
    /*
    const walls = [
        { x: 500, y: 100, width: 100, height: 300 },
        { x: 700, y: 360, width: 150, height: 150 },
        { x: 300, y: 500, width: 330, height: 80 },
        { x: 700, y: 180, width: 300, height: 100}
    ];
    */
    const walls = [
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

    // End point
    const endPoint = { x: 950, y: 400, width: 50, height: 50 };

    // Raycaster instances
    const raycastBell = new Raycast(canvas, player, walls, 180, 12, 400, 90, false, false, false, playBell, false, 1000, false, endPoint);
    const raycastRadar = new Raycast(canvas, player, walls, 720, 30, 150, 100, true, true, true, false, false, 1000, true, endPoint);
    // const raycastAirhorn = new Raycast(canvas, player, walls, endPoint, 360, 12, 500, 90, false, false, false, playAirhorn, true, 600)

    // Array of sound types
    const soundTypes = [raycastBell, raycastRadar];
    let currentType = 0; // Start with the first type (raycastBell)

    // Sound select buttons (assuming we add more in the html)

    document.getElementById('buttonContainer').addEventListener('click', function(event) {
        const typeIndex = event.target.getAttribute('data-type');
        if (typeIndex !== null) {
            let newIndex = parseInt(typeIndex, 10); // Convert the data-type value to an integer
            if (newIndex === 0 && raycastBellUsageCount >= maxRaycastBellUsage) {
                // If raycastBell is selected and usage limit is reached, do nothing
                return;
            }
            currentType = newIndex;
            soundTypes[currentType].triggerPing(); // Trigger the ping for the selected sound type
            if (currentType === 0) { // Only count usages for raycastBell
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
    

    // Event listeners for keyups and keydowns (smoother movement)
    window.addEventListener('keydown', function(event) {
        switch (event.key) {
            case "ArrowUp":    player.activeDirections.up = true; break;
            case "ArrowDown":  player.activeDirections.down = true; break;
            case "ArrowLeft":  player.activeDirections.left = true; break;
            case "ArrowRight": player.activeDirections.right = true; break;
            case '1': 
                currentType = 0; // Switch to raycastBell
                break;
            case '2':
                currentType = 1; // Switch to raycastRadar
                break;
            case 'r':
                soundTypes[currentType].visibility = !soundTypes[currentType].visibility;
                break;
            case 's':
                soundTypes[currentType].spinning = !soundTypes[currentType].spinning; // Toggle spinning on or off
                break;
            case 'c':
                soundTypes[currentType].cone = !soundTypes[currentType].cone; // Toggle cone shape on or off
                break; 
            case 'e':
                soundTypes[currentType].triggerPing();
                break;
            case 'a': 
                soundTypes[currentType].cross = !soundTypes[currentType].cross;
                break;
            case 'b':
                player.visibility = !player.visibility;
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

    function drawWalls() {
        ctx.fillStyle = '#000'; // Fill outer wall
        walls.forEach((wall) => {
            // Draw the base wall
            ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
            ctx.strokeStyle = '#000';
            ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);
        });
    }

    function drawEndPoint() {
        ctx.fillStyle = '#000'; // Fill end point with green color
        ctx.fillRect(endPoint.x, endPoint.y, endPoint.width, endPoint.height);
    }

    function checkCollision() {
        if (
            player.x < endPoint.x + endPoint.width &&
            player.x + player.width > endPoint.x &&
            player.y < endPoint.y + endPoint.height &&
            player.y + player.height > endPoint.y
        ) {
            congratulatePlayer();
        }
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

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        player.update(walls);
        drawWalls();
        drawEndPoint();
        player.draw(ctx);

        requestAnimationFrame(gameLoop);
        
        // Manage raycast expansions and drawing
        if (soundTypes[currentType].pingActive) {
            soundTypes[currentType].expandRays();
        }
        soundTypes[currentType].castRays();
        soundTypes[currentType].drawRays(ctx);

        // Special sound feature for Radar
        if (currentType === 1) { // Radar is selected
            if (soundRadar.paused) {
                soundRadar.play();
            }
        } else {
            soundRadar.pause(); // Pause if Radar is not selected
            soundRadar.currentTime = 0; // Optionally reset the playback position
        }

        checkCollision();
    }

    gameLoop();
});