export class Wall {
    constructor(x, y, width, height, player, canvas, isMoving = false, moveDistance = 0, moveChance = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.player = player; // for collision checking
        this.canvas = canvas
        this.isMoving = isMoving;
        this.moveDistance = moveDistance;
        this.moveChance = moveChance;
        this.moveTimer = 0;
        this.moveInterval = 2000; // Movement check every 2000 milliseconds (2 seconds)
        this.isHitByRay = false; // don't move if currently lighting up
    }

    update(deltaTime) {
        if (this.isMoving && !this.isHitByRay) {
            this.moveTimer += deltaTime;
            if (this.moveTimer >= this.moveInterval) {
                this.moveTimer = 0; // Reset timer
                if (Math.random() < this.moveChance) {
                    this.attemptMove();
                }
            }
        }
    }

    attemptMove() {
        if (this.isHitByRay) {
            return; // Skip the move attempt if the wall is currently hit by a ray
        }
    
        // Existing movement logic
        const directions = [
            { dx: 0, dy: -this.moveDistance }, // Up
            { dx: this.moveDistance, dy: 0 }, // Right
            { dx: 0, dy: this.moveDistance }, // Down
            { dx: -this.moveDistance, dy: 0 } // Left
        ];
        const direction = directions[Math.floor(Math.random() * directions.length)];
    
        // Calculate new position
        const newX = this.x + direction.dx;
        const newY = this.y + direction.dy;
    
        // Check for collision with player and boundary
        if (!this.collidesWithPlayer(newX, newY) && this.isWithinBounds(newX, newY)) {
            this.x = newX;
            this.y = newY;
        }
    }
    

    collidesWithPlayer(newX, newY) {
        // Check if the new position of the wall intersects with the player's position
        return (
            newX < this.player.x + this.player.width &&
            newX + this.width > this.player.x &&
            newY < this.player.y + this.player.height &&
            newY + this.height > this.player.y
        );
    }

    isWithinBounds(newX, newY) {
        // Check if the wall stays within the canvas boundaries
        return (
            newX >= 0 &&
            newX + this.width <= this.canvas.width &&
            newY >= 0 &&
            newY + this.height <= this.canvas.height
        );
    }

    setHitByRay(hitStatus) {
        // Set the hit by ray status
        this.isHitByRay = hitStatus;
    }
}
