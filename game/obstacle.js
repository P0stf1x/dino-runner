const scale_factor = 4;

import { DEBUG } from "./game.js";

export class Obstacle {
    constructor(y, base_speed, sprite) {
        this.x = 1001;

        this.y = y;
        this.base_speed = base_speed;
        this.speed = 0;

        this.sprite = sprite;
    }

    tick(dt) {
        this.x -= this.speed * dt;
    }

    render(ctx) {
        ctx.drawImage(
            this.sprite,
            this.x,
            this.y,
            32 * scale_factor, 32 * scale_factor
        );

        if (DEBUG) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(
                this.bbox().x0,
                this.bbox().y0,
                this.bbox().x1-this.bbox().x0,
                this.bbox().y1-this.bbox().y0
            );
        }
    }

    is_outside() {
        if (this.x < -999) {
            return true;
        } else {
            return false;
        }
    }

    bbox() {
        let center_x = this.x + (16*scale_factor);
        let center_y = this.y + (16*scale_factor);
        return {
            x0: (center_x - (2*scale_factor)),
            y0: (center_y - (11*scale_factor)),
            x1: (center_x + (2*scale_factor)),
            y1: (center_y + (11*scale_factor)),
        }
    }

    set_speed(score) {
        this.speed = this.base_speed + (score*1);
    }
}
