export class Monster {
    constructor(x, y, width, height, isMoving, moveSpeed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isMoving = isMoving;
        this.moveSpeed = moveSpeed;
    }

    // Function to update the monster's position if it is moving
    update() {
        if (this.isMoving) {
            this.move();
        }
    }

    // Function to handle the movement logic
    move() {
        // Example movement logic: move horizontally
        this.x += this.moveSpeed;
        // Add conditions to change direction or handle collisions here
    }

    checkCollision(other) {
        return (
            this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y
        );
    }
}
