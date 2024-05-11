export class Raycast {
    constructor(canvas, player, walls) {
        this.canvas = canvas;
        this.player = player;
        this.walls = walls;
        this.rays = [];
        this.maxDistance = 300;
        this.visibility = false;
        this.currentAngle = 0;
        this.spinSpeed = Math.PI / 180;
        this.spinning = false;
        this.bouncing = false;
    }

    castRays() {
        this.rays = []; // Clear previous rays
        const angleIncrement = Math.PI * 2 / 18;
        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;

        let startAngle = this.currentAngle;
        let endAngle = startAngle + Math.PI * 2;

        for (let angle = startAngle; angle < endAngle; angle += angleIncrement) {
            for (let distance = 0; distance < this.maxDistance; distance++) {
                const rayX = Math.round(playerCenterX + distance * Math.cos(angle));
                const rayY = Math.round(playerCenterY + distance * Math.sin(angle));

                if (this.rayHitsWall(rayX, rayY)) {
                    this.rays.push({x: rayX, y: rayY, distance: distance, angle: angle});
                    break; // Stop this ray if it hits a wall
                }

                if (distance === this.maxDistance - 1) { // Ray reached maximum distance without hitting a wall
                    this.rays.push({x: rayX, y: rayY, distance: distance, angle: angle});
                }
            }
        }

        // Spin stuff
        if (this.spinning) {
            this.currentAngle += this.spinSpeed;
            if (this.currentAngle >= Math.PI * 2) {
                this.currentAngle -= Math.PI * 2; // Normalize angle
            }
        }
    }

    rayHitsWall(rayX, rayY) {
        return this.walls.some(wall => {
            return (rayX >= wall.x && rayX <= wall.x + wall.width &&
                    rayY >= wall.y && rayY <= wall.y + wall.height);
        });
    }

    drawRays(ctx) {
        if (this.visibility) {
            ctx.strokeStyle = 'red';
            ctx.beginPath();
            this.rays.forEach(ray => {
                ctx.moveTo(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
                ctx.lineTo(ray.x, ray.y);
            });
            ctx.stroke();
        }
    }
}
