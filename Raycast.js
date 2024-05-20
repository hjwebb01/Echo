export class Raycast {
    constructor(canvas, player, walls, rayAmount, expansionSpeed, maxDistance, spinSpeedvar, spinning, cone, alwaysPing, playSoundCallback, cross, fadeSpeed, visibility) {
        this.canvas = canvas;
        this.player = player;
        this.walls = walls;
        this.rays = [];
        this.hitPoints = []; // Store hit points with timestamps and color intensity
        this.rayAmount = rayAmount; // 180 Defualt
        this.expansionSpeedvar = expansionSpeed;
        this.maxDistance = maxDistance; // 200 Default
        this.visibility = visibility;
        this.currentAngle = 0;
        this.spinSpeedvar = spinSpeedvar; // 90 Default
        this.spinSpeed = Math.PI / this.spinSpeedvar;
        this.spinning = spinning; // false default
        this.cone = cone; // false default
        this.pingActive = false; // This will be set true only for a frame when 'e' is pressed
        this.currentDistance = 0; // To track the current distance of expanding rays
        this.alwaysPing = alwaysPing;
        this.playSoundCallback = playSoundCallback;
        this.cross = cross;
        this.fadeSpeed = fadeSpeed;
    }

    castRays() {
        this.rays = []; // Clear previous rays
        const angleIncrement = Math.PI * 2 / this.rayAmount;
        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;
    
        let startAngle = this.currentAngle;
        let endAngle = startAngle + Math.PI * 2;
    
        if (this.cone) {
            startAngle += Math.PI * 7 / 8;
            endAngle = startAngle + Math.PI / 10;
        }
    
        for (let angle = startAngle; angle < endAngle; angle += angleIncrement) {
           
            if (this.cross) {
                // Convert angle to degrees and normalize
                const degreeAngle = angle * (180 / Math.PI) % 360;
                // Check if the angle is close to one of the cardinal directions within a 20-degree range
                if (!(Math.abs(degreeAngle - 0) <= 20 || Math.abs(degreeAngle - 180) <= 20 ||
                      Math.abs(degreeAngle - 360) <= 20 || Math.abs(degreeAngle - 90) <= 20 || 
                      Math.abs(degreeAngle - 270) <= 20)) {
                    continue; // Skip this angle if it's not within the specified range
                }
            }

            for (let distance = 0; distance < this.currentDistance; distance++) {
                const rayX = Math.round(playerCenterX + distance * Math.cos(angle));
                const rayY = Math.round(playerCenterY + distance * Math.sin(angle));
    
                if (this.rayHitsWall(rayX, rayY)) {
                    this.rays.push({x: rayX, y: rayY, distance: distance, angle: angle});
                    if (this.pingActive || this.alwaysPing) {
                        let fraction = distance / this.maxDistance; // Change to distance traveled fraction
                        let intensity = Math.pow(fraction, 1.5); // Cubing the fraction
                        let color = `rgba(255, 255, 255, ${1 - intensity})`; // Interpolate color based on distance
                        let timeReduction = (1 - fraction) * this.fadeSpeed; // Calculate time reduction inversely
                        let timeVisible = 400 + timeReduction; // Ensure at least 1 second visibility
                        this.hitPoints.push({x: rayX, y: rayY, time: Date.now(), color, timeVisible});
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
        const expansionSpeed = this.expansionSpeedvar; // Increase this value to make the expansion faster
        if (this.currentDistance < this.maxDistance) {
            this.currentDistance += expansionSpeed; // Increase the distance of the rays faster
        } else {
            this.pingActive = false; // Stop expanding when max distance is reached
        }
    }

    triggerPing() {
        if (this.playSoundCallback) { // Sound
            this.playSoundCallback();
        }
        this.pingActive = true; // Set the ping flag true
        this.currentDistance = 0; // Reset the current distance
    }

    rayHitsWall(rayX, rayY) {
        // Check if the ray hits any wall
        const hitsWall = this.walls.some(wall => {
            return (rayX >= wall.x && rayX <= wall.x + wall.width &&
                    rayY >= wall.y && rayY <= wall.y + wall.height);
        });
    
        // Check if the ray hits the canvas boundaries
        const hitsCanvasEdge = rayX <= 0 || rayX >= this.canvas.width || rayY <= 0 || rayY >= this.canvas.height;
    
        return hitsWall || hitsCanvasEdge;
    }    

    drawRays(ctx) {
        if (this.visibility) {
            ctx.strokeStyle = 'lightgreen';
            ctx.beginPath();
            ctx.lineWidth = 5;
            this.rays.forEach(ray => {
                ctx.moveTo(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
                ctx.lineTo(ray.x, ray.y);
            });
            ctx.stroke();
        }
    
        let currentTime = Date.now();
        this.hitPoints = this.hitPoints.filter(point => {
            return currentTime - point.time < point.timeVisible; // Use the dynamically adjusted visibility time
        });
    
        this.hitPoints.forEach(point => {
            const elapsedTime = currentTime - point.time;
            const pulseDuration = 800; // Total duration for one full pulse cycle
            const minRadius = 3;
            const maxRadius = 10;
    
            let radius;
            if (elapsedTime < pulseDuration) {
                const phase = (elapsedTime / pulseDuration) * Math.PI;
                radius = minRadius + (maxRadius - minRadius) * Math.sin(phase);
            } else {
                radius = minRadius;
            }
    
            ctx.fillStyle = point.color;
            ctx.beginPath();
            ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}
