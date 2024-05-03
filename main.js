// Now we go

document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Walls
    const walls = [
        { x: 50, y: 100, width: 100, height: 300 },
        { x: 200, y: 200, width: 150, height: 150 }
    ];

    function drawWalls() {
        ctx.fillStyle = '#000'; // Wall color
        walls.forEach(wall => {
            ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        });
    }

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        drawWalls();
        requestAnimationFrame(gameLoop); // Updates game state
    }

    gameLoop(); // Game loop
});