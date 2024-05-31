export class Monster {
    constructor(x, y, width, height, isMoving, moveSpeed, player, visibility, chanceTeleport) {
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
        this.visibility = visibility;
        this.isSighted = false;  // Play a sound for initial spotting
        this.chanceTeleport = chanceTeleport;
        this.teleportTimer = 0;
        this.teleportInterval = 2000;
    }

    update(deltaTime, endpointActive) {
        if (this.isMovingInitially && endpointActive) {
            this.isMoving = true;
        }

        if (this.isMoving) {
            this.teleportTimer += deltaTime;
            if (this.teleportTimer >= this.teleportInterval) {
                this.teleportTimer = 0;
                this.checkAndTeleport();
            }
            this.moveTowardPlayer();
        }
    }


    resetPosition() {
        this.x = this.originalX;
        this.y = this.originalY;
        this.isMoving = false; // Stop moving when resetting position
    }

    checkAndTeleport() {
        const distance = this.calculateDistanceToPlayer();
        if (distance < 300 && Math.random() < this.chanceTeleport) {
            this.teleport();
        }
    }

    teleport() {
        let newX, newY, distance;
        do {
            newX = Math.random() * this.player.canvas.width;
            newY = Math.random() * this.player.canvas.height;
            const dx = this.player.x - newX;
            const dy = this.player.y - newY;
            distance = Math.sqrt(dx * dx + dy * dy);
        } while (distance < 300 || distance > this.player.canvas.width); // Ensure teleportation is outside 300 units but within the canvas

        this.x = newX;
        this.y = newY;
        this.isSighted = false;
    }

    moveTowardPlayer() {
        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Apply rubber banding: increase speed if distance is greater than 300 units
        const speedMultiplier = distance > 300 ? 2 : 1;
        const effectiveSpeed = this.moveSpeed * speedMultiplier;

        const normalizedX = dx / distance;
        const normalizedY = dy / distance;

        this.x += normalizedX * effectiveSpeed;
        this.y += normalizedY * effectiveSpeed;

        if (Math.abs(this.x - this.player.x) < effectiveSpeed && Math.abs(this.y - this.player.y) < effectiveSpeed) {
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

    calculateDistanceToPlayer() {
        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    draw(ctx) {
        if (this.visibility) {
            ctx.fillStyle = '#FFF'
        } else {
            ctx.fillStyle = '#000'
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    sighted() {
        if (!this.isSighted && this.isMoving) { // Check if monster is moving and not already sighted
            this.isSighted = true;
            return true;
        }
        return false;
    }
}