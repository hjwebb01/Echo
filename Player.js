export class Player {
    constructor(x, y, width, height, moveSpeed, canvas, visibility) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.moveSpeed = moveSpeed;
        this.canvas = canvas;
        this.activeDirections = { up: false, down: false, left: false, right: false }; // Tracking active movement directions
        this.visibility = visibility;
    }

    update(walls) {
        Object.keys(this.activeDirections).forEach(direction => {
            if (this.activeDirections[direction]) {
                this.move(direction, walls);
            }
        });
    }

    move(direction, walls) {
        let newX = this.x;
        let newY = this.y;

        switch (direction) {
            case 'up':    newY -= this.moveSpeed; break;
            case 'down':  newY += this.moveSpeed; break;
            case 'left':  newX -= this.moveSpeed; break;
            case 'right': newX += this.moveSpeed; break;
        }

        if (!this.checkCollision(newX, newY, walls) && this.inBounds(newX, newY)) {
            this.x = newX;
            this.y = newY;
        }
    }

    checkCollision(newX, newY, walls) {
        const playerRect = { x: newX, y: newY, width: this.width, height: this.height };
        return walls.some(wall => (
            playerRect.x < wall.x + wall.width &&
            playerRect.x + playerRect.width > wall.x &&
            playerRect.y < wall.y + wall.height &&
            playerRect.y + playerRect.height > wall.y
        ));
    }

    inBounds(newX, newY) {
        return newX >= 0 && newX + this.width <= this.canvas.width &&
               newY >= 0 && newY + this.height <= this.canvas.height;
    }

    draw(ctx) {
        if (this.visibility) {
            ctx.fillStyle = '#FFF'
        } else {
            ctx.fillStyle = '#000'
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
