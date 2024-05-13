// When launching the .html file, use it via VSCode's Live Server extension
import { Player } from './Player.js';
import { Raycast } from './Raycast.js';

document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    canvas.style.backgroundColor = '#000'; // Background color

    /* Sliders RECYCLED STUFF
    const rayAmountSlider = document.getElementById('rayAmountSlider');
    const maxDistanceSlider = document.getElementById('maxDistanceSlider');
    const spinSpeedSlider = document.getElementById('spinSpeedSlider');

    function updateRaycastSettings() {
        raycast.rayAmount = parseInt(rayAmountSlider.value);
        raycast.maxDistance = parseInt(maxDistanceSlider.value);
        raycast.spinSpeedvar = parseInt(spinSpeedSlider.value);
        raycast.spinSpeed = Math.PI / raycast.spinSpeedvar;
    }

    rayAmountSlider.addEventListener('input', updateRaycastSettings);
    maxDistanceSlider.addEventListener('input', updateRaycastSettings);
    spinSpeedSlider.addEventListener('input', updateRaycastSettings);

    // Buttons
    const toggleEcho = document.getElementById('toggleEcho');
    const toggleVisibility = document.getElementById('toggleVisibility');
    const toggleSpinning = document.getElementById('toggleSpinning');
    const toggleCone = document.getElementById('toggleCone');

    toggleEcho.addEventListener('click', () => {
        if (canPing && !SonarEcho.active) {
            SonarEcho.active = true;
            SonarEcho.radius = 0;
            canPing = false;
            playBell();
            setTimeout(function() {
                canPing = true;  // Re-enable pinging after 5 seconds (This is a workaround for now but may be scrapped in the future)
            }, 5000);
        }
    });


    toggleVisibility.addEventListener('click', () => {
        raycast.visibility = !raycast.visibility;
    });

    toggleSpinning.addEventListener('click', () => {
        raycast.spinning = !raycast.spinning;
    });

    toggleCone.addEventListener('click', () => {
        raycast.cone = !raycast.cone;
    });
    */

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

    // Raycaster
    const raycast = new Raycast(canvas, player, walls);

    // SonarEcho
    let SonarEcho = {
        active: false,
        radius: 0,
        maxRadius: 100
    };

    // Keep track of lit up walls
    let echoes = [];

    // SonarEcho
    let canPing = true;

    // Event listeners for keyups and keydowns (smoother movement)
    window.addEventListener('keydown', function(event) {
        switch (event.key) {
            case "ArrowUp":    player.activeDirections.up = true; break;
            case "ArrowDown":  player.activeDirections.down = true; break;
            case "ArrowLeft":  player.activeDirections.left = true; break;
            case "ArrowRight": player.activeDirections.right = true; break;
            /* SCRAPPED
            case 'e':
                if (canPing && !SonarEcho.active) {
                    SonarEcho.active = true;
                    SonarEcho.radius = 0;
                    canPing = false;
                    playBell();
                    setTimeout(function() {
                        canPing = true;  // Re-enable pinging after 5 seconds (This is a workaround for now but may be scrapped in the future)
                    }, 5000);
                }
                break;
            */
            case 'r':
                raycast.visibility = !raycast.visibility;
                break;
            case 's':
                raycast.spinning = !raycast.spinning; // Toggle spinning on or off
                break;
            case 'c':
                raycast.cone = !raycast.cone; // Toggle cone shape on or off
                break; 
            case 'e':
                raycast.triggerPing();
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
        walls.forEach((wall, wallIndex) => {
            // Draw the base wall
            ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    
            /* SCRAPPED
            // Draw echolocation effect from active and fading echoes
            echoes.forEach((echo, index) => {
                const timeElapsed = (Date.now() - echo.timestamp) / 1000; // Time in seconds
                if (timeElapsed < 5) {
                    const opacity = 1 - timeElapsed / 5; // Gradually reduce opacity
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(wall.x, wall.y, wall.width, wall.height);
                    ctx.clip();
    
                    const gradient = ctx.createRadialGradient(echo.x, echo.y, 0, echo.x, echo.y, echo.radius);
                    gradient.addColorStop(0, `rgba(255, 255, 255, ${0.9 * opacity})`);
                    gradient.addColorStop(1, `rgba(0, 0, 0, 0)`);
    
                    ctx.fillStyle = gradient;
                    ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
                    ctx.restore();
                } else {
                    echoes.splice(index, 1); // Remove echo after 5 seconds (TODO: make multiple echos be usable at once)
                }
            });
    
            // Use the stored visible sides at the time of the ping
            let visibleSides = walls[wallIndex] && echoes[0] ? echoes[0].wallVisibility.find(wv => wv.wallId === wallIndex).visibleSides : getVisibleWallSides(wall);
    
            const borderSize = 4;
            let innerX = wall.x + borderSize;
            let innerY = wall.y + borderSize;
            let innerWidth = wall.width - 2 * borderSize;
            let innerHeight = wall.height - 2 * borderSize;
    
            if (!visibleSides.includes('T')) {
                innerY -= borderSize;
                innerHeight += borderSize;
            }
            if (!visibleSides.includes('B')) {
                innerHeight += borderSize;
            }
            if (!visibleSides.includes('L')) {
                innerX -= borderSize;
                innerWidth += borderSize;
            }
            if (!visibleSides.includes('R')) {
                innerWidth += borderSize;
            }
    
            ctx.fillStyle = '#000';
            ctx.fillRect(innerX, innerY, innerWidth, innerHeight);
            */
            ctx.strokeStyle = '#000';
            ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);
        });
    }
    
    /* SCRAPPED
    function getVisibleWallSides(wall) {
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;
        let visibleSides = '';
    
        // Check top side visibility
        if (playerCenterY > wall.y + wall.height) {
            visibleSides += 'B';
        }
    
        // Check bottom side visibility
        if (playerCenterY < wall.y) {
            visibleSides += 'T';
        }
    
        // Check left side visibility
        if (playerCenterX > wall.x + wall.width) {
            visibleSides += 'R';
        }
    
        // Check right side visibility
        if (playerCenterX < wall.x) {
            visibleSides += 'L'; 
        }
    
        return visibleSides;
    }   

    function drawSonarEcho() {
        if (SonarEcho.active) {
            ctx.beginPath();
            ctx.arc(player.x + player.width / 2, player.y + player.height / 2, SonarEcho.radius, 0, 2 * Math.PI);
            ctx.strokeStyle = '#FFF';
            ctx.stroke();
            SonarEcho.radius += 4; // Expanding effect
            if (SonarEcho.radius > SonarEcho.maxRadius) {
                SonarEcho.active = false; // Deactivate when hits max
                let wallVisibility = walls.map(wall => ({ 
                    wallId: walls.indexOf(wall), 
                    visibleSides: getVisibleWallSides(wall)
                }));
                echoes.push({
                    x: player.x + player.width / 2, 
                    y: player.y + player.height / 2, 
                    radius: SonarEcho.radius, 
                    timestamp: Date.now(), 
                    wallVisibility: wallVisibility
                });
            }
        }
    }
    */

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        player.update(walls);
        drawWalls();
        player.draw(ctx);

        requestAnimationFrame(gameLoop);
        
        if (raycast.pingActive) {
            raycast.expandRays(); // Gradually increase the distance of the rays
        }
        raycast.castRays();
        raycast.drawRays(ctx);
    }

    gameLoop();
});