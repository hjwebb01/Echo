export class Level {
    constructor(player, playerStartPosition, walls, endPoint, startupTexts, canvas, ctx, monsters) {
        this.player = player;
        this.playerStartPosition = playerStartPosition;
        this.walls = walls;
        this.endPoint = endPoint;
        this.canvas = canvas;
        this.ctx = ctx;
        this.startupTexts = startupTexts.map(text => ({ ...text, opacity: 0 }));
        this.textsShown = false;
        this.currentTextIndex = 0;
        this.endpointActive = false;
        this.endpointFadeTime = 0;
        this.endpointFadeDuration = 120;
        this.endpointFadeInitiated = false;
        this.monsters = monsters;
    }

    activate() {
        this.player.x = this.playerStartPosition.x;
        this.player.y = this.playerStartPosition.y;
        this.textsShown = false;
        this.currentTextIndex = 0;
        this.endpointActive = false;
        this.endpointFadeTime = 0;
        this.startupTexts.forEach(text => text.opacity = 0); // Reset opacity on activate
    }

    update(deltaTime) {
        if (!this.textsShown) {
            this.updateTextFadeIn();
        }
        this.updateEndpointFade();
        this.updateWalls(deltaTime); // Update the walls with the delta time
    }

    draw() {
        this.drawWalls();
        this.drawEndPoint();
        if (!this.textsShown) {
            this.drawIntroTexts();
        }
    }

    drawIntroTexts() {
        if (!this.textsShown) {
            this.startupTexts.forEach((text, index) => {
                if (index <= this.currentTextIndex) {
                    this.drawTextSegment(text);
                }
            });
        }
    }

    updateEndpointFade() {
        if (this.endpointActive) {
            if (this.endpointFadeTime < this.endpointFadeDuration) {
                this.endpointFadeTime++;
            } else {
                this.endpointActive = false; // Stop fading after duration is over
                this.endpointFadeTime = 0; // Optionally reset to allow reactivation
                this.endpointFadeInitiated = true;
            }
        }
    }

    updateTextFadeIn() {
        if (this.currentTextIndex < this.startupTexts.length) {
            let text = this.startupTexts[this.currentTextIndex];
            if (text.opacity < 1) {
                text.opacity += 0.01; // Adjust for desired fade-in speed
                if (text.opacity >= 1) {
                    this.currentTextIndex++; // Move to the next text after the current one is fully visible
                }
            }
        }
    }

    drawEndPoint() {
        let fadeFactor = Math.min(this.endpointFadeTime / this.endpointFadeDuration, 1);
        let green = 200 * (1 - fadeFactor);
        this.ctx.fillStyle = fadeFactor > 0 ? `rgb(0, ${green}, 0)` : '#000';
        this.ctx.fillRect(this.endPoint.x, this.endPoint.y, this.endPoint.width, this.endPoint.height);
    }
    
    activateEndpoint() {
        if (!this.endpointActive) {  // Only activate once per raycaster activation
            this.endpointActive = true;
            this.endpointFadeTime = 0;
        }
    }

    updateWalls(deltaTime) {
        this.walls.forEach(wall => {
            wall.update(deltaTime); // Make sure each wall has an update method
        });
    }

    drawWalls() {
        this.ctx.fillStyle = '#000';
        this.ctx.strokeStyle = '#000'; // Ensure stroke is black
        this.walls.forEach(wall => {
            this.ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
            this.ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);
        });
    }

    drawTextSegment(text) {
        let xPosition = this.canvas.width / 2;
        this.ctx.textAlign = 'center';
        this.ctx.font = '20px Verdana';
    
        // Split the sentence to color words "green", "white", and "red" differently
        let parts = text.text.split(/(green|white|red|THEY)/);
        let accumulatedWidth = 0;
    
        parts.forEach(part => {
            // Default light grey color
            this.ctx.fillStyle = `rgba(150, 150, 150, ${text.opacity})`;
            if (part === 'green') {
                this.ctx.fillStyle = `rgba(0, 255, 0, ${text.opacity})`; // Green color
            } else if (part === 'white') {
                this.ctx.fillStyle = `rgba(255, 255, 255, ${text.opacity})`; // White color
            } else if (part === 'red' || part === 'THEY') {
                this.ctx.fillStyle = `rgba(255, 0, 0, ${text.opacity})`; // Red color
            }
    
            // Calculate the width of the part and adjust position
            let metrics = this.ctx.measureText(part);
            let partWidth = metrics.width;
            let partX = xPosition - this.ctx.measureText(text.text).width / 2 + accumulatedWidth + partWidth / 2;
    
            this.ctx.fillText(part, partX, text.y);
            accumulatedWidth += partWidth; // Accumulate width to adjust next part position
        });
    }
    
}