export class Raycast {
    constructor(canvas, player, walls, rayAmount, expansionSpeed, maxDistance, spinSpeedvar, spinning, cone, alwaysPing, playSoundCallback, cross, fadeSpeed, visibility, endPoint) {
        this.canvas = canvas;
        this.player = player;
        this.walls = walls;
        this.endPoint = endPoint;
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
                const collision = this.rayHits(rayX, rayY);

                if (collision.hitsWall || collision.hitsEndPoint) {
                    this.rays.push({x: rayX, y: rayY, distance: distance, angle: angle, hitsEndPoint: collision.hitsEndPoint});
                    if (this.pingActive || this.alwaysPing) {
                        let fraction = distance / this.maxDistance;
                        let intensity = Math.pow(fraction, 0.1);
                        let color = `rgba(255, 255, 255, ${1 - intensity})`;
                        if (collision.hitsEndPoint) {
                            color = `rgba(0, 255, 0, ${1 - intensity})`; // Green for endPoint hits
                        }
                        let timeReduction = (1 - fraction) * this.fadeSpeed;
                        let timeVisible = 400 + timeReduction;
                        this.hitPoints.push({x: rayX, y: rayY, time: Date.now(), color, timeVisible});
                    }
                    break;
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

    rayHits(rayX, rayY) {
        // Check collision with walls
        const hitsWall = this.walls.some(wall => {
            return (rayX >= wall.x && rayX <= wall.x + wall.width &&
                    rayY >= wall.y && rayY <= wall.y + wall.height);
        });

        // Check collision with endPoint
        const hitsEndPoint = rayX >= this.endPoint.x && rayX <= this.endPoint.x + this.endPoint.width &&
                            rayY >= this.endPoint.y && rayY <= this.endPoint.y + this.endPoint.height;

        return { hitsWall, hitsEndPoint };
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
    
        // Handle fading of the expanding circle
        let currentTime = Date.now();
        if (!this.visibility && this.currentDistance > 0) {
            let opacity = 1;
            if (this.currentDistance >= this.maxDistance) {
                if (!this.fadeStartTime) {
                    this.fadeStartTime = currentTime;  // Mark the start of the fade out
                }
                const fadeDuration = 1200;  // Fade out over 2000 milliseconds (2 seconds)
                const fadeElapsed = currentTime - this.fadeStartTime;
                if (fadeElapsed < fadeDuration) {
                    opacity = 1 - (fadeElapsed / fadeDuration);  // Linear fade out
                } else {
                    opacity = 0;  // Fully transparent after fade duration
                }
            } else {
                this.fadeStartTime = null;  // Reset fade start time if below max distance
            }
    
            if (opacity > 0) {
                ctx.strokeStyle = `rgba(144, 238, 144, ${opacity})`;  // Light green with calculated opacity
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.arc(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, this.currentDistance, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    
        this.hitPoints = this.hitPoints.filter(point => {
            return currentTime - point.time < point.timeVisible;  // Use the dynamically adjusted visibility time
        });
    
        this.hitPoints.forEach(point => {
            const elapsedTime = currentTime - point.time;
            const pulseDuration = 800;  // Total duration for one full pulse cycle
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
