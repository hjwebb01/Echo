// When launching the .html file, use it via VSCode's Live Server extension
import { Player } from './Player.js';
import { Raycast } from './Raycast.js';

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
    const raycastBell = new Raycast(canvas, player, walls, 180, 200, 90, false, false, false);
    const raycastRadar = new Raycast(canvas, player, walls, 1, 300, 100, true, false, true);

    // Array of sound types
    const soundTypes = [raycastBell, raycastRadar];
    let currentType = 0; // Start with the first type (raycastBell)

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
