export class Raycast {
    constructor(canvas, player, walls) {
        this.canvas = canvas;
        this.player = player;
        this.walls = walls;
        this.rays = [];
        this.hitPoints = []; // Store hit points with timestamps and color intensity
        this.rayAmount = 180;
        this.maxDistance = 200;
        this.visibility = false;
        this.currentAngle = 0;
        this.spinSpeedvar = 90;
        this.spinSpeed = Math.PI / this.spinSpeedvar;
        this.spinning = false;
        this.cone = false;
        this.pingActive = false; // This will be set true only for a frame when 'e' is pressed
        this.currentDistance = 0; // To track the current distance of expanding rays
    }

    castRays() {
        this.rays = []; // Clear previous rays
        const angleIncrement = Math.PI * 2 / this.rayAmount;
        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;

        let startAngle = this.currentAngle;
        let endAngle = startAngle + Math.PI * 2;

        if (this.cone) {
            startAngle += Math.PI * 3 / 4;
            endAngle = startAngle + Math.PI / 2;
        }

        for (let angle = startAngle; angle < endAngle; angle += angleIncrement) {
            for (let distance = 0; distance < this.currentDistance; distance++) {
                const rayX = Math.round(playerCenterX + distance * Math.cos(angle));
                const rayY = Math.round(playerCenterY + distance * Math.sin(angle));

                if (this.rayHitsWall(rayX, rayY)) {
                    this.rays.push({x: rayX, y: rayY, distance: distance, angle: angle});
                    if (this.pingActive) {
                        let fraction = (this.maxDistance - distance) / this.maxDistance;
                        let intensity = Math.pow(fraction, 3); // Cubing the fraction
                        let color = `rgba(255, 255, 255, ${intensity})`; // Interpolate color based on distance
                        this.hitPoints.push({x: rayX, y: rayY, time: Date.now(), color});
                    }
                    break; // Stop this ray if it hits a wall
                }

                if (distance === this.currentDistance - 1) { // Ray reached current expanding distance without hitting a wall
                    this.rays.push({x: rayX, y: rayY, distance: distance, angle: angle});
                }
            }
        }

        if (this.spinning) {
            this.currentAngle += this.spinSpeed;
            if (this.currentAngle >= Math.PI * 2) {
                this.currentAngle -= Math.PI * 2;
            }
        }
    }

    expandRays() {
        const expansionSpeed = 5; // Increase this value to make the expansion faster
        if (this.currentDistance < this.maxDistance) {
            this.currentDistance += expansionSpeed; // Increase the distance of the rays faster
        } else {
            this.pingActive = false; // Stop expanding when max distance is reached
        }
    }

    triggerPing() {
        this.pingActive = true; // Set the ping flag true
        this.currentDistance = 0; // Reset the current distance
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

        let currentTime = Date.now();
        this.hitPoints = this.hitPoints.filter(point => {
            return currentTime - point.time < 3000; // Only keep markers less than 3 seconds old
        });

        this.hitPoints.forEach(point => {
            const currentTime = Date.now();
            const elapsedTime = currentTime - point.time;
            const pulsePeriod = 800; // Period of the pulsation in milliseconds
            const minRadius = 1.5;
            const maxRadius = 3;
            const amplitude = (maxRadius - minRadius) / 2;
            const baseRadius = minRadius + amplitude;
        
            // Calculate the radius using a sinusoidal function based on the elapsed time
            const radius = baseRadius + amplitude * Math.sin((2 * Math.PI / pulsePeriod) * elapsedTime);
        
            ctx.fillStyle = point.color;
            ctx.beginPath();
            ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}
