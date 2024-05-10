// When launching the .html file, use it via VSCode's Live Server extension
import { Player } from './Player.js';

document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    canvas.style.backgroundColor = '#000'; // Background color

    // Sounds (More to come)
    var soundBell = new Audio('Bell.mp3')
    function playBell() {
        soundBell.play();
    }

    // Raycasting vars
    let raycasting = {
        active: false,
        rays: [],
        maxDistance: 500,  // Same as the SonarEcho maxRadius
        visibility: false,
        currentAngle: 0, // Spin stuff
        spinSpeed: Math.PI / 180 
    };

    // Player
    const player = new Player(650, 380, 10, 10, 2, canvas);

    // Walls
    const walls = [
        { x: 500, y: 100, width: 100, height: 300 },
        { x: 700, y: 360, width: 150, height: 150 },
        { x: 300, y: 500, width: 330, height: 80 },
        { x: 700, y: 180, width: 300, height: 100}
    ];

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
            case 'r':
                raycasting.visibility = !raycasting.visibility;
                break;
            case 's':
                raycasting.spinning = !raycasting.spinning; // Toggle spinning on or off
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
            ctx.strokeStyle = '#000';
            ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);
        });
    }

    function rayHitsWall(rayX, rayY) {
        return walls.some(wall => {
            return (rayX >= wall.x && rayX <= wall.x + wall.width &&
                    rayY >= wall.y && rayY <= wall.y + wall.height);
        });
    }
    
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
    
    // RAYCASTING RAAAAAAAAAAAAAAAAAAHHH
    function castRays() {
        raycasting.rays = []; // Clear previous rays
        const angleIncrement = Math.PI * 2 / 18; // Cast 10 rays around the player for simplicity
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;
    
        let startAngle = raycasting.currentAngle;
        let endAngle = startAngle + Math.PI * 2;
    
        for (let angle = startAngle; angle < endAngle; angle += angleIncrement) {
            for (let distance = 0; distance < raycasting.maxDistance; distance++) {
                const rayX = Math.round(playerCenterX + distance * Math.cos(angle));
                const rayY = Math.round(playerCenterY + distance * Math.sin(angle));
    
                if (rayHitsWall(rayX, rayY)) {
                    raycasting.rays.push({x: rayX, y: rayY, distance: distance, angle: angle});
                    break; // Stop this ray if it hits a wall
                }
    
                if (distance === raycasting.maxDistance - 1) { // Ray reached maximum distance without hitting a wall
                    raycasting.rays.push({x: rayX, y: rayY, distance: distance, angle: angle});
                }
            }
        }
    
        // Spin stuff
        if (raycasting.spinning) {
            raycasting.currentAngle += raycasting.spinSpeed;
            if (raycasting.currentAngle >= Math.PI * 2) {
                raycasting.currentAngle -= Math.PI * 2; // Normalize angle
            }
        }
    }
    
    
    function drawRays() {
        if (raycasting.visibility) {
            ctx.strokeStyle = 'red';
            ctx.beginPath();
            raycasting.rays.forEach(ray => {
                ctx.moveTo(player.x + player.width / 2, player.y + player.height / 2);
                ctx.lineTo(ray.x, ray.y);
            });
            ctx.stroke();
        }
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

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        player.update(walls);
        drawWalls();
        player.draw(ctx);

        drawSonarEcho();
        requestAnimationFrame(gameLoop);

        castRays();
        drawRays(); 
    }

    gameLoop();
});