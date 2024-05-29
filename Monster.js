export class Monster {
    constructor(x, y, width, height, isMoving, moveSpeed, player) {
        this.originalX = x;
        this.originalY = y;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isMovingInitially = isMoving;
        this.isMoving = false;  // Start as false, enable later
        this.moveSpeed = moveSpeed;
        this.player = player;
    }

    update(endpointActive) {
        // Only allow movement if textsShown is false
        if (this.isMovingInitially && endpointActive) {
            this.isMoving = true;
        }

        if (this.isMoving) {
            this.moveTowardPlayer();
        }
    }

    resetPosition() {
        this.x = this.originalX;
        this.y = this.originalY;
    }

    moveTowardPlayer() {
        // Calculate the direction vector pointing from monster to player
        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;

        // Calculate the distance to the player
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Normalize the direction vector
        const normalizedX = dx / distance;
        const normalizedY = dy / distance;

        // Move the monster towards the player
        this.x += normalizedX * this.moveSpeed;
        this.y += normalizedY * this.moveSpeed;

        // Prevent overshooting the player's exact location by readjusting if close enough
        if (Math.abs(this.x - this.player.x) < this.moveSpeed && Math.abs(this.y - this.player.y) < this.moveSpeed) {
            this.x = this.player.x;
            this.y = this.player.y;
        }
    }

    checkCollision(other) {
        return (
            this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y
        );
    }

    draw(ctx) {
        ctx.fillStyle = '#FFF'
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}