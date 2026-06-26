const scale_factor = 4;

import { DEBUG, game_state, state } from "./game.js";

export class Player {
    constructor(x, y, sprite0, sprite1, sprite2, sprite3) {
        this.x = x;
        this.ground_level = y;
        this.sprite0 = sprite0;
        this.sprite1 = sprite1;
        this.sprite2 = sprite2;
        this.sprite3 = sprite3;
        this.init();
    }

    jump(speed) {
        if (this.on_ground) {
            this.velocity += speed;
            this.on_ground = false;
        }
    }

    tick(dt) {
        this.animation_timer += dt;

        if (this.on_ground) {
            return;
        }

        const gravity = 1000;

        this.velocity -= (gravity * dt);
        this.relative_y += (this.velocity * dt);

        if (this.relative_y <= 0) {
            this.relative_y = 0;
            this.velocity = 0;
            this.on_ground = true;
        }
    }

    render(ctx) {

        // Determining correct sprite to use
        let used_sprite;
        if (state == game_state.FINISHED) {
            used_sprite = this.sprite3;
        } else if (state >= game_state.TUTORIAL) {
            let left_leg = ((Math.floor((this.animation_timer*5)%2))==0);
            if (left_leg) {
                used_sprite = this.sprite1;
            } else {
                used_sprite = this.sprite2;
            }
        } else {
            used_sprite = this.sprite0;
        }

        ctx.drawImage(
            used_sprite,
            this.x,
            (this.ground_level - this.relative_y),
            22 * scale_factor, 23 * scale_factor
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

    bbox() {
        let center_x = this.x + (11*scale_factor);
        let center_y = (this.ground_level - this.relative_y) + (11*scale_factor);
        return {
            x0: (center_x - (5*scale_factor)),
            y0: (center_y - (4*scale_factor)),
            x1: (center_x + (1*scale_factor)),
            y1: (center_y + (7*scale_factor)),
        }
    }

    init() {
        this.relative_y = 0;
        this.velocity = 0;
        this.on_ground = true;
        this.animation_timer = 0;
    }
}
