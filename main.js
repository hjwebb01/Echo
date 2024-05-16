// When launching the .html file, use it via VSCode's Live Server extension
import { Player } from './Player.js';
import { Raycast } from './Raycast.js';

// You should probbably use a css style for this instead of dumping it in main
const menuContainer = document.createElement('div');
menuContainer.style.position = 'absolute';
menuContainer.style.top = '50%';
menuContainer.style.left = '50%';
menuContainer.style.transform = 'translate(-50%, -50%)';

const playButton = document.createElement('button');
playButton.textContent = 'Play';
playButton.style.padding = '10px 20px';
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

    // Sounds (More to come)
    var soundBell = new Audio('Bell.mp3')
    function playBell() {
        soundBell.play();
    }

    // Player
    const player = new Player(650, 380, 10, 10, 2, canvas);

    // Walls
    const walls = [
        { x: 500, y: 100, width: 100, height: 300 },
        { x: 700, y: 360, width: 150, height: 150 },
        { x: 300, y: 500, width: 330, height: 80 },
        { x: 700, y: 180, width: 300, height: 100}
    ];

    // Raycaster instances
    const raycastBell = new Raycast(canvas, player, walls, 180, 200, 90, false, false, false, playBell);
    const raycastRadar = new Raycast(canvas, player, walls, 1, 300, 100, true, false, true);

    // Array of sound types
    const soundTypes = [raycastBell, raycastRadar];
    let currentType = 0; // Start with the first type (raycastBell)

    // Sound select buttons (assuming we add more in the html)
    document.getElementById('buttonContainer').addEventListener('click', function(event) {
        const typeIndex = event.target.getAttribute('data-type');
        if (typeIndex !== null) {
            currentType = parseInt(typeIndex, 10); // Convert the data-type value to an integer
            soundTypes[currentType].triggerPing(); // Trigger the ping for the selected sound type
            updateButtonSelection(); // Call a function to update the button visuals
        }
    });
    
    function updateButtonSelection() {
        // Get all buttons within the container
        const buttons = document.querySelectorAll('#buttonContainer button');
        // Iterate over each button and update its class based on whether it's the selected type
        buttons.forEach((button, index) => {
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

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        player.update(walls);
        drawWalls();
        player.draw(ctx);

        requestAnimationFrame(gameLoop);
        
        // Manage raycast expansions and drawing
        if (soundTypes[currentType].pingActive) {
            soundTypes[currentType].expandRays();
        }
        soundTypes[currentType].castRays();
        soundTypes[currentType].drawRays(ctx);
    }

    gameLoop();
});